// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });
fastify.register(require("@fastify/websocket"));

let wsConnection;

fastify.register(async function (fastify) {
	fastify.get("/websocket-connect", { websocket: true }, (connection /* SocketStream */, req /* FastifyRequest */) => {
		connection.socket.on("message", (message) => {
			// message.toString() === 'hi from client'
			connection.socket.send("hi from server");
			wsConnection = connection;
		});
	});
});

fastify.post("/webhook", (req, reply) => {
	if (wsConnection) {
		// Send a message to the WebSocket client
		wsConnection.socket.send("A new GET request has been received");
	}
	reply.code(200).header("Content-Type", "application/json").send({ hello: wsConnection });
});

fastify.get("/hello", (req, reply) => {
	reply.code(200).send({ hello: "world" });
});

// Run the server!
const start = async () => {
	try {
		await fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();
