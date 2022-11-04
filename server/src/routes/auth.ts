import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

import fetch from "node-fetch";

export async function authRoutes(fastify: FastifyInstance) {
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
        }
      }
    }

    //g

    return { userInfo };
  });
}
