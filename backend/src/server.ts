import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./db/connectDB";

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
