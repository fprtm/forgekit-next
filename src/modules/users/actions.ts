import { db } from "@/db"
import { auth } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { users } from "./schema"
import { updateUserSchema } from "./validations"

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

export async function getCurrentUser(): Promise<
  ActionResult<typeof users.$inferSelect>
> {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Unauthorized", data: null }
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user) {
    return { success: false, error: "User not found", data: null }
  }

  return { success: true, data: user, error: null }
}

export async function updateUser(
  input: unknown,
): Promise<ActionResult<typeof users.$inferSelect>> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized", data: null }
  }

  const parsed = updateUserSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.message, data: null }
  }

  const [updated] = await db
    .update(users)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))
    .returning()

  return { success: true, data: updated, error: null }
}
