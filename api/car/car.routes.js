import express from 'express'
import { addCar, getCar, getCars, removeCar, updateCar } from './car.controller.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'

const router = express.Router()

router.get('/', getCars)
router.get('/:carId', getCar)
router.delete('/:carId', requireAuth, removeCar)
router.post('/', requireAuth, addCar)
router.put('/', requireAuth, updateCar)


export const carRoutes = router