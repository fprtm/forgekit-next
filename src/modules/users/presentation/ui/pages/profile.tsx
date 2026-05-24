import * as React from "react"
import { UserProfileForm } from "../components/form"
import Wrapper from "@/components/layout/wrapper"

export function UserProfilePage() {
  return (
    <Wrapper>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
      </div>
      
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Edit Information</h2>
        <UserProfileForm />
      </div>
    </Wrapper>
  )
}
