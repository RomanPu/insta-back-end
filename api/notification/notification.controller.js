import { notificationService } from './notification.service.js'
import { loggerService } from '../../services/logger.service.js';

export async function getNotifications(req, res) {
    try {
        const notifications = await notificationService.getNotifications()
        res.json(notifications)
    } catch (err) {
        loggerService.error('Failed to get notifications', err)
        res.status(500).send({ err: 'Failed to get notifications' })
    }
}

export async function addNotification(req, res) {
    try {
        const notification = req.body
        const addedNotification = await notificationService.addNotification(notification)
        res.json(addedNotification)
    } catch (err) {
        loggerService.error('Failed to add notification', err)
        res.status(500).send({ err: 'Failed to add notification' })
    }
}

export async function getNotificationById(req, res) {
    try {
        const { _id } = req.params
        const notification = await notificationService.getNotificationById(_id)
        res.json(notification)
    } catch (err) {
        loggerService.error('Failed to get notification by id', err)
        res.status(500).send({ err: 'Failed to get notification by id' })
    }
}

export async function markAsRead(req, res) {
    try {
        const { _id } = req.body
        console.log('markAsRead', _id)
        const updatedNotification = await notificationService.markAsRead(_id)
        res.json(updatedNotification)
    } catch (err) {
        console.log('Failed to mark notification as read', err)
        loggerService.error('Failed to mark notification as read', err)
        res.status(500).send({ err: 'Failed to mark notification as read' })
    }
}