import { Database } from "better-sqlite3";

export default function init(
    database: Database,
    exists: Boolean
) {
    if (exists) { return }

    // create module_config table
    // [PK][INT] server_id | [PK][INT] module_id | [BOOL] module_enabled | [STR] module_config
    // TODO

    // create session table
    // [PK][STR] id | [STR] access_token | [STR] refresh_token | [DATE] expires
    database.prepare(`CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires TEXT NOT NULL
    )`)

    // create logs table
    // [PK][STR] message_id | [STR] user_id | [STR] server_id | [STR] command | [DATE] created | [INT] command_id
    // TODO

}