import { utilService } from '../../services/util.service.js'
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'

export const userService = {
    query,
    getById,
    remove,
    save,
    getByUsername
}

async function query(username = '') {
    try {
        const collection = await dbService.getCollection('user')
        const users = await collection.find({ username: { $regex: username, $options: 'i' } }).toArray()
        return users
    } catch (err) {
        loggerService.error('userService[query] : ', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ _id: new ObjectId(userId) })
        if (!user) throw `User not found by userId: ${userId}`
        return user
    } catch (err) {
        loggerService.error('userService[getById] : ', err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username: username })
        if (!user) throw `User not found by username: ${username}`
        return user
    } catch (err) {
        loggerService.error('userService[getByUsername] : ', err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('user')
        const result = await collection.deleteOne({ _id: new ObjectId(userId) })
        if (result.deletedCount === 0) throw `User not found by userId: ${userId}`
        return result
    } catch (err) {
        loggerService.error('userService[remove] : ', err)
        throw err
    }
}

async function save(user) {
    try {
        const collection = await dbService.getCollection('user')
        console.log('user', user)
        if (user._id) {
            user._id = new ObjectId(user._id)
            await collection.updateOne({ _id: user._id }, { $set: user })
        } else {
            user._id = new ObjectId()
            await collection.insertOne(user)
        }
        return user
    } catch (err) {
        loggerService.error('userService[save] : ', err)
        throw err
    }
}