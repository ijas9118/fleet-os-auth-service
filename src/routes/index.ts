import { Router } from "express";

import authRoutes from "./auth.routes";
import driverRoutes from "./driver.routes";
import operationsManagerRoutes from "./operations-manager.routes";
import tenantRoutes from "./tenant.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tenants", tenantRoutes);
router.use("/users", userRoutes);
router.use("/operations-managers", operationsManagerRoutes);
router.use("/drivers", driverRoutes);

export default router;
