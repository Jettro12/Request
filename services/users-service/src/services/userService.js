// services/userService.js

class UserService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createUserProfile(userData) {
    try {
      console.log("📝 Creating user profile in users-service:", userData.email);

      const existingUser = await this.prisma.user.findUnique({
        where: { id: userData.id },
      });

      if (existingUser) {
        console.log("⚠️ User already exists:", userData.id);
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

      console.log("✅ User profile created:", newUser.email);
      return newUser;
    } catch (error) {
      console.error("❌ Error in createUserProfile:", error);
      throw error;
    }
  }

  async updateUserProfile(userId, updateData) {
    try {
      console.log("📝 Updating user profile:", userId);

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      console.log("✅ User profile updated:", updatedUser.email);
      return updatedUser;
    } catch (error) {
      console.error("❌ Error in updateUserProfile:", error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      return await this.prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (error) {
      console.error("❌ Error in getUserById:", error);
      throw error;
    }
  }
}

// Use CommonJS export to avoid runtime SyntaxError under CJS loader
module.exports = UserService;
