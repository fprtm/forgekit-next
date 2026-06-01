import * as React from "react"
import { UserTable } from "../components/table"
import { UserEntity } from "../../../domain/entities/user.entity"
import { AuthUser } from "@/modules/auth/domain/types"
import Wrapper from "@/shared/components/layout/wrapper"

export function UserRoleListPage({
  users,
  currentUser,
}: {
  users: UserEntity[]
  currentUser: AuthUser | null | undefined
}) {
  return (
    <Wrapper>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
      </div>

      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <UserTable data={users} currentUser={currentUser} editHrefSuffix="?profile=true" showExtraActions={false} />
      </div>
    </Wrapper>
  )
}
