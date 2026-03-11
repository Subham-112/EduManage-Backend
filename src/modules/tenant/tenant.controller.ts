import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiError from "../../utils/ApiError";
import { TenantService } from "./tenant.service";

export const createTenant = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      phone,
      email,
      password,
      image,
      branchDetails,
      numberOfStudents,
      numberOfTeachers,
    } = req.body;

    if (!name || typeof name !== "string") {
      throw new ApiError(400, `Invalid name (${name})`);
    }

    if (!phone) {
      throw new ApiError(400, "Phone number is required");
    } else if (phone.trim().length < 10) {
      throw new ApiError(
        400,
        `Phone number must be at least 10 digits long (received: ${phone})`,
      );
    }

    if (!password) {
      throw new ApiError(400, "Password is required");
    } else if (password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters long");
    }

    if (branchDetails) {
      const {
        branchName,
        city,
        state,
        country,
        postalCode,
        geoLocation,
      } = branchDetails;

      if (!branchName || typeof branchName !== "string") {
        throw new ApiError(400, `Invalid branch name (${branchName})`);
      }

      if (!city || typeof city !== "string") {
        throw new ApiError(400, `Invalid branch city (${city})`);
      }

      if (!state || typeof state !== "string") {
        throw new ApiError(400, `Invalid branch state (${state})`);
      }

      if (!country || typeof country !== "string") {
        throw new ApiError(400, `Invalid branch country (${country})`);
      }

      if (!postalCode || typeof postalCode !== "string") {
        throw new ApiError(400, `Invalid branch postal code (${postalCode})`);
      }

      if (geoLocation) {
        const { type, coordinates } = geoLocation;
        if (type !== "Point") {
          throw new ApiError(400, `Invalid geoLocation type (${type})`);
        }
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
          throw new ApiError(
            400,
            `GeoLocation coordinates must be an array of [longitude, latitude] (received: ${JSON.stringify(
              coordinates,
            )})`,
          );
        } else if (typeof coordinates[0] !== "number" || typeof coordinates[1] !== "number") {
          throw new ApiError(
            400,
            `GeoLocation coordinates must be numbers (received: ${JSON.stringify(
              coordinates,
            )})`,
          );
        } else if (coordinates[0] < -180 || coordinates[0] > 180) {
          throw new ApiError(
            400,
            `Longitude must be between -180 and 180 (received: ${coordinates[0]})`,
          );
        } else if (coordinates[1] < -90 || coordinates[1] > 90) {
          throw new ApiError(
            400,
            `Latitude must be between -90 and 90 (received: ${coordinates[1]})`,
          );
        } else {
          // Convert coordinates to numbers if they are strings
          geoLocation.coordinates = coordinates.map((coord: any) => {
            if (typeof coord === "string") {
              const num = parseFloat(coord);
              if (isNaN(num)) {
                throw new ApiError(
                  400,
                  `GeoLocation coordinates must be valid numbers (received: ${JSON.stringify(
                    coordinates,
                  )})`,
                );
              }
              return num;
            }
            return coord;
          });
        }
      }
    }

    const response = await TenantService.createTenant({
      name,
      tenantPhone: phone,
      email,
      password,
      image,
      branchDetails,
      numberOfStudents,
      numberOfTeachers,
    });

    return res.status(response.statusCode).json(response);
  },
);

export const listTenants = asyncHandler(
  async (req: Request, res: Response) => {
    const response = await TenantService.listTenants(req.query);
    return res.status(response.statusCode).json(response);
  },
);

export const getTenant = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = req.params.id;
    if (!tenantId) {
      throw new ApiError(400, "Tenant ID is required");
    }
    const response = await TenantService.getTenant(String(tenantId));
    return res.status(response.statusCode).json(response);
  },
);

export const updateTenant = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = req.params.id;
    if (!tenantId) {
      throw new ApiError(400, "Tenant ID is required");
    }

    const response = await TenantService.updateTenant(String(tenantId), req.body);
    return res.status(response.statusCode).json(response);
  },
);

export const deleteTenant = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = req.params.id;
    if (!tenantId) {
      throw new ApiError(400, "Tenant ID is required");
    }
    const response = await TenantService.deleteTenant(String(tenantId));
    return res.status(response.statusCode).json(response);
  },
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = req.params.id;
    const { oldPassword, newPassword } = req.body;
    if (!tenantId) {
      throw new ApiError(400, "Tenant ID is required");
    }
    if (!oldPassword || !newPassword) {
      throw new ApiError(400, "Both old and new passwords are required");
    }
    if (newPassword.length < 6) {
      throw new ApiError(400, "New password must be at least 6 characters long");
    }
    const response = await TenantService.changePassword(
      String(tenantId),
      {
        oldPassword,
        newPassword
      }
    );

    return res.status(response.statusCode).json(response);
  },
);

export const getTenantStats = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = req.params.id;
    if (!tenantId) {
      throw new ApiError(400, "Tenant ID is required");
    }
    const response = await TenantService.getTenantStats(String(tenantId));
    return res.status(response.statusCode).json(response);
  },
);
