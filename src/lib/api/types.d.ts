export enum ApiErrorCode {
    UNAUTHORIZED,
    BAD_REQUEST
}

export interface ApiResponse {
    body?: any
    error?: ApiError
}

export interface ApiError {
    code: ApiErrorCode,
    message: string
}


// logs
export interface ApiLog {
    messageId: string,
    userId: string,
    serverId: string,
    command: string,
    commandId: number,
    dateCreated: string
}