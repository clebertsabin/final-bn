import { NextFunction, Request, Response } from "express";
import { UserTable, UserRole } from "../models/UserTable";
import { AppDataSource } from "../db/db";
import { generateToken } from "../utils/generateToken";
import { CampusTable } from "../models/CampusTable";
import { DepTable } from "../models/DepartmentTable";
import { SchoolTable } from "../models/SchoolTable";
import { LeaveTable } from "../models/LeaveTable";
import { MissionTable } from "../models/MissionTable";
const bcrypt = require("bcryptjs");
import PDFDocument from "pdfkit";
// import { UserTable } from "../models/UserTable";
import { getRepository } from "typeorm";
// import { Response, Request, NextFunction } from "express";
import fs from "fs";
import path from "path";

class userController {
    static async createUser(req: Request, res: Response) {
        try {
            const { name, email, password, campusId, role, phone, depId, schoolId, profilePhoto } = req.body;

            if (!name) {
                res.status(400).json({ message: "name is required" });
                return;
            }
            if (!email) {
                res.status(400).json({ message: "email is required" });
                return;
            }
            if (!password) {
                res.status(400).json({ message: "password is required" });
                return;

                // Hash the password before saving
                const hashedPassword = await bcrypt.hash(password, 10);
            }

            if (!campusId) {
                res.status(400).json({ message: "campusId is required" });
                return;
            }
            if (!role) {
                res.status(400).json({ message: "role is required" });
                return;
            }

            const userRepository = AppDataSource.getRepository(UserTable);

            if (await userRepository.findOne({ where: { email } })) {
                res.status(400).json({ message: "User already exists" });
                return;
            }

            const campusRepo = AppDataSource.getRepository(CampusTable);
            const campus = await campusRepo.findOne({ where: { campusID: campusId } });
            if (!campus) {
                res.status(400).json({ message: "Invalid campusId" });
                return;
            }

            let department: DepTable | undefined;
            if (depId) {
                const depRepo = AppDataSource.getRepository(DepTable);
                const department = await depRepo.findOne({ where: { depId } });
                if (!department) {
                    res.status(400).json({ message: "Invalid depId" });
                    return;
                }
            }

            let school: SchoolTable | undefined;
            if (schoolId) {
                const schoolRepo = AppDataSource.getRepository(SchoolTable);
                const school = await schoolRepo.findOne({ where: { schoolId } });
                if (!school) {
                    res.status(400).json({ message: "Invalid schoolId" });
                    return;
                }
            }

            const user = userRepository.create({
                name,
                email,
                password,
                campusId,
                campus,
                role,
                phone,
                depId,
                department,
                schoolId,
                school,
                profilePhoto,
            });

            await userRepository.save(user);
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ message: "Error creating user", error });
        }
    }

    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            const userRepository = AppDataSource.getRepository(UserTable);
            const user = await userRepository.findOne({ where: { email } });

            if (!user || user.password !== password) {
                res.status(401).json({ message: "Invalid email or password" });
                return;
            }

            // You can add status checks if you add a status column to UserTable

            const token = generateToken(user);
            res.status(200).json({ token, user });
        } catch (error: any) {
            res.status(500).json({ message: "Error logging in", error: error.message });
        }
    }

    static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userRepository = AppDataSource.getRepository(UserTable);
            const users = await userRepository.find();
            res.status(200).json({ message: "All users", data: users });
        } catch (error: any) {
            res.status(500).json({ message: "Failed to Fetch All users", error: error.message });
        }
    }

    static async getSingleUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;
            const userRepository = AppDataSource.getRepository(UserTable);

            const user = await userRepository.findOne({ where: { userId } });

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            res.status(200).json({ message: "existing user", data: user });
        } catch (error: any) {
            res.status(500).json({ message: "Error fetching user", error: error.message });
        }
    }

    static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;
            const { name, password, phone, profilePhoto } = req.body;

            const userRepository = AppDataSource.getRepository(UserTable);
            const user = await userRepository.findOne({ where: { userId } });

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            if (name) user.name = name;

            if (password) user.password = password;

            if (phone) user.phone = phone;
            if (profilePhoto) user.profilePhoto = profilePhoto;






            user.updatedAt = new Date();

            await userRepository.save(user);
            res.status(200).json({ message: "User updated successfully", data: user });
        } catch (error: any) {
            res.status(500).json({ message: "Error updating user", error: error.message });
        }
    }
    static async updateSingleUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;
            const { name, email, password, campusId, role, phone, depId, schoolId, profilePhoto } = req.body;

            const userRepository = AppDataSource.getRepository(UserTable);
            const user = await userRepository.findOne({ where: { userId } });

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            if (name) user.name = name;
            if (email) user.email = email;
            if (password) user.password = password;
            if (role) user.role = role;
            if (phone) user.phone = phone;
            if (profilePhoto) user.profilePhoto = profilePhoto;

            if (campusId) {
                const campusRepo = AppDataSource.getRepository(CampusTable);
                const campus = await campusRepo.findOne({ where: { campusID: campusId } });
                if (!campus) {
                    res.status(400).json({ message: "Invalid campusId" });
                    return;
                }
                user.campusId = campusId;
                user.campus = campus;
            }

            if (depId) {
                const depRepo = AppDataSource.getRepository(DepTable);
                const department = await depRepo.findOne({ where: { depId } });
                if (!department) {
                    res.status(400).json({ message: "Invalid depId" });
                    return;
                }
                user.depId = depId;
                user.department = department;
            }

            if (schoolId) {
                const schoolRepo = AppDataSource.getRepository(SchoolTable);
                const school = await schoolRepo.findOne({ where: { schoolId } });
                if (!school) {
                    res.status(400).json({ message: "Invalid schoolId" });
                    return;
                }
                user.schoolId = schoolId;
                user.school = school;
            }

            user.updatedAt = new Date();

            await userRepository.save(user);
            res.status(200).json({ message: "User updated successfully", data: user });
        } catch (error: any) {
            res.status(500).json({ message: "Error updating user", error: error.message });
        }
    }

    static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;
            const userRepository = AppDataSource.getRepository(UserTable);

            const user = await userRepository.findOne({ where: { userId } });

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            await userRepository.remove(user);
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ message: "Error deleting user", error: error.message });
        }
    }

    // Create a mission request
