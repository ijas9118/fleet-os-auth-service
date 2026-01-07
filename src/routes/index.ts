import { Router } from "express";

import authRoutes from "./auth.routes";
import tenantRoutes from "./tenant.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tenants", tenantRoutes);

export default router;
