import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


// post chat regarding the event by id
export const postChat = async function (eventId: number, userId: string, message: string) {
    const chat = await prisma.chats.create({
        data: {
            eventId,
            userId,
            message
        }
    });
    return chat;
}

export const getChat = async function (eventId: number) {
    const chats = await prisma.chats.findMany({
        where: {
            eventId
        },
        include: {
            user: true
        }
    });
    return chats;
}
