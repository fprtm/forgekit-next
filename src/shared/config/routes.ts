export const routes = {
  dashboard: {
    root: "/d",
    products: {
      list: "/d/products",
      create: "/d/products/create",
      detail: (id: string) => `/d/products/${id}`,
    },
    users: {
      root: "/d/users",
      accounts: "/d/users/accounts",
      admins: "/d/users/admins",
      users: "/d/users/users",
      create: "/d/users/create",
      edit: (id: string) => `/d/users/${id}/edit`,
    },
    settings: {
      root: "/d/settings",
      notifications: "/d/settings/notifications",
    },
    profile: "/d/profile",
  },
  auth: {
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
  },
} as const;
