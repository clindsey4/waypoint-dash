import { createModuleConfigRecord, deleteModuleConfigRecord, deleteSession, getModuleConfigRecord, getSession, insertSession, updateModuleConfigRecord, updateSession } from "@/data/botData";
import { describe } from "node:test";

describe('Database', () => {
    // module_config
    test('can create module_config record', async () => {
        return createModuleConfigRecord({
            serverId: "test",
            moduleId: 1,
            moduleConfig: "{}",
            enabled: true
        })
        .then(response => expect(response).toEqual(true))
    })

    test('can update a module_config record', async () => {
        await createModuleConfigRecord({
            serverId: "test",
            moduleId: 1,
            moduleConfig: "{}",
            enabled: true
        })

        const success = await updateModuleConfigRecord({
            serverId: "test", 
            moduleId: 1, 
            moduleConfig: "{}", 
            enabled: false
        })
        
        if (!success)
            return false

        return getModuleConfigRecord("test", 1)
        .then(response => response?.enabled)
        .then(enabled => expect(enabled).toEqual(false))
    })

    test('can delete a module_config record', async () => {
        await createModuleConfigRecord({
            serverId: "test",
            moduleId: 1,
            moduleConfig: "{}",
            enabled: true
        })

        return deleteModuleConfigRecord("test", 1)
        .then(response => expect(response).toEqual(true))
    })

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