import amqp from "amqplib";

export class EventConsumer {
  private connection: any = null;
  private channel: any = null;
  private isConnected = false;
  private rabbitmqUrl: string;
  private queueName = "users-service-queue";

  constructor() {
    this.rabbitmqUrl =
      process.env.RABBITMQ_URL || "amqp://admin:admin123@rabbitmq:5672";
  }

  async connect() {
    if (this.isConnected) return;

    try {
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange("user-events", "fanout", {
        durable: true,
      });

      const queue = await this.channel.assertQueue(this.queueName, {
        exclusive: false,
        durable: true,
      });

      await this.channel.bindQueue(queue.queue, "user-events", "");

      this.isConnected = true;
      console.log("✅ Users-service connected to RabbitMQ");

      this.connection.on("close", () => {
        console.log("❌ RabbitMQ connection closed, reconnecting...");
        this.isConnected = false;
        setTimeout(() => this.connect(), 5000);
      });

      return queue.queue;
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async startConsuming(userService: any) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      console.log("🔄 Starting to consume events...");

      this.channel.consume(
        this.queueName,
        async (message: any) => {
          if (message !== null) {
            try {
              const event = JSON.parse(message.content.toString());
              console.log(`📥 Received event: ${event.type}`, event.data);

              switch (event.type) {
                case "USER_CREATED":
                  await this.handleUserCreated(event.data, userService);
                  break;
                case "USER_UPDATED":
                  await this.handleUserUpdated(event.data, userService);
                  break;
                default:
                  console.log(`Unknown event type: ${event.type}`);
              }

              this.channel.ack(message);
            } catch (error) {
              console.error("Error processing message:", error);
              this.channel.nack(message, false, false);
            }
          }
        },
        { noAck: false }
      );
    } catch (error) {
      console.error("Failed to start consuming:", error);
    }
  }

  async handleUserCreated(userData: any, userService: any) {
    try {
      console.log(`Processing USER_CREATED for: ${userData.email}`);

      const result = await userService.createUserProfile({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        image: userData.image || "",
        role: userData.role || "user",
      });

      console.log(
        `✅ User profile created in users-service: ${userData.email}`
      );
      return result;
    } catch (error) {
      console.error("Failed to create user profile:", error);
    }
  }

  async handleUserUpdated(userData: any, userService: any) {
    try {
      console.log(`Processing USER_UPDATED for: ${userData.email}`);

      const result = await userService.updateUserProfile(userData.id, {
        name: userData.name,
        email: userData.email,
        image: userData.image,
        role: userData.role,
      });

      console.log(
        `✅ User profile updated in users-service: ${userData.email}`
      );
      return result;
    } catch (error) {
      console.error("Failed to update user profile:", error);
    }
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    this.isConnected = false;
  }
}

export const eventConsumer = new EventConsumer();
