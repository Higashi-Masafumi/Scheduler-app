import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// return events user participated in
export const getEvents = async function (userId: string) {
    const user = await prisma.participants.findMany({
        where: {
            userId
        },
        include: {
            event: {
                include: {
                    holder: true
                }
            }
        }
    });

    const events = user.map(participant => {
        return {
            id: participant.id,
            eventId: participant.event.id,
            title: participant.event.title,
            description: participant.event.description,
            holder: participant.event.holder.name,
            createdAt: participant.event.createdAt
        }
    });
    return events;
    }

// return events by id
export const getEvent = async function (eventId: number) {
    const event = await prisma.events.findUnique({
        where: {
            id: eventId
        },
        include: {
            eventSchedules: {
                select: {
                    id: true,
                    user: true,
                    abscence: true,
                    remarks: true
                }
            }
        }
    });

    const participants = event?.eventSchedules.map(schedule => {
        return {
            id: schedule.id,
            userId: schedule.user.id,
            name: schedule.user.name,
            imageurl: schedule.user.imageurl,
            abscence: schedule.abscence,
            remarks: schedule.remarks
        }
    }
    );
    return {
        ...event,
        participants
    };
}

// return holding events
export const getHoldingEvents = async function (userId: string) {
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
export const createEvent = async function (userId: string, data: { title: string, description: string, candidates: string[] }) {
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

// update event
export const updateEvent = async function (eventId: number, data: { title: string, description: string, candidates: string[] }) {
    const event = await prisma.events.update({
        where: {
            id: eventId
        },
        data: {
            title: data.title,
            description: data.description,
            candidates: data.candidates
        }
    });
    // eventのpariticipantsのabscenceを更新
    const participants = await prisma.participants.updateMany({
        where: {
            eventId
        },
        data: {
            abscence: []
        }
    });
    return event;
}

// withdraw from event
export const withdrawEvent = async function (id: number) {
    await prisma.participants.delete({
        where: {
            id
        }
    });
}

// update abscence
export const updateAbscence = async function (participantId: number, abscence: string[], remarks: string) {
    const newabscence = await prisma.participants.update({
        where: {
            id: participantId
        },
        data: {
            abscence,
            remarks
        }
    });
   return newabscence;
}

// delete event
export const deleteEvent = async function (eventId: number) {
    await prisma.participants.deleteMany({
        where: {
            eventId
        }
    });
    await prisma.chats.deleteMany({
        where: {
            eventId
        }
    });
    await prisma.events.delete({
        where: {
            id: eventId
        }
    });
    return true;
}