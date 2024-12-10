import { utilService } from "../../services/util.service.js";
import { loggerService } from "../../services/logger.service.js";
import { socketService } from "../../services/socket.service.js";
import { dbService } from "../../services/db.service.js";
import { ObjectId } from "mongodb";

export const notificationService = {
  getNotifications,
  addNotification,
  getNotificationById,
  markAsRead,
};

async function getNotifications(forUser) {
  const collection = await dbService.getCollection("notification");

  const notifications = await collection
    .aggregate([
      { $match: { forUser: forUser } },
      {
        $lookup: {
          from: "user",
          localField: "byUser",
          foreignField: "_id",
          as: "byUserDetails",
        },
      },
      {
        $lookup: {
          from: "post",
          localField: "postId",
          foreignField: "_id",
          as: "postDetails",
        },
      },
      {
        $unwind: {
          path: "$byUserDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$postDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          about: 1,
          body: 1,
          createdAt: 1,
          isRead: 1,
          byUser: {
            _id: "$byUserDetails._id",
            username: "$byUserDetails.username",
            avatarPic: "$byUserDetails.avatarPic",
          },
          post: {
            postId: "$postDetails._id",
            picUrl: "$postDetails.picUrl",
          },
        },
      },
    ])
    .toArray();
  return notifications;
}
async function addNotification(notification) {
  try {
    const forUser = notification.forUser;
    notification.createdAt = Date.now().toString();
    notification.isRead = false;
    notification.byUser = new ObjectId(notification.byUser); // Convert byUser to ObjectId
    if (notification.postId) {
      notification.postId = new ObjectId(notification.postId); // Convert postId to ObjectId if it exists
    }
    const collection = await dbService.getCollection("notification");
    const { insertedId } = await collection.insertOne(notification);

    notification = await collection
      .aggregate([
        { $match: { _id: insertedId } },
        {
          $lookup: {
            from: "user",
            localField: "byUser",
            foreignField: "_id",
            as: "byUserDetails",
          },
        },
        {
          $lookup: {
            from: "post",
            localField: "postId",
            foreignField: "_id",
            as: "postDetails",
          },
        },
        {
          $unwind: {
            path: "$byUserDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$postDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            about: 1,
            body: 1,
            createdAt: 1,
            isRead: 1,
            byUser: {
              _id: "$byUserDetails._id",
              username: "$byUserDetails.username",
              avatarPic: "$byUserDetails.avatarPic",
            },
            post: {
              postId: "$postDetails._id",
              picUrl: "$postDetails.picUrl",
            },
          },
        },
      ])
      .toArray();
    socketService.emitToUser({
      type: "notification",
      data: notification[0],
      userId: forUser,
    });

    return notification[0];
  } catch (err) {
    loggerService.error("notificationService[addNotification] : ", err);
    throw err;
  }
}

async function getNotificationById(id) {
  try {
    const collection = await dbService.getCollection("notification");
    const notification = await collection.findOne({
      _id: ObjectId.createFromHexString(id),
    });
    if (!notification) throw `Notification not found by id: ${id}`;
    return notification;
  } catch (err) {
    loggerService.error("notificationService[getNotificationById] : ", err);
    throw err;
  }
}

async function markAsRead(id) {
  try {
    const collection = await dbService.getCollection("notification");
    await collection.updateOne(
      { _id: ObjectId.createFromHexString(id) },
      { $set: { isRead: true } },
    );
    return true;
  } catch (err) {
    console.log("notificationService[markAsRead] : ", err);
    loggerService.error("notificationService[markAsRead] : ", err);
    throw err;
  }
}
