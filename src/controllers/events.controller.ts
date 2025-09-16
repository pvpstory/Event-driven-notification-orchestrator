import { Express } from 'express';
import {mockDb,UserPreferences} from '../mockDb'
import{checkIfCanSendTheNotification} from './checkIfCanSendTheNotification'
import { z } from 'zod';
import { Request, Response, NextFunction} from 'express';

const eventDataSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
  eventType: z.enum(['item_shipped', 'invoice_generated']),
  timestamp: z.string().datetime({ message: "Invalid ISO 8601 date-time format for timestamp" }),
});

const validate = (schema: z.Schema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
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

export const eventsControllerFactory = (app: Express) => {
	app.post('/events',validate(eventDataSchema), (req, res) => {
		//time zones question
		console.log('Received event:', req.body);
		const eventData = req.body;
		
		const userId: string = eventData.userId;
		const preference: UserPreferences | undefined = mockDb.getUserPreferences(userId);
		if (!preference){
			return res.status(404).json({error: "No user found"});
		}
		
		const eventType = eventData.eventType as keyof typeof preference.eventSettings; 
		const notificationsAllowed: boolean = preference.eventSettings[eventType]?.enabled;
		if (!notificationsAllowed){
			return res.status(200).json(
				{
				decision: "DO_NOT_NOTIFY", 
				reason: "USER_UNSUBSCRIBED_FROM_EVENT"
				})
		}

		const timestampEvent = eventData.timestamp
		let start = preference.dnd.start;
		let end = preference.dnd.end;
		

		const canSendTheNotification: boolean = checkIfCanSendTheNotification(end,start,timestampEvent);
	
		if (canSendTheNotification){
			return res.status(202).json({decision: "PROCESS_NOTIFICATION"})
		}
		else{
			return res.status(200).json(
				{
				"decision": "DO_NOT_NOTIFY",
				"reason": "DND_ACTIVE"
				}
			)
		}		
	});
};
