import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

export const messageService = {
    getMessages,
    addMessage,
    getMessageById,
    markAsRead
}

async function getMessages(byUser) {
    console.log(byUser);
    console.log(new ObjectId(byUser));
    const collection = await dbService.getCollection('message');
    const messages = await collection.aggregate([
        { $match: { owner: new ObjectId(byUser) } },
        {
            $lookup: {
                from: 'user',
                localField: 'correspandent',
                foreignField: '_id',
                as: 'correspandentDetails'
            }
        },
        {
            $unwind: {
                path: '$ownerDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                body: 1,
                createdAt: 1,
                isRead: 1,
                Byuser: 1,
                correspandent: {
                    fullname: '$correspandentDetails.fullname',
                    username: '$correspandentDetails.username',
                    avatarPic: '$correspandentDetails.avatarPic'
                }
            }
        }
    ]).toArray()

    return messages
}

async function addMessage(message) {
    try {
        message.createdAt = Date.now().toString();
        message.isRead = false;
        message.owner = new ObjectId(message.owner); 
        message.byUser = new ObjectId(message.byUser);
        message.correspandent = new ObjectId(message.correspandent); 

        const collection = await dbService.getCollection('message');
        const { insertedId } = await collection.insertOne(message);

        message = await collection.aggregate([
            { $match: { _id: insertedId } },
            {
                $lookup: {
                    from: 'user',
                    localField: 'correspandent',
                    foreignField: '_id',
                    as: 'correspandentDetails'
                }
            },
            {
                $unwind: {
                    path: '$ownerDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    body: 1,
                    createdAt: 1,
                    isRead: 1,
                    Byuser: 1,
                    correspandent: {
                        fullname: '$correspandentDetails.fullname',
                        username: '$correspandentDetails.username',
                        avatarPic: '$correspandentDetails.avatarPic'
                    }
                }
            }
        ]).toArray();

        return message[0];
    } catch (err) {
        loggerService.error('messageService[addMessage] : ', err);
        throw err;
    }
}

async function getMessageById(id) {
    try {
        const collection = await dbService.getCollection('message');
        const message = await collection.findOne({ _id: new ObjectId(id) });
        if (!message) throw `Message not found by id: ${id}`;
        return message;
    } catch (err) {
        loggerService.error('messageService[getMessageById] : ', err);
        throw err;
    }
}

async function markAsRead(id) {
    try {
        const collection = await dbService.getCollection('message');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { isRead: true } }
        );
        if (result.matchedCount === 0) throw `Message not found by id: ${id}`;
        return true;
    } catch (err) {
        loggerService.error('messageService[markAsRead] : ', err);
        throw err;
    }
}