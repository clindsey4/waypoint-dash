import getDatabase from ".";
import { randomBytes } from "crypto";
import { DatabaseSession, Databases, ModuleConfigRecord, RawModuleConfigRecord, Session } from "./types";

const db = getDatabase(Databases.BOT_DATA)

// ------------- MODULE CONFIGURATIONS -------------

/**
 * Takes a ModuleConfigRecord and converts it to raw data acceptable by the database
 * 
 * @param moduleConfigRecord 
 * @returns RawModuleConfigRecord
 */
function deconstructModuleConfigRecord(moduleConfigRecord: ModuleConfigRecord): RawModuleConfigRecord {
    return {
        server_id: moduleConfigRecord.serverId, 
        module_id: moduleConfigRecord.moduleId, 
        module_config: JSON.stringify(moduleConfigRecord.moduleConfig), 
        enabled: moduleConfigRecord.enabled? 1 : 0
    } as RawModuleConfigRecord
}

/**
 * Takes a RawModuleConfigRecord and converts it to usable data
 * 
 * @param rawModuleConfigRecord 
 * @returns ModuleConfigRecord
 */
function buildModuleConfigRecord(rawModuleConfigRecord: RawModuleConfigRecord): ModuleConfigRecord {
    return {
        serverId: rawModuleConfigRecord.server_id, 
        moduleId: rawModuleConfigRecord.module_id, 
        moduleConfig: JSON.parse(rawModuleConfigRecord.module_config), 
        enabled: (rawModuleConfigRecord.enabled > 0)? true : false
    } as ModuleConfigRecord
}

/**
 * Returns a ModuleConfigRecord object for the given server and module
 * 
 * @param serverId
 * @param moduleId
 * @returns ModuleConfigRecord | null.
 */
function getModuleConfigRecordSync(
    serverId: number,
    moduleId: number
): ModuleConfigRecord | null {
    const rawData = db.prepare(`
    SELECT server_id, module_id, module_config, enabled
    FROM module_config
    WHERE server_id = ?
    AND module_id = ?`).get(serverId, moduleId) as RawModuleConfigRecord | undefined

    if (rawData === undefined) return null

    return buildModuleConfigRecord(rawData)
}

/**
 * Returns a ModuleConfigRecord object for the given server and module
 * 
 * @param serverId
 * @param moduleId
 * @returns ModuleConfigRecord | null.
 */
export function getModuleConfigRecord(
    serverId: number,
    moduleId: number
): Promise<ModuleConfigRecord | null> {
    return new Promise<ModuleConfigRecord | null>((resolve, reject) => {
        try {
            resolve(getModuleConfigRecordSync(serverId, moduleId))
        } catch (error) {
            reject(error)   
        }
    })
}

/**
 * Returns All ModuleConfigRecords for a given serverId
 * 
 * @param serverId
 * @param enabled
 * @returns ModuleConfigRecord[]
 */
function getAllModuleConfigRecordsSync(
    serverId: number,
    enabled: boolean | null
): ModuleConfigRecord[] | null {
    const rawData = db.prepare(`
    SELECT server_id, module_id, module_config, enabled
    FROM module_config
    WHERE server_id = ?
    ${enabled == null? '' : 'AND enabled = ?'}`).all(serverId, enabled) as RawModuleConfigRecord[]

    return rawData.map(record => buildModuleConfigRecord(record))
}

/**
 * Returns All ModuleConfigRecords for a given serverId
 * 
 * @param serverId
 * @param enabled
 * @returns ModuleConfigRecord[]
 */
export function getAllModuleConfigRecords(
    serverId: number,
    enabled: boolean | null
): Promise<ModuleConfigRecord[] | null> {
    return new Promise<ModuleConfigRecord[] | null>((resolve, reject) => {
        try {
            resolve(getAllModuleConfigRecordsSync(serverId, enabled))
        } catch (error) {
            reject(error)   
        }
    })
}

/**
 * Creates a new ModuleConfigRecord in the database
 * 
 * @param moduleConfigRecord 
 * @returns true on success
 */
function createModuleConfigRecordSync(
    moduleConfigRecord: ModuleConfigRecord
): boolean {
    var rawData: RawModuleConfigRecord = deconstructModuleConfigRecord(moduleConfigRecord)

    db.prepare(`
    INSERT INTO module_config (server_id, module_id, module_config, enabled)
    VALUES (?, ?, ?, ?)
    `).run(
        rawData.server_id,
        rawData.module_id,
        rawData.module_config,
        rawData.enabled
    )
    
    return true
}

/**
 * Creates a new ModuleConfigRecord in the database
 * 
 * @param moduleConfigRecord 
 * @returns true on success
 */
export function createModuleConfigRecord(
    moduleConfigRecord: ModuleConfigRecord
): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            resolve(createModuleConfigRecordSync(moduleConfigRecord))
        } catch (error) {
            resolve(false)
        }
    })
}

/**
 * Updates a ModuleConfigRecord in the database
 * 
 * @param moduleConfigRecord 
 * @returns true on success
 */
export function updateModuleConfigRecordSync(
    moduleConfigRecord: Partial<ModuleConfigRecord> & Pick<ModuleConfigRecord, 'serverId'> & Pick<ModuleConfigRecord, 'moduleId'>
): boolean {
    let parameters: string[] = []
    let values: any[] = []

    if (moduleConfigRecord.moduleConfig !== undefined) {
        parameters.push(`module_config = ?`)
        const module_config: string = JSON.stringify(moduleConfigRecord.moduleConfig)
        values.push(module_config)
    }

    if (moduleConfigRecord.enabled !== undefined) {
        parameters.push(`enabled = ?`)
        const enabled: number = moduleConfigRecord.enabled? 1 : 0
        values.push(enabled)
    }

    if (parameters.length > 0) {
        db.prepare(`
            UPDATE module_config
            SET ${parameters.join(', ')}
            WHERE server_id = ? 
            AND module_id = ?
            `).run([...values, moduleConfigRecord.serverId, moduleConfigRecord.moduleId])
        return true
    }
    return false
}

/**
 * Updates a ModuleConfigRecord in the database
 * 
 * @param moduleConfigRecord 
 * @returns true on success
 */
export function updateModuleConfigRecord(
    moduleConfigRecord: ModuleConfigRecord
): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            resolve(updateModuleConfigRecordSync(moduleConfigRecord))
        } catch (error) {
            resolve(false)
        }
    })
}

/**
 * Deletes a ModuleConfigRecord in the database
 * 
 * @param moduleConfigRecord 
 * @returns true on success
 */
export function deleteModuleConfigRecordSync(
    serverId: number,
    moduleId: number
): boolean {
    db.prepare(`
                DELETE FROM module_config
                WHERE server_id = ? 
                AND module_id = ?
                `).run(serverId, moduleId)
    return true
}

/**
 * Deletes a ModuleConfigRecord in the database
 * 
 * @param moduleConfigRecord 
 * @returns true on success
 */
export function deleteModuleConfigRecord(
    serverId: number,
    moduleId: number
): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            resolve(deleteModuleConfigRecordSync(serverId, moduleId))
        } catch (error) {
            resolve(false)
        }
    })
}


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