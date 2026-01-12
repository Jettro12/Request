import { Request, Response } from "express";
import { prisma } from "../prisma";
import { producer, POSTS_TOPIC } from "../kafka";

// Datos mock para usuarios (temporal)
const mockUsers: Record<string, any> = {
  cmk56lt4f0007qj55so4afsyi: {
    id: "cmk56lt4f0007qj55so4afsyi",
    name: "Usuario de Prueba",
    email: "usuario@test.com",
    career: "Ingeniería en Sistemas",
    semester: 6,
    rating: 4.5,
    skills: ["JavaScript", "React", "Node.js"],
  },
  user2: {
    id: "user2",
    name: "María García",
    email: "maria@test.com",
    career: "Ingeniería Civil",
    semester: 4,
    rating: 4.2,
    skills: ["AutoCAD", "Estructuras", "Cálculo"],
  },
};

// GET /posts - list posts with pagination (VERSIÓN CON MOCK)
export async function getPosts(req: Request, res: Response) {
  try {
    const careerSpace = req.query.careerSpace as string | undefined;
    const type = req.query.type as string | undefined;
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (careerSpace && careerSpace !== "Todos los espacios") {
      where.careerSpace = careerSpace;
    }
    if (type && type !== "all") {
      where.type = type.toUpperCase();
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    const postsWithMockUsers = posts.map((post) => ({
      ...post,
      author: mockUsers[post.authorId] || {
        id: post.authorId,
        name: `Usuario ${post.authorId.substring(0, 8)}`,
        email: `${post.authorId}@example.com`,
        career: "No especificada",
        semester: 0,
        rating: 0,
        skills: [],
      },
    }));

    return res.json({
      posts: postsWithMockUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in getPosts:", error.message);
    } else {
      console.error("Error in getPosts:", error);
    }
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// Versión simplificada de ensureUserExists
async function ensureUserExists(userId: string, userData?: any) {
  try {
    console.log(`👤 Mock user ${userId} referenced`);

    return {
      id: userId,
      email: userData?.email || `${userId}@example.com`,
      name: userData?.name || `Usuario ${userId.substring(0, 8)}`,
      career: userData?.career || "Ingeniería en Sistemas",
      semester: userData?.semester || 0,
      rating: userData?.rating || 0,
      skills: userData?.skills || [],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.warn(`⚠️ Mock user ${userId}:`, error.message);
    } else {
      console.warn(`⚠️ Mock user ${userId}:`, error);
    }
    return null;
  }
}

// POST /posts - create new post (VERSIÓN CON MOCK)
export async function createPost(req: Request, res: Response) {
  try {
    const {
      title,
      content,
      type,
      careerSpace,
      skills,
      authorId,
      authorEmail,
      authorName,
    } = req.body;

    if (!title || !content || !type || !careerSpace || !authorId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log(`📝 Creating post for user: ${authorId}`);

    const mockUser = await ensureUserExists(authorId, {
      email: authorEmail,
      name: authorName,
    });

    const post = await prisma.post.create({
      data: {
        title,
        content,
        type: type.toUpperCase(),
        careerSpace,
        skills: skills || [],
        authorId,
      },
    });

    await producer.send({
      topic: POSTS_TOPIC,
      messages: [
        {
          key: post.id,
          value: JSON.stringify({ action: "create", post }),
        },
      ],
    });

    return res.status(201).json({
      message: "Post created successfully",
      post: {
        ...post,
        author: mockUser,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in createPost:", error.message);
    } else {
      console.error("Error in createPost:", error);
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

// GET /posts/:id
export async function getPostById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.json({
      post: {
        ...post,
        author: mockUsers[post.authorId] || {
          id: post.authorId,
          name: `Usuario ${post.authorId.substring(0, 8)}`,
          career: "No especificada",
          semester: 0,
          rating: 0,
          skills: [],
        },
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in getPostById:", error.message);
    } else {
      console.error("Error in getPostById:", error);
    }
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// PUT /posts/:id
export async function updatePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, content, type, careerSpace, skills, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const existingPost = await prisma.post.findUnique({ where: { id } });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingPost.authorId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: title || existingPost.title,
        content: content || existingPost.content,
        type: type ? type.toUpperCase() : existingPost.type,
        careerSpace: careerSpace || existingPost.careerSpace,
        skills: skills || existingPost.skills,
      },
    });

    await producer.send({
      topic: POSTS_TOPIC,
      messages: [
        {
          key: id,
          value: JSON.stringify({ action: "update", post: updatedPost }),
        },
      ],
    });

    return res.json({
      message: "Post updated successfully",
      post: {
        ...updatedPost,
        author: mockUsers[existingPost.authorId],
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in updatePost:", error.message);
    } else {
      console.error("Error in updatePost:", error);
    }
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// DELETE /posts/:id
export async function deletePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await prisma.post.delete({ where: { id } });

    await producer.send({
      topic: POSTS_TOPIC,
      messages: [
        {
          key: id,
          value: JSON.stringify({ action: "delete", postId: id }),
        },
      ],
    });

    return res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in deletePost:", error.message);
    } else {
      console.error("Error in deletePost:", error);
    }
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
