import { generateUniqueString } from "@/shared/lib/utils";

export interface AuthUserFixture {
  name: string;
  email: string;
  password: string;
}

export function createUserFixture(prefix = "User"): AuthUserFixture {
  const uniqueName = generateUniqueString(prefix);
  const emailSafeString = uniqueName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const uniqueEmail = `test${emailSafeString}@example.com`;

  return {
    name: uniqueName,
    email: uniqueEmail,
    password: "Secure@123",
  };
}
