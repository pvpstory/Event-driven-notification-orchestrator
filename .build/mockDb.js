"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDb = void 0;
class MockDatabase {
    mockDb = new Map();
    constructor() {
        this.seedPreferencesData();
    }
    seedPreferencesData() {
        const preferences1 = {
            //userId: '1',
            dnd: {
                start: '22:00',
                end: '07:00'
            },
            eventSettings: {
                item_shipped: {
                    enabled: true
                },
                invoice_generated: {
                    enabled: true
                }
            }
        };
        const preferences2 = {
            dnd: {
                start: '23:00',
                end: '08:00'
            },
            eventSettings: {
                item_shipped: {
                    enabled: false
                },
                invoice_generated: {
                    enabled: true
                }
            }
        };
        this.mockDb.set('1', preferences1);
        this.mockDb.set('2', preferences2);
    }
    getUserPreferences(userId) {
        return this.mockDb.get(userId);
    }
    setUserPreferences(userId, preferences) {
        this.mockDb.set(userId, preferences);
    }
}
exports.mockDb = new MockDatabase();
