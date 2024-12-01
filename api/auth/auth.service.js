import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'
import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'
import { userService } from '../user/user.service.js'

const cryptr = new Cryptr('mySecretKey')

export const authService = {
    signup,
    login,
    getLoginToken,
    validateToken
}

async function signup(user) {
    try {
        const collection = await dbService.getCollection('user')
        user.password = await bcrypt.hash(user.password, 10)
        user.likes = []
        user.followers = []
        user.following = []
        user.createdAt = Date.now()
        user.posts = []
        user.body = ''
        user.avatarPic = ''
        user.conversations = []
        
        await collection.insertOne(user)
        return user
    } catch (err) {
        loggerService.error('authService[signup] : ', err)
        throw err
    }
}

async function login(username, password) {
    try {
        const user = await userService.getByUsername(username)
        if (!user) throw 'Unknown username'

        // const match = await bcrypt.compare(password, user.password)
        // if (!match) throw 'Invalid username or password'

        // Removing passwords and personal data
        const miniUser = {
            _id: user._id,
            fullname: user.fullname,
            avatarPic: user.avatarPic,
            username: user.username,
            conversations: user.conversations
        }
        return miniUser
    } catch (err) {
        loggerService.error('authService[login] : ', err)
        throw err
    }
}

function getLoginToken(user) {
    const str = JSON.stringify(user)
    const encryptedStr = cryptr.encrypt(str)
    return encryptedStr
}

function validateToken(token) {
    try {
        const json = cryptr.decrypt(token)
        const loggedinUser = JSON.parse(json)
        return loggedinUser
    } catch (err) {
        console.log('Invalid login token')
        return null
    }
}