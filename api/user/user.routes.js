import express from 'express'
import { getUser, getUsers, deleteUser, updateUser } from './user.controller.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'

const router = express.Router()

router.get('/', requireAuth, getUsers)
router.get('/:id', requireAuth, getUser)
router.put('/:id', requireAuth, updateUser)
router.delete('/:id', requireAuth, deleteUser)

export const userRoutes = router