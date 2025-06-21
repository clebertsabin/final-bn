import { Router } from "express";
import userController from "../controllers/userController";
import { authenticate} from "../middleware/AuthMiddleware";
import { upload } from "../utils/upload";

const router = Router();

router.post("/signup", userController.createUser);
router.post("/login", userController.login);
router.get("/",
    // authenticate,
    // checkType("system admin"),
    userController.getAllUsers);
router.get("/:id",
    //  authenticate,
    userController.getSingleUser);
router.put("/:id",
    //  authenticate,
    userController.updateSingleUser);
router.delete("/:id",
    //  authenticate,
    userController.deleteUser);
router.patch("/update/:id", userController.updateUser)
//authenticatte on mission  

//authentication on leave
router.post("/leave-request", userController.createLeaveRequest);
router.get("/leave-requests", userController.getAllLeaveRequests);
router.get("/leave-request/:leaveId", userController.getSingleLeaveRequest);
router.put("/leave-request/:leaveId", userController.updateLeaveRequest);
router.delete("/leave-request/:leaveId", userController.deleteLeaveRequest);

// authentictaion on change mission status
router.patch("/mission-request/:missionId/status", userController.changeMissionStatus);
// authentication for change leave status
router.patch("/leave-request/:leaveId/status", userController.changeLeaveStatus);

//generate mission pdf
// router.post("/mission-request/:missionId/generate-pdf", userController.generateMissionPdf);
router.get("/mission-request/:missionId/pdf", userController.generateMissionPdf);


export default router;


