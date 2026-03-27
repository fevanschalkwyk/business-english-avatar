// app/api/paddle/cancel-subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { paddle } from "@/lib/paddle";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("paddle_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.paddle_subscription_id) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  await paddle.subscriptions.cancel(profile.paddle_subscription_id, {
    effectiveFrom: "next_billing_period",
  });

  return NextResponse.json({ success: true });
}