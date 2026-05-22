# Next.js Boilerplate — Setup Guide

**Stack:** Next.js 15 + Auth.js v5 + Drizzle ORM + PostgreSQL + Shadcn/UI + TypeScript

---

## Prerequisites

Pastikan sudah terinstall:
- Node.js 20+
- Bun (package manager)
- PostgreSQL (local atau Neon/Supabase untuk cloud)

---

## 1. Init Project

```bash
bunx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd my-app
```

---

## 2. Install Dependencies

```bash
# ORM & Database
bun add drizzle-orm @auth/drizzle-adapter
bun add -D drizzle-kit

# Database driver — pilih salah satu:
bun add postgres          # Neon / Supabase / self-hosted PostgreSQL

# Auth
bun add next-auth@beta

# Validation
bun add zod

# Utilities
bun add @t3-oss/env-nextjs   # Type-safe env variables
bun add server-only           # Guard server-only modules

# UI — Shadcn init terpisah (lihat section 5)
```

---

## 3. Environment Variables

Buat file `.env.local` dan `.env.example`:

```bash
# .env.local

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myapp"

# Auth.js
AUTH_SECRET=""                    # generate: bunx auth secret
AUTH_GOOGLE_ID=""                 # dari Google Console
AUTH_GOOGLE_SECRET=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Buat `.env.example` dengan value kosong — ini yang di-commit ke git:

```bash
DATABASE_URL=""
AUTH_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
NEXT_PUBLIC_APP_URL=""
```

Setup type-safe env di `src/env.ts`:

```typescript
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(1),
    AUTH_GOOGLE_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
})
```

---

## 4. Struktur Folder

Buat struktur berikut secara manual atau lewat terminal:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── webhooks/
│   │       └── midtrans/
│   │           └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── actions/
│   ├── auth.ts
│   └── user.ts
├── components/
│   ├── ui/             # Shadcn — jangan modif manual
│   ├── shared/
│   │   ├── navbar.tsx
│   │   └── sidebar.tsx
│   └── forms/
│       └── login-form.tsx
├── db/
│   ├── schema/
│   │   ├── index.ts
│   │   └── user.ts
│   ├── migrations/
│   └── index.ts
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── utils.ts
│   └── validations/
│       └── user.ts
├── hooks/
│   └── use-user.ts
├── types/
│   └── index.ts
├── config/
│   └── site.ts
└── env.ts
```

Buat folder sekaligus via terminal:

```bash
mkdir -p src/actions src/components/shared src/components/forms
mkdir -p src/db/schema src/db/migrations
mkdir -p src/lib/validations src/hooks src/types src/config
```

---

## 5. Setup Shadcn/UI

```bash
bunx shadcn@latest init
```

Pilih opsi:
- Style: **Default**
- Base color: **Slate** (atau sesuai preferensi)
- CSS variables: **Yes**

Install komponen yang selalu dipakai di semua project:

```bash
bunx shadcn@latest add button input label card form
bunx shadcn@latest add dropdown-menu avatar separator
bunx shadcn@latest add toast sonner
```

> Jangan install semua sekaligus — install per kebutuhan project.

---

## 6. Setup Database (Drizzle)

**`src/db/index.ts`** — Drizzle instance:

```typescript
import "server-only"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { env } from "@/env"
import * as schema from "./schema"

const client = postgres(env.DATABASE_URL)
export const db = drizzle(client, { schema })
```

**`src/db/schema/user.ts`** — User schema (dipakai Auth.js):

```typescript
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  role: text("role", { enum: ["admin", "user"] }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const accounts = pgTable("accounts", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: text("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
})

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})
```

**`src/db/schema/index.ts`** — Export semua schema:

```typescript
export * from "./user"
// export * from "./[domain]"  ← tambah di sini kalau ada domain baru
```

**`drizzle.config.ts`** di root:

```typescript
import { defineConfig } from "drizzle-kit"
import { env } from "./src/env"

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
```

---

## 7. Setup Auth.js

**`auth.config.ts`** di root (untuk edge runtime / middleware):

```typescript
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export default {
  providers: [Google],
  pages: {
    signIn: "/login",
    error: "/login",
  },
} satisfies NextAuthConfig
```

**`src/lib/auth.ts`** — full config dengan Drizzle adapter:

```typescript
import "server-only"
import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import authConfig from "../../auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
```

**`src/app/api/auth/[...nextauth]/route.ts`**:

```typescript
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

**`middleware.ts`** di root:

```typescript
import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

const publicRoutes = ["/", "/login", "/register"]
const authRoutes = ["/login", "/register"]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  if (isAuthRoute) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/dashboard", nextUrl))
    return NextResponse.next()
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

---

## 8. Setup Server Actions

Pattern yang konsisten untuk semua actions:

**`src/actions/user.ts`**:

```typescript
"use server"

import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { updateUserSchema } from "@/lib/validations/user"
import { eq } from "drizzle-orm"

// Return type yang konsisten
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function getCurrentUser(): Promise<ActionResult<typeof users.$inferSelect>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user) return { success: false, error: "User not found" }
  return { success: true, data: user }
}

export async function updateUser(input: unknown): Promise<ActionResult<typeof users.$inferSelect>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const parsed = updateUserSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const [updated] = await db
    .update(users)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))
    .returning()

  return { success: true, data: updated }
}
```

---

## 9. Setup Route Handlers (API)

Route Handlers hanya untuk dua kasus: **webhook** dan **endpoint publik yang dipanggil dari luar Next.js** (mobile app, Laravel, third party).

### Helper — Response standar

Buat helper dulu supaya response format konsisten di semua handler:

**`src/lib/api-response.ts`**:

```typescript
import { NextResponse } from "next/server"

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}
```

---

