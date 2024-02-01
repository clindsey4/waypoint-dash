// general types
export enum Databases {
    BOT_DATA
}

export enum Pragma {
    DEFAULT
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