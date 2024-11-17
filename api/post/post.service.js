import { loggerService } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js';

export const postService = {
    query,
    getById,
    remove,
    save
}

const PAGE_SIZE = 4
var posts = utilService.readJsonFile('./data/post.json')

async function query(filterBy = {}) {
    try {
        let postsToReturn = [...posts]
        return postsToReturn
    } catch (err) {
        loggerService.error(err)
        throw err
    }
}

async function getById(postId) {
    try {
        var post = posts.find(post => post._id === postId)
        if (!post) throw `Couldn't find post with _id ${postId}`
        return post
    } catch (err) {
        loggerService.error('postService[getById] : ' + err)
        throw (err)
    }
}

async function remove(postId, user) {
    try {
        const idx = posts.findIndex(post => post._id === postId)
        if (idx === -1) throw `Couldn't find post with _id ${postId}`

        if (!user.isAdmin) {
            if (posts[idx].owner._id !== user._id) throw `Not your post`
        }

        posts.splice(idx, 1)
        await _savePostsToFile()
    } catch (err) {
        loggerService.error('postService[remove] : ', err)
        throw err
    }
}

async function save(postToSave, user) {
    try {
        if (postToSave._id) {
            const idx = posts.findIndex(post => post._id === postToSave._id)
            if (idx === -1) throw `Couldn't find post with _id ${postId}`
            posts.splice(idx, 1, postToSave)
        } else {
            postToSave._id = utilService.makeId()
            postToSave.createdAt = Date.now()
            posts.push(postToSave)
        }
        await _savePostsToFile()
        return postToSave
    } catch (err) {
        loggerService.error('postService[save] : ' + err)
        throw err
    }
}

function _savePostsToFile() {
    return utilService.writeJsonFile('./data/post.json', posts)
}