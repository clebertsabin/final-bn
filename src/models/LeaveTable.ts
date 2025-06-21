import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { UserTable } from "./UserTable";
enum LeaveStatus {
        Pending = 'pending',
        Approved = 'approved',
        Rejected = 'rejected',
        HODApproved = 'HOD Approved',
        HODRejected = 'HOD Rejected',
        DeanApproved = 'Dean Approved',
        DeanRejected = 'Dean Rejected',
        HRApproved = 'HR Approved',
        HRRejected = 'HR Rejected'
    }
@Entity('leave_table')
export class LeaveTable {
    @PrimaryGeneratedColumn("uuid")
    leaveId!: string;

  @ManyToOne(() => UserTable, (user) => user.leaves, { eager: true })
    @JoinColumn({ name: "userId" })
    user!: UserTable;

    @Column({ nullable: false })
    userId!: string;

    @Column({ nullable: false })
    type!: string;

    @Column({ type: 'date', nullable: false })
    startDate!: string;

    @Column({ type: 'date', nullable: false })
    endDate!: string;

    @Column({ nullable: true })
    reason?: string;

    @Column({ nullable: true })
    supportingDocument?: string;

    

    @Column({ 
        type: 'enum', 
        enum: LeaveStatus, 
        default: LeaveStatus.Pending 
    })
    status!: LeaveStatus;

    @Column({ nullable: true })
    approvalId?: string;

    @Column({ nullable: true })
    approverId?: string;

    @Column({ nullable: true })
    role?: string;

    @Column({ enum: ['approved', 'rejected', 'pending'], default: 'pending' })
    decision!: string;

    @Column({ type: 'timestamp', nullable: true })
    decisionDate?: Date;

    @Column({ nullable: true })
    comment?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
    leaveStatus: any;
}
