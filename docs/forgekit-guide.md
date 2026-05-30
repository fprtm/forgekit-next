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
├── db/
│   ├── schema/
│   │   ├── index.ts
│   │   └── user.ts
│   ├── migrations/
│   └── index.ts
├── shared/
│   ├── components/
│   │   ├── ui/             # Shadcn UI (e.g., button, input)
│   │   ├── data-table/     # Reusable TanStack Table components
│   │   └── layout/         # Dashboard layout, App Sidebar
│   ├── lib/
│   │   ├── utils.ts        # Helper functions (cn, formatRole, etc.)
│   │   ├── auth.ts         # NextAuth v5 server instance
│   │   └── api-response.ts # Standard API Response helpers
│   ├── config/
│   │   ├── auth.ts         # Edge-compatible OAuth providers config
│   │   ├── env.ts          # Type-safe environment variables
│   │   └── site.ts         # Site metadata configuration
│   ├── constant/           # Shared enums and constant values
│   ├── hooks/              # Shared custom hooks (e.g. use-mobile.ts)
│   └── types/              # Shared types and NextAuth type overrides
└── env.ts
```

Buat folder sekaligus via terminal:

```bash
mkdir -p src/db/schema src/db/migrations
mkdir -p src/shared/components/ui src/shared/components/layout
mkdir -p src/shared/lib src/shared/config src/shared/constant src/shared/hooks src/shared/types
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

## 14. Evolusi Arsitektur: Modular Clean Architecture (DDD)

Sebagai repositori skala enterprise, boilerplate ini telah berevolusi dari struktur Next.js tradisional ke **Modular Clean Architecture (Domain-Driven Design)** di bawah direktori `src/modules/`. Pemisahan ini memastikan kode fungsional bisnis terisolasi sempurna dan siap dikembangkan tanpa batas oleh banyak tim sekaligus.

### A. Anatomi 4-Layer Taxonomy per Modul
Setiap modul baru (misal: `products`, `users`, `notifications`) wajib mematuhi struktur folder 4-Layer berikut:

```text
src/modules/<module-name>/
├── domain/                 # 1. CORE LAYER (Tipe & Entitas murni tanpa dependensi)
│   └── types.ts            
│
├── application/            # 2. USE CASES LAYER (Zod Validations & Service Logic)
│   ├── validations.ts      
│   ├── services.ts         
│   └── use-cases/          # [Scale-out] Dibagi per berkas jika service terlalu besar
│
├── infrastructure/         # 3. EXTERNAL LAYER (Drizzle Schema & Query Repositories)
│   ├── schema.ts           
│   └── repository.ts       
│
└── presentation/           # 4. DELIVERY LAYER (Delivery UI & HTTP Controllers)
    ├── http/               # API Route Handlers
    │   └── route-handlers.ts 
    └── ui/                 # Next.js Server & Client Components
        ├── components/     # Sub-komponen modular (Form, Table, dsb)
        └── pages/          # Halaman React utuh yang diekspos ke App Router
```

### B. Aturan Emas Arsitektur (Architecture Guardrails)
Setiap kontributor atau agen AI wajib mematuhi aturan arsitektur mutlak berikut tanpa pengecualian:

