import * as React from "react"
import { UserProfileForm } from "../components/form"
import { Button } from "@/shared/components/ui/button"
import Link from "next/link"
import { UserEntity } from "../../../domain/entities/user.entity"
import Wrapper from "@/shared/components/layout/wrapper"

export function UserEditPage({ user }: { user: UserEntity }) {
  return (
    <Wrapper>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/d/users">← Back</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
      </div>
      
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <UserProfileForm initialData={user} />
      </div>
    </Wrapper>
  )
}
