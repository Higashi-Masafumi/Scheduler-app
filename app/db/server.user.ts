import { Prisma, PrismaClient } from '@prisma/client';

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

export const signIn = async function (email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: {
        email,
        password,
        },
    });
    return user;
    }

  export const getUser = async function (id: number) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  export const updateUser = async function (id: number, data: { name: string; bio: string }) {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data,
    });
    return user;
  }