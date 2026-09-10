export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignInResult {
  success: boolean;
}

/**
 * Abstracts the underlying auth framework (e.g. NextAuth) so application/domain
 * code never imports framework-specific APIs directly.
 */
export interface IAuthProvider {
  signIn(credentials: SignInCredentials): Promise<SignInResult>;
  signOut(): Promise<void>;
}
