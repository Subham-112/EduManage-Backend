import { Router } from "express";
import studentRoutes from "../modules/students/student.route";

const router = Router();

router.use("/students", studentRoutes);

export default router;