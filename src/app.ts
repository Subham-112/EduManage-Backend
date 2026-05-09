import Express from "express";
import cors from "cors";
import allRoutes from "./routes/index";
import { config } from "./config/config";
import { connectDB } from "./config/database";

const app = Express();

app.use(cors());
app.use(Express.json());

app.use("/api", allRoutes);

const startServer = async () => {
  try {
    if (config.mode === "dev") {
        require('dns').setServers(['8.8.8.8', '8.8.4.4']);
    }
    await connectDB();

    app.listen(config.port, () => {
      console.log(`✅ Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
  }
};

startServer();
