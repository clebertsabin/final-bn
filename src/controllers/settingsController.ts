import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../db/db";
import { CampusTable } from "../models/CampusTable";
import path from "path";

class settingsController {
    // Create Campus
    static async createCampus(req: Request, res: Response): Promise<void> {
        try {
            const { campusName, location, website } = req.body;
            // campusstamp will be handled as an uploaded file

            if (!campusName) {
                res.status(400).json({ message: "campusName is required" });
                return;
            }
            if (!location) {
                res.status(400).json({ message: "location is required" });
                return;
            }

            // Check if file was uploaded
            let campusstamp: string | undefined;
            const backendUrl = process.env.back_end_url || "http://localhost:5000";
            if (req.file && req.file.filename) {
                campusstamp = `${backendUrl}/${path.join('uploads', req.file.filename).replace(/\\/g, '/')}`;
            } else if (req.body.campusstamp) {
                campusstamp = req.body.campusstamp; // fallback if sent as a link
            } else {
                res.status(400).json({ message: "campusstamp (image) is required" });
                return;
            }

            const campusRepository = AppDataSource.getRepository(CampusTable);
            // Check for duplicate campusName
            const existingCampus = await campusRepository.findOne({ where: { campusName, location, website } });
            if (existingCampus) {
                res.status(409).json({ message: "Campus  already exists" });
                return;
            }
            const campus = campusRepository.create({
                campusName,
                location,
                website,
                campusstamp,
            });

            await campusRepository.save(campus);
            res.status(201).json({ message: "Campus created successfully", data: campus });
        } catch (error: any) {
            res.status(500).json({ message: "Error creating campus", error: error.message });
        }
    }

    // Get All Campuses
    static async getAllCampuses(req: Request, res: Response): Promise<void> {
        try {
            const campusRepository = AppDataSource.getRepository(CampusTable);
            const campuses = await campusRepository.find();
            res.status(200).json({ message: "All campuses", data: campuses });
        } catch (error: any) {
            res.status(500).json({ message: "Failed to fetch campuses", error: error.message });
        }
    }

    // Get Single Campus
    static async getSingleCampus(req: Request, res: Response): Promise<void> {
        try {
            const { campusID } = req.params;
            const campusRepository = AppDataSource.getRepository(CampusTable);

            const campus = await campusRepository.findOne({ where: { campusID } });

            if (!campus) {
                res.status(404).json({ message: "Campus not found" });
                return;
            }
            res.status(200).json({ message: "Campus found", data: campus });
        } catch (error: any) {
            res.status(500).json({ message: "Error fetching campus", error: error.message });
        }
    }

    // Update Campus
    static async updateCampus(req: Request, res: Response): Promise<void> {
        try {
            const { campusID } = req.params;
            const { campusName, location, website, campusstamp } = req.body;

            const campusRepository = AppDataSource.getRepository(CampusTable);
            const campus = await campusRepository.findOne({ where: { campusID } });

            if (!campus) {
                res.status(404).json({ message: "Campus not found" });
                return;
            }

            if (campusName) campus.campusName = campusName;
            if (location) campus.location = location;
            if (website) campus.website = website;
            if (campusstamp) campus.campusstamp = campusstamp;

            campus.updatedAt = new Date();

            await campusRepository.save(campus);
            res.status(200).json({ message: "Campus updated successfully", data: campus });
        } catch (error: any) {
            res.status(500).json({ message: "Error updating campus", error: error.message });
        }
    }

