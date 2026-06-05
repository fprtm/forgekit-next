import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function waitForTyping(maxDelay: number = 300, minDelay: number = 150) {
  return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
}

/**
 * Generates a dynamically unique string driven by a millisecond timestamp and random integers.
 * Ideal for E2E testing data and unique database seeds across modules.
 * 
 * @param {string} prefix - The name prefix for the generated string.
 * @returns {string} A guaranteed unique string.
 */
export function generateUniqueString(prefix: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  return `${prefix} ${timestamp} ${randomSuffix}`;
}

/**
 * Utility to parse role codes by replacing underscores with spaces and capitalizing words.
 * E.g., 'super_admin' -> 'Super Admin', 'standard_user' -> 'Standard User'
 */
export function formatRole(role: string | null | undefined): string {
  if (!role) return "";
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
