const request = require('supertest');
const http = require('http');
const { app, connectRabbitMQ } = require('../index');

let server;

beforeAll(done => {
    server = http.createServer(app).listen(0, async () => {
        await connectRabbitMQ();
        done();
    });
});

afterAll(done => {
    server.close(done);
});

describe('Service A API', () => {
    it('should return 400 if message is missing', async () => {
        const res = await request(server)
            .post('/send')
            .send({});
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Message is required');
    });

    it('should accept a valid message', async () => {
        const res = await request(server)
            .post('/send')
            .send({ message: 'Test Message from A' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'Message sent from Service A');
        expect(res.body).toHaveProperty('message', 'Test Message from A');
    });
});
