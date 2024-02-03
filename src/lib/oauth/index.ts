import { deleteSession, getSession, insertSession, updateSession } from "@/data/botData";
import { Session } from "@/data/types";
import OAuth from "discord-oauth2";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const defaultCookieName = 'session'
const defaultSessionRefreshThreshold = 24 * 60 * 60 * 1000 // in milliseconds, when a session has this much time left before expiration, it will be refreshed automatically
const sessionCookieLifetime = 365 * 24 * 60 * 60 * 1000 // in milliseconds, how long a session cookie will last.

export const oauth = new OAuth({
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    redirectUri: process.env.DISCORD_OAUTH_REDIRECT_URL
})

export function getOauthExpirationDate(
    lifetime: number // in seconds, how long an oauth token will last.
): Date {
    const expires = new Date() // generate the current date as a Date object.
    expires.setSeconds(expires.getSeconds() + lifetime) // offset the date by the number of seconds that the session is valid for
    return expires
}

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
            if (refreshThreshold >= (session.expires.getTime() - new Date().getTime())) return resolve(refreshSession(session))

            resolve(session)
        } catch (error) {
            reject(error)
        }
    })
}

export function refreshSession(
    session: Session,
): Promise<Session> {
    return new Promise(async (resolve, reject) => {
        try {
            // get the new token
            const tokenData = await oauth.tokenRequest({
                refreshToken: session.refreshToken,
                grantType: 'refresh_token',
                scope: ""
            })

            const updated: Session = {
                id: session.id,
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expires: getOauthExpirationDate(tokenData.expires_in)
            }

            await updateSession(updated)

            // update the session
            resolve(updated)
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
    const expires = getOauthExpirationDate(tokenData.expires_in)

    const session = await insertSession({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expires: expires
    });

    // set the cookie
    cookies.set(cookieName, session.id, {
        expires: new Date(expires.getTime() + sessionCookieLifetime),
        sameSite: true
    });

    return session;
}