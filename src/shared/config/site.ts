import { env } from "@/shared/config/env";

export const siteConfig = {
  name: "ForgeKit",
  shortName: "FK",
  description:
    "Enterprise-grade Next.js DDD boilerplate — clone, fork, or build your next project on top of it.",
  url: env.NEXT_PUBLIC_APP_URL,
  author: "Ferry Pratama",
  links: {
    github: "https://github.com/fprtm/forgekit-next",
    docs: "/docs/forgekit-guide.md",
  },
};
