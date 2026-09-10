import * as React from "react"
import { UserTable } from "../components/table"
import { UserEntity } from "../../../domain/entities/user.entity"
import { Button } from "@/shared/components/ui/button"
import Link from "next/link"
import { AuthUser } from "@/modules/auth/domain/types"
import { PermissionGate } from "@/modules/auth/presentation/ui/components/permission-gate"
import Wrapper from "@/shared/components/layout/wrapper"
import { routes } from "@/shared/config/routes"
import { Card, CardContent } from "@/shared/components/ui/card"

export function AccountListPage({
  users,
  currentUser,
}: {
  users: UserEntity[]
  currentUser: AuthUser | null | undefined
}) {
  return (
    <Wrapper>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Accounts</h1>
          <PermissionGate action="users:create" user={currentUser}>
            <Button asChild>
              <Link href={routes.dashboard.users.create} data-testid="create-user-button">Create User</Link>
            </Button>
          </PermissionGate>
        </div>

        <Card>
          <CardContent>
            <UserTable data={users} currentUser={currentUser} />
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  )
}
