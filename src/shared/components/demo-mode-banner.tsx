import { env } from "@/shared/config/env";

export function DemoModeBanner() {
  if (env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;

  return (
    <div className="w-full bg-amber-500 px-4 py-2 text-center text-xs font-semibold text-amber-950">
      Public demo — mutations are disabled. Data resets are not guaranteed.
    </div>
  );
}
