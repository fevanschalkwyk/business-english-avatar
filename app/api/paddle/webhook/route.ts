// app/api/paddle/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { paddle } from "@/lib/paddle";
import { EventName } from "@paddle/paddle-node-sdk";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PRO_MINUTES_PER_MONTH = 160;
const ADDON_MINUTES = 60;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature") ?? "";

  let event;
  try {
    event = await paddle.webhooks.unmarshal(
      rawBody,
      process.env.PADDLE_WEBHOOK_SECRET!,
      signature
    );
  } catch (err) {
    console.error("Paddle webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    switch (event.eventType) {

      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated: {
        const sub = event.data;
        const customerId = sub.customerId;
        const subscriptionId = sub.id;
        const status = sub.status;
        const periodEnd = sub.currentBillingPeriod?.endsAt ?? null;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, minutes_remaining, subscription_status")
          .eq("paddle_customer_id", customerId)
          .single();

        if (!profile) {
          console.error("No profile found for Paddle customer:", customerId);
          break;
        }

        const isNewActivation =
          event.eventType === EventName.SubscriptionCreated ||
          (event.eventType === EventName.SubscriptionUpdated &&
            (profile as any).subscription_status !== "pro" &&
            status === "active");

        await supabase
          .from("profiles")
          .update({
            paddle_subscription_id: subscriptionId,
            subscription_status: status === "active" ? "pro" : status,
            subscription_tier: status === "active" ? "pro" : "free",
            subscription_current_period_end: periodEnd,
            ...(isNewActivation
              ? {
                  minutes_remaining: PRO_MINUTES_PER_MONTH,
                  minutes_reset_at: new Date().toISOString(),
                }
              : {}),
          })
          .eq("id", profile.id);

        break;
      }

      case EventName.SubscriptionCanceled: {
        const sub = event.data;
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("paddle_subscription_id", sub.id)
          .single();

        if (!profile) break;

        await supabase
          .from("profiles")
          .update({
            subscription_status: "free",
            subscription_tier: "free",
            paddle_subscription_id: null,
            subscription_current_period_end: null,
            minutes_remaining: 0,
          })
          .eq("id", profile.id);

        break;
      }

      case EventName.TransactionCompleted: {
        const tx = event.data;
        const customerId = tx.customerId;
        if (!customerId) break;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, minutes_remaining, ai_sessions_remaining")
          .eq("paddle_customer_id", customerId)
          .single();

        if (!profile) break;

        for (const item of tx.details?.lineItems ?? []) {
          const priceId = item.priceId;

          if (priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_ADDON_MINUTES) {
            await supabase
              .from("profiles")
              .update({
                minutes_remaining: ((profile as any).minutes_remaining ?? 0) + ADDON_MINUTES,
              })
              .eq("id", profile.id);

            await supabase.from("purchases").insert({
              user_id: profile.id,
              paddle_transaction_id: tx.id,
              purchase_type: "addon_minutes",
              amount_cents: Math.round(
                parseFloat(tx.details?.totals?.total ?? "0") * 100
              ),
              currency: tx.currencyCode ?? "USD",
            });
          }

          if (priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_SINGLE_ROLEPLAY) {
            await supabase
              .from("profiles")
              .update({
                ai_sessions_remaining: ((profile as any).ai_sessions_remaining ?? 0) + 1,
              })
              .eq("id", profile.id);

            await supabase.from("purchases").insert({
              user_id: profile.id,
              paddle_transaction_id: tx.id,
              purchase_type: "single_roleplay",
              roleplay_id: null,
              amount_cents: Math.round(
                parseFloat(tx.details?.totals?.total ?? "0") * 100
              ),
              currency: tx.currencyCode ?? "USD",
            });
          }
        }

        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