1. **Zero Business Logic in App Router**: Berkas di dalam `src/app/` murni bertindak sebagai *Thin Delivery Mechanism*. Berkas tersebut HANYA boleh memetakan URL ke handler (`presentation/http/controllers` atau server `actions`). DILARANG keras melakukan kueri database (Drizzle) atau menulis aturan bisnis di dalam `src/app/`.
2. **Inward Dependency Rule**: Arah ketergantungan wajib mengarah ke dalam: `Presentation -> Application -> Domain`. Layer `Domain` wajib bersih dan memiliki **ZERO external dependencies** (dilarang mengimpor UI, database, library pihak ketiga, atau framework).
3. **Sub-folder Granularity**: Wajib memanfaatkan folder struktur secara detail dan granuler (`domain/events`, `domain/exceptions`, `presentation/http/controllers`, dsb.). Dilarang mengosongkan folder tersebut atau melakukan *mocking* tidak perlu.
4. **Domain Exceptions & Stack Trace Protection**:
   * DILARANG keras melempar kelas `Error` generik di dalam Use Case. Seluruh kegagalan logika bisnis wajib melempar *class* khusus turunan dari **`DomainException`** yang berada di dalam `domain/exceptions/`.
   * Server Actions dan Controllers wajib menangkap `DomainException` untuk mengembalikan pesan error yang aman bagi klien, sedangkan error internal generik wajib disamarkan sebagai `"Internal Server Error"` dan dicatat di log server untuk perlindungan *stack trace*.
5. **IDOR & AuthZ**: Setiap tindakan modifikasi/penghapusan data di Server Action atau Use Case wajib memvalidasi izin hak akses pengguna (menggunakan `can()` dari engine kebijakan *policies*) dan memverifikasi kepemilikan data (*ownership*).
6. **No Manual Side-Effects in Use Cases/Actions**: Tindakan bisnis sekunder (seperti mencatat log audit, mengirim email, atau push notifikasi) DILARANG keras dieksekusi secara manual/langsung di dalam Server Actions atau jalur Use Case primer.
7. **Event-Driven Side Effects (EDA)**: Aksi sekunder wajib dipicu menggunakan event domain asinkronus (`DomainEvent`) melalui `eventDispatcher.dispatch()`, dan diproses secara terpisah oleh *dedicated listeners* (seperti `AuditLogListener` atau `NotificationListener`) di bawah layer `application/services`.

### C. Daftar Modul Aktif Saat Ini
1. **Products (`src/modules/products`)**:
   - Mengelola katalog produk lengkap dengan form pembuatan, edit harga, validasi, dan alur hapus otomatis.
2. **Users (`src/modules/users`)**:
   - Mengelola data profil pengguna dan sistem administrasi pengguna (manajemen Nama, Email, dan Role Admin/User).
3. **Notifications (`src/modules/notifications`)**:
   - Sistem riwayat & preferensi notifikasi berlapis (konfigurasi sistem global + preferensi per-user) yang beroperasi asinkronus menggunakan Event-Driven Architecture.
4. **Audit Logs (`src/modules/audit-logs`)**:
   - Mengelola perekaman asinkronus aktivitas log sistem tingkat *enterprise* untuk seluruh tindakan sensitif aktor (DevSecOps compliant).
5. **Auth (`src/modules/auth`)**:
   - Pusat sistem autentikasi, pendaftaran, Edge-safe middleware, otorisasi Policies, serta fitur impersonasi Superadmin.
6. **Setting (`src/modules/setting`)**:
   - Mengelola seluruh konfigurasi global tingkat aplikasi/bisnis (kredensial API, data bisnis, timezone, dan preferensi modul asinkronus).
7. **Dashboard (`src/modules/dashboard`)**:
   - Kerangka UI dasbor utama untuk penyajian metrik data bisnis ringkas pengguna.

---

## 15. Sistem Pengujian Terpadu (Enterprise Testing Suite)

Boilerplate ini dilengkapi dengan **ForgeKit Unified Test Runner**, sebuah sistem otomatisasi pengujian modular yang menggabungkan unit test berkecepatan tinggi (`bun test`) dan pengujian browser visual E2E (`Playwright`).

### A. Perintah Menjalankan Pengujian
```bash
# Menjalankan seluruh tes (Unit & E2E) untuk modul tertentu secara otomatis
bun run test --module <module-name>

# Contoh: Menguji modul products
bun run test --module products

# Menjalankan seluruh Unit Test secara global
bun run test:unit
```

