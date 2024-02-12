// general types
export enum Databases {
    BOT_DATA
}

export enum Pragma {
    DEFAULT
}

// module_config types
export interface RawModuleConfigRecord {
    server_id: number,
    module_id: number,
    module_config: string,
    enabled: number
}

export interface ModuleConfigRecord {
    serverId: number,
    moduleId: number,
    moduleConfig: any,
    enabled: boolean
}


// session types
export interface Session {
    id: string,
    accessToken: string,
    refreshToken: string,
    expires: Date
}

export interface DatabaseSession {
    id: string,
    access_token: string,
    refresh_token: string,
    expires: string
}

// logs types
export interface RawLog {
    message_id: string,
    user_id: string,
    server_id: string,
    command: string,
    command_id: number
    date_created: string
}

export interface Log {
    messageId: string,
    userId: string,
    serverId: string,
    command: string,
    command_id: number,
    dateCreated: Date
}