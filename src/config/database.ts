import { config } from "./config";
import mongoose from "mongoose";

const dbConfig = {
  envMode: config.mode || "prod",
  dbName: config.db.dbName,
  dbUrl: config.db.url,
};

export const connectDB = async () => {
  console.log(
    `⏰ Attempting to connect to the ${dbConfig.dbName} database in ${dbConfig.envMode} mode...`,
  );

  try {
    // let dbUrl = `${dbConfig.dbUrl}/${dbConfig.dbName}?retryWrites=true&w=majority&appName=Cluster0`;
    let dbUrl = `${dbConfig.dbUrl}/${dbConfig.dbName}`;
    
    if (!dbConfig.dbUrl || !dbConfig.dbName) {
      console.error("❌ Database URL or name is not configured.");
      return;
    }

    await mongoose
      .connect(dbUrl, {
        family: 4,
        serverSelectionTimeoutMS: 30000,
      })
      .then(() => {
        console.log(
          `✅ Successfully connected to the ${dbConfig.dbName} database.`,
        );
      })
      .catch((error) => {
        console.error("❌ Error connecting to the database:", error);
      });
  } catch (error) {
    console.error("❌ Unexpected error while connecting to the database:", error);
  }
};
