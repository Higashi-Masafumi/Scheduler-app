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
    // username, imageurl, message, createdAt
    const chatData = chats.map(chat => {
        return {
            userId: chat.userId,
            username: chat.user.name,
            imageurl: chat.user.imageurl,
            message: chat.message,
            createdAt: chat.createdAt
        }
    });
    return chatData;
}
