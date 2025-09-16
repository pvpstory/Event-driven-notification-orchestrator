import { Express} from 'express';
import { mockDb } from '../mockDb';
import {UserPreferences} from '../mockDb';
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const timeFormat = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
  message: "Invalid time format, expected 'HH:MM'",
});

const userPreferencesSchema = z.object({
  dnd: z.object({
    start: timeFormat,
    end: timeFormat,
  }),
  eventSettings: z.object({
    item_shipped: z.object({
      enabled: z.boolean(),
    }),
    invoice_generated: z.object({
      enabled: z.boolean(),
    }),
  }),
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

export const preferencesControllerFactory = (app: Express) => {
	app.get('/preferences/:userId', (req, res) => {
		console.log(`Preferences for user ${req.params.userId} requested`);
		let preference: UserPreferences | undefined = mockDb.getUserPreferences(req.params.userId);
		if (!preference){
			return res.status(404).json({error: "User preference not found"});
		}

		console.log(`User's current preferences:`, preference);
		return res.status(200).json(preference);
	});	

	app.post('/preferences/:userId',validate(userPreferencesSchema),(req, res) => {
		console.log(`Preferences for user ${req.params.userId} updated`, req.body);

		const userId: string = req.params.userId;
		const requestData = req.body;
		
		
		//the preference can still be invalid if dnd or eventSettings is not correct structure
		const preference: UserPreferences = {
			dnd: requestData.dnd,
			eventSettings: requestData.eventSettings
		};
		console.log(`User's current preferences:`, preference);
		mockDb.setUserPreferences(userId,preference);

		return res.status(200).json({ message: 'Preferences updated successfully' });
	});
};
