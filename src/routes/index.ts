import { Router } from "express";

import tenantRouter from "../modules/tenant/tenant.routes";
import ownerRoutes from "../modules/owner/owner.routes";
import studentRouters from "../modules/student/student.routes";

export const router = Router();

router.use("/tenants", tenantRouter);
router.use("/owners", ownerRoutes);
router.use("/students", studentRouters);