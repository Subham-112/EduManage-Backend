import { Router } from 'express';
import { createStudent, loginStudent, logoutStudent } from './student.controller';
import { authenticateRole, authenticateToken, Role } from '../../middleware/authMiddleware';

const router = Router();

const userAccess = authenticateRole("student" as Role);

// Public routes
router.post('/', createStudent);
router.post("/login", loginStudent);

router.post("/logout", authenticateToken, userAccess, logoutStudent);

export default router;