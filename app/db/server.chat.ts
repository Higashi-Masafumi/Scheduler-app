import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


// post chat regarding the event by id
export const postChat = async function (eventId: number, userId: string, text: string) {
    const chat = await prisma.chats.create({
        data: {
            eventId,
            userId,
            text
        }
    });
    return chat;
}

export const getChat = async function (eventId: number) {
    const chat = await prisma.chats.findMany({
        where: {
            eventId
        },
        include: {
            user: true
        }
    });
    return chat;
}
