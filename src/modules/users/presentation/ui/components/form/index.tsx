"use client"

import * as React from "react"
import { updateUser } from "../../actions"

export function UserProfileForm() {
  return (
    <form className="space-y-4" action={async (formData) => {
      const name = formData.get("name")
      await updateUser({ name })
    }}>
      <div>
        <label className="block text-sm font-medium">Full Name</label>
        <input name="name" type="text" className="border rounded px-3 py-2 w-full" placeholder="Enter your name" />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Update Profile
      </button>
    </form>
  )
}
