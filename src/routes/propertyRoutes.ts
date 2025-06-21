import { Router } from 'express';
import { propertyController } from '../controllers/propertyController';
import upload from "../middleware/multer";

const router = Router();

router.post("/create/:id",upload.array('pictures'), propertyController.createProperty)
router.get("/", propertyController.getAllProperties)
router.get("/all", propertyController.getAdminProperties)
router.get("/:id", propertyController.getSingleProperty)
router.put("/update/:id", propertyController.updateProperty)
router.put("/admin-update/:id", propertyController.adminUpdateProperty)
router.delete("/:id", propertyController.deleteProperty)
router.get("/my-listings/:id", propertyController.getHostProperties)


export default router