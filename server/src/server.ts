import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";

import { poolRoutes } from "./routes/pool";
import { authRoutes } from "./routes/auth";
import { gameRoutes } from "./routes/game";
import { guessRoutes } from "./routes/guess";
import { userRoutes } from "./routes/user";

async function bootstrap() {
  const fastify = Fastify({
    logger: true, // logs para monitoramento da aplicação
  });

  await fastify.register(cors, {
    origin: true, // qualquer aplicação pode acessar a API
  });

  // em produção, secret deve ser uma variável ambiente
  await fastify.register(jwt, {
    secret: "nlw-copa",
  });

  // deixa rotas funcionais
  await fastify.register(poolRoutes);
  await fastify.register(authRoutes);
  await fastify.register(gameRoutes);
  await fastify.register(guessRoutes);
  await fastify.register(userRoutes);

  await fastify.listen({ port: 3333, host: "0.0.0.0" });
}

bootstrap();
