import { eventPublisher } from "../events/publisher.js";

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 1. Crear usuario en auth db
    const user = await authService.registerUser({ email, password, name });

    // 2. Publicar evento de usuario creado
    await eventPublisher.publishUserCreated({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
