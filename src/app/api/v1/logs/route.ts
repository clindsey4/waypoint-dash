import { createLog } from "@/data/botData";
import { buildApiResponse, deserializeLog, isApiRequestAuthorized } from "@/lib/api";
import { ApiErrorCode, ApiResponse } from "@/lib/api/types";
import { redirect } from "next/navigation";
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

export async function GET(
    request: NextRequest
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
        const params = request.nextUrl.searchParams
        const messageId = params.get('messageId')
        if (messageId === undefined)
            return buildApiResponse(
                400,
                null,
                {
                    code: ApiErrorCode.BAD_REQUEST,
                    message: 'Bad Request'
                }
            )
        
    } catch (err: any) {
        console.log('Oauth2 Error', err.response, err.message, err.code)
    }
    
    return redirect('/')
}