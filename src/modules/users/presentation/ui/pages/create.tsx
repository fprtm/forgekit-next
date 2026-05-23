import * as React from "react"
import { UserProfileForm } from "../components/form"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function UserCreatePage() {
  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/users">← Back</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
      </div>
      
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <UserProfileForm />
      </div>
    </div>
  )
}
