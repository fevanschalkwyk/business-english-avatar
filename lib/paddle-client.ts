// lib/paddle-client.ts
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

let paddleInstance: Paddle | undefined;

export async function getPaddleInstance(): Promise<Paddle> {
  if (paddleInstance) return paddleInstance;

  return new Promise((resolve, reject) => {
    initializePaddle({
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
      environment: "sandbox",
      eventCallback: (event) => {
        console.log("Paddle event:", event);
      },
    }).then((instance) => {
      if (!instance) {
        reject(new Error("Paddle failed to initialise"));
        return;
      }
      paddleInstance = instance;
      resolve(instance);
    });
  });
}