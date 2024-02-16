import { deleteSession, getSession, insertSession, updateSession } from "@/data/botData";
import { Session } from "@/data/types";
import OAuth, { PartialGuild } from "discord-oauth2";
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
            const expires = session.expires
            const now = new Date()
            if (now > expires) {
                // the session can't be refreshed as it's beyond its expiration date
                await deleteSession(session.id)
                return resolve(null)
            }
            // if the session is within the refresh threshold, refresh it
            if (refreshThreshold >= (expires.getTime() - now.getTime())) return resolve(refreshSession(session))

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

/**
 * Takes a guild permissions string for a user and determines whether this user is an administrator or not.
 * 
 * @param permissions The permissions value for a guild.
 * @returns A boolean which says if the provided permissions value is for an administrator
 */
export function isGuildAdministrator(
    permissions?: string
): boolean {
    // bitwise AND on the permissions to see if the user is administrator
    // https://discord.com/developers/docs/topics/permissions
    return permissions ? (Number.parseInt(permissions) & 8) === 8 : false
}

/**
 * Gets guilds that the user belonging to the provided access token is in.
 * Only returns guilds where that user is an administrator.
 * 
 * @param accessToken An oauth access token.
 * @returns A list of PartialGuilds
 */
export async function getUserGuilds(
    accessToken: string
): Promise<PartialGuild[]> {
    // get the user's guilds from the API
    const guilds = await oauth.getUserGuilds(accessToken)

    // sort the guilds alphabetically
    guilds.sort((a, b): number => a.name > b.name ? 1 : -1)

    // only return guilds where the user is an administrator
    const adminGuilds: PartialGuild[] = []
    for (const guild of guilds) {
        if (isGuildAdministrator(guild.permissions)) adminGuilds.push(guild)
    }

    return adminGuilds
}

/**
 * Returns a specific guild that a user is in.
 * 
 * @param accessToken An oauth access token.
 * @param guildId The guild of the ID to get.
 * @returns A PartialGuild or null.
 */
export function getUserGuild(
    accessToken: string,
    guildId: string
): Promise<PartialGuild | null> {
    return oauth.getUserGuilds(accessToken, {
        after: String(Number(guildId) - 1),
        limit: 1
    })
        .then(guilds => guilds[0])
        .then(guild => {
            return isGuildAdministrator(guild.permissions) ? guild : null
        })
}