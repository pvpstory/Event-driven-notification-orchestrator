export interface UserPreferences {
  //userId: string;
  dnd: {
    start: string;
    end: string;
  };
  eventSettings: {
    item_shipped: {
      enabled: boolean;
    };
    invoice_generated: {
      enabled: boolean;
    };
  };
}

class MockDatabase{
    private mockDb: Map<string,UserPreferences> = new Map()
    constructor(){
        this.seedPreferencesData();
    }
    
    private seedPreferencesData() {
        const preferences1: UserPreferences = {
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

        const preferences2: UserPreferences = {
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

    getUserPreferences(userId: string): UserPreferences | undefined {
        return this.mockDb.get(userId);
    }

    setUserPreferences(userId: string, preferences: UserPreferences): void {
        this.mockDb.set(userId, preferences);
    }
}

export const mockDb = new MockDatabase();