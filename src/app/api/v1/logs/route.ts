import { createLog } from "@/data/botData";
import { buildApiResponse, deserializeLog, isApiRequestAuthorized } from "@/lib/api";
import { ApiErrorCode, ApiResponse } from "@/lib/api/types";
import { NextRequest } from "next/server";

export async function POST(
    request: Request
) {
    const authorized = await isApiRequestAuthorized(request)

    if (!authorized) return buildApiResponse(
        403,
        null,
        {
            code: ApiErrorCode.UNAUTHORIZED,
            message: 'Unauthorized'
        }
    )

    try {
        const body = await request.json()
        const log = deserializeLog(body)
        await createLog(log)
    } catch (error: any) {
        return buildApiResponse(
            400,
            null,
            {
                code: ApiErrorCode.BAD_REQUEST,
                message: error?.['message'] || ''
            }
        )
    }

    return true
}