import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 新規ユーザー登録、名前と画像URLは任意
export const signUp = async function (id: string, email: string, name?: string, imageurl?: string) {
    // すでにユーザーが存在するかを確認して存在する場合はそのユーザーを返す
    const findUser = await prisma.user.findUnique({
        where: {
        id,
        email,
        },
    });  
    if(findUser) {
        // アップデート情報がある場合、アップデートする
        const updateuser = await prisma.user.update({
        where: {
            id,
        },
        data: {
            name,
            imageurl,
        },
        });
        return updateuser;
    }
    // ユーザーが存在しない場合、新規ユーザーを作成して返す
    const newuser = await prisma.user.create({
        data: {
        id,
        email,
        name,
        imageurl,
        },
    });
    return newuser;
    }

export const signIn = async function (id: string, email: string) {
    const user = await prisma.user.findUnique({
        where: {
        id,
        email,
        },
    });
    return user;
    }

  export const getUser = async function (id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  export const updateUser = async function (id: string, data: { name?: string; bio?: string, imageurl?: string }) {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data,
    });
    return user;
  }

  // participate in event
  export const participateinEvent = async function (userId: string, eventId: number) {
    // まずイベントが存在するかを確認
    const findEvent = await prisma.events.findUnique({
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