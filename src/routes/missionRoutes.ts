import { Router } from "express";
import userController from "../controllers/userController";
import { authenticate } from "../middleware/AuthMiddleware";
import { upload } from "../utils/upload";

const router = Router();


router.post("/mission-request", upload.single("invitationLetter"), userController.createMissionRequest);
router.get("/mission-requests", userController.getAllMissionRequests);
router.get("/mission-request/:missionId", userController.getSingleMissionRequest);
router.put("/mission-request/:missionId", userController.updateMissionRequest);
router.delete("/mission-request/:missionId", userController.deleteMissionRequest);
export default router;
