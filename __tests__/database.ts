import { createModuleConfigRecord, updateModuleConfigRecord, deleteModuleConfigRecord, getModuleConfigRecord,
    insertSession, updateSession, deleteSession, getSession, 
    createLog, deleteLog, getLogsByDate, getLog } from "@/data/botData";
import { Log } from "@/data/types";
import { describe } from "node:test";

describe('Database', () => {
    // module_config
    test('can create module_config record', async () => {
        return createModuleConfigRecord({
            serverId: 1,
            moduleId: 1,
            moduleConfig: "{}",
            enabled: true
        })
        .then(response => expect(response).toEqual(true))
    })

    test('can update a module_config record', async () => {
        await createModuleConfigRecord({
            serverId: 1,
            moduleId: 1,
            moduleConfig: "{}",
            enabled: true
        })

        const success = await updateModuleConfigRecord({
            serverId: 1, 
            moduleId: 1, 
            moduleConfig: "{}", 
            enabled: false
        })
        
        if (!success)
            return false

        return getModuleConfigRecord(1, 1)
        .then(response => response?.enabled)
        .then(enabled => expect(enabled).toEqual(false))
    })

    test('can delete a module_config record', async () => {
        await createModuleConfigRecord({
            serverId: 1,
            moduleId: 1,
            moduleConfig: "{}",
            enabled: true
        })

        return deleteModuleConfigRecord(1, 1)
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

    //logs
    let dateCreated: Date = new Date()
    let startDate: Date = dateCreated
    startDate.setHours(startDate.getHours() - 1)
    let endDate: Date = dateCreated
    endDate.setHours(endDate.getHours() + 1)
    
    test('can create a log', async () => {
        return createLog({
            messageId: "test",
            userId: "test",
            serverId: "test",
            command: "test",
            command_id: 0,
            dateCreated: dateCreated
        })
        .then(response => expect(response).toEqual(true))
    })

    test('can get a log', async () => {
        return getLog(
            "test"
        )
        .then(response => expect(response).toEqual({
            messageId: "test",
            userId: "test",
            serverId: "test",
            command: "test",
            command_id: 0,
            dateCreated: dateCreated
        }))
    })

    test('delete a log', async () => {
        return deleteLog(
            "test"
        )
        .then(response => expect(response).toEqual(true))
    })

    test('can get logs by date', async() => {
        try {
            await createLog({
                messageId: "test2",
                userId: "test",
                serverId: "test",
                command: "test",
                command_id: 0,
                dateCreated: dateCreated
            })
            await createLog({
                messageId: "test3",
                userId: "test",
                serverId: "test",
                command: "test",
                command_id: 0,
                dateCreated: dateCreated
            })
            await createLog({
                messageId: "test4",
                userId: "test",
                serverId: "test",
                command: "test",
                command_id: 0,
                dateCreated: dateCreated
            })
            return getLogsByDate(
                startDate,
                endDate
            )
            .then(response => expect(response).toEqual(
                [
                {
                messageId: "test2",
                userId: "test",
                serverId: "test",
                command: "test",
                command_id: 0,
                dateCreated: dateCreated
                },
                {
                    messageId: "test3",
                    userId: "test",
                    serverId: "test",
                    command: "test",
                    command_id: 0,
                    dateCreated: dateCreated
                },
                {
                    messageId: "test4",
                    userId: "test",
                    serverId: "test",
                    command: "test",
                    command_id: 0,
                    dateCreated: dateCreated
                }
                ] as Log[]))
        } finally {
            deleteLog("test2")
            deleteLog("test3")
            deleteLog("test4")
        }
    })
})