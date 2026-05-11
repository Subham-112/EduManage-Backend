import { Router } from "express";
import { createOwner, loginOwner } from "./owner.controller";
import {
  authenticateRole,
  authenticateToken,
} from "../../middleware/authMiddleware";

const router = Router();

const ownerAccess = [authenticateToken, authenticateRole("owner")];

router.post("/", createOwner);
router.post("/login", loginOwner);

router.post("/logout", ...ownerAccess, );

export default router;
