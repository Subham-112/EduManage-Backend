import Tenant, { ITenant } from "../../models/tenant.model";
import Branch from "../../models/branch.model";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import { hashPassword, comparePasswords } from "../../utils/password.util";
import { TenantStatus, BranchStatus } from "../../config/enums";

export const TenantService = {
  async createTenant(payload: {
    name: string;
    tenantPhone: string;
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
    const existingTenant = await Tenant.findOne({
      $or: [
        { tenantPhone: payload.tenantPhone },
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

    // Hash the password
    const hashedPassword = await hashPassword(payload.password);

    // Create new tenant with branch IDs
    const savedTenant = await Tenant.create({
      name: payload.name,
      tenantPhone: payload.tenantPhone,
      email: payload.email,
      password: hashedPassword,
      image: payload.image,
      branches: [],
      numberOfStudents: payload.numberOfStudents || 0,
      numberOfTeachers: payload.numberOfTeachers || 0,
      status: TenantStatus.REVIEW,
    });

    // Create branch if branch details are provided
    let branchIds: any[] = [];
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

      const savedBranch = await Branch.create({
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
      });

      branchIds.push(savedBranch._id);
    }

    // Update branch with tenant ID
    if (branchIds.length > 0) {
      await Branch.updateMany(
        { _id: { $in: branchIds } },
        { $set: { tenant: savedTenant._id } },
      );
      // Update tenant with branch IDs
      savedTenant.branches = branchIds;
      await savedTenant.save();
    }

    // Return tenant without password, with populated branches
    const populatedTenant = await Tenant.findById(savedTenant._id)
      .select("-password")
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
        .select("-password")
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
        { tenantPhone: { $regex: payload.search, $options: "i" } },
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
      tenantPhone?: string;
    },
  ) {
    if (payload.email || payload.tenantPhone) {
      const existingTenant = await Tenant.findOne({
        _id: { $ne: tenantId },
        $or: [
          ...(payload.tenantPhone
            ? [{ tenantPhone: payload.tenantPhone }]
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
    ).select("-password");

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
      }

      // Verify old password
      const isPasswordMatch = await comparePasswords(
        payload.oldPassword,
        tenant.password,
      );

      if (!isPasswordMatch) {
        throw new ApiError(401, "Invalid current password", null, [
          "Current password does not match",
        ]);
      }

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
    const deletedTenant = await Tenant.findByIdAndDelete(tenantId);

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
