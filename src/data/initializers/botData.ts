import { Database } from "better-sqlite3";

export default function init(
    database: Database,
    exists: Boolean
) {
    if (exists) { return }

    // create module_config table
    // [PK][INT] server_id | [PK][INT] module_id | [BOOL] module_enabled | [STR] module_config
    database.prepare(`CREATE TABLE IF NOT EXISTS module_config (
        server_id INTEGER NOT NULL,
        module_id INTEGER NOT NULL,
        module_config TEXT NOT NULL,
        enabled INT2 CHECK(module_enabled IN (0,1)) NOT NULL DEFAULT 1,
        PRIMARY KEY (server_id, module_id)
    )`).run()

    // create session table
    // [PK][STR] id | [STR] access_token | [STR] refresh_token | [DATE] expires
    database.prepare(`CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires TEXT NOT NULL
    )`).run()

    // create logs table
    // [PK][STR] message_id | [STR] user_id | [STR] server_id | [STR] command | [DATE] created | [INT] command_id
    // TODO

}