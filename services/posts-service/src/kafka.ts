import { Kafka, Partitioners } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

// Configuración de Kafka desde variables de entorno
const KAFKA_BROKER = process.env.KAFKA_BROKER || "localhost:9092";
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || "posts-service";

// Crear instancia de Kafka
export const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: [KAFKA_BROKER],
  // Opcional: agregar configuración de reconexión
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

// Producer con LegacyPartitioner para evitar el warning
export const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner, // ← ESTO ELIMINA EL WARNING
});

// Consumer (opcional, si necesitas consumir eventos)
export const consumer = kafka.consumer({
  groupId: `${CLIENT_ID}-group`,
});

// Topics
export const POSTS_TOPIC = "posts";
export const USERS_TOPIC = "users"; // Ejemplo adicional
export const NOTIFICATIONS_TOPIC = "notifications"; // Ejemplo adicional

// Función para conectar el producer
export async function connectKafkaProducer() {
  try {
    await producer.connect();
    console.log("✅ Kafka Producer connected successfully");
  } catch (error) {
    console.error("❌ Error connecting Kafka Producer:", error);
    // Podrías agregar lógica de reintento aquí
  }
}

// Función para conectar el consumer (si lo necesitas)
export async function connectKafkaConsumer() {
  try {
    await consumer.connect();
    console.log("✅ Kafka Consumer connected successfully");
  } catch (error) {
    console.error("❌ Error connecting Kafka Consumer:", error);
  }
}

// Función para desconectar todo
export async function disconnectKafka() {
  try {
    await producer.disconnect();
    console.log("✅ Kafka Producer disconnected");
  } catch (error) {
    console.error("❌ Error disconnecting Kafka Producer:", error);
  }

  try {
    await consumer.disconnect();
    console.log("✅ Kafka Consumer disconnected");
  } catch (error) {
    console.error("❌ Error disconnecting Kafka Consumer:", error);
  }
}

// Función para publicar mensajes de manera segura
export async function sendKafkaMessage(topic: string, key: string, value: any) {
  try {
    await producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(value),
        },
      ],
    });
    console.log(`📨 Message sent to topic ${topic} with key ${key}`);
  } catch (error) {
    console.error(`❌ Error sending message to Kafka topic ${topic}:`, error);
    throw error;
  }
}

// Inicialización automática al importar (opcional)
// connectKafkaProducer();
