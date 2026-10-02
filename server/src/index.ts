import "dotenv/config";
import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 4000;
createApp().listen(PORT, () => console.log(`API en http://localhost:${PORT}`));