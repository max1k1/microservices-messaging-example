const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib');

const app = express();
app.use(bodyParser.json());

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://127.0.0.1';
const SERVICE_A_QUEUE = 'serviceAQueue';
const SERVICE_B_QUEUE = 'serviceBQueue';

let channel;

async function connectRabbitMQ() {
    if (process.env.NODE_ENV === 'test') {
        channel = {
            assertQueue: async () => {},
            sendToQueue: (queue, buffer, options) => {
                console.log(`Dummy send to ${queue}: ${buffer.toString()}`);
            },
            consume: () => {}
        };
        return;
    }
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(SERVICE_B_QUEUE, { durable: true });
        console.log('Service B connected to RabbitMQ');
        channel.consume(SERVICE_B_QUEUE, (msg) => {
            if (msg !== null) {
                console.log(`Service B received message: ${msg.content.toString()}`);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Service B RabbitMQ connection error:', error);
    }
}

app.post('/send', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    if (!channel) {
        console.error('RabbitMQ channel is not available');
        return res.status(503).json({ error: 'RabbitMQ connection not available' });
    }
    try {
        await channel.assertQueue(SERVICE_A_QUEUE, { durable: true });
        channel.sendToQueue(SERVICE_A_QUEUE, Buffer.from(message), { persistent: true });
        console.log(`Service B sent message: ${message}`);
        res.status(200).json({ status: 'Message sent from Service B', message });
    } catch (error) {
        console.error('Service B error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, async () => {
        console.log(`Service B is running on port ${PORT}`);
        await connectRabbitMQ();
    });
}

module.exports = { app, connectRabbitMQ };
