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

async function getMessages(byUser, isRead) {

    const collection = await dbService.getCollection('message'); 
    if (isRead) {
        const unreadMessages = await collection.aggregate([
            {
                $match: {
                    isRead: {
                        $elemMatch: {
                            id: new ObjectId(byUser),
                            isRead: false
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'user',
                    localField: 'correspandents',
                    foreignField: '_id',
                    as: 'correspandentDetails'
                }
            },
            {
                $project: {
                    _id: 1,
                    messages: 1,
                    createdAt: 1,
                    isRead: 1,
                    correspandents: '$correspandentDetails'
                }
            }
        ]).toArray();
        
        return unreadMessages.length;
    }
    // Rest of the existing getMessages function...

      
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

async function addMessage(message, user) {
    //console.log("add",message);
    console.log("user",user);
    try {
        message.createdAt = Date.now().toString();
        message.correspandents = message.correspandents.map(correspandent => new ObjectId(correspandent));
        message.isRead = message.correspandents.map(correspandent => ({ id: correspandent, isRead: false }));
        message.messages = []; 

        message.isRead.forEach(isRead => {
            if (isRead.id.equals(user._id)) {
                isRead.isRead = true;
            } else {
                isRead.isRead = false;
            }
        });

        console.log("message",message.isRead);

        const collection = await dbService.getCollection('message');
        const { insertedId } = await collection.insertOne(message);

            const savadMsg = await getMessageById(insertedId);
    //    console.log("insertedId",message.correspandents.map(correspandent => correspandent.toString()));
   //     socketService.emitToUsers({type: "add-message",data: insertedId, userIds: savadMsg.correspandents.map(correspandent => correspandent.toString())});
        socketService.emitToUsers({type:'add-message', data:  message._id, userIds:
            message.correspandents.filter(correspandent => !correspandent.equals(user._id))
            .map(correspandent => correspandent.toString())})
        message._id = insertedId;
        return savadMsg
    } catch (err) {
        loggerService.error('messageService[addMessage] : ', err);
        throw err;
    }
}

async function getMessageById(id) {
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

async function editMessage(msg, user) {
    try {
        // msg.isRead.forEach(isRead => {
        //     if (isRead.id === user._id) isRead.isRead = true
        //     else isRead.isRead = false
        // });


        msg.correspandents = msg.correspandents.map(correspandent => new ObjectId(correspandent._id));
        msg._id = new ObjectId(msg._id);
        const collection = await dbService.getCollection('message');
        const result = await collection.updateOne(
            { _id: msg._id },
            { $set: msg }
        );
        if (result.matchedCount === 0) throw `Message not found by id: ${id}`;
        socketService.emitToUsers({type:'edit-message', data:  msg._id, userIds:
            msg.correspandents.filter(correspandent => !correspandent.equals(user._id))
            .map(correspandent => correspandent.toString())})
        return msg;
    } catch (err) {
        loggerService.error('messageService[updateMessage] : ', err);
        throw err;
    }
}