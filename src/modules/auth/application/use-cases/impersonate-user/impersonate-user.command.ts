export interface ImpersonateUserCommand {
  superAdminId: string;
  targetUserId: string | null; // null means stop impersonating
}
