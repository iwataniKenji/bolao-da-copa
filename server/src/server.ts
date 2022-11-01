import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import cors from "@fastify/cors";

const prisma = new PrismaClient({
  log: ["query"],
});

async function bootstrap() {
  const fastify = Fastify({
    logger: true, // logs para monitoramento da aplicação
  });

  await fastify.register(cors, {
    origin: true, // qualquer aplicação pode acessar a API
  });

  // rota de pools
  fastify.get("/pools/count", async () => {
    // prisma tem autocomplete das tabelas criadas
    const count = await prisma.pool.count();

    return { count };
  });

  await fastify.listen({ port: 3333 /*host: "0.0.0.0"*/ });
}

bootstrap();
