import amqp from 'amqplib';
let channel;
// const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.Rabbitmq_Host,
            port: 5672,
            username: process.env.Rabbitmq_Username,
            password: process.env.Rabbitmq_Password,
        });
        channel = await connection.createChannel();
        console.log("✅ Connected to RabbitMQ");
    }
    catch (error) {
        console.error("Error connecting to RabbitMQ:", error);
        process.exit(1);
    }
};
export const publishToQueue = async (queueName, message) => {
    if (!channel) {
        throw new Error("RabbitMQ channel not initialized");
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
};
//# sourceMappingURL=rabbitmq.js.map