import express from 'express';
import { eventsControllerFactory } from './controllers/events.controller';
import { preferencesControllerFactory } from './controllers/preferences.controller';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
eventsControllerFactory(app);
preferencesControllerFactory(app);

export { app }; // Export for testing

const main = () => {
  const port = Number.parseFloat(process.env.PORT ?? '3000');
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

// Only start server if this file is run directly
if (require.main === module) {
  main();
}