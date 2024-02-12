// general types
export enum Databases {
    BOT_DATA
}

export enum Pragma {
    DEFAULT
}

// module_config types
export interface RawModuleConfigRecord {
    server_id: string,
    module_id: number,
    module_config: string,
    enabled: number
}

export interface ModuleConfigRecord {
    serverId: string,
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