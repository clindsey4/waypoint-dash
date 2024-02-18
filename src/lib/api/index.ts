import { apiTokenExists } from "@/data/botData";
import { NextRequest } from "next/server";
import { ApiError, ApiLog, ApiResponse } from "./types";
import { Log } from "@/data/types";

// General functions

/**
 * Builds an API response
 * 
 * @param status An HTTP status code indicating the status of the response.
 * @param body The body of the API response.
 * @param error The error of the API response.
 * @returns An API response
 */
export function buildApiResponse(
    status: number,
    body?: any,
    error?: ApiError
): Response {
    return new Response(
        JSON.stringify({
            body: body,
            error: error
        } as ApiResponse), 
        {
            status: status
        }
    )
}

/**
 * Asynchronously checks whether a given HTTP request is authorized for API use.
 * 
 * @param request The Next HTTP request object.
 * @returns {Promise<boolean>}
 */
export async function isApiRequestAuthorized(
    request: Request
): Promise<boolean> {

    const headers = request.headers
    const authHeader = headers.get('Authorization')
    const token = authHeader ? authHeader.split('Token')[1] : null

    // if the API token wasn't found, this request isn't authorized.
    if (!token) return false

    // Check to see if the token is within the database.
    return apiTokenExists(token)
}

// logs functions
export function deserializeLog(
    apiLog: ApiLog
): Log {
    return {
        messageId: apiLog.messageId,
        userId: apiLog.userId,
        serverId: apiLog.serverId,
        command: apiLog.command,
        commandId: apiLog.commandId,
        dateCreated: new Date(apiLog.dateCreated)
    }
}