import { getSession, insertSession } from "@/data/botData";
import { Session } from "@/data/types";
import OAuth from "discord-oauth2";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const defaultCookieName = 'session'
const defaultSessionRefreshThreshold = 24 * 60 * 60 * 1000 // in milliseconds, when a session has this much time left before expiration, it will be refreshed automatically

export const oauth = new OAuth({
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    redirectUri: process.env.DISCORD_OAUTH_REDIRECT_URL
})

/**
 * Gets a session from a session token.
 * 
 * @param cookies A RequestCookies or ReadonlyRequestCookies object to get the session token from.
 */
export function getActiveSession(
    cookies: RequestCookies | ReadonlyRequestCookies,

    cookieName: string = defaultCookieName,
    refreshThreshold: number = defaultSessionRefreshThreshold
): Promise<Session | null> {
    return new Promise(async (resolve, reject) => {
        try {
            // get the session token from the cookies
            const token = cookies.get(cookieName)
            if (token === undefined) return resolve(null) // return null if no token exists

            const session = await getSession(token.value)
            if (session === null) return resolve(null) // resolve with null if no session was found

            // check if sesison needs to be refreshed
            if (refreshThreshold >= (session.expires.getTime() - new Date().getTime())) return resolve(refreshSession(cookies, session, cookieName))

            resolve(session)
        } catch (error) {
            reject(error)
        }
    })
}

export function refreshSession(
    cookies: RequestCookies | ReadonlyRequestCookies,
    session: Session,

    cookieName: string = defaultCookieName,
): Promise<Session> {
    return new Promise((resolve, reject) => {
        try {
            
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * Saves discord oauth token data.
 * 
 * @param cookies A RequestCookies or ReadonlyRequestCookies object to save the session token to.
 * @param tokenData The token data received from discord.
 */
export async function saveToken(
    cookies: RequestCookies | ReadonlyRequestCookies,
    tokenData: OAuth.TokenRequestResult,

    cookieName: string = defaultCookieName
): Promise<Session> {
    // calculate the expiration date
    const expires = new Date() // generate the current date as a Date object.
    expires.setSeconds(expires.getSeconds() + tokenData.expires_in) // offset the date by the number of seconds that the session is valid for

    const session = await insertSession({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expires: expires
    });

    // set the cookie
    cookies.set(cookieName, session.id, {
        expires: expires,
        sameSite: true
    });

    return session;
}