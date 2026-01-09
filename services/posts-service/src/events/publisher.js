import amqp from "amqplib";

class EventPublisher {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isConnected = false;
    this.rabbitmqUrl =
      process.env.RABBITMQ_URL || "amqp://admin:admin123@rabbitmq:5672";
  }

  async connect() {
    if (this.isConnected) return;

    try {
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Declarar el exchange
      await this.channel.assertExchange("user-events", "fanout", {
        durable: true,
      });

      this.isConnected = true;
      console.log("✅ Connected to RabbitMQ");

      // Manejar reconexión
      this.connection.on("close", () => {
        console.log("❌ RabbitMQ connection closed, reconnecting...");
        this.isConnected = false;
        setTimeout(() => this.connect(), 5000);
      });
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publishUserCreated(userData) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const message = {
        type: "USER_CREATED",
        data: userData,
        timestamp: new Date().toISOString(),
        service: "auth-service",
      };

      this.channel.publish(
        "user-events",
        "",
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
        }
      );

      console.log(
        `✅ Published USER_CREATED event for user: ${userData.email}`
      );
      return true;
    } catch (error) {
      console.error("Failed to publish event:", error);
      return false;
    }
  }

  async publishUserUpdated(userData) {
    // Similar a publishUserCreated pero para updates
    if (!this.isConnected) await this.connect();

    const message = {
      type: "USER_UPDATED",
      data: userData,
      timestamp: new Date().toISOString(),
      service: "auth-service",
    };

    this.channel.publish(
      "user-events",
      "",
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
      }
    );
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    this.isConnected = false;
  }
}

// Singleton instance
export const eventPublisher = new EventPublisher();

// Inicializar conexión al iniciar
eventPublisher.connect();
