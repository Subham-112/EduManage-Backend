import mongoose from "mongoose";
import { config } from "./config";
import { logColors, logger } from "../utils/logger.util";

const isSrvUrl = config.db.isSrv;
const url = isSrvUrl ? `${config.db.url}/${config.db.name}` : `${config.db.url}/${config.db.name}?ssl=true&replicaSet=atlas-i0izia-shard-0&authSource=admin&appName=Cluster0`

const connectDB = async () => {
    try {
        if (!url) {
            throw new Error("❌ Missing DB_URL or DB_NAME in configuration.")
        }
        logger.info(`Connection URL: ${logColors.warning(url)}`)

        await mongoose.connect(url, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
            .then(() => {
                logger.info("☑️ Connected to DB successfully")
            })
    } catch (err) {
        logger.error("Error while connecting DB", err)
        throw err;
    }
}

export default connectDB;