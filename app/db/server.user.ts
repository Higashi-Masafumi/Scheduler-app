import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const signUp = async function (email: string, password: string) {
  const user = await prisma.user.create({
    data: {
      email,
      password,
    },
  });
  return user;
}