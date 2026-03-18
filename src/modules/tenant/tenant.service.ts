import Tenant, { ITenant } from "../../models/tenant.model";
import mongoose from "mongoose";
import Branch from "../../models/branch.model";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import { hashPassword, comparePasswords } from "../../utils/password.util";
import { TenantStatus, BranchStatus } from "../../config/enums";
import { findOwner } from "../owner/owner.service";
import { UserRole } from "../../middlewares/auth.middleware";

export const TenantService = {
  async createTenant(payload: {
    ownerId: string;
    name: string;
    phone: string;
    email?: string;
    password: string;
    image?: {
      url: string;
      key?: string;
      name?: string;
      size?: number;
      mimetype?: string;
      originalname?: string;
    };
    numberOfStudents?: number;
    numberOfTeachers?: number;
    createdByUser?: {
      id: string;
      role: string;
    };
    branchDetails?: {
      branchName: string;
      phone?: string;
      email?: string;
      area?: string;
      city: string;
      state: string;
      country: string;
      landmark?: string;
      postalCode: string;
      geoLocation?: {
        type?: string;
        coordinates?: any[];
      };
      numberOfStudents?: number;
      numberOfTeachers?: number;
    };
  }) {
    const owner = await findOwner({ _id: payload.ownerId });
    if (!owner) {
      throw new ApiError(404, "Owner not found")
    };

    const existingTenant = await Tenant.findOne({
      $or: [
        { phone: payload.phone },
        ...(payload.email ? [{ email: payload.email }] : []),
      ],
    }).lean();

    if (existingTenant) {
      throw new ApiError(
        409,
        "Tenant with this phone or email already exists",
        null,
        ["Duplicate phone or email"],
      );
    }

    // Create new tenant with branch IDs
    const tenantData: Partial<ITenant> = {
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      images: payload.image ? [payload.image] : [],
      branches: [],
      numberOfStudents: payload.numberOfStudents || 0,
      numberOfTeachers: payload.numberOfTeachers || 0,
      status: TenantStatus.REVIEW,
      owner: payload.ownerId as unknown as mongoose.Schema.Types.ObjectId,
      createdByUser: {
        id: payload.createdByUser?.id as unknown as mongoose.Schema.Types.ObjectId,
        role: payload.createdByUser?.role || UserRole.OWNER,
      },
    };
    const savedTenant = await Tenant.create(tenantData);

    // Create branch if branch details are provided
    let branchIds: mongoose.Schema.Types.ObjectId[] = [];
    if (payload.branchDetails) {
      // Prepare geoLocation if provided
      let geoLocation = undefined;
      if (
        payload.branchDetails.geoLocation &&
        payload.branchDetails.geoLocation.coordinates
      ) {
        const coords = payload.branchDetails.geoLocation.coordinates;
        geoLocation = {
          type: "Point",
          coordinates: [
            typeof coords[0] === "string" ? parseFloat(coords[0]) : coords[0],
            typeof coords[1] === "string" ? parseFloat(coords[1]) : coords[1],
          ],
        };
      }

      const branchData = {
        branchName: payload.branchDetails.branchName,
        phone: payload.branchDetails.phone,
        email: payload.branchDetails.email,
        area: payload.branchDetails.area,
        city: payload.branchDetails.city,
        state: payload.branchDetails.state,
        country: payload.branchDetails.country,
        landmark: payload.branchDetails.landmark,
        postalCode: payload.branchDetails.postalCode,
        geoLocation,
        numberOfStudents: payload.branchDetails.numberOfStudents || 0,
        numberOfTeachers: payload.branchDetails.numberOfTeachers || 0,
        status: BranchStatus.ACTIVE,
        tenant: savedTenant._id as unknown as mongoose.Schema.Types.ObjectId,
      };
      const savedBranch = await Branch.create(branchData);
      branchIds.push(savedBranch._id as unknown as mongoose.Schema.Types.ObjectId);
    }

    // Update tenant with branch IDs
    if (branchIds.length > 0) {
      savedTenant.branches = branchIds;
      await savedTenant.save();
    }

    // Update owner's tenants array
    if (owner && Array.isArray(owner.tenants)) {
      owner.tenants.push(savedTenant._id as unknown as mongoose.Schema.Types.ObjectId);
      await owner.save();
    }

    // Return tenant without password, with populated branches
    const populatedTenant = await Tenant.findById(savedTenant._id)
      .populate(
        "branches",
        "branchName city state status numberOfStudents numberOfTeachers",
      )
      .lean();

    return new ApiResponse(
      201,
      populatedTenant,
      "Tenant registered successfully with branch",
    );
  },

  async getTenant(tenantId: string) {
    try {
      const tenant = await Tenant.findById(tenantId)
        .populate(
          "branches",
          "branchName city state status numberOfStudents numberOfTeachers",
        )
        .lean();

      if (!tenant) {
        throw new ApiError(404, "Tenant not found", null, [
          "Tenant with provided ID does not exist",
        ]);
      }

      return new ApiResponse(200, tenant, "Tenant retrieved successfully");
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to fetch tenant", null, [
        (error as Error).message,
      ]);
    }
  },

  /**
   * Get all tenants with pagination and filtering
   */
  async listTenants(payload: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const page = payload.page || 1;
    const limit = payload.limit || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};

    if (payload.status) {
      filter.status = payload.status;
    }

    if (payload.search) {
      filter.$or = [
        { name: { $regex: payload.search, $options: "i" } },
        { phone: { $regex: payload.search, $options: "i" } },
        { email: { $regex: payload.search, $options: "i" } },
      ];
    }

    // Get total count
    const total = await Tenant.countDocuments(filter).lean();

    // Get paginated data
    const tenants = await Tenant.find(filter)
      .select("-password")
      .populate(
        "branches",
        "branchName city state numberOfStudents numberOfTeachers",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return new ApiResponse(
      200,
      {
        tenants,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      "Tenants retrieved successfully",
    );
  },

  /**
   * Update tenant details
   */
  async updateTenant(
    tenantId: string,
    payload: {
      name?: string;
      email?: string;
      phone?: string;
    },
  ) {
    if (payload.email || payload.phone) {
      const existingTenant = await Tenant.findOne({
        _id: { $ne: tenantId },
        $or: [
          ...(payload.phone
            ? [{ phone: payload.phone }]
            : []),
          ...(payload.email ? [{ email: payload.email }] : []),
        ],
      }).lean();

      if (existingTenant) {
        throw new ApiError(409, "Phone or email already in use", null, [
          "Duplicate phone or email",
        ]);
      }
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { $set: payload },
      { new: true, runValidators: true },
    );

    if (!updatedTenant) {
      throw new ApiError(404, "Tenant not found", null, [
        "Tenant with provided ID does not exist",
      ]);
    }

    return new ApiResponse(200, updatedTenant, "Tenant updated successfully");
  },

  /**
   * Change tenant password
   */
  async changePassword(
    tenantId: string,
    payload: {
      oldPassword: string;
      newPassword: string;
    },
  ) {
    try {
      const tenant = await Tenant.findById(tenantId).select("+password").lean();

      if (!tenant) {
        throw new ApiError(404, "Tenant not found", null, [
          "Tenant with provided ID does not exist",
        ]);
      };

      // Hash new password
      const hashedNewPassword = await hashPassword(payload.newPassword);

      // Update password
      await Tenant.findByIdAndUpdate(tenantId, {
        password: hashedNewPassword,
      });

      return new ApiResponse(
        200,
        { message: "Password changed successfully" },
        "Password changed successfully",
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to change password", null, [
        (error as Error).message,
      ]);
    }
  },

  async deleteTenant(tenantId: string) {
    const deletedTenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { status: TenantStatus.DELETED },
      { new: true }
    );

    if (!deletedTenant) {
      throw new ApiError(404, "Tenant not found", null, [
        "Tenant with provided ID does not exist",
      ]);
    }

    return new ApiResponse(200, deletedTenant, "Tenant deleted successfully");
  },

  async getTenantStats(tenantId: string) {
    const tenant = await Tenant.findById(tenantId)
      .select("branches numberOfStudents numberOfTeachers status")
      .lean();

    if (!tenant) {
      throw new ApiError(404, "Tenant not found", null, [
        "Tenant with provided ID does not exist",
      ]);
    }

    const stats = {
      totalBranches: tenant.branches.length,
      totalStudents: tenant.numberOfStudents,
      totalTeachers: tenant.numberOfTeachers,
      status: tenant.status,
    };

    return new ApiResponse(200, stats, "Tenant stats retrieved successfully");
  },
};
