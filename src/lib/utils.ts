import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function waitForTyping(maxDelay: number = 500, minDelay: number = 150) {
  return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
}
