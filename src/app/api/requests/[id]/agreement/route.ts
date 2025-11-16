import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { MessageType } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { action } = await request.json();
    const { id: requestId } = await params;

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        fromUser: true,
        toUser: true,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Request no encontrado" },
        { status: 404 }
      );
    }

    let updateData: any = {};
    let messageType = "TEXT";
    let messageContent = "";
    let shouldShowRating = false;
    let bothAccepted = false;

    if (action === "propose") {
      updateData.agreementProposedAt = new Date();
      updateData.agreementAcceptedBy = [currentUser.id];
      messageType = "AGREEMENT_PROPOSAL";
      messageContent = `${currentUser.name} ha propuesto cerrar el acuerdo`;

      await prisma.message.createMany({
        data: [
          {
            content: `Has propuesto cerrar el acuerdo con ${
              currentUser.id === existingRequest.fromUserId
                ? existingRequest.toUser.name
                : existingRequest.fromUser.name
            }`,
            senderId: currentUser.id,
            receiverId: currentUser.id,
            requestId: requestId,
            type: messageType as MessageType,
          },
          {
            content: `${currentUser.name} ha propuesto cerrar el acuerdo`,
            senderId: currentUser.id,
            receiverId:
              currentUser.id === existingRequest.fromUserId
                ? existingRequest.toUserId
                : existingRequest.fromUserId,
            requestId: requestId,
            type: messageType as MessageType,
          },
        ],
      });

      // 🔔 NOTIFICACIÓN: Propuesta de acuerdo
      await createNotification({
        type: "AGREEMENT_PROPOSAL",
        userId:
          currentUser.id === existingRequest.fromUserId
            ? existingRequest.toUserId
            : existingRequest.fromUserId,
        title: "Propuesta de acuerdo",
        message: `${currentUser.name} ha propuesto cerrar el acuerdo`,
        relatedId: requestId,
      });
    } else if (action === "accept") {
      const acceptedBy = [
        ...(existingRequest.agreementAcceptedBy || []),
        currentUser.id,
      ];
      updateData.agreementAcceptedBy = [...new Set(acceptedBy)];

      messageType = "AGREEMENT_ACCEPTED";
      messageContent = `${currentUser.name} ha aceptado el acuerdo`;

      bothAccepted = updateData.agreementAcceptedBy.length === 2;

      if (bothAccepted) {
        messageContent = `${currentUser.name} ha aceptado el acuerdo - Ambos han aceptado`;

        await prisma.message.createMany({
          data: [
            {
              content: messageContent,
              senderId: currentUser.id,
              receiverId: currentUser.id,
              requestId: requestId,
              type: messageType as MessageType,
            },
            {
              content: messageContent,
              senderId: currentUser.id,
              receiverId:
                currentUser.id === existingRequest.fromUserId
                  ? existingRequest.toUserId
                  : existingRequest.fromUserId,
              requestId: requestId,
              type: messageType as MessageType,
            },
          ],
        });

        shouldShowRating = true;

        // 🔔 NOTIFICACIÓN: Ambos aceptaron el acuerdo
        await createNotification({
          type: "AGREEMENT_ACCEPTED",
          userId:
            currentUser.id === existingRequest.fromUserId
              ? existingRequest.toUserId
              : existingRequest.fromUserId,
          title: "Acuerdo aceptado",
          message: `${currentUser.name} aceptó tu propuesta de acuerdo - Ambos pueden calificar ahora`,
          relatedId: requestId,
        });
      } else {
        shouldShowRating = true;

        await prisma.message.createMany({
          data: [
            {
              content: messageContent,
              senderId: currentUser.id,
              receiverId: currentUser.id,
              requestId: requestId,
              type: messageType as MessageType,
            },
            {
              content: messageContent,
              senderId: currentUser.id,
              receiverId:
                currentUser.id === existingRequest.fromUserId
                  ? existingRequest.toUserId
                  : existingRequest.fromUserId,
              requestId: requestId,
              type: messageType as MessageType,
            },
          ],
        });

        // 🔔 NOTIFICACIÓN: Un usuario aceptó el acuerdo
        await createNotification({
          type: "AGREEMENT_ACCEPTED",
          userId:
            currentUser.id === existingRequest.fromUserId
              ? existingRequest.toUserId
              : existingRequest.fromUserId,
          title: "Acuerdo aceptado",
          message: `${currentUser.name} aceptó tu propuesta de acuerdo`,
          relatedId: requestId,
        });
      }
    } else if (action === "reject") {
      updateData.agreementProposedAt = null;
      updateData.agreementAcceptedBy = [];
      messageType = "AGREEMENT_REJECTED";
      messageContent = `${currentUser.name} ha rechazado el acuerdo`;

      await prisma.message.createMany({
        data: [
          {
            content: messageContent,
            senderId: currentUser.id,
            receiverId: currentUser.id,
            requestId: requestId,
            type: messageType as MessageType,
          },
          {
            content: messageContent,
            senderId: currentUser.id,
            receiverId:
              currentUser.id === existingRequest.fromUserId
                ? existingRequest.toUserId
                : existingRequest.fromUserId,
            requestId: requestId,
            type: messageType as MessageType,
          },
        ],
      });

      // 🔔 NOTIFICACIÓN: Acuerdo rechazado
      await createNotification({
        type: "AGREEMENT_REJECTED",
        userId:
          currentUser.id === existingRequest.fromUserId
            ? existingRequest.toUserId
            : existingRequest.fromUserId,
        title: "Acuerdo rechazado",
        message: `${currentUser.name} rechazó tu propuesta de acuerdo`,
        relatedId: requestId,
      });
    }

    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: updateData,
    });

    console.log("🔵 [BACKEND-AGREEMENT] Action:", action);
    console.log("🔵 [BACKEND-AGREEMENT] BothAccepted:", bothAccepted);
    console.log("🔵 [BACKEND-AGREEMENT] ShouldShowRating:", shouldShowRating);

    return NextResponse.json({
      request: updatedRequest,
      message:
        action === "propose"
          ? "Acuerdo propuesto"
          : action === "accept"
          ? "Acuerdo aceptado"
          : "Acuerdo rechazado",
      shouldShowRating,
      currentUserId: currentUser.id,
      bothAccepted: bothAccepted,
    });
  } catch (error) {
    console.error("❌ [BACKEND-AGREEMENT] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
