import { Request, Response } from 'express';
import { prisma } from '../prisma';

/* =====================================================
   GET /search - Buscar usuarios
===================================================== */
export async function searchUsers(req: Request, res: Response) {
  try {
    const { query, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (query && query !== 'undefined') {
      where.OR = [
        { name: { contains: query as string, mode: 'insensitive' } },
        { email: { contains: query as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      users,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Error in searchUsers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/* =====================================================
   GET /:id - Obtener perfil completo
===================================================== */
export async function getUserProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        bio: true,
        skills: true,
        interests: true,
        career: true,
        semester: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ profile: user });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/* =====================================================
   GET /career/:career - Usuarios por carrera (opcional)
===================================================== */
export async function getUsersByCareer(req: Request, res: Response) {
  try {
    const { career } = req.params;
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const skip = (page - 1) * limit;

    const where = career ? { career } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          career: true,
          image: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error in getUsersByCareer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/* =====================================================
   POST /profile - Crear perfil (solo si no existe)
===================================================== */
export async function createProfile(req: Request, res: Response) {
  try {
    const { userId, name, email, image } = req.body;

    if (!userId || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        image: image || null,
        bio: '',
        skills: [],
        interests: [],
      },
    });

    return res.status(201).json({
      message: 'Profile created successfully',
      user,
    });
  } catch (error) {
    console.error('Error in createProfile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/* =====================================================
   PUT /:id/profile - Actualizar perfil completo
===================================================== */
export async function updateProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, image, bio, skills, interests, career, semester } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name ?? existingUser.name,
        image: image ?? existingUser.image,
        bio: bio ?? existingUser.bio,
        skills: Array.isArray(skills) ? skills : existingUser.skills,
        interests: Array.isArray(interests)
          ? interests
          : existingUser.interests,
        career: career ?? existingUser.career,
        semester: semester ?? existingUser.semester,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        skills: true,
        interests: true,
        career: true,
        semester: true,
        image: true,
        updatedAt: true,
      },
    });

    return res.json({
      message: 'Profile updated successfully',
      profile: updatedUser,
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
