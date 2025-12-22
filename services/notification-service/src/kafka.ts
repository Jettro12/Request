import { Kafka, Producer, Consumer, Admin } from "kafkajs";

const brokers = (process.env.KAFKA_BROKER || "kafka:29092").split(",");
const clientId = "notification-service";

export const kafka = new Kafka({ clientId, brokers });
export const producer: Producer = kafka.producer();
export const consumer: Consumer = kafka.consumer({
  groupId: "notification-service-group",
});

export const NOTIFICATION_TOPIC =
  process.env.NOTIFICATION_TOPIC || "notifications";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitForTopicLeader(
  admin: Admin,
  topic: string,
  timeout = 30000
) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const metadata = await admin.fetchTopicMetadata({ topics: [topic] });
      if (metadata && metadata.topics && metadata.topics.length > 0) {
        const t = metadata.topics[0];
        const allHaveLeader = t.partitions.every((p) => p.leader !== -1);
        if (allHaveLeader) return true;
      }
    } catch (err) {
      // ignore transient fetch errors
    }
    await sleep(1000);
  }
  return false;
}

export async function initKafka() {
  console.log("Connecting to Kafka brokers:", brokers);
  const admin = kafka.admin();
  const maxRetries = 8;
  let attempt = 0;
  let backoff = 1000;

  while (attempt < maxRetries) {
    try {
      await admin.connect();

      // Create topic (idempotent) and wait for leaders
      await admin.createTopics({
        topics: [{ topic: NOTIFICATION_TOPIC, numPartitions: 1 }],
        waitForLeaders: true,
      });

      const ready = await waitForTopicLeader(admin, NOTIFICATION_TOPIC, 20000);
      if (!ready) {
        throw new Error("Topic leaders not ready yet");
      }

      // Connect producer and consumer
      await producer.connect();
      await consumer.connect();
      await consumer.subscribe({
        topic: NOTIFICATION_TOPIC,
        fromBeginning: false,
      });

      console.log("Kafka connected and topic subscribed:", NOTIFICATION_TOPIC);
      await admin.disconnect();
      return;
    } catch (err) {
      attempt++;
      console.warn(
        `Kafka init attempt ${attempt} failed: ${err}. Retrying in ${backoff}ms...`
      );
      try {
        await admin.disconnect();
      } catch (_) {}
      await sleep(backoff);
      backoff = Math.min(20000, backoff * 2);
    }
  }
  throw new Error("Unable to initialize Kafka after multiple attempts");
}

// Starts the consumer.run in a resilient loop: if it crashes, restart after delay
export async function startConsumerLoop(eachMessageHandler: any) {
  const restartDelay = 2000;
  while (true) {
    try {
      await consumer.run({ eachMessage: eachMessageHandler });
      console.warn("Kafka consumer.run exited unexpectedly — restarting...");
    } catch (err) {
      console.error("Kafka consumer failed, will restart:", err);
    }
    await sleep(restartDelay);
  }
}
