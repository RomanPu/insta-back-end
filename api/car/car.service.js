import { loggerService } from '../../services/logger.service.js'
import { utilService } from './../../services/util.service.js';

export const carService = {
    query,
    getById,
    remove,
    save
}

const PAGE_SIZE = 4
var cars = utilService.readJsonFile('./data/car.json')

async function query(filterBy = {}) {
    try {
        let carsToReturn = [...cars]
        if (filterBy.txt) {
            const regExp = new RegExp(filterBy.txt, 'i')
            carsToReturn = carsToReturn.filter(car => regExp.test(car.vendor))
        }

        if (filterBy.minSpeed) {
            carsToReturn = carsToReturn.filter(car => car.speed >= filterBy.minSpeed)
        }

        if (filterBy.pageIdx !== undefined) {
            const startIdx = filterBy.pageIdx * PAGE_SIZE
            carsToReturn = carsToReturn.slice(startIdx, startIdx + PAGE_SIZE)
        }

        return carsToReturn
    } catch (err) {
        loggerService.error(err)
        throw err
    }
}

async function getById(carId) {
    try {
        var car = cars.find(car => car._id === carId)
        if (!car) throw `Couldn't find car with _id ${carId}`
        return car
    } catch (err) {
        loggerService.error('carService[getById] : ' + err)
        throw (err)
    }
}

async function remove(carId, user) {
    try {
        const idx = cars.findIndex(car => car._id === carId)
        if (idx === -1) throw `Couldn't find car with _id ${carId}`

        if (!user.isAdmin) {
            if (cars[idx].owner._id !== user._id) throw `Not your car`
        }

        cars.splice(idx, 1)
        await _saveCarsToFile()
    } catch (err) {
        loggerService.error('carService[remove] : ', err)
        throw err
    }
}

async function save(carToSave, user) {
    try {
        if (carToSave._id) {
            const idx = cars.findIndex(car => car._id === carToSave._id)
            if (idx === -1) throw `Couldn't find car with _id ${carId}`

            if (!user.isAdmin) {
                if (cars[idx].owner._id !== user._id) throw `Not your car`
            }
        cars.splice(idx, 1, carToSave)
        } else {
            carToSave._id = utilService.makeId()
            carToSave.createdAt = Date.now()
            cars.push(carToSave)
        }
        await _saveCarsToFile()
        return carToSave
    } catch (err) {
        loggerService.error('carService[save] : ' + err)
        throw err
    }
}

function _saveCarsToFile() {
    return utilService.writeJsonFile('./data/car.json', cars)
}