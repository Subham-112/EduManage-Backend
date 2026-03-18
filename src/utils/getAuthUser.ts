import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import ApiError from "./ApiError";

export const getAuthUser = (req: AuthenticatedRequest, roles: string[]) => {
    if (!req || !roles) {
        throw new ApiError(400, "Request and roles are required to get authenticated user");
    }

    if (!req.user || !req.user.id || !roles.includes(req.user.role)) {
        throw new ApiError(401, `Authenticated user with role '${roles}' not found in request`);
    }
    return req.user;
}