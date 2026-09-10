---
mode: standard
domain: web
sdlc: solo
---

# SDD Config — forgekit-next

- **Mode**: standard
- **Domain**: web (Next.js 15 App Router)
- **SDLC**: solo (single maintainer, boilerplate intended for public reuse/fork)
- **Architecture**: DDD 4-layer per module (domain/application/infrastructure/presentation) under `src/modules/*`, cross-cutting in `src/shared/*`. Established pattern — respect and extend, do not replace.

## Project intent

ForgeKit is meant to be cloned/forked as a starting point for new Next.js projects — by the maintainer solo, by a small team, or forked/resold by third parties. Because the audience is unknown and external, the folder structure and design system must be self-explanatory without access to the maintainer for questions.
