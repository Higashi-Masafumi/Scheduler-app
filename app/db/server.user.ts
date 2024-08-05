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

  // participate in event
  export const participateinEvent = async function (userId: number, eventId: number) {
    // まずイベントが存在するかを確認
    const findEvent = await prisma.events.findFirst({
      where: {
        id: eventId,
      },
    });
    if (!findEvent) {
      return 'event not found';
    }
    // イベントが存在することを確認したのち、ユーザーが参加しているかを確認
    const findUser = await prisma.participants.findFirst({
      where: {
        userId,
        eventId,
      },
    });
    // 参加していない場合、参加する
    if (!findUser) {
      await prisma.participants.create({
        data: {
          userId,
          eventId,
        },
      });
    }
  }