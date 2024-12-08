import { authService } from '../auth/auth.service.js'
import { postService } from './post.service.js'

// Post CRUDL API

export async function getPosts(req, res) {
    try {

        const filterBy = {
            txt: req.query.txt || '',
            minSpeed: +req.query.minSpeed || 0,
            pageIdx: req.query.pageIdx || undefined
        }
        const posts = await postService.query(filterBy)
        res.send(posts)
    } catch (err) {
        res.status(400).send(`Couldn't get posts`)
    }
}

export async function getPost(req, res) {
    const { postId } = req.params

    try {
        const post = await postService.getById(postId)
        res.send(post)
    } catch (err) {
        res.status(400).send(`Couldn't get post`)
    }
}


export async function removePost(req, res) {
    const user = req.loggedinUser
    const { postId } = req.params

    try {
        await postService.remove(postId, user)
        res.send('Deleted OK')
    } catch (err) {
        res.status(400).send(`Couldn't remove post : ${err}`)
    }
}


export async function addPost(req, res) {
    const user = req.loggedinUser

    const { author, userId, likes, comments, createdAt, body, picUrl } = req.body
    const postToSave = { author, userId, likes, comments, createdAt: +createdAt,
         body, picUrl}

    try {
        const savedPost = await postService.save(postToSave)
        res.send(savedPost)
    } catch (err) {
        res.status(400).send(`Couldn't save post`)
    }
}

export async function updatePost(req, res) {
    const user = req.loggedinUser

    const {_id, author, userId, likes, comments, createdAt, body, picUrl } = req.body
    const postToSave = { _id, author, userId, likes, comments, createdAt: +createdAt,
         body, picUrl}

    try {
        const savedPost = await postService.save(postToSave, user)
        res.send(savedPost)
    } catch (err) {
        res.status(400).send(`Couldn't save post`)
    }
}
