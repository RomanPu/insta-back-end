import express from 'express'
import { getNotifications, addNotification, getNotificationById, markAsRead } from './notification.controller.js'
import { log } from '../../middlewares/log.middleware.js'

const router = express.Router()

router.get('/', log, getNotifications)
router.get('/:id', log, getNotificationById)
router.post('/', log, addNotification)
router.put('/', log, markAsRead)

export const notificationRoutes = router