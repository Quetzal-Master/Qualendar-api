const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");
const ssePlugin = require("fastify-sse-v2");

fastify.register(cors, {
	origin: "*",
	methods: ["GET", "POST"],
	allowedHeaders: ["Content-Type"],
});

fastify.register(ssePlugin);

let sseConnection = null;
const HEARTBEAT_INTERVAL = 15000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

fastify.get("/events", async (request, reply) => {
	console.log("SSE connection requested");

	try {
		// Envoi de heartbeats réguliers
		const heartbeat = setInterval(() => {
			console.log("Sending heartbeat");
			reply.sse({ data: "heartbeat" });
		}, HEARTBEAT_INTERVAL);

		// Écouter la fermeture de la connexion et arrêter les heartbeats
		request.socket.on("close", () => {
			console.log("SSE connection closed");
			clearInterval(heartbeat);
		});
	} catch (error) {
		console.error("Error in SSE route:", error);
	}
});

fastify.post("/webhook", (req, reply) => {
	let replyCode = 201;

	if (sseConnection) {
		replyCode = 200;
		sseConnection.send(
			`data: {"message": "A new POST request has been received"}\n\n`
		);
	}
	reply.code(replyCode).send("SIUUU");
});

fastify.get("/hello", (req, reply) => {
	return reply.code(200).send({ hello: "world" });
});

// Run the server!
const start = async () => {
	try {
		const port = process.env.PORT || 8000;
		await fastify.listen({ port: port, host: "0.0.0.0" });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
