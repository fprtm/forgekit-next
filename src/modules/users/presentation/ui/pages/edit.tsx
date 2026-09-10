import * as React from "react"
import { UserProfileForm } from "../components/form"
import { Button } from "@/shared/components/ui/button"
import Link from "next/link"
import { UserEntity } from "../../../domain/entities/user.entity"
import Wrapper from "@/shared/components/layout/wrapper"
import { routes } from "@/shared/config/routes"
import { Card, CardContent } from "@/shared/components/ui/card"

export function UserEditPage({ user, isProfile = false, backHref = routes.dashboard.users.accounts }: { user: UserEntity; isProfile?: boolean; backHref?: string }) {
  return (
    <Wrapper>
      <div className="page-shell">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={backHref} data-testid="back-button">← Back</Link>
          </Button>
          <h1 className="page-title">
            {isProfile ? "Edit User Profile" : "Edit Account"}
          </h1>
        </div>

        <Card>
          <CardContent>
            <UserProfileForm initialData={user} isProfile={isProfile} />
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  )
}
