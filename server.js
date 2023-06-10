const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');

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
	reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
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
		// Google Cloud Run will set this environment variable for you, so
		// you can also use it locally to emulate Cloud Run.
		const port = process.env.PORT || 8000;
		await fastify.listen(port, '0.0.0.0');

		console.log(`Server listening on http://0.0.0.0:${port}`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
