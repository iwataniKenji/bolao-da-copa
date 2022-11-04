import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function guessRoutes(fastify: FastifyInstance) {
  // conta quantidade de apostas
  fastify.get("/guesses/count", async () => {
    const count = await prisma.guess.count();

    return { count };
  });

  // cria uma nova aposta e faz diversas validações
  fastify.post(
    "/pools/:poolId/games/:gameId/guesses",
    { onRequest: [authenticate] },
    async (request, reply) => {
      // vem por params
      const createGuessParams = z.object({
        poolId: z.string(),
        gameId: z.string(),
      });

      // vem por body
      const createGuessBody = z.object({
        firstTeamPoints: z.number(),
        secondTeamPoints: z.number(),
      });

      const { poolId, gameId } = createGuessParams.parse(request.params);
      const { firstTeamPoints, secondTeamPoints } = createGuessBody.parse(
        request.body
      );

      const participant = await prisma.participant.findUnique({
        where: {
          userId_poolId: {
            poolId,
            userId: request.user.sub,
          },
        },
      });

      // usuário não faz parte do bolão escolhido
      if (!participant) {
        return reply.status(400).send({
          message: "You are not allowed to create a guess inside this pool.",
        });
      }

      const guess = await prisma.guess.findUnique({
        where: {
          participantId_gameId: {
            participantId: participant.id,
            gameId,
          },
        },
      });

      // se encontrou palpite, não permite criar outro
      if (guess) {
        return reply.status(400).send({
          message: "You already sent a guess for this game on this pool.",
        });
      }

      const game = await prisma.game.findUnique({
        where: {
          id: gameId,
        },
      });

      // se jogo não existir
      if (!game) {
        return reply.status(400).send({
          message: "Game not found.",
        });
      }

      // se jogo já tiver acontecido
      if (game.date < new Date()) {
        return reply.status(400).send({
          message: "You can't send a guess for a game that already happened.",
        });
      }

      await prisma.guess.create({
        data: {
          gameId,
          participantId: participant.id,
          firstTeamPoints,
          secondTeamPoints,
        },
      });

      return reply.status(201).send();
    }
  );
}
