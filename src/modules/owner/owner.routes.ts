import { Router } from "express";
import {
  changePassword,
  createOwner,
  getActiveOwners,
  getAllOwners,
  getOwnerById,
  loginOwner,
} from "./owner.controller";
import { upload } from "../../middlewares/multer.middlewaare";
import {
  authenticate,
  authorize,
  UserRole,
} from "../../middlewares/auth.middleware";

const router = Router();

const ownerAccess = [authenticate, authorize([UserRole.OWNER, UserRole.ADMIN])];
const adminAccess = [authenticate, authorize([UserRole.ADMIN])];
const anyAuth = [authenticate, authorize([UserRole.ADMIN, UserRole.STUDENT, UserRole.TEACHER])];

router.post("/create", upload.single("avatar"), createOwner);
router.post("/login", loginOwner);
router.post("/change-password", ...ownerAccess, changePassword);

router.get("/", ...adminAccess, getAllOwners);
router.get("/:ownerId", ...adminAccess, getOwnerById);
router.get("/active", ...anyAuth, getActiveOwners);

export default router;
