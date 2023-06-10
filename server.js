// Require the framework
const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');  // Change this line

fastify.register(cors, {
	origin: true, // Reflect the request origin
	methods: ['GET', 'POST'], // The methods you're using
	allowedHeaders: ['Content-Type'], // The headers you're using in your requests
	credentials: true, // This allows cookies and credentials to be sent with requests
});

let sseConnection = null;

fastify.get('/events', async function (req, reply) {
	reply.raw.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
	reply.raw.setHeader('Access-Control-Allow-Methods', 'GET');
	reply.raw.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	reply.raw.setHeader('Access-Control-Allow-Credentials', 'true'); // Add this line
	reply.raw.setHeader('Content-Type', 'text/event-stream');
	reply.raw.setHeader('Cache-Control', 'no-cache');
	reply.raw.setHeader('Connection', 'keep-alive');
	reply.raw.flushHeaders();

	req.raw.on('close', () => {
		sseConnection = null;
		console.log('SSE connection closed');
		reply.raw.end();
	});

	sseConnection = reply.raw;
});

fastify.post('/webhook', (req, reply) => {
	let replyCode = 201;

	if (sseConnection) {
		replyCode = 200;
		sseConnection.write(`data: {"message": "A new POST request has been received"}\n\n`);
	}
	reply.code(replyCode).send("SIUUU");
});

fastify.get('/hello', (req, reply) => {
	return reply.code(200).send({ hello: 'world' });
});

// Run the server!
const start = async () => {
	try {
		await fastify.listen({ port: process.env.PORT || 8000, host: '0.0.0.0' });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
