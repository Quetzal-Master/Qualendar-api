const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");
const ssePlugin = require("fastify-sse-v2");

fastify.register(cors, {
	origin: true,
	credentials: true,
	methods: ["GET", "POST"],
	allowedHeaders: ["Content-Type"],
});

fastify.register(ssePlugin);

const HEARTBEAT_INTERVAL = 5000;
let sseReply = null;

fastify.get("/events", (request, reply) => {
	console.log("SSE connection requested");

	// Stocker la réponse 'reply' pour une utilisation ultérieure
	sseReply = reply;

	try {
		// Envoi de heartbeats réguliers
		const heartbeat = setInterval(() => {
			console.log("Sending heartbeat");
			sseReply.sse({ data: "heartbeat" });
		}, HEARTBEAT_INTERVAL);

		// Écouter la fermeture de la connexion et arrêter les heartbeats
		request.raw.on("close", () => {
			console.log("SSE connection closed");
			clearInterval(heartbeat);
			sseReply = null; // Réinitialiser sseReply lorsque la connexion est fermée
		});
	} catch (error) {
		console.error("Error in SSE route:", error);
	}
});

fastify.post("/webhook", (req, reply) => {
	let replyCode = 201;

	if (sseReply) {
		replyCode = 200;
		sseReply.sse({
			data: JSON.stringify({
				message: "A new POST request has been received",
			}),
		});
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
