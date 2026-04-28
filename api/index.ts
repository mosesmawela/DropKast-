import { createApiApp } from "./_app.js";

// Single Express instance reused across warm invocations.
const app = createApiApp();

export default app;
