import { Router } from "express";
import {
  changePassword,
  createStudent,
  deleteStudent,
  getActiveStudents,
  getAllStudents,
  getStudentById,
  loginStudent,
  updateStudent,
  updateAadhar
} from "./student.controller";
import { upload } from "../../middlewares/multer.middlewaare";
import {
  authenticate,
  authorize,
  UserRole,
} from "../../middlewares/auth.middleware";

const router = Router();

const studentAccess = [authenticate, authorize([UserRole.STUDENT, UserRole.ADMIN])];
const adminAccess = [authenticate, authorize([UserRole.ADMIN, UserRole.TEACHER, UserRole.OWNER])];
const anyAuth = [
  authenticate,
  authorize([UserRole.ADMIN, UserRole.STUDENT, UserRole.TEACHER]),
];

router.post("/create", upload.single("avatar"), createStudent);
router.post("/login", loginStudent);
router.post("/change-password", ...studentAccess, changePassword);

router.get("/", ...adminAccess, getAllStudents);
router.get("/:studentId", ...adminAccess, getStudentById);
router.get("/active", ...anyAuth, getActiveStudents);

router.put("/:studentId", upload.single("avatar"), ...studentAccess, updateStudent);
router.delete("/:studentId", ...adminAccess, deleteStudent);

router.put("/:studentId/aadhar", upload.single("aadharImage"), ...studentAccess, updateAadhar);

export default router;
