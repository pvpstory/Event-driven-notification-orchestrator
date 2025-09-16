# Event-Driven Notification Orchestrator

A Node.js service that manages user notification preferences and decides whether to send notifications based on user settings and "Do Not Disturb" (DND) time windows.

## Features

- **User Preference Management**: Store and retrieve notification preferences for users
- **Event Processing**: Evaluate incoming events against user preferences
- **Do Not Disturb Logic**: Handle complex DND time windows, including midnight crossings
- **Input Validation**: Robust validation using Zod schemas
- **Comprehensive Testing**: Full test coverage including edge cases

## Technology Stack

- **Node.js** with **TypeScript**
- **Express.js** framework
- **Zod** for input validation
- **Jest** for testing
- **Supertest** for API testing

## Setup & Installation

### Prerequisites
- Node.js (version 14 or higher)
- npm
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/Xpvpstory/Event-driven-notification-orchestrator.git
cd Event-driven-notification-orchestrator
```

### Step 2: Install Dependencies
```bash
npm install
```

## Running the Application

### Development Mode (Recommended)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## Running Tests

```bash
npx jest
```

This runs all 17 tests including unit tests for DND logic and integration tests for API endpoints.

## API Endpoints

### 1. Get User Preferences
```http
GET /preferences/:userId
```

**Response (200 OK):**
```json
{
  "dnd": {
    "start": "22:00",
    "end": "07:00"
  },
  "eventSettings": {
    "item_shipped": {
      "enabled": true
    },
    "invoice_generated": {
      "enabled": false
    }
  }
}
```

**Response (404 Not Found):**
```json
{
  "error": "User preference not found"
}
```

### 2. Set User Preferences
```http
POST /preferences/:userId
```

**Request Body:**
```json
{
  "dnd": {
    "start": "22:00",
    "end": "07:00"
  },
  "eventSettings": {
    "item_shipped": {
      "enabled": true
    },
    "invoice_generated": {
      "enabled": true
    }
  }
}
```

**Response (200 OK):**
```json
{
  "message": "Preferences updated successfully"
}
```

### 3. Process Event
```http
POST /events
```

**Request Body:**
```json
{
  "eventId": "evt_12345",
  "userId": "usr_abcde",
  "eventType": "item_shipped",
  "timestamp": "2025-07-28T15:00:00Z"
}
```

**Responses:**

**Send Notification (202 Accepted):**
```json
{
  "decision": "PROCESS_NOTIFICATION"
}
```

**Do Not Send - DND Active (200 OK):**
```json
{
  "decision": "DO_NOT_NOTIFY",
  "reason": "DND_ACTIVE"
}
```

**Do Not Send - User Unsubscribed (200 OK):**
```json
{
  "decision": "DO_NOT_NOTIFY",
  "reason": "USER_UNSUBSCRIBED_FROM_EVENT"
}
```

## Example Usage

### 1. Set User Preferences
```bash
curl -X POST http://localhost:3000/preferences/user123 \
  -H "Content-Type: application/json" \
  -d '{
    "dnd": {
      "start": "22:00",
      "end": "08:00"
    },
    "eventSettings": {
      "item_shipped": {
        "enabled": true
      },
      "invoice_generated": {
        "enabled": false
      }
    }
  }'
```

### 2. Get User Preferences
```bash
curl http://localhost:3000/preferences/user123
```

### 3. Process an Event
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "evt_12345",
    "userId": "user123",
    "eventType": "item_shipped",
    "timestamp": "2025-07-28T15:00:00Z"
  }'
```

## DND Logic

The service handles complex "Do Not Disturb" scenarios:

- **Same-day windows**: e.g., 09:00 to 17:00
- **Midnight-crossing windows**: e.g., 22:00 to 08:00
- **Edge cases**: Events exactly at start/end times

### Example DND Scenarios

| DND Window | Event Time | Result | Reason |
|------------|------------|--------|---------|
| 22:00-08:00 | 15:00 | ✅ Send | Outside DND |
| 22:00-08:00 | 23:30 | ❌ Block | Inside DND (after start) |
| 22:00-08:00 | 02:00 | ❌ Block | Inside DND (before end) |
| 22:00-08:00 | 09:00 | ✅ Send | Outside DND |

## Project Structure

```
src/
├── controllers/
│   ├── preferences.controller.ts    # User preference endpoints
│   ├── events.controller.ts         # Event processing endpoint
│   └── checkIfCanSendTheNotification.ts  # DND logic
├── mockDb.ts                        # In-memory data storage
├── index.ts                         # Express app setup
└── tests/
    └── index.test.ts               # Test suite
```

## Data Storage

This project uses an in-memory Map for data storage. Data will be reset when the application restarts. The service comes pre-seeded with sample user data for testing.

## Error Handling

The API includes comprehensive error handling:
- **400 Bad Request**: Invalid input data or validation errors
- **404 Not Found**: User not found
- **500 Internal Server Error**: Unexpected server errors

## Development Notes

- All timestamps are processed in UTC
- Time formats use 24-hour notation (HH:MM)
- Event types are validated against a predefined enum
- Comprehensive input validation prevents malformed requests

## License

This project was created as a coding assignment and is for demonstration purposes.
