import { utilService } from '../../services/util.service.js'
import { loggerService } from '../../services/logger.service.js'

const users = utilService.readJsonFile('data/user.json')

export const userService = {
    query,
    getById,
    remove,
    save,
    getByUsername
}

async function query() {
    return users
}

async function getById(userId) {
    try {
        const user = users.find(user => user._id === userId)
        if (!user) throw `User not found by userId : ${userId}`
        return user
    } catch (err) {
        loggerService.error('userService[getById] : ', err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const user = users.find(user => user.username === username)
        return user
    } catch (err) {
        loggerService.error('userService[getByUsername] : ', err)
        throw err
    }
}

async function remove(userId) {
    try {
        const idx = users.findIndex(user => user._id === userId)
        if (idx === -1) throw `Couldn't find user with _id ${causerIdrId}`

        users.splice(idx, 1)
        await _saveUsersToFile()
    } catch (err) {
        loggerService.error('userService[remove] : ', err)
        throw err
    }
}

async function save(user) {
    // Only handles user ADD for now
    try {

        if (user._id) {
            const idx = users.findIndex(currUser => currUser._id === user._id)
            if (idx === -1) throw `Couldn't find user with _id ${user._id}`
            users[idx] = user
        }else{
            user._id = utilService.makeId()
            user.createdAt = Date.now()    
            user.posts = []
            user.followers = []
            user.following = []
            user.body = ""
            users.push(user)
            
        }
    
        await _saveUsersToFile()
        return user
    } catch (err) {
        loggerService.error('userService[save] : ', err)
        throw err
    }
}

function _saveUsersToFile() {
    return utilService.writeJsonFile('data/user.json', users)
}