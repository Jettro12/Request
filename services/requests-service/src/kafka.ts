import { Kafka, Producer, Consumer } from "kafkajs";

const brokers = (process.env.KAFKA_BROKER || "kafka:29092").split(",");
const clientId = "requests-service";

export const kafka = new Kafka({ clientId, brokers });
export const producer: Producer = kafka.producer();
export const consumer: Consumer = kafka.consumer({
  groupId: "requests-service-group",
});

export const REQUESTS_TOPIC = process.env.REQUESTS_TOPIC || "requests";

export async function initKafka() {
  console.log("Connecting to Kafka brokers:", brokers);
  const admin = kafka.admin();
  const maxRetries = 8;
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      await admin.connect();
      await admin.createTopics({
        topics: [{ topic: REQUESTS_TOPIC, numPartitions: 1 }],
        waitForLeaders: true,
      });
      await admin.disconnect();

      await producer.connect();
      await consumer.connect();
      await consumer.subscribe({ topic: REQUESTS_TOPIC, fromBeginning: false });
      console.log("Kafka connected and topic subscribed:", REQUESTS_TOPIC);
      return;
    } catch (err) {
      attempt++;
      console.warn(
        `Kafka init attempt ${attempt} failed: ${err}. Retrying in 2s...`
      );
      try {
        await admin.disconnect();
      } catch (_) {}
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("Unable to initialize Kafka after multiple attempts");
}
