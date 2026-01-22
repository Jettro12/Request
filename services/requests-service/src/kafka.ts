import { Kafka, Producer, Partitioners } from "kafkajs";

// Configuración adaptable
const KAFKA_ENABLED = process.env.KAFKA_ENABLED !== "false";
const KAFKA_BROKER = process.env.KAFKA_BROKER || "kafka:9092";
const brokers = KAFKA_BROKER.split(",");

console.log(
  `Kafka Config: Enabled=${KAFKA_ENABLED}, Brokers=${brokers.join(",")}`,
);

let kafka: Kafka | null = null;
let producer: Producer | null = null;
let isKafkaReady = false;

export const REQUESTS_TOPIC = process.env.REQUESTS_TOPIC || "requests";

// Crear cliente Kafka
if (KAFKA_ENABLED) {
  try {
    kafka = new Kafka({
      clientId: "requests-service",
      brokers,
      retry: {
        initialRetryTime: 300,
        retries: 10,
        maxRetryTime: 10000,
      },
      connectionTimeout: 10000,
      requestTimeout: 30000,
    });
    console.log("✅ Kafka client initialized");
  } catch (error) {
    console.error("❌ Failed to initialize Kafka client:", error);
  }
}

export async function getProducer(): Promise<Producer | null> {
  if (!KAFKA_ENABLED || !kafka) {
    console.log("⚠️ Kafka is disabled or not initialized");
    return null;
  }

  if (!producer) {
    try {
      producer = kafka.producer({
        createPartitioner: Partitioners.LegacyPartitioner,
        allowAutoTopicCreation: true,
        transactionTimeout: 30000,
      });

      console.log("Attempting to connect Kafka producer...");
      await producer.connect();
      console.log("✅ Kafka producer connected");
      isKafkaReady = true;
    } catch (error) {
      console.error("❌ Failed to connect Kafka producer:", error);
      producer = null;
      isKafkaReady = false;
    }
  }

  return producer;
}

// Función para verificar conexión a Kafka
export async function checkKafkaConnection(): Promise<boolean> {
  if (!KAFKA_ENABLED) {
    return false;
  }

  if (isKafkaReady) {
    return true;
  }

  try {
    const producer = await getProducer();
    if (producer) {
      // Probar enviando un mensaje de ping
      await producer.send({
        topic: REQUESTS_TOPIC,
        messages: [
          {
            key: "ping",
            value: JSON.stringify({
              type: "ping",
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      });
      console.log("✅ Kafka connection verified");
      return true;
    }
  } catch (error) {
    console.error("❌ Kafka connection check failed:", error);
  }

  return false;
}

// Función segura para enviar mensajes
export async function sendToKafkaSafe(
  topic: string,
  key: string,
  value: any,
): Promise<boolean> {
  if (!KAFKA_ENABLED) {
    console.log(`[Kafka Disabled] Would send to ${topic}: ${key}`);
    return true; // Simular éxito
  }

  try {
    const producer = await getProducer();
    if (!producer) {
      console.log(`⚠️ Kafka producer not available for ${topic}`);
      return false;
    }

    await producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify({
            ...value,
            timestamp: new Date().toISOString(),
            service: "requests-service",
          }),
        },
      ],
    });

    console.log(`✅ Kafka event sent: ${topic} - ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send Kafka event to ${topic}:`, error);
    return false;
  }
}

// Inicialización no bloqueante
export async function initKafka(): Promise<boolean> {
  if (!KAFKA_ENABLED) {
    console.log("ℹ️ Kafka is disabled");
    return false;
  }

  console.log("Starting Kafka initialization...");

  try {
    // Intentar conectar sin bloquear
    setTimeout(async () => {
      try {
        const producer = await getProducer();
        if (producer) {
          console.log("✅ Kafka initialized successfully");
        } else {
          console.log("⚠️ Kafka producer not available");
        }
      } catch (error) {
        console.error("❌ Kafka background initialization failed:", error);
      }
    }, 5000); // Esperar 5 segundos antes de intentar

    return true;
  } catch (error) {
    console.error("❌ Kafka initialization failed:", error);
    return false;
  }
}
