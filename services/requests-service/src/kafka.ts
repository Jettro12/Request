import { Kafka, Producer, Consumer, Partitioners } from "kafkajs";

const brokers = (process.env.KAFKA_BROKER || "kafka:29092").split(",");
const clientId = "requests-service";

export const kafka = new Kafka({
  clientId,
  brokers,
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

// Variables para manejar estado
let producer: Producer | null = null;
let consumer: Consumer | null = null;
let isInitialized = false;

export const REQUESTS_TOPIC = process.env.REQUESTS_TOPIC || "requests";

export async function getProducer(): Promise<Producer> {
  if (!producer) {
    producer = kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });
  }

  if (!isInitialized) {
    await initKafka();
  }

  return producer;
}

export async function getConsumer(): Promise<Consumer> {
  if (!consumer) {
    consumer = kafka.consumer({
      groupId: "requests-service-group",
    });
  }

  if (!isInitialized) {
    await initKafka();
  }

  return consumer;
}

export async function initKafka() {
  if (isInitialized) return;

  console.log("Connecting to Kafka brokers:", brokers);
  const admin = kafka.admin();
  const maxRetries = 8;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await admin.connect();
      console.log("Kafka admin connected");

      // Verificar si el topic existe
      const topics = await admin.listTopics();
      if (!topics.includes(REQUESTS_TOPIC)) {
        console.log(`Creating topic: ${REQUESTS_TOPIC}`);
        await admin.createTopics({
          topics: [
            {
              topic: REQUESTS_TOPIC,
              numPartitions: 1,
              replicationFactor: 1,
            },
          ],
          waitForLeaders: true,
        });
      }
      await admin.disconnect();

      // Conectar producer
      const prod = await getProducer();
      await prod.connect();
      console.log("Kafka producer connected");

      // Conectar consumer
      const cons = await getConsumer();
      await cons.connect();
      await cons.subscribe({
        topic: REQUESTS_TOPIC,
        fromBeginning: false,
      });
      console.log("Kafka consumer subscribed");

      isInitialized = true;
      console.log("Kafka initialization complete");
      return;
    } catch (err) {
      attempt++;
      console.warn(
        `Kafka init attempt ${attempt} failed:`,
        err instanceof Error ? err.message : err,
      );

      try {
        await admin.disconnect().catch(() => {});
        if (producer) await producer.disconnect().catch(() => {});
        if (consumer) await consumer.disconnect().catch(() => {});
      } catch (_) {}

      if (attempt >= maxRetries) {
        console.error("Unable to initialize Kafka after multiple attempts");
        // No lanzamos error, dejamos que el servicio continúe
        return;
      }

      await new Promise((r) => setTimeout(r, 2000 * attempt)); // Backoff exponencial
    }
  }
}

export async function sendToKafka(topic: string, key: string, value: any) {
  try {
    const producer = await getProducer();

    await producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(value),
        },
      ],
    });

    console.log(`✅ Message sent to Kafka topic ${topic}:`, key);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send message to Kafka topic ${topic}:`, error);
    return false;
  }
}

// Función para verificar conexión
export async function checkKafkaConnection() {
  try {
    await initKafka();
    return true;
  } catch (error) {
    console.error("Kafka connection check failed:", error);
    return false;
  }
}