### Contoh 1 — Webhook Midtrans

**`src/app/api/webhooks/midtrans/route.ts`**:

```typescript
import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-response"
import crypto from "crypto"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"

// Verifikasi signature Midtrans
function verifySignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string, receivedSignature: string) {
  const hash = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex")
  return hash === receivedSignature
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { order_id, transaction_status, status_code, gross_amount, signature_key } = body

    // Verifikasi signature
    const isValid = verifySignature(
      order_id,
      status_code,
      gross_amount,
      process.env.MIDTRANS_SERVER_KEY!,
      signature_key
    )

    if (!isValid) return apiError("Invalid signature", 401)

    // Update status order
    if (transaction_status === "settlement" || transaction_status === "capture") {
      await db.update(orders)
        .set({ status: "paid", updatedAt: new Date() })
        .where(eq(orders.id, order_id))
    }

    if (transaction_status === "cancel" || transaction_status === "expire") {
      await db.update(orders)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(orders.id, order_id))
    }

    return apiSuccess({ received: true })
  } catch {
    return apiError("Internal server error", 500)
  }
}
```

---

### Contoh 2 — Public API untuk Mobile App

**`src/app/api/v1/products/route.ts`**:

```typescript
import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-response"
import { db } from "@/db"
import { products } from "@/db/schema"
import { eq, ilike } from "drizzle-orm"

// GET /api/v1/products?search=baju&limit=10
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") ?? ""
    const limit = Number(searchParams.get("limit") ?? 10)

    const data = await db.query.products.findMany({
      where: search ? ilike(products.name, `%${search}%`) : undefined,
      limit,
      orderBy: (products, { desc }) => [desc(products.createdAt)],
    })

    return apiSuccess(data)
  } catch {
    return apiError("Internal server error", 500)
  }
}

// POST /api/v1/products
export async function POST(req: NextRequest) {
  try {
    // Validasi API key untuk endpoint publik
    const apiKey = req.headers.get("x-api-key")
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return apiError("Unauthorized", 401)
    }

    const body = await req.json()

    const [created] = await db.insert(products)
      .values(body)
      .returning()

    return apiSuccess(created, 201)
  } catch {
    return apiError("Internal server error", 500)
  }
}
```

---

### Contoh 3 — Protected API dengan Auth Session

Untuk endpoint yang butuh user login — misalnya dipanggil dari mobile app yang sudah login:

**`src/app/api/v1/me/route.ts`**:

```typescript
import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-response"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    })

    if (!user) return apiError("User not found", 404)
    return apiSuccess(user)
  } catch {
    return apiError("Internal server error", 500)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const body = await req.json()

    const [updated] = await db.update(users)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))
      .returning()

    return apiSuccess(updated)
  } catch {
    return apiError("Internal server error", 500)
  }
}
```

---

### Kapan pakai Server Actions vs Route Handlers

| Situasi | Pakai |
|---|---|
| Form submit dari halaman Next.js | Server Actions |
| Fetch data di Server Component | Server Actions / langsung query |
| Dipanggil dari mobile app | Route Handlers |
| Webhook dari payment gateway | Route Handlers |
| Dipanggil dari Laravel / service lain | Route Handlers |
| Real-time / streaming response | Route Handlers |

---

## 10. Setup Validations

**`src/lib/validations/user.ts`**:

```typescript
import { z } from "zod"

export const updateUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(50),
})

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
```

---

## 10. Setup Dashboard Layout

**`src/app/(dashboard)/layout.tsx`**:

```typescript
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Sidebar } from "@/components/shared/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  )
}
```

---

## 11. Config & Types

**`src/config/site.ts`**:

```typescript
export const siteConfig = {
  name: "My App",
  description: "",
  url: process.env.NEXT_PUBLIC_APP_URL,
  nav: [
    { title: "Dashboard", href: "/dashboard" },
    // tambah menu di sini
  ],
}
```

**`src/types/index.ts`**:

```typescript
import type { users } from "@/db/schema"

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// Extend Auth.js session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
}
```

---

## 12. Scripts di package.json

Tambahkan scripts ini:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## 13. First Run

```bash
# 1. Generate migration dari schema
bun db:generate

# 2. Push ke database
bun db:push

# 3. Jalankan dev server
bun dev
```

---

## Cara Tambah Modul Baru

Misal mau tambah modul **Product**:

```bash
# 1. Buat schema
touch src/db/schema/product.ts

# 2. Export di index
# tambah: export * from "./product" di src/db/schema/index.ts

# 3. Buat validation
touch src/lib/validations/product.ts

# 4. Buat actions
touch src/actions/product.ts

# 5. Buat page
mkdir -p src/app/(dashboard)/products
touch src/app/(dashboard)/products/page.tsx

# 6. Generate migration baru
bun db:generate && bun db:push
```

Pattern ini sama untuk semua modul — tidak ada yang perlu diubah di tempat lain.

---

## Deployment Checklist

Sebelum deploy ke production:

- [ ] Set semua env variables di platform (Vercel/Railway)
- [ ] Ganti `DATABASE_URL` ke production database
- [ ] Generate `AUTH_SECRET` baru: `bunx auth secret`
- [ ] Set `NEXTAUTH_URL` ke domain production
- [ ] Jalankan `bun db:migrate` ke production DB
- [ ] Test auth flow end-to-end
- [ ] Enable HTTPS (otomatis di Vercel/Railway)

---

## Recommended Stack Tambahan (per kebutuhan)

| Kebutuhan | Library |
|---|---|
| Email | Resend + React Email |
| File upload | Uploadthing |
| Background jobs | Trigger.dev |
| Payment | Midtrans (lokal) / Stripe |
| Analytics | Posthog |
| Error tracking | Sentry |
| Realtime | Pusher / Ably |
