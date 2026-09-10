import { UserRole } from "@/shared/config/roles";
import { EmailValueObject } from "../value-objects/email.value-object";

export interface UserProfile {
  id: string
  userId: string
  bio: string | null
  phoneNumber: string | null
  dateOfBirth: string | null
  gender: string | null
  preferredPronouns: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postalCode: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Full set of persisted attributes for a User, as stored/loaded from infrastructure.
 * Used by `UserEntity.reconstruct` to rebuild an entity from trusted data with no validation.
 */
export interface UserEntityProps {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
  role: UserRole
  password?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  profile?: UserProfile | null
}

/**
 * Input accepted by `UserEntity.create` to construct a brand new user.
 * Fields that infrastructure normally defaults are optional here and are
 * filled in by the entity itself.
 */
export interface CreateUserProps {
  id?: string
  name: string | null
  email: string
  role: UserRole
  password?: string | null
  emailVerified?: Date | null
  image?: string | null
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
  profile?: UserProfile | null
}

export class UserEntity {
  public readonly id: string
  public readonly name: string | null
  public readonly email: string
  public readonly emailVerified: Date | null
  public readonly image: string | null
  public readonly role: UserRole
  public readonly password?: string | null
  public readonly isActive: boolean
  public readonly createdAt: Date
  public readonly updatedAt: Date
  public readonly profile?: UserProfile | null

  private constructor(props: UserEntityProps) {
    this.id = props.id
    this.name = props.name
    this.email = props.email
    this.emailVerified = props.emailVerified
    this.image = props.image
    this.role = props.role
    this.password = props.password
    this.isActive = props.isActive
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
    this.profile = props.profile
  }

  /**
   * Creates a brand new user, validating the email through `EmailValueObject`.
   * Throws `DomainException` (via EmailValueObject) when the email is invalid.
   */
  public static create(props: CreateUserProps): UserEntity {
    const email = EmailValueObject.create(props.email)
    const now = new Date()

    return new UserEntity({
      id: props.id ?? crypto.randomUUID(),
      name: props.name,
      email: email.getValue(),
      emailVerified: props.emailVerified ?? null,
      image: props.image ?? null,
      role: props.role,
      password: props.password ?? null,
      isActive: props.isActive ?? true,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      profile: props.profile ?? null,
    })
  }

  /**
   * Rebuilds a `UserEntity` from data already known to be valid (e.g. rows
   * loaded from the database). Performs no validation.
   */
  public static reconstruct(raw: UserEntityProps): UserEntity {
    return new UserEntity(raw)
  }

  /**
   * Plain-object projection so this entity can cross the Server->Client
   * Component boundary (React's RSC serializer rejects class instances but
   * respects toJSON()) and so it survives JSON.stringify anywhere else.
   */
  public toJSON(): UserEntityProps {
    return this.toProps()
  }

  private toProps(): UserEntityProps {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      emailVerified: this.emailVerified,
      image: this.image,
      role: this.role,
      password: this.password,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      profile: this.profile,
    }
  }

  public changeRole(role: UserRole): UserEntity {
    return new UserEntity({
      ...this.toProps(),
      role,
      updatedAt: new Date(),
    })
  }

  public deactivate(): UserEntity {
    return new UserEntity({
      ...this.toProps(),
      isActive: false,
      updatedAt: new Date(),
    })
  }
}