### B. Standardisasi Best-Practice Pengujian yang Diterapkan
1. **Database-Agnostic E2E**: Seluruh pengujian E2E tidak memiliki ketergantungan pada seed database statis. Alur pembuatan, penyuntingan, dan penghapusan diuji secara berurutan dalam satu sesi pengujian untuk menjamin database tetap bersih (*database hygiene*).
2. **Global Unique Generator & Domain Factories**:
    - Menggunakan generator global `generateUniqueString(prefix)` di `src/shared/lib/utils.ts` untuk memastikan tidak ada data bertabrakan di database saat tes paralel dijalankan.
   - Setiap modul memiliki Factory dinamis terisolasi (seperti `product.factory.ts` dan `user.factory.ts` di folder presentasi masing-masing) untuk merakit payload pengujian.
3. **Human-like Interaction**: Form pengisian menggunakan `.pressSequentially()` dengan jeda waktu acak (*random delay*) dan penundaan kecepatan aksi global (`slowMo: 500` di `playwright.config.ts`) agar jalannya visualisasi browser terasa nyata.
4. **E2E Scoping & Outer Variables**: Menghindari tabrakan strict-mode Playwright dengan memfilter locator spesifik per baris tabel (`page.locator("tr").filter({ hasText: name })`) dan mencocokkan tombol aksi via dynamic `data-testid` (misal: `edit-button-${id}`).

---

## 16. Cara Menambah Modul Baru dengan Arsitektur DDD

Jika Anda ingin menambahkan modul baru, misalnya **Payments**:

```bash
# 1. Buat folder 4-Layer Clean Architecture
mkdir -p src/modules/payments/domain
mkdir -p src/modules/payments/application
mkdir -p src/modules/payments/infrastructure
mkdir -p src/modules/payments/presentation/ui/components
mkdir -p src/modules/payments/presentation/ui/pages

# 2. Definisikan Schema Drizzle di infrastruktur
touch src/modules/payments/infrastructure/schema.ts

# 3. Export Schema baru di global schema index
# Tambahkan: export * from "@/modules/payments/infrastructure/schema" di src/db/schema/index.ts

# 4. Definisikan tipe entitas di domain
touch src/modules/payments/domain/types.ts

# 5. Buat validasi Zod & use case business logic di application
touch src/modules/payments/application/validations.ts
touch src/modules/payments/application/services.ts

# 6. Buat UI Components, React Pages, & Actions Server di presentation
touch src/modules/payments/presentation/ui/pages/list.tsx
touch src/modules/payments/presentation/ui/actions.ts

# 7. Daftarkan rute tipis di App Router Next.js
mkdir -p src/app/\(dashboard\)/payments
touch src/app/\(dashboard\)/payments/page.tsx # panggil <PaymentListPage /> dari modul presentasi
```

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

---

## 9. Modul Autentikasi (DDD 4-Layer & OAuth Generik)

ForgeKit menerapkan autentikasi NextAuth (v5 / Auth.js) secara terstruktur penuh ke dalam pola modular DDD 4-Layer.

### Pemisahan Arsitektur Auth:
* **Edge-Compatible Config (`src/config/auth.ts` & `src/config/env.ts`)**: Konfigurasi dasar yang *Edge-safe* (OAuth provider, Pages redirect) agar dapat diimpor langsung oleh `middleware.ts` Next.js tanpa memicu error modul Node.js yang tidak didukung di Edge runtime.
* **Full-Server Lib (`src/lib/auth.ts`)**: Inisialisasi penuh NextAuth tingkat server yang menampung `DrizzleAdapter` dan provider `Credentials` (email & sandi). Lapisan ini bebas melakukan kueri database dan verifikasi password menggunakan pustaka enkripsi berat (`bcrypt`).

### Dukungan OAuth Generik & Dinamis:
Anda dapat mengontrol apakah tombol masuk sosial (OAuth) aktif atau tidak melalui variabel lingkungan:
* **`NEXT_PUBLIC_ENABLE_OAUTH="true"`**: Menampilkan tombol OAuth (seperti Google) secara dinamis di halaman masuk (`/login`) dan mendaftarkannya di NextAuth.
* **`NEXT_PUBLIC_ENABLE_OAUTH="false"`**: Secara otomatis menyembunyikan tombol masuk sosial dan garis pemisah pada antarmuka halaman login, menyisakan form masuk Kredensial email yang sangat bersih.

