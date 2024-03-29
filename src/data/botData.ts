import getDatabase from ".";
import { randomBytes } from "crypto";
import { DatabaseSession, Databases, Session } from "./types";

const db = getDatabase(Databases.BOT_DATA)

// ------------- SESSIONS -------------

/**
 * Randomly generates a session token.
 * 
 * @param [bytes=36] The number of bytes to generate.
 * @returns A randomly generated session token.
 */
function generateSessionToken(
    bytes: number = 36
): string {
    return randomBytes(bytes).toString('base64')
}

/**
 * Creates a Session from a raw DatabaseSession
 * 
 * @param rawSession The raw DatabaseSession to convert into a Session.
 * @returns The built Session object.
 */
function buildSession(
    rawSession: DatabaseSession
): Session {
    return {
        id: rawSession.id,
        accessToken: rawSession.access_token,
        refreshToken: rawSession.refresh_token,
        expires: new Date(rawSession.expires) // convert the date from ISO format to a Date object.
    }
}

/**
 * Gets a session from a provided session id.
 * 
 * @param id The ID of the session to get.
 * @returns The session, or null depending on if the session with the provided id exists.
 */
function getSessionSync(
    id: string
): Session | null {

    // get the raw session data from the database
    const sessionData = db.prepare(`
    SELECT id, access_token, refresh_token, expires
    FROM sessions
    WHERE id = ?`).get(id) as DatabaseSession | undefined

    // build & return the session if it exists, otherwise return null
    return sessionData === undefined ? null : buildSession(sessionData)
}

/**
 * Gets a session from a provided session id.
 * 
 * @param id The ID of the session to get.
 * @returns A promise that resolves with the session or null depending on if the session with the provided id exists.
 */
export function getSession(
    id: string
): Promise<Session | null> {
    return new Promise<Session | null>((resolve, reject) => {
        try {
            resolve(getSessionSync(id))
        } catch (error) {
            reject(error)   
        }
    })
}


/**
 * Inserts a session into the database.
 * 
 * @param session A Session object, but without its id, which will be randomly generated.
 * @returns A full Session object with the id that was generated.
 */
function insertSessionSync(
    session: Omit<Session, 'id'>
): Session {

    const id = generateSessionToken()
    const accessToken = session.accessToken
    const refreshToken = session.refreshToken
    const expires = session.expires

    db.prepare(`
    INSERT INTO sessions (id, access_token, refresh_token, expires)
    VALUES (?, ?, ?, ?)
    `).run(
        id,
        accessToken,
        refreshToken,
        expires.toISOString() // convert the date into ISO format.
    )

    // return the same session, but with its id.
    const returnSession = session as Session
    returnSession.id = id
    return returnSession
}

/**
 * Inserts a session into the database.
 * 
 * @param session A Session object, but without its id, which will be randomly generated.
 * @returns A promise that resolves with the Session object containing the id that was generated.
 */
export function insertSession(
    session: Omit<Session, 'id'>
): Promise<Session> {
    return new Promise<Session>((resolve, reject) => {
        try {
            resolve(insertSessionSync(session))
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * Updates any provided value of a session to the new value.
 * 
 * @param session A session with the only required field being its id.
 */
function updateSessionSync(
    session: Partial<Session> & Pick<Session, 'id'>
): void {

    // maps the fields of the session object to their database counterparts
    const fields: Record<string, string> = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        expires: 'expires'
    }

    const sets: string[] = [] // list of strings like '[field] = ?'
    const values: any[] = [] // the values that will replace "?" in the final query

    // iterate the entire session object
    for (const key in session) {
        const value = session[key as keyof typeof session]
        const field = fields[key]
        if (field && value !== undefined) {
            // create set value
            sets.push(`${field} = ?`)
            // convert value to a type storable in the database, and add it to the values array.
            values.push(value instanceof Date ? value.toISOString() : value)
        }
    }

    if (sets.length > 0) db.prepare(`
            UPDATE sessions
            SET ${sets.join(', ')}
            WHERE id = ?
            `).run([...values, session.id])
}

/**
 * Updates any provided value of a session to the new value.
 * 
 * @param session A session with the only required field being its id.
 * @returns A promise that resolves when the session is updated.
 */
export function updateSession(
    session: Partial<Session> & Pick<Session, 'id'>
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        try {
            resolve(updateSessionSync(session))
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * Deletes the session with the provided id from the database.
 * 
 * @param id The ID of the session to delete.
 */
function deleteSessionSync(
    id: string
): void {
    db.prepare(`
    DELETE FROM SESSIONS
    WHERE id = ?
    `).run(id)
}

/**
 * Deletes the session with the provided id from the database.
 * 
 * @param id The ID of the session to delete.
 * @returns A promise that resolves when the session is deleted.
 */
export function deleteSession(
    id: string
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        try {
            resolve(deleteSessionSync(id))
        } catch (error) {
            reject(error)
        }
    })
}