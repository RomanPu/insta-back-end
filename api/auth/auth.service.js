import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/user.service.js'
import { loggerService } from '../../services/logger.service.js'

const cryptr = new Cryptr(process.env.SECRET1 || 'Secret-Puk-1234')

export const authService = {
    getLoginToken,
    validateToken,
    login,
    signup
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
    }
    return null
}

async function login(username, password) {
    // console.log('auth.service - login with username:', username)
    var user = await userService.getByUsername(username)
    if (!user) throw 'Unkown username'
   // console.log('auth.service - login with user:', user)

    //  un-comment for real login
    // const match = await bcrypt.compare(password, user.password)
    // if (!match) throw 'Invalid username or password'

    // Removing passwords and personal data
    const miniUser = {
        _id: user._id,
        fullname: user.fullname,
        avatarPic: user.avatarPic,
        username: user.username,
        // Additional fields required for miniuser
    }
    return miniUser
}

async function signup({ username, password, fullname, email }) {
    const saltRounds = 10

    if (!username || !password || !fullname || !email) throw 'Missing required signup information'
    loggerService.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)

    const userExist = await userService.getByUsername(username)
    if (userExist) throw 'Username already taken'

    const hash = await bcrypt.hash(password, saltRounds)
    return userService.save({ username, password: hash, fullname, email })
}