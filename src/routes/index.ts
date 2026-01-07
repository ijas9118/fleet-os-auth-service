import { Router } from "express";

import authRoutes from "./auth.routes";
import tenantRoutes from "./tenant.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tenants", tenantRoutes);
router.use("/users", userRoutes);

export default router;
