import { Request, Response } from "express";
import { prisma } from "../prisma";
import { producer, POSTS_TOPIC } from "../kafka";

// GET /posts - list posts with pagination
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
        include: {
          author: {
            select: {
              id: true,
              name: true,
              career: true,
              semester: true,
              rating: true,
              skills: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getPosts", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// POST /posts - create new post
export async function createPost(req: Request, res: Response) {
  try {
    const { title, content, type, careerSpace, skills, authorId } = req.body;

    if (!title || !content || !type || !careerSpace || !authorId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        type: type.toUpperCase(),
        careerSpace,
        skills: skills || [],
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            career: true,
            semester: true,
            rating: true,
            skills: true,
          },
        },
      },
    });

    // Publish event to Kafka
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
      post,
    });
  } catch (error) {
    console.error("Error in createPost", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// GET /posts/:id - get single post
export async function getPostById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            career: true,
            semester: true,
            rating: true,
            skills: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.json({ post });
  } catch (error) {
    console.error("Error in getPostById", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// DELETE /posts/:id - delete post
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

    // Publish event to Kafka
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
    console.error("Error in deletePost", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
