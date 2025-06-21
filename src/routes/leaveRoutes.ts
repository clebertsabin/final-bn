import { Router } from "express";
import userController from "../controllers/userController";
import { authenticate } from "../middleware/AuthMiddleware";

const router = Router();


//authentication on leave
router.post("/leave-request", userController.createLeaveRequest);
router.get("/leave-requests", userController.getAllLeaveRequests);
router.get("/leave-request/:leaveId", userController.getSingleLeaveRequest);
router.put("/leave-request/:leaveId", userController.updateLeaveRequest);
router.delete("/leave-request/:leaveId", userController.deleteLeaveRequest);

export default router;