    // Delete Campus
    static async deleteCampus(req: Request, res: Response): Promise<void> {
        try {
            const { campusID } = req.params;
            const campusRepository = AppDataSource.getRepository(CampusTable);

            const campus = await campusRepository.findOne({ where: { campusID } });

            if (!campus) {
                res.status(404).json({ message: "Campus not found" });
                return;
            }

            await campusRepository.remove(campus);
            res.status(200).json({ message: "Campus deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ message: "Error deleting campus", error: error.message });
        }
    }

    // Create School
    static async createSchool(req: Request, res: Response): Promise<void> {
        try {
            const { campusId, schoolName, location, website } = req.body;
            // schoolStamp will be handled as an uploaded file

            if (!campusId) {
                res.status(400).json({ message: "campusId is required" });
                return;
            }
            if (!schoolName) {
                res.status(400).json({ message: "schoolName is required" });
                return;
            }
            if (!location) {
                res.status(400).json({ message: "location is required" });
                return;
            }

            // Check if file was uploaded
            let schoolStamp: string | undefined;
            const backendUrl = process.env.back_end_url || "http://localhost:5000";
            if (req.file && req.file.filename) {
                schoolStamp = `${backendUrl}/${path.join('uploads', req.file.filename).replace(/\\/g, '/')}`;
            } else if (req.body.schoolStamp) {
                schoolStamp = req.body.schoolStamp; // fallback if sent as a link
            } else {
                res.status(400).json({ message: "schoolStamp (image) is required" });
                return;
            }

            const schoolRepository = AppDataSource.getRepository("school_table");
            // Check for duplicate school
            const existingSchool = await schoolRepository.findOne({ where: { campusId, schoolName, location } });
            if (existingSchool) {
                res.status(409).json({ message: "School already exists" });
                return;
            }

            const school = schoolRepository.create({
                campusId,
                schoolName,
                location,
                website,
                schoolStamp,
            });

            await schoolRepository.save(school);
            res.status(201).json({ message: "School created successfully", data: school });
        } catch (error: any) {
            res.status(500).json({ message: "Error creating school", error: error.message });
        }
    }

    // Get All Schools
    static async getAllSchools(req: Request, res: Response): Promise<void> {
        try {
            const schoolRepository = AppDataSource.getRepository("school_table");
            const schools = await schoolRepository.find();
            res.status(200).json({ message: "All schools", data: schools });
        } catch (error: any) {
            res.status(500).json({ message: "Failed to fetch schools", error: error.message });
        }
    }
    // Get Schools by Campus ID
    static async getSchoolsByCampusId(req: Request, res: Response): Promise<void> {
        try {
            const { campusId } = req.params;
            const schoolRepository = AppDataSource.getRepository("school_table");
            const schools = await schoolRepository.find({ where: { campusId } });
            res.status(200).json({ message: "Schools for campus", data: schools });
        } catch (error: any) {
            res.status(500).json({ message: "Failed to fetch schools by campusId", error: error.message });
        }
    }
    // Get Single School
    static async getSingleSchool(req: Request, res: Response): Promise<void> {
        try {
            const { schoolId } = req.params;
            const schoolRepository = AppDataSource.getRepository("school_table");

            const school = await schoolRepository.findOne({ where: { schoolId } });

            if (!school) {
                res.status(404).json({ message: "School not found" });
                return;
            }
            res.status(200).json({ message: "School found", data: school });
        } catch (error: any) {
            res.status(500).json({ message: "Error fetching school", error: error.message });
        }
    }

    // Update School
    static async updateSchool(req: Request, res: Response): Promise<void> {
        try {
            const { schoolId } = req.params;
            const { campusId, schoolName, location, website, schoolStamp } = req.body;

            const schoolRepository = AppDataSource.getRepository("school_table");
            const school = await schoolRepository.findOne({ where: { schoolId } });

            if (!school) {
                res.status(404).json({ message: "School not found" });
                return;
            }

            if (campusId) school.campusId = campusId;
            if (schoolName) school.schoolName = schoolName;
            if (location) school.location = location;
            if (website) school.website = website;
            if (schoolStamp) school.schoolStamp = schoolStamp;

            school.updatedAt = new Date();

            await schoolRepository.save(school);
            res.status(200).json({ message: "School updated successfully", data: school });
        } catch (error: any) {
            res.status(500).json({ message: "Error updating school", error: error.message });
        }
    }

    // Delete School
    static async deleteSchool(req: Request, res: Response): Promise<void> {
        try {
            const { schoolId } = req.params;
            const schoolRepository = AppDataSource.getRepository("school_table");

            const school = await schoolRepository.findOne({ where: { schoolId } });

            if (!school) {
                res.status(404).json({ message: "School not found" });
                return;
            }

            await schoolRepository.remove(school);
            res.status(200).json({ message: "School deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ message: "Error deleting school", error: error.message });
        }
    }

    // Create Department
    static async createDepartment(req: Request, res: Response): Promise<void> {
        try {
            const { schoolId, depName, location, website } = req.body;

            if (!schoolId) {
                res.status(400).json({ message: "schoolId is required" });
                return;
            }
            if (!depName) {
                res.status(400).json({ message: "depName is required" });
                return;
            }

            let depStamp: string | undefined;
            const backendUrl = process.env.back_end_url || "http://localhost:5000";
            if (req.file && req.file.filename) {
                depStamp = `${backendUrl}/${path.join('uploads', req.file.filename).replace(/\\/g, '/')}`;
            } else if (req.body.depStamp) {
                depStamp = req.body.depStamp;
            }

            const depRepository = AppDataSource.getRepository("dep_table");
            const existingDep = await depRepository.findOne({ where: { schoolId, depName } });
            if (existingDep) {
                res.status(409).json({ message: "Department already exists" });
                return;
            }

            const department = depRepository.create({
                schoolId,
                depName,
                location,
                website,
                depStamp,
            });

            await depRepository.save(department);
            res.status(201).json({ message: "Department created successfully", data: department });
        } catch (error: any) {
            res.status(500).json({ message: "Error creating department", error: error.message });
        }
    }
    // Get All Departments by School ID
    static async getDepartmentsBySchoolId(req: Request, res: Response): Promise<void> {
        try {
            const { schoolId } = req.params;
            const depRepository = AppDataSource.getRepository("dep_table");
            const departments = await depRepository.find({ where: { schoolId } });
            res.status(200).json({ message: "Departments for school", data: departments });
        } catch (error: any) {
            res.status(500).json({ message: "Failed to fetch departments by schoolId", error: error.message });
        }
    }
    // Get All Departments
    static async getAllDepartments(req: Request, res: Response): Promise<void> {
        try {
            const depRepository = AppDataSource.getRepository("dep_table");
            const departments = await depRepository.find();
            res.status(200).json({ message: "All departments", data: departments });
        } catch (error: any) {
            res.status(500).json({ message: "Failed to fetch departments", error: error.message });
        }
    }

    // Get Single Department
    static async getSingleDepartment(req: Request, res: Response): Promise<void> {
        try {
            const { depId } = req.params;
            const depRepository = AppDataSource.getRepository("dep_table");

            const department = await depRepository.findOne({ where: { depId } });

            if (!department) {
                res.status(404).json({ message: "Department not found" });
                return;
            }
            res.status(200).json({ message: "Department found", data: department });
        } catch (error: any) {
            res.status(500).json({ message: "Error fetching department", error: error.message });
        }
    }

    // Update Department
    static async updateDepartment(req: Request, res: Response): Promise<void> {
        try {
            const { depId } = req.params;
            const { schoolId, depName, location, website, depStamp } = req.body;

            const depRepository = AppDataSource.getRepository("dep_table");
            const department = await depRepository.findOne({ where: { depId } });

            if (!department) {
                res.status(404).json({ message: "Department not found" });
                return;
            }

            if (schoolId) department.schoolId = schoolId;
            if (depName) department.depName = depName;
            if (location) department.location = location;
            if (website) department.website = website;
            if (depStamp) department.depStamp = depStamp;

            department.updatedAt = new Date();

            await depRepository.save(department);
            res.status(200).json({ message: "Department updated successfully", data: department });
        } catch (error: any) {
            res.status(500).json({ message: "Error updating department", error: error.message });
        }
    }

    // Delete Department
    static async deleteDepartment(req: Request, res: Response): Promise<void> {
        try {
            const { depId } = req.params;
            const depRepository = AppDataSource.getRepository("dep_table");

            const department = await depRepository.findOne({ where: { depId } });

            if (!department) {
                res.status(404).json({ message: "Department not found" });
                return;
            }

            await depRepository.remove(department);
            res.status(200).json({ message: "Department deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ message: "Error deleting department", error: error.message });
        }
    }
}

export default settingsController;
