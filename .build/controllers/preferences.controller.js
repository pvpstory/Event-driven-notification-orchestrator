"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preferencesControllerFactory = void 0;
const mockDb_1 = require("../mockDb");
const zod_1 = require("zod");
const timeFormat = zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Invalid time format, expected 'HH:MM'",
});
const userPreferencesSchema = zod_1.z.object({
    dnd: zod_1.z.object({
        start: timeFormat,
        end: timeFormat,
    }),
    eventSettings: zod_1.z.object({
        item_shipped: zod_1.z.object({
            enabled: zod_1.z.boolean(),
        }),
        invoice_generated: zod_1.z.object({
            enabled: zod_1.z.boolean(),
        }),
    }),
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
const preferencesControllerFactory = (app) => {
    app.get('/preferences/:userId', (req, res) => {
        console.log(`Preferences for user ${req.params.userId} requested`);
        let preference = mockDb_1.mockDb.getUserPreferences(req.params.userId);
        if (!preference) {
            return res.status(404).json({ error: "User preference not found" });
        }
        console.log(`User's current preferences:`, preference);
        return res.status(200).json(preference);
    });
    app.post('/preferences/:userId', validate(userPreferencesSchema), (req, res) => {
        console.log(`Preferences for user ${req.params.userId} updated`, req.body);
        const userId = req.params.userId;
        const requestData = req.body;
        //the preference can still be invalid if dnd or eventSettings is not correct structure
        const preference = {
            dnd: requestData.dnd,
            eventSettings: requestData.eventSettings
        };
        console.log(`User's current preferences:`, preference);
        mockDb_1.mockDb.setUserPreferences(userId, preference);
        return res.status(200).json({ message: 'Preferences updated successfully' });
    });
};
exports.preferencesControllerFactory = preferencesControllerFactory;
