"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsControllerFactory = void 0;
const mockDb_1 = require("../mockDb");
const checkIfCanSendTheNotification_1 = require("./checkIfCanSendTheNotification");
const zod_1 = require("zod");
const eventDataSchema = zod_1.z.object({
    eventId: zod_1.z.string(),
    userId: zod_1.z.string(),
    eventType: zod_1.z.enum(['item_shipped', 'invoice_generated']),
    timestamp: zod_1.z.string().datetime({ message: "Invalid ISO 8601 date-time format for timestamp" }),
});
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const errors = error.issues.map(issue => ({
                path: issue.path.join('.'),
                message: issue.message,
            }));
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors,
            });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
const eventsControllerFactory = (app) => {
    app.post('/events', validate(eventDataSchema), (req, res) => {
        //time zones question
        console.log('Received event:', req.body);
        const eventData = req.body;
        const userId = eventData.userId;
        const preference = mockDb_1.mockDb.getUserPreferences(userId);
        if (!preference) {
            return res.status(404).json({ error: "No user found" });
        }
        const eventType = eventData.eventType;
        const notificationsAllowed = preference.eventSettings[eventType]?.enabled;
        if (!notificationsAllowed) {
            return res.status(200).json({
                decision: "DO_NOT_NOTIFY",
                reason: "USER_UNSUBSCRIBED_FROM_EVENT"
            });
        }
        const timestampEvent = eventData.timestamp;
        let start = preference.dnd.start;
        let end = preference.dnd.end;
        const canSendTheNotification = (0, checkIfCanSendTheNotification_1.checkIfCanSendTheNotification)(end, start, timestampEvent);
        if (canSendTheNotification) {
            return res.status(202).json({ decision: "PROCESS_NOTIFICATION" });
        }
        else {
            return res.status(200).json({
                "decision": "DO_NOT_NOTIFY",
                "reason": "DND_ACTIVE"
            });
        }
    });
};
exports.eventsControllerFactory = eventsControllerFactory;
