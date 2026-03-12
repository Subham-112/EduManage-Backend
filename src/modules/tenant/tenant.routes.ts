import { Router } from "express";
import { authenticate, authorize, UserRole } from "../../middlewares/auth.middleware";
import { changePassword, createTenant, deleteTenant, getTenant, getTenantStats, listTenants, updateTenant } from "./tenant.controller";

const tenantRouter = Router();

const ownerAccess = [authenticate, authorize([UserRole.OWNER, UserRole.ADMIN])];

tenantRouter.post("/create", createTenant);
tenantRouter.post(
    "/:id/change-password",
    ...ownerAccess,
    changePassword
);

tenantRouter.get("/", listTenants);
tenantRouter.get("/:id", getTenant);
tenantRouter.get(
    "/:id/stats",
    ...ownerAccess,
    getTenantStats
);

tenantRouter.put(
    "/:id",
    ...ownerAccess,
    updateTenant
);

tenantRouter.delete(
    "/:id",
    ...ownerAccess,
    deleteTenant
);

export default tenantRouter;
