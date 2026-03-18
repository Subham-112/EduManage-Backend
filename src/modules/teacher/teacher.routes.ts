import { Router } from "express";
import {
  createTeacher,
  loginTeacher,
  changePassword,
  deleteTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
} from "./teacher.controller";
import { upload } from "../../middlewares/multer.middlewaare";
import {
  authenticate,
  authorize,
  UserRole,
} from "../../middlewares/auth.middleware";

const router = Router();

const teacherAccess = [authenticate, authorize([UserRole.TEACHER, UserRole.ADMIN])];
const adminAccess = [authenticate, authorize([UserRole.ADMIN, UserRole.OWNER])];
const anyAuth = [
  authenticate,
  authorize([UserRole.ADMIN, UserRole.TEACHER, UserRole.OWNER]),
];

router.post("/create", upload.single("avatar"), createTeacher);
router.post("/login", loginTeacher);
router.post("/change-password", ...teacherAccess, changePassword);

router.get("/", ...adminAccess, getAllTeachers);
router.get("/:teacherId", ...adminAccess, getTeacherById);

router.put("/:teacherId", upload.single("avatar"), ...teacherAccess, updateTeacher);
router.delete("/:teacherId", ...adminAccess, deleteTeacher);

export default router;
