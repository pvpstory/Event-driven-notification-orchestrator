"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const checkIfCanSendTheNotification_1 = require("./controllers/checkIfCanSendTheNotification");
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("./index");
test("checkIfCanSendTheNotification returns true for valid input", () => {
    // The event time (21:01) is outside the do-not-disturb window (22:00 to 23:00)
    expect((0, checkIfCanSendTheNotification_1.checkIfCanSendTheNotification)("23:00", "22:00", "2025-07-28T21:01:00Z")).toBe(true);
});
test("checkIfCanSendTheNotification returns false for invalid input", () => {
    // The event time (22:01) is inside the do-not-disturb window (22:00 to 24:00/00:00)
    expect((0, checkIfCanSendTheNotification_1.checkIfCanSendTheNotification)("23:59", "22:00", "2025-07-28T22:01:00Z")).toBe(false);
});
test("checkIfCanSendTheNotification returns false for invalid input. Midnight crossing 1", () => {
    // The event time (23:59) is inside the do-not-disturb window (23:22 to 09:00)
    expect((0, checkIfCanSendTheNotification_1.checkIfCanSendTheNotification)("09:00", "23:22", "2025-07-28T23:59:00Z")).toBe(false);
});
test("checkIfCanSendTheNotification returns false for invalid input. Midnight crossing 2", () => {
    // The event time (02:19) is inside the do-not-disturb window (23:22 to 09:00)
    expect((0, checkIfCanSendTheNotification_1.checkIfCanSendTheNotification)("09:00", "23:22", "2025-07-28T02:19:00Z")).toBe(false);
});
test("checkIfCanSendTheNotification returns false for invalid input. Midnight crossing and event time equals to start time", () => {
    // The event time (23:22) is inside the do-not-disturb window (23:22 to 09:00)
    expect((0, checkIfCanSendTheNotification_1.checkIfCanSendTheNotification)("09:00", "23:22", "2025-07-28T23:22:00Z")).toBe(false);
});
test("checkIfCanSendTheNotification returns true for valid input. Midnight crossing", () => {
    // The event time (21:59) is outside the do-not-disturb window (22:00 to 02:00)
    expect((0, checkIfCanSendTheNotification_1.checkIfCanSendTheNotification)("02:00", "22:00", "2025-07-28T21:59:00Z")).toBe(true);
});
test("checkIfCanSendTheNotification returns true for valid input. Midnight crossing 2", () => {
    // The event time (10:10) is outside the do-not-disturb window (22:00 to 02:00)
    expect((0, checkIfCanSendTheNotification_1.checkIfCanSendTheNotification)("02:00", "22:00", "2025-07-28T10:10:00Z")).toBe(true);
});
describe("preference api testing", () => {
    const newPreference = {
        dnd: {
            start: '23:59',
            end: '08:00'
        },
        eventSettings: {
            item_shipped: {
                enabled: false
            },
            invoice_generated: {
                enabled: false
            }
        }
    };
    const invalidPreference1 = "2312";
    const invalidPreference2 = {
        "check": {}
    };
    const invalidPreference3 = {
        dnd: {
            start: "89:00",
            end: '::::'
        },
        eventSettings: {
            item_shipped: {
                en: "12"
            },
            invoice_generated: {
                en: "true"
            }
        }
    };
    it("should add a preference to a new user, and then get it back", async () => {
        const createResponse = await (0, supertest_1.default)(index_1.app)
            .post('/preferences/5')
            .send(newPreference);
        expect(createResponse.status).toBe(200);
        const getResponse = await (0, supertest_1.default)(index_1.app)
            .get('/preferences/5');
        expect(getResponse.status).toBe(200);
        expect(getResponse.body).toEqual(newPreference);
    });
    it("should return status 404 if the user isn't present", async () => {
        const getResponse = await (0, supertest_1.default)(index_1.app)
            .get('/preferences/8');
        expect(getResponse.status).toBe(404);
    });
    it("should return status 400 if preference data is not valid", async () => {
        let createResponse = await (0, supertest_1.default)(index_1.app)
            .post('/preferences/6')
            .send(invalidPreference1);
        expect(createResponse.status).toBe(400);
        createResponse = await (0, supertest_1.default)(index_1.app)
            .post('/preferences/6')
            .send(invalidPreference2);
        expect(createResponse.status).toBe(400);
        createResponse = await (0, supertest_1.default)(index_1.app)
            .post('/preferences/6')
            .send(invalidPreference3);
        expect(createResponse.status).toBe(400);
    });
});
describe("events api testing", () => {
    const testUserId = 'user-event-tester';
    const userPreferences = {
        dnd: {
            start: '22:00',
            end: '09:00'
        },
        eventSettings: {
            item_shipped: {
                enabled: true
            },
            invoice_generated: {
                enabled: false
            }
        }
    };
    beforeAll(async () => {
        await (0, supertest_1.default)(index_1.app)
            .post(`/preferences/${testUserId}`)
            .send(userPreferences);
    });
    it("should return 202 PROCESS_NOTIFICATION for a valid event outside DND hours", async () => {
        const eventData = {
            "eventId": "evt_12345",
            "userId": testUserId,
            "eventType": "item_shipped",
            "timestamp": "2025-07-28T15:00:00Z" // 3 PM, outside DND
        };
        const response = await (0, supertest_1.default)(index_1.app)
            .post('/events')
            .send(eventData);
        expect(response.status).toBe(202);
        expect(response.body).toEqual({ decision: "PROCESS_NOTIFICATION" });
    });
    it("should return 200 DO_NOT_NOTIFY because of DND_ACTIVE", async () => {
        const eventData = {
            "eventId": "evt_67890",
            "userId": testUserId,
            "eventType": "item_shipped",
            "timestamp": "2025-07-28T23:30:00Z" // 11:30 PM, inside DND
        };
        const response = await (0, supertest_1.default)(index_1.app)
            .post('/events')
            .send(eventData);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            decision: "DO_NOT_NOTIFY",
            reason: "DND_ACTIVE"
        });
    });
    it("should return 200 DO_NOT_NOTIFY because of USER_UNSUBSCRIBED_FROM_EVENT", async () => {
        const eventData = {
            "eventId": "evt_abcde",
            "userId": testUserId,
            "eventType": "invoice_generated", // This is disabled in userPreferences
            "timestamp": "2025-07-28T16:00:00Z" // Outside DND
        };
        const response = await (0, supertest_1.default)(index_1.app)
            .post('/events')
            .send(eventData);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            decision: "DO_NOT_NOTIFY",
            reason: "USER_UNSUBSCRIBED_FROM_EVENT"
        });
    });
    it("should return 404 if the user is not found", async () => {
        const eventData = {
            "eventId": "evt_fghij",
            "userId": "non_existent_user",
            "eventType": "item_shipped",
            "timestamp": "2025-07-28T15:00:00Z"
        };
        const response = await (0, supertest_1.default)(index_1.app)
            .post('/events')
            .send(eventData);
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "No user found" });
    });
    describe("input validation", () => {
        it("should return 400 for a missing field (e.g., eventId)", async () => {
            const invalidEvent = {
                // eventId is missing
                "userId": testUserId,
                "eventType": "item_shipped",
                "timestamp": "2025-07-28T15:00:00Z"
            };
            const response = await (0, supertest_1.default)(index_1.app)
                .post('/events')
                .send(invalidEvent);
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation failed');
            expect(response.body.errors).toBeDefined();
        });
        it("should return 400 for an invalid eventType", async () => {
            const invalidEvent = {
                "eventId": "evt_12345",
                "userId": testUserId,
                "eventType": "item_returned", // Not a valid enum value
                "timestamp": "2025-07-28T15:00:00Z"
            };
            const response = await (0, supertest_1.default)(index_1.app)
                .post('/events')
                .send(invalidEvent);
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation failed');
        });
        it("should return 400 for an invalid timestamp format", async () => {
            const invalidEvent = {
                "eventId": "evt_12345",
                "userId": testUserId,
                "eventType": "item_shipped",
                "timestamp": "July 28, 2025" // Invalid format
            };
            const response = await (0, supertest_1.default)(index_1.app)
                .post('/events')
                .send(invalidEvent);
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation failed');
        });
    });
});
