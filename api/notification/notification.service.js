import { utilService } from '../../services/util.service.js'
import { loggerService } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'
import { userService } from '../user/user.service.js'
import { postService } from '../post/post.service.js'

const notifications = utilService.readJsonFile('data/notification.json')

export const notificationService = {
    getNotifications,
    addNotification,
    getNotificationById,
    markAsRead
}

async function getNotifications(forUser) {
    console.log('forUser', forUser)
    return notifications
        .filter(element => element.forUser === forUser)
        .map(element => createServerResponce(element));
}

function createServerResponce(notification){
    const users = userService.query()
    const posts = postService.query()
    const byUser = users.find(user => user._id === notification.byUser)
    const post = notification.postId ? posts.find(post => post._id === notification.postId) : ""
    return {
        _id: notification._id,
        about: notification.about,
        body: notification.body,
        byUser: {
            _id: byUser._id,
            username: byUser.username,
            avatarPic: byUser.avatarPic
        },
        post: post ? {postId: post._id, picUrl: post.picUrl} : "",
        createdAt: notification.createdAt,
        isRead: notification.isRead
    }
}

async function addNotification(notification) {
    try {
        notification._id = utilService.makeId()
        notification.createdAt = Date.now().toString()
        notification.isRead = false
        notifications.push(notification)
        socketService.emitToUser({ type: 'notification', data: createServerResponce(notification), 
            userId: notification.forUser })
        await _saveNotificationsToFile()
        return notification
    } catch (err) {
        loggerService.error('notificationService[addNotification] : ', err)
        throw err
    }
}

async function getNotificationById(id) {
    try {
        const notification = notifications.find(notification => notification._id === id)
        if (!notification) throw `Notification not found by id: ${id}`
        return notification
    } catch (err) {
        loggerService.error('notificationService[getNotificationById] : ', err)
        throw err
    }
}

async function markAsRead(id) {
    try {
        const notification = notifications.find(notification => notification._id === id)
        if (!notification) throw `Notification not found by id: ${id}`
        notification.isRead = true
        await _saveNotificationsToFile()
        return notification
    } catch (err) {
        console.log('notificationService[markAsRead] : ', err)
        loggerService.error('notificationService[markAsRead] : ', err)
        throw err
    }
}

function _saveNotificationsToFile() {
    return utilService.writeJsonFile('data/notification.json', notifications)
}