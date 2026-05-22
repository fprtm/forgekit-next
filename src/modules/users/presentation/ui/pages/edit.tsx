import * as React from "react"
import { UserProfileForm } from "../components/form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserEntity } from "../../../domain/types"

export function UserEditPage({ user }: { user: UserEntity }) {
  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/users">← Back</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
      </div>
      
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <UserProfileForm initialData={user} />
      </div>
    </div>
  )
}
