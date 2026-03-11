import { Router } from "express";

import tenantRouter from "../modules/tenant/tenant.routes";
import ownerRoutes from "../modules/owner/owner.routes";

export const router = Router();

router.use("/tenants", tenantRouter);
router.use("/owners", ownerRoutes);