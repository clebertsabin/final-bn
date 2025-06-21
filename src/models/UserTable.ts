import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CampusTable } from "./CampusTable";
import { DepTable } from "./DepartmentTable";
import { SchoolTable } from "./SchoolTable";
import { MissionTable } from "./MissionTable";
import { LeaveTable } from "./LeaveTable";
export enum UserRole {
        SYSTEM_ADMIN = "system admin",
        EMPLOYEE_LECTURER = "Employee/Lecturer",
        HOD = "HOD",
        DEAN = "dean",
        CAMPUS_ADMIN = "campus admin",
        PRINCIPLE = "principle",
        VICE_CHANCELLOR = "vice chancelor",
        HR = "HR"
    }
@Entity('user_table')
export class UserTable {
    @PrimaryGeneratedColumn("uuid")
    userId!: string;

    @Column({ nullable: false })
    campusId!: string;
    


    @ManyToOne(() => CampusTable, (campus) => campus.users, { eager: true })
    @JoinColumn({ name: "campusId" }) // This ties the foreign key to the column
    campus!: CampusTable;



    @Column({ nullable: false, unique: true })
    name!: string;

    @Column({ nullable: false, unique: true })
    email!: string;

    @Column({ nullable: false })
    password!: string;

    
    @Column({ 
        type: "enum", 
        enum: UserRole, 
        nullable: false 
    })
    role!: UserRole;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    depId?: string;

   @ManyToOne(() => DepTable, { eager: true, nullable: true })
    @JoinColumn({ name: "depId" })
    department?: DepTable;

    
@OneToMany(() => LeaveTable, (leave) => leave.user)
leaves!: LeaveTable[];

    @Column({ nullable: true })
    profilePhoto?: string;

    @Column({ nullable: true })
    schoolId?: string;


    @ManyToOne(() => SchoolTable, { eager: true, nullable: true })
    @JoinColumn({ name: "schoolId" })
    school?: SchoolTable;

    @OneToMany(() => MissionTable, (mission) => mission.user)
    missions!: MissionTable[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
