// services/userService.ts
import { PrismaClient, User } from "@prisma/client";

export interface UserData {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role?: string;
}

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async createUserProfile(userData: UserData): Promise<User> {
    try {
      console.log("Creating user profile:", userData.email);

      const existingUser = await this.prisma.user.findUnique({
        where: { id: userData.id },
      });

      if (existingUser) {
        console.log("User already exists:", userData.id);
        return existingUser;
      }

      const newUser = await this.prisma.user.create({
        data: {
          id: userData.id,
          email: userData.email,
          name: userData.name || "",
          image: userData.image || "",
          role: userData.role || "user",
          createdAt: new Date(),
        },
      });

      console.log("User profile created:", newUser.email);
      return newUser;
    } catch (error) {
      console.error("Error in createUserProfile:", error);
      throw error;
    }
  }

  async updateUserProfile(
    id: string,
    data: Partial<UserData>
  ): Promise<User | null> {
    try {
      const existingUser = await this.prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new Error("User not found");
      }

      const updated = await this.prisma.user.update({
        where: { id },
        data: {
          name: data.name ?? existingUser.name,
          email: data.email ?? existingUser.email,
          image: data.image ?? existingUser.image,
          role: data.role ?? existingUser.role,
        },
      });

      return updated;
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      throw error;
    }
  }
}

export default UserService;
