import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import ShortUniqueId from "short-unique-id";
import { authenticate } from "../plugins/authenticate";

export async function poolRoutes(fastify: FastifyInstance) {
  // conta a quantidade de bolões
  fastify.get("/pools/count", async () => {
    // prisma tem autocomplete das tabelas criadas
    const count = await prisma.pool.count();

    return { count };
  });

  // cria um bolão
  fastify.post("/pools", async (request, reply) => {
    // validação
    const createPoolBody = z.object({
      title: z.string(),
    });

    const { title } = createPoolBody.parse(request.body);

    const generate = new ShortUniqueId({ length: 6 });
    const code = String(generate()).toUpperCase();

    try {
      // se tem token, cria uma id com dono
      await request.jwtVerify();

      await prisma.pool.create({
        data: {
          title,
          code,
          ownerId: request.user.sub,

          participants: {
            create: {
              userId: request.user.sub,
            },
          },
        },
      });
    } catch {
      // se não tiver token, cria uma pool sem dono
      await prisma.pool.create({
        data: {
          title,
          code,
        },
      });
    }

    return reply.status(201).send({ code });
  });

  // cria relação de participante do bolão
  fastify.post(
    "/pools/:id/join",
    { onRequest: [authenticate] },
    async (request, reply) => {
      const joinPoolBody = z.object({
        code: z.string(),
      });

      const { code } = joinPoolBody.parse(request.body);

      const pool = await prisma.pool.findUnique({
        where: {
          code,
        },
        include: {
          participants: {
            where: {
              userId: request.user.sub, // sub -> id do usuário logado
            },
          },
        },
      });

      if (!pool) {
        return reply.status(400).send({ message: "Pool not found" });
      }

      if (pool.participants.length > 0) {
        return reply
          .status(400)
          .send({ message: "You already joined this pool" });
      }

      // se bolão não tiver dono, adiciona o primeiro participante como dono
      if (!pool.ownerId) {
        await prisma.pool.update({
          where: {
            id: pool.id,
          },
          data: {
            ownerId: request.user.sub,
          },
        });
      }

      // cria relação entre usuário e pool (participante)
      await prisma.participant.create({
        data: {
          poolId: pool.id,
          userId: request.user.sub,
        },
      });

      return reply.status(201).send();
    }
  );

  // lista todos os bolões que o usuário está participando
  fastify.get("/pools", { onRequest: [authenticate] }, async (request) => {
    const pools = await prisma.pool.findMany({
      where: {
        // onde, pelo menos um participante, tem o id do usuário logado
        participants: {
          some: {
            userId: request.user.sub,
          },
        },
      },
      include: {
        // faz contagem do relacionamento de participantes
        _count: {
          select: {
            participants: true,
          },
        },
        participants: {
          select: {
            id: true,

            // pega dados da tabela de relacionamento
            user: {
              select: {
                avatarUrl: true,
              },
            },
          },
          take: 4,
        },
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { pools };
  });
}
