import express from 'express'
import { addPost, getPosts, getPost, removePost, updatePost } from './post.controller.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'

const router = express.Router()

router.get('/', getPosts)
router.get('/:postId', getPost)
router.delete('/:postId', requireAuth, removePost)
router.post('/', requireAuth, addPost)
router.put('/', requireAuth, updatePost)


export const postRoutes = router