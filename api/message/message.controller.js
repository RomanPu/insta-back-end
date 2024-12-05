import { messageService } from './message.service.js'
import { loggerService } from '../../services/logger.service.js'

export async function getMessages(req, res) {
    try {
        const { forUser } = req.query
        const messages = await messageService.getMessages(forUser)
        res.json(messages)
    } catch (err) {
        loggerService.error('Failed to get messages', err)
        res.status(500).send({ err: 'Failed to get messages' })
    }
}

export async function addMessage(req, res) {
    try {
        const message = req.body
        const addedMessage = await messageService.addMessage(message)
        res.json(addedMessage)
    } catch (err) {
        loggerService.error('Failed to add message', err)
        res.status(500).send({ err: 'Failed to add message' })
    }
}

export async function getMessageById(req, res) {
    try {
        const { id } = req.params
        const message = await messageService.getMessageById(id)
        res.json(message)
    } catch (err) {
        loggerService.error('Failed to get message by id', err)
        res.status(500).send({ err: 'Failed to get message by id' })
    }
}

export async function editMessage(req, res) {
    try {
        const  msg  = req.body
        const updatedMessage = await messageService.editMessage(msg)
        res.json(updatedMessage)
    } catch (err) {
        loggerService.error('Failed to edit message', err)
        res.status(500).send({ err: 'Failed to edit message' })
    }
}