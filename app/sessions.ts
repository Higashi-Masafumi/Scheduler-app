import { createCookieSessionStorage } from '@remix-run/node';

type SessionData = {
    useId: number;
};

type SessionFlashData = {
    error: string;
}

export const { getSession, commitSession, destroySession } = 
    createCookieSessionStorage({
        cookie: {
            name: 'session',
            httpOnly: true,
            path: "/",
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            secrets:[process.env.SESSION_SECRET!],
            maxAge: 60 * 60 * 24,
        },
    });
