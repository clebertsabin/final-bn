import { Router } from "express";
import settingsController from "../controllers/settingsController";
import multer from "multer";
import { upload } from "../utils/upload"; // Assuming you have a utility for file uploads

const router = Router();

// Configure multer for file uploads
 // You can customize storage as needed

// Create Campus (with file upload)
router.post("/campus", upload.single("campusstamp"), settingsController.createCampus);

// Get All Campuses
router.get("/campus", settingsController.getAllCampuses);

// Get Single Campus
router.get("/campus/:campusID", settingsController.getSingleCampus);

// Update Campus
router.put("/campus/:campusID", settingsController.updateCampus);

// Delete Campus
router.delete("/campus/:campusID", settingsController.deleteCampus);

/* School Routes */

// Create School (with file upload)
router.post("/school", upload.single("schoolStamp"), settingsController.createSchool);

// Get All Schools
router.get("/school", settingsController.getAllSchools);
// Get Schools by Campus ID
router.get("/school/by-campus/:campusId", settingsController.getSchoolsByCampusId);
// Get Single School
router.get("/school/:schoolId", settingsController.getSingleSchool);

// Update School
router.put("/school/:schoolId", settingsController.updateSchool);

// Delete School
router.delete("/school/:schoolId", settingsController.deleteSchool);
/* Department Routes */

// Create Department (with file upload)
router.post("/department", upload.single("depStamp"), settingsController.createDepartment);
// Get Departments by School ID
router.get("/department/by-school/:schoolId", settingsController.getDepartmentsBySchoolId);
// Get All Departments
router.get("/department", settingsController.getAllDepartments);

// Get Single Department
router.get("/department/:depId", settingsController.getSingleDepartment);

// Update Department
router.put("/department/:depId", settingsController.updateDepartment);

// Delete Department
router.delete("/department/:depId", settingsController.deleteDepartment);
export default router;
