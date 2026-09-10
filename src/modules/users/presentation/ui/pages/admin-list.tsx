import * as React from "react"
import { UserTable } from "../components/table"
import { UserEntity } from "../../../domain/entities/user.entity"
import { AuthUser } from "@/modules/auth/domain/types"
import Wrapper from "@/shared/components/layout/wrapper"
import { Card, CardContent } from "@/shared/components/ui/card"

export function AdminListPage({
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
          <h1 className="page-title">Admins</h1>
        </div>

        <Card>
          <CardContent>
            <UserTable data={users} currentUser={currentUser} editHrefSuffix="?profile=true" showExtraActions={false} />
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  )
}
