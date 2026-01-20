router.post("/:id/agree", async (req, res) => {
  const { id } = req.params;
  const { userId, action } = req.body;

  const request = await prisma.request.findUnique({ where: { id } });

  if (!request) {
    return res.status(404).json({ error: "Request no encontrada" });
  }

  let acceptedBy = request.agreementAcceptedBy || [];

  if (action === "accept") {
    if (!acceptedBy.includes(userId)) {
      acceptedBy.push(userId);
    }
  } else {
    return res.json({
      success: true,
      status: "REJECTED",
    });
  }

  const status = acceptedBy.length === 2 ? "COMPLETED" : "ACCEPTED";

  const updated = await prisma.request.update({
    where: { id },
    data: {
      agreementAcceptedBy: acceptedBy,
      status,
    },
  });

  res.json({ success: true, data: updated });
});
