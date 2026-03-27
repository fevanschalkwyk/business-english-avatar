// app/api/paddle/create-customer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { paddle } from "@/lib/paddle";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("paddle_customer_id, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.paddle_customer_id) {
    return NextResponse.json({ customerId: profile.paddle_customer_id });
  }

  const customer = await paddle.customers.create({
    email: user.email!,
    name: profile?.full_name ?? undefined,
  });

  await supabase
    .from("profiles")
    .update({ paddle_customer_id: customer.id })
    .eq("id", user.id);

  return NextResponse.json({ customerId: customer.id });
}