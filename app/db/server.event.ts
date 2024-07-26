import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// return events user participated in
export const getEvents = async function (userId: number) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            participatingEvents: true
        }
    });

    const participatingEvents = user?.participatingEvents;
    return participatingEvents;
    }

// return events by id
export const getEvent = async function (eventId: number) {
    const event = await prisma.events.findUnique({
        where: {
            id: eventId
        }
    });
    return event;
}

// return holding events
export const getHoldingEvents = async function (userId: number) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            holdingEvents: true
        }
    });

    const holdingEvents = user?.holdingEvents;
    return holdingEvents;
}

// create new event
export const createEvent = async function (userId: number, data: { title: string, description: string, candidates: string[] }) {
    const event = await prisma.events.create({
        data: {
            title: data.title,
            description: data.description,
            candidates: data.candidates,
            holderId: userId,
            createdAt: new Date()
        }
    });
    return event;
}