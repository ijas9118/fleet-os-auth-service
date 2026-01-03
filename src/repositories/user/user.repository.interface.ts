import type { IUser } from "@/models/user.model";

export interface IUserRepository {
  /**
   * Retrieves a user by email.
   *
   * @param email - Email address to query.
   * @returns A user object if found, otherwise null.
   */
  getUserByEmail: (email: string) => Promise<IUser | null>;

  /**
   * Retrieves a user by ID.
   *
   * @param id - The user ID to query.
   * @returns A user object if found, otherwise null.
   */
  getUserById: (id: string) => Promise<IUser | null>;

  /**
   * Creates a new user using the provided registration data.
   * Implementations must persist the user to the database.
   *
   * @param data - User registration details.
   * @returns The newly created user object.
   */
  createUser: (data: Partial<IUser>) => Promise<IUser>;

  /**
   * Updates an existing user with the provided data.
   *
   * @param id - The ID of the user to update.
   * @param data - A partial user object containing the fields to update.
   *               Fields not included will remain unchanged.
   * @returns The updated user object if found, otherwise null.
   */
  updateUser: (id: string, data: Partial<IUser>) => Promise<IUser | null>;

  /**
   * Retrieves users by tenant ID and role.
   *
   * @param tenantId - The tenant ID.
   * @param role - The user role.
   * @returns A list of users.
   */
  getUsersByTenantAndRole: (tenantId: string, role: string) => Promise<IUser[]>;
};
