import * as React from "react"
import { UserTable } from "../components/table"
import { UserEntity } from "../../../domain/entities/user.entity"
import { Button } from "@/shared/components/ui/button"
import Link from "next/link"
import { AuthUser } from "@/modules/auth/domain/types"
import { PermissionGate } from "@/modules/auth/presentation/ui/components/permission-gate"
import Wrapper from "@/shared/components/layout/wrapper"

export function AccountListPage({
  users,
  currentUser,
}: {
  users: UserEntity[]
  currentUser: AuthUser | null | undefined
}) {
  return (
    <Wrapper>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
        <PermissionGate action="users:create" user={currentUser}>
          <Button asChild>
            <Link href="/d/users/create">Create User</Link>
          </Button>
        </PermissionGate>
      </div>

      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <UserTable data={users} currentUser={currentUser} />
      </div>
    </Wrapper>
  )
}
