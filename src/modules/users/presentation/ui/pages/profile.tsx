import * as React from "react"
import { UserProfileForm } from "../components/form"
import { ChangePasswordForm } from "../components/change-password-form"
import { UserEntity } from "../../../domain/entities/user.entity"
import Wrapper from "@/shared/components/layout/wrapper"
import { Card, CardContent } from "@/shared/components/ui/card"

export function UserProfilePage({ user }: { user: UserEntity }) {
  return (
    <Wrapper>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">User Profile</h1>
        </div>

        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Edit Information</h2>
            <UserProfileForm initialData={user} isProfile={true} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Update your password. You&apos;ll need to enter your current password to confirm the change.
            </p>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  )
}