static async createMissionRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = (req as any).user?.userId;

        const {
            type,
            district,
            destination,
            startDate,
            endDate,
            purpose,
        } = req.body;

        const invitationLetter = req.file ? req.file.filename : undefined;

        if (
            !userId || !type || !startDate || !endDate || !purpose ||
            (type === 'local' && !district) ||
            (type === 'international' && !destination)
        ) {
            res.status(400).json({ message: "Missing required mission fields" });
            return;
        }

        const userRepository = AppDataSource.getRepository(UserTable);
        const user = await userRepository.findOne({ where: { userId } });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const missionRepo = AppDataSource.getRepository(MissionTable);

        const missionRequest = missionRepo.create({
            user, // If your MissionTable expects a relation, keep this; otherwise, use userId: user.userId,
            type,
            district: type === 'local' ? district : undefined,
            destination: type === 'international' ? destination : undefined,
            startDate,
            endDate,
            purpose,
            invitationLetter,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await missionRepo.save(missionRequest);
        res.status(201).json({
            message: "Mission request created successfully",
            data: missionRequest,
        });

    } catch (error: any) {
        console.error("Mission creation error:", error);
        res.status(500).json({
            message: "Error creating mission request",
            error: error.message,
        });
    }
}




    // Get all mission requests
    static async getAllMissionRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const missionRepo = AppDataSource.getRepository(MissionTable);
            const missions = await missionRepo.find({ relations: ["user"] });
            res.status(200).json({ message: "All mission requests", data: missions });
        } catch (error: any) {
            res.status(500).json({ message: "Failed to fetch mission requests", error: error.message });
        }
    }

    // Get a single mission request
    static async getSingleMissionRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { missionId } = req.params;
            const missionRepo = AppDataSource.getRepository("MissionTable");
            const mission = await missionRepo.findOne({ where: { missionId }, relations: ["user"] });

            if (!mission) {
                res.status(404).json({ message: "Mission request not found" });
                return;
            }
            res.status(200).json({ message: "Mission request found", data: mission });
        } catch (error: any) {
            res.status(500).json({ message: "Error fetching mission request", error: error.message });
        }
    }

    // Update a mission request
    static async updateMissionRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { missionId } = req.params;
            const { type, district, destination, startDate, endDate, purpose, invitationLetter } = req.body;

            const missionRepo = AppDataSource.getRepository("MissionTable");
            const mission = await missionRepo.findOne({ where: { missionId } });

            if (!mission) {
                res.status(404).json({ message: "Mission request not found" });
                return;
            }

            if (type) mission.type = type;
            if (district) mission.district = district;
            if (destination) mission.destination = destination;
            if (startDate) mission.startDate = startDate;
            if (endDate) mission.endDate = endDate;
            if (purpose) mission.purpose = purpose;
            if (invitationLetter !== undefined) mission.invitationLetter = invitationLetter;

            mission.updatedAt = new Date();

            await missionRepo.save(mission);
            res.status(200).json({ message: "Mission request updated successfully", data: mission });
        } catch (error: any) {
            res.status(500).json({ message: "Error updating mission request", error: error.message });
        }
    }

    // Delete a mission request
    static async deleteMissionRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { missionId } = req.params;
            const missionRepo = AppDataSource.getRepository("MissionTable");
            const mission = await missionRepo.findOne({ where: { missionId } });

            if (!mission) {
                res.status(404).json({ message: "Mission request not found" });
                return;
            }

            await missionRepo.remove(mission);
            res.status(200).json({ message: "Mission request deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ message: "Error deleting mission request", error: error.message });
        }
    }

    // Create a leave request
    static async createLeaveRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId, type, startDate, endDate, reason, supportingDocument } = req.body;

            if (!userId || !type || !startDate || !endDate) {
                res.status(400).json({ message: "userId, type, startDate, and endDate are required" });
                return;
            }

            const userRepository = AppDataSource.getRepository(UserTable);
            const user = await userRepository.findOne({ where: { userId } });

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            const leaveRepo = AppDataSource.getRepository(LeaveTable);
            const leaveRequest = leaveRepo.create({
                userId,
                type,
                startDate,
                endDate,
                reason: reason || null,
                supportingDocument: supportingDocument || null,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await leaveRepo.save(leaveRequest);
            res.status(201).json({ message: "Leave request created successfully", data: leaveRequest });
        } catch (error: any) {
            res.status(500).json({ message: "Error creating leave request", error: error.message });
        }
    }

    // Get all leave requests
    static async getAllLeaveRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const leaveRepo = AppDataSource.getRepository(LeaveTable);
            const leaves = await leaveRepo.find();
            res.status(200).json({ message: "All leave requests", data: leaves });
        } catch (error: any) {
            res.status(500).json({ message: "Failed to fetch leave requests", error: error.message });
        }
    }

    // Get a single leave request
    static async getSingleLeaveRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { leaveId } = req.params;
            const leaveRepo = AppDataSource.getRepository(LeaveTable);
            const leave = await leaveRepo.findOne({ where: { leaveId } });

            if (!leave) {
                res.status(404).json({ message: "Leave request not found" });
                return;
            }
            res.status(200).json({ message: "Leave request found", data: leave });
        } catch (error: any) {
            res.status(500).json({ message: "Error fetching leave request", error: error.message });
        }
    }

    // Update a leave request
    static async updateLeaveRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { leaveId } = req.params;
            const { type, startDate, endDate, reason, supportingDocument } = req.body;

            const leaveRepo = AppDataSource.getRepository(LeaveTable);
            const leave = await leaveRepo.findOne({ where: { leaveId } });

            if (!leave) {
                res.status(404).json({ message: "Leave request not found" });
                return;
            }

            if (type) leave.type = type;
            if (startDate) leave.startDate = startDate;
            if (endDate) leave.endDate = endDate;
            if (reason !== undefined) leave.reason = reason;
            if (supportingDocument !== undefined) leave.supportingDocument = supportingDocument;

            leave.updatedAt = new Date();

            await leaveRepo.save(leave);
            res.status(200).json({ message: "Leave request updated successfully", data: leave });
        } catch (error: any) {
            res.status(500).json({ message: "Error updating leave request", error: error.message });
        }
    }

    // Delete a leave request
    static async deleteLeaveRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { leaveId } = req.params;
            const leaveRepo = AppDataSource.getRepository(LeaveTable);
            const leave = await leaveRepo.findOne({ where: { leaveId } });

            if (!leave) {
                res.status(404).json({ message: "Leave request not found" });
                return;
            }

            await leaveRepo.remove(leave);
            res.status(200).json({ message: "Leave request deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ message: "Error deleting leave request", error: error.message });
        }
    }
    //  change mission status 

    static async changeMissionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { missionId } = req.params;
            const { missionStatus } = req.body;

            // if (!status || !["pending", "approved", "rejected"].includes(status)) {
            //     res.status(400).json({ message: "Invalid status value" });
            //     return;
            // }

            const missionRepo = AppDataSource.getRepository(MissionTable);
            const mission = await missionRepo.findOne({ where: { missionId } });

            if (!mission) {
                res.status(404).json({ message: "Mission request not found" });
                return;
            }
            // console.log("mission", mission);

            mission.missionStatus = missionStatus;
            mission.updatedAt = new Date();

            await missionRepo.save(mission);
            res.status(200).json({ message: `Mission status changed to ${missionStatus}`, data: mission });
        } catch (error: any) {
            res.status(500).json({ message: "Error changing mission status", error: error.message });
        }
    }
    // change leave status

    static async changeLeaveStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { leaveId } = req.params;
            const { status } = req.body;

            // Only allow specific statuses
            // const validStatuses = ["pending", "approved", "rejected"];
            // if (!leaveStatus || !validStatuses.includes(leaveStatus)) {
            //     res.status(400).json({ message: "Invalid leaveStatus value" });
            //     return;
            // }

            const leaveRepo = AppDataSource.getRepository(LeaveTable);
            const leave = await leaveRepo.findOne({ where: { leaveId } });

            if (!leave) {
                res.status(404).json({ message: "Leave request not found" });
                return;
            }

            leave.status = status;
            leave.updatedAt = new Date();

            await leaveRepo.save(leave);
            res.status(200).json({ message: `Leave status changed to ${status}`, data: leave });
        } catch (error: any) {
            res.status(500).json({ message: "Error changing leave status", error: error.message });
        }
    }


    static async generateMissionPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { missionId } = req.params;
            const missionRepo = AppDataSource.getRepository(MissionTable);
            const mission = await missionRepo.findOne({
                where: { missionId },
                relations: ["user"]
            });

            if (!mission) {
                res.status(404).json({ message: "Mission not found" });
                return;
            }

            // Create a PDF document
            const doc = new PDFDocument();
            const filename = `mission_${mission.missionId}.pdf`;
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

            doc.pipe(res);

            doc.fontSize(20).text("Mission Request", { align: "center" });
            doc.moveDown();

            doc.fontSize(14).text(`Mission ID: ${mission.missionId}`);
            doc.text(`User: ${mission.user.name} (${mission.user.email})`);
            doc.text(`Type: ${mission.type}`);
            doc.text(`District: ${mission.district}`);
            doc.text(`Destination: ${mission.destination}`);
            doc.text(`Start Date: ${mission.startDate}`);
            doc.text(`End Date: ${mission.endDate}`);
            doc.text(`Purpose: ${mission.purpose}`);
            if (mission.invitationLetter) {
                doc.text(`Invitation Letter: ${mission.invitationLetter}`);
            }

            doc.end();
        } catch (error: any) {
            res.status(500).json({ message: "Error generating mission PDF", error: error.message });
        }
    }



}


export default userController;
