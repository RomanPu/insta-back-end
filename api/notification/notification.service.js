import { utilService } from '../../services/util.service.js'
import { loggerService } from '../../services/logger.service.js'

const notifications = utilService.readJsonFile('data/notification.json')

export const notificationService = {
    getNotifications,
    addNotification,
    getNotificationById,
    markAsRead
}

async function getNotifications() {
    return notifications
}

async function addNotification(notification) {
    try {
        notification._id = utilService.makeId()
        notification.createdAt = Date.now().toString()
        notification.read = false
        notifications.push(notification)
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
        console.log('notification', notification)
        if (!notification) throw `Notification not found by id: ${id}`
        notification.read = true
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