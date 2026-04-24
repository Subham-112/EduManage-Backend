import Express from "express";
import cors from "cors";
import allRoutes from "./routes/index";
import { config } from "./config/config";

const app = Express();

app.use(cors());
app.use(Express.json());

app.use("/api", allRoutes);

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
})