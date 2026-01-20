router.post("/send", async (req, res) => {
  const { senderId, receiverId, content, requestId, type } = req.body;

  if (!senderId || !receiverId || !content || !requestId) {
    return res.status(400).json({ success: false, error: "Datos incompletos" });
  }

  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      content,
      requestId,
      type: type || "TEXT",
    },
  });

  res.json({ success: true, data: message });
});
