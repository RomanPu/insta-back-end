import { loggerService } from './logger.service.js'
import { Server } from 'socket.io'


export const socketService = {

    setupSocketAPI,
    emitToUser,
    emitToUsers
}

var gIo = null

export function setupSocketAPI(http) {
    gIo = new Server(http, {
        cors: {
            origin: '*',
        }
    })
    gIo.on('connection', socket => {
        loggerService.info(`New connected socket [id: ${socket.id}]`)
        socket.on('disconnect', socket => {
            loggerService.info(`Socket disconnected [id: ${socket.id}]`)
        })
        socket.on('set-user-socket', userId => {
            console.log('userId', userId)
            loggerService.info(`Setting socket.userId = ${userId} for socket [id: ${socket.id}]`)
            socket.userId = userId
        })
        socket.on('unset-user-socket', () => {
            loggerService.info(`Removing socket.userId for socket [id: ${socket.id}]`)
            delete socket.userId
        })
        // socket.on('unset-user-socket', () => {
        //     loggerService.info(`Removing socket.userId for socket [id: ${socket.id}]`)
        //     delete socket.userId
        // })
    })
}

async function emitToUser({ type, data, userId }) {
    userId = userId.toString()
    const socket = await _getUserSocket(userId)

    if (socket) {
        loggerService.info(`Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`)
        //console.log('socket', data)
        socket.emit(type, data)
    } else {
        loggerService.info(`No active socket for user: ${userId}`)
        // _printSockets()
    }
}

async function emitToUsers({ type, data, userIds }) {
    console.log('userIds', userIds)
    console.log(data)

    userIds.forEach(async userId => { 
        const socket = await _getUserSocket(userId)
        if (socket) {
            loggerService.info(`Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`)
            socket.emit(type, data)
        } else {
            loggerService.info(`No active socket for user: ${userId}`)
        }
    })
}


async function _getUserSocket(userId) {
    const sockets = await _getAllSockets()
    const socket = sockets.find(s => s.userId === userId)
    return socket
}

async function _getAllSockets() {
    // return all Socket instances
    const sockets = await gIo.fetchSockets()
    return sockets
}

async function _printSockets() {
    const sockets = await _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}):`)
    sockets.forEach(_printSocket)
}
function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}
