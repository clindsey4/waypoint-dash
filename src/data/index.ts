import sqlite3, { Database } from 'better-sqlite3'
import { existsSync, mkdirSync } from "fs"
import initBotData from "./initializers/botData"
import { Databases, Pragma } from './types'

const rootDirectory = process.cwd()
const dataDirectory = rootDirectory + "/src/data/database/"
if (!existsSync(dataDirectory)) {
    try {
        mkdirSync(dataDirectory)
    } catch (error) {
        console.log(error)
    }
}

const loadedDatabases: {
    [key in Databases]?: Database
} = {}

const dbPragmas = {
    [Pragma.DEFAULT]: "journal_mode = WAL"
}

const databaseMetadata = {
    [Databases.BOT_DATA]: {
        path: 'bot_data.db',
        pragma: Pragma.DEFAULT,
        init: initBotData
    }
}

export default function getDatabase(
    database: Databases
): Database {
    const isLoaded = loadedDatabases[database]
    if (isLoaded) {
        return isLoaded
    }

    // load the database
    const metadata = databaseMetadata[database]

    const fullPath = dataDirectory + metadata.path

    // see if the db already exists
    const dbExists = existsSync(fullPath)

    // create new db
    const db = new sqlite3(fullPath)

    // set pragma
    const pragma = metadata.pragma
    if (pragma) { db.pragma(dbPragmas[pragma]); }

    // call init function
    const init = metadata.init
    if (init) {
        try {
            init(db, dbExists)
        } catch (error) {
            console.log(`Initalization failed for module ${metadata.path}. Error: ${error}`)
        }
    }

    // add to loaded databases
    loadedDatabases[database] = db

    return db
}