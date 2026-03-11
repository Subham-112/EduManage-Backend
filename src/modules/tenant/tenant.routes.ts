import { Router } from "express";
import { authenticate, authorize, UserRole, optionalAuth } from "../../middlewares/auth.middleware";
import { changePassword, createTenant, deleteTenant, getTenant, getTenantStats, listTenants, updateTenant } from "./tenant.controller";

const tenantRouter = Router();

tenantRouter.post("/create", createTenant);
tenantRouter.post(
    "/:id/change-password",
    authenticate,
    authorize([UserRole.TENANT, UserRole.ADMIN]),
    changePassword
);

tenantRouter.get("/", listTenants);
tenantRouter.get("/:id", getTenant);
tenantRouter.get(
    "/:id/stats",
    authenticate,
    authorize([UserRole.TENANT, UserRole.ADMIN]),
    getTenantStats
);

tenantRouter.put(
    "/:id",
    authenticate,
    authorize([UserRole.TENANT, UserRole.ADMIN]),
    updateTenant
);

tenantRouter.delete(
    "/:id",
    authenticate,
    authorize(UserRole.ADMIN),
    deleteTenant
);

export default tenantRouter;