---

## 10. Sistem Database Seeding Modular & Dinamis

ForgeKit menyertakan mesin seeding basis data sentral (`scripts/seed.ts`) yang sangat pintar, modular, dan 100% *type-safe* tanpa bergantung pada tipe data `any` yang berbahaya.

### Karakteristik Utama Seeder Modular:
1. **Pemisahan Tanggung Jawab (Decoupled)**: Setiap modul mengelola logika datanya sendiri di dalam folder infrastrukturnya masing-masing.
   * Modul Users: `src/modules/users/infrastructure/seeder.ts`
   * Modul Products: `src/modules/products/infrastructure/seeder.ts`
2. **Standardisasi API**: Setiap berkas seeder modul wajib mengekspor fungsi bernama `seed` dengan parameter database Drizzle bertipe data default:
   ```typescript
   import { NodePgDatabase } from "drizzle-orm/node-postgres";
   export async function seed(db: NodePgDatabase) {
     // Logika insert data ke database menggunakan db.insert(...)
   }
   ```
3. **Deteksi Otomatis & Dinamis**: Skrip sentral `scripts/seed.ts` secara otomatis memindai direktori `src/modules` saat dijalankan, mencari berkas `seeder.ts` yang aktif, melakukan impor dinamis (`await import`), dan mengeksekusinya secara berurutan.

### Cara Menjalankan Seeder:
* **Menjalankan Seluruh Seeder Modul**:
  ```bash
  bun run db:seed
  ```
* **Menjalankan Seeder Modul Tertentu Saja (Flag `--module` / `-m`)**:
  ```bash
  bun run db:seed --module users
  ```

---

## 17. Fitur Superadmin Impersonate (Login As)

ForgeKit mendukung fitur impersonasi identitas bagi `super_admin` untuk masuk sementara sebagai akun pengguna lain.

### Karakteristik & Alur Kerja Keamanan:
1. **Validasi Domain Policy**: Kebijakan `"impersonate"` dibatasi ketat di tingkat *policy engine* (`policies.ts`) hanya untuk role `super_admin`.
2. **NextAuth Intercept**: Berkas `src/shared/lib/auth.ts` memproses cookie asinkronus `impersonate_target` untuk bertukar sesi identitas pengguna secara sementara.
3. **Identitas Asli Aman**: Sesi superadmin asli yang memicu impersonasi tersimpan di dalam field `originalUserId` & `originalUserRole` untuk memfasilitasi pemulihan sesi superadmin secara instan via endpoint `/api/auth/stop-impersonation`.
4. **Audit Logs & Keamanan Compliance**: Setiap aktivitas impersonasi dicatat ke dalam **Audit Logs** menggunakan `auth-audit.listener.ts`.

---

## 18. Sistem Notifikasi Dinamis (Global & User Preferences)

Sistem notifikasi diimplementasikan di `src/modules/notifications` dengan membagi pengaturan menjadi dua lapisan fungsional:

1. **Konfigurasi Global (Sistem)**: Menggunakan tabel `settings` utama untuk mengontrol hidup/mati saluran notifikasi (email, push, whatsapp) secara global. Kredensial SMTP atau Fonnte disimpan di sini.
2. **Preferensi Pengguna (User Settings)**: Menggunakan tabel `user_notification_settings` agar setiap pengguna dapat memilih apakah ingin menerima email, push, atau WhatsApp secara mandiri.
3. **Arsitektur Filter Use-Case**: Pengiriman pesan (`SendNotificationHandler`) hanya mengeksekusi saluran apabila diaktifkan di tingkat global *dan* disetujui di tingkat preferensi pengguna.

