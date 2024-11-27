import { utilService } from '../../services/util.service.js'
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'

const PAGE_SIZE = 4

export const postService = {
    query,
    getById,
    remove,
    save
}

async function query(filterBy = {}) {
    try {
        const collection = await dbService.getCollection('post')
        const posts = await collection.find().toArray()
        return posts
    } catch (err) {
        loggerService.error('postService[query] : ', err)
        throw err
    }
}

async function getById(postId) {
    try {
        const collection = await dbService.getCollection('post')
        const post = await collection.findOne({ _id: new ObjectId(postId) })
        if (!post) throw `Couldn't find post with _id ${postId}`
        return post
    } catch (err) {
        loggerService.error('postService[getById] : ', err)
        throw err
    }
}

async function remove(postId) {
    try {
        const collection = await dbService.getCollection('post')
        const result = await collection.deleteOne({ _id: new ObjectId(postId) })
        if (result.deletedCount === 0) throw `Couldn't find post with _id ${postId}`
        return result
    } catch (err) {
        loggerService.error('postService[remove] : ', err)
        throw err
    }
}

async function save(post) {
    try {
        const collection = await dbService.getCollection('post')
        if (post._id) {
            post._id = new ObjectId(post._id)
            await collection.updateOne({ _id: post._id }, { $set: post })
        } else {
            post._id = new ObjectId()
            await collection.insertOne(post)
        }
        return post
    } catch (err) {
        loggerService.error('postService[save] : ', err)
        throw err
    }
}