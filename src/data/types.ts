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
    enabled: number,
    module_config: string
}

export interface ModuleConfigRecord {
    serverId: number,
    moduleId: number,
    enabled: boolean,
    moduleConfig: any
}

export interface RawModuleConfig {
    module_config: string,
    enabled: number
}

export interface ModuleConfig {
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