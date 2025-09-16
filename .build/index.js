"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const events_controller_1 = require("./controllers/events.controller");
const preferences_controller_1 = require("./controllers/preferences.controller");
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
(0, events_controller_1.eventsControllerFactory)(app);
(0, preferences_controller_1.preferencesControllerFactory)(app);
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
