export class UserNotFoundException extends Error {
  constructor(idOrEmail: string) {
    super(`User with identifier ${idOrEmail} was not found.`);
    this.name = "UserNotFoundException";
  }
}

export class InvalidRoleException extends Error {
  constructor(role: string) {
    super(`The role '${role}' is not valid or unauthorized.`);
    this.name = "InvalidRoleException";
  }
}
