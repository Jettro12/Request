/**
 * userClient.ts
 * Direct client for users-service queries.
 * Frontend can fetch user data directly from users-service instead of relying on local DB mirrors.
 */

const USERS_SERVICE_URL =
  typeof window !== "undefined"
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/users`
    : `http://users-service:4007`;

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch a user profile from users-service by ID.
 * Used by frontend when displaying user info in posts, requests, etc.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${USERS_SERVICE_URL}/${userId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`[userClient] Failed to fetch user ${userId}: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`[userClient] Error fetching user ${userId}:`, error);
    return null;
  }
}

/**
 * Search users by name/email.
 */
export async function searchUsers(query: string, page: number = 1, limit: number = 20) {
  try {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${USERS_SERVICE_URL}/search?${params}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`[userClient] Search failed: ${response.status}`);
      return [];
    }

    return response.json();
  } catch (error) {
    console.error("[userClient] Search error:", error);
    return [];
  }
}

/**
 * Batch fetch multiple users by ID.
 */
export async function getUserProfiles(userIds: string[]): Promise<Map<string, UserProfile>> {
  const results = new Map<string, UserProfile>();

  await Promise.all(
    userIds.map(async (id) => {
      const user = await getUserProfile(id);
      if (user) {
        results.set(id, user);
      }
    })
  );

  return results;
}
