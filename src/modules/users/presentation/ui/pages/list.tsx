import * as React from "react"
import { UserTable } from "../components/table"
import { UserEntity } from "../../../domain/types"

export function UserListPage({ users }: { users: UserEntity[] }) {
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
      </div>
      
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <UserTable data={users} />
      </div>
    </div>
  )
}
