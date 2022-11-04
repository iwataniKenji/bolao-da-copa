import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

import fetch from "node-fetch";

// plugin ou middleware -> função que roda antes da rota
export async function authRoutes(fastify: FastifyInstance) {
  fastify.get("/me", { onRequest: [authenticate] }, async (request) => {
    // retorna apenas se token for validado
    return { user: request.user };
  });

  fastify.post("/users", async (request) => {
    const createUserBody = z.object({
      access_token: z.string(),
    });

    const { access_token } = createUserBody.parse(request.body);

    // envia access token advindo do header do mobile -> chama api do google -> retorna dados do usuário logado no google
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    // resolve da promise dos dados do google
    const userData = await userResponse.json();

    const userInfoSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    });

    // validação se info do google bate com schema
    const userInfo = userInfoSchema.parse(userData);

    // verifica se usuário já existe no database
    let user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.id,
      },
    });

    // se não existir, cria usuário
    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.picture,
        },
      });
    }

    // cria token jwt
    const token = fastify.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        sub: user.id, // quem gerou o token
        expiresIn: "7 days",
      }
    );

    return { token };
  });
}
