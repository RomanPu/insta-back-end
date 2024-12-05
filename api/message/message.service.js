import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'
import { socketService } from '../../services/socket.service.js'

export const messageService = {
    getMessages,
    addMessage,
    getMessageById,
    editMessage
}

async function getMessages(byUser) {

    let t;
    console.log( new ObjectId(t));
    const collection = await dbService.getCollection('message');
    const messages = await collection.aggregate([
        { $match: { correspandents: { $in: [new ObjectId(byUser)] } } },
        {
            $lookup: {
                from: 'user',
                localField: 'correspandents',
                foreignField: '_id',
                as: 'correspandentDetails'
            }
        },
        {
            $unwind: {
                path: '$correspandentDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: '$_id',
                messages: { $first: '$messages' },
                createdAt: { $first: '$createdAt' },
                isRead: { $first: '$isRead' },
                correspandents: { $push: '$correspandentDetails' }
            }
        },
        {
            $project: {
                _id: 1,
                createdAt: 1,
                isRead: 1,
                messages: 1,
                correspandents: {
                    _id: 1,
                    fullname: 1,
                    username: 1,
                    avatarPic: 1
                }
            }
        }
    ]).toArray();

    return messages;
}

async function addMessage(message) {
    try {
        message.createdAt = Date.now().toString();
        message.correspandents = message.correspandents.map(correspandent => new ObjectId(correspandent));
        message.isRead = message.correspandents.map(correspandent => ({ id: correspandent, isRead: false }));
        message.messages = []; 

        const collection = await dbService.getCollection('message');
        const { insertedId } = await collection.insertOne(message);
        socketService.emitToUsers("message", insertedId, message.correspandents.map(correspandent => correspandent.id.toString()));

        return insertedId;
    } catch (err) {
        loggerService.error('messageService[addMessage] : ', err);
        throw err;
    }
}

async function getMessageById(id) {
    console.log("getby",id);
    try {
        const collection = await dbService.getCollection('message');
        const messages = await collection.aggregate([
            { $match: { _id: new ObjectId(id) } },
            {
                $lookup: {
                    from: 'user',
                    localField: 'correspandents',
                    foreignField: '_id',
                    as: 'correspandentDetails'
                }
            },
            {
                $unwind: {
                    path: '$correspandentDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    messages: { $first: '$messages' },
                    createdAt: { $first: '$createdAt' },
                    isRead: { $first: '$isRead' },
                    correspandents: { $push: '$correspandentDetails' }
                }
            },
            {
                $project: {
                    _id: 1,
                    createdAt: 1,
                    isRead: 1,
                    messages: 1,
                    correspandents: {
                        _id: 1,
                        fullname: 1,
                        username: 1,
                        avatarPic: 1
                    }
                }
            }
        ]).toArray();

        return messages[0]
    } catch (err) {
        loggerService.error('messageService[getMessageById] : ', err);
        throw err;
    }
}

async function editMessage(msg) {
    try {
        msg.correspandents = msg.correspandents.map(correspandent => new ObjectId(correspandent._id));
        msg._id = new ObjectId(msg._id);
        const collection = await dbService.getCollection('message');
        const result = await collection.updateOne(
            { _id: msg._id },
            { $set: msg }
        );
        if (result.matchedCount === 0) throw `Message not found by id: ${id}`;
        socketService.emitToUsers({type:'messeage', data:  msg._id.toString(), userIds:
            msg.correspandents.map(correspandent => correspandent.toString())});
        return true;
    } catch (err) {
        loggerService.error('messageService[updateMessage] : ', err);
        throw err;
    }
}