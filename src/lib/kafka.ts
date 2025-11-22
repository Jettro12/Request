import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "notifications-service",
  brokers: ["localhost:9092"], // Cambia por tu broker
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "notifications-group" });

export async function connectKafka() {
  await producer.connect();
  await consumer.connect();
}
