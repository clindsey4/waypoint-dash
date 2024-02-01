import { deleteSession, getSession, insertSession, updateSession } from "@/data/botData";
import { describe } from "node:test";

describe('Database', () => {

    // sessions
    test('can insert a session', () => {
        return insertSession({
            accessToken: 'thisIsAnAccessToken',
            refreshToken: 'thisIsARefreshToken',
            expires: new Date()
        })
        .then(session => getSession(session.id))
        .then(data => expect(data).toEqual({
            id: data?.id,
            accessToken: 'thisIsAnAccessToken',
            refreshToken: 'thisIsARefreshToken',
            expires: data?.expires
        }))
    })

    test('can update a session', async () => {
        const session = await insertSession({
            accessToken: 'thisIsAnAccessToken',
            refreshToken: 'thisIsARefreshToken',
            expires: new Date()
        })

        await updateSession({
            id: session.id,
            accessToken: 'thisIsADifferentAccessToken'
        })

        return getSession(session.id)
            .then(data => expect(data).toEqual({
                id: session.id,
                accessToken: 'thisIsADifferentAccessToken',
                refreshToken: 'thisIsARefreshToken',
                expires: session.expires
            }))
    })

    test('can delete a session', async () => {
        const session = await insertSession({
            accessToken: 'thisIsAnAccessToken',
            refreshToken: 'thisIsARefreshToken',
            expires: new Date()
        })

        return deleteSession(session.id)
            .then(_ => getSession(session.id))
            .then(data => expect(data).toBeNull())
    })

})