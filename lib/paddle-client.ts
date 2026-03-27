// lib/paddle-client.ts
import { initializePaddle, Paddle } from "@paddle/paddle-js";

let paddleInstance: Paddle | null = null;

export async function getPaddleInstance(): Promise<Paddle> {
  if (paddleInstance) return paddleInstance;

  const instance = await initializePaddle({
    token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    environment:
      process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox" ? "sandbox" : "production",
  });

  if (!instance) throw new Error("Paddle failed to initialise");
  paddleInstance = instance;
  return instance;
}