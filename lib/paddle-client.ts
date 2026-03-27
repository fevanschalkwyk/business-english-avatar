// lib/paddle-client.ts
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

let paddleInstance: Paddle | undefined;

export async function getPaddleInstance(): Promise<Paddle> {
  if (paddleInstance) return paddleInstance;

  const instance = await initializePaddle({
    token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    environment: "sandbox",
  });

  if (!instance) throw new Error("Paddle failed to initialise");
  paddleInstance = instance;
  return instance;
}