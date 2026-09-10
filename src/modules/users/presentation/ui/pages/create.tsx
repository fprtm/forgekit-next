import * as React from "react"
import { UserProfileForm } from "../components/form"
import { Button } from "@/shared/components/ui/button"
import Link from "next/link"
import Wrapper from "@/shared/components/layout/wrapper"
import { routes } from "@/shared/config/routes"
import { Card, CardContent } from "@/shared/components/ui/card"

export function UserCreatePage() {
  return (
    <Wrapper>
      <div className="page-shell">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={routes.dashboard.users.root} data-testid="back-button">← Back</Link>
          </Button>
          <h1 className="page-title">Create User</h1>
        </div>

        <Card>
          <CardContent>
            <UserProfileForm />
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  )
}
