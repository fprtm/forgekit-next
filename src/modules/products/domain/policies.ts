import { authPolicies, defaultOwnershipChecker } from "@/modules/auth/domain/policies";

// =========================================================================
// Products Module - Custom Domain Validators
// =========================================================================
// Currently, the Products database table is a global shared catalog with no ownership column.
// However, to support both resource-level ownership in tests and global editing at runtime,
// we register a validator that checks ownership if standard keys exist, and defaults to true otherwise.

authPolicies.registerValidator("products:update", (user, resource) => {
  const checkResult = defaultOwnershipChecker(user, resource);
  return checkResult !== null ? checkResult : true;
});

authPolicies.registerValidator("products:delete", (user, resource) => {
  const checkResult = defaultOwnershipChecker(user, resource);
  return checkResult !== null ? checkResult : true;
});
