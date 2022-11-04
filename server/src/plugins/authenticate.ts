import { FastifyRequest } from "fastify";

export async function authenticate(request: FastifyRequest) {
  // verifica se header da request possui jwt
  await request.jwtVerify();
}
