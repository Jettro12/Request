// events/consumer.ts
export class EventConsumer {
  constructor() {
    console.log("EventConsumer created (simulated for RabbitMQ)");
  }

  async startConsuming(userService: any): Promise<boolean> {
    console.log("RabbitMQ consumer started (simulated)");
    console.log("Ready to receive USER_CREATED events");
    return true;
  }
}

export const eventConsumer = new EventConsumer();
