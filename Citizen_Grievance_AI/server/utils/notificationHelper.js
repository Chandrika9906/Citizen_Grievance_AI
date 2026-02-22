const Notification = require("../models/Notification");

async function createNotification(userId, type, title, message, complaintId = null) {
    try {
        const notification = new Notification({
            userId,
            type,
            title,
            message,
            complaintId
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
}

module.exports = { createNotification };
