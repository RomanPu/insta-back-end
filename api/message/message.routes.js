import express from 'express'
import { getMessages, addMessage, getMessageById, editMessage } from './message.controller.js'
import { log } from '../../middlewares/log.middleware.js'

const router = express.Router()

router.get('/:id', log, getMessageById)
router.get('/', log, getMessages)
router.post('/', log, addMessage)
router.put('/', log, editMessage)

export const messageRoutes = router