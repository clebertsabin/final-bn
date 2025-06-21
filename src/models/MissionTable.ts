import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { UserTable } from "./UserTable";

export enum MissionStatus {
  PENDING = "pending",
  HOD_APPROVE = "HOD approve",
  HOD_REJECT = "HOD reject",
  DEAN_APPROVE = "dean approve",
  DEAN_REJECT = "dean reject",
  CAMPUS_ADMIN_APPROVE = "campus admin approve",
  CAMPUS_ADMIN_REJECT = "campus admin reject",
  PRINCIPLE_APPROVE = "principle approve",
  PRINCIPLE_REJECT = "principle reject",
  VICE_CHANCELOR_APPROVE = "Vice chancelor approve",
  VICE_CHANCELOR_REJECT = "Vice chancelor reject",
  HR_APPROVE = "HR approve",
  HR_REJECT = "HR reject",
  APPROVED = "approved",
  REJECTED = "rejected"
}

@Entity('missions')
export class MissionTable {
  @PrimaryGeneratedColumn("uuid")
  missionId!: string;

  @ManyToOne(() => UserTable, (user) => user.missions, { eager: true })
  @JoinColumn({ name: "userId" })
  user!: UserTable;

  @Column()
  userId!: string;

  @Column()
  type!: string;

  @Column()
  district!: string;

  @Column()
  destination!: string;

  @Column({ type: 'date' })
  startDate!: string;

  @Column({ type: 'date' })
  endDate!: string;

  @Column()
  purpose!: string;

  @Column({ nullable: true })
  invitationLetter?: string;

  @Column({
    type: "enum",
    enum: MissionStatus,
    default: MissionStatus.PENDING,
  })
  missionStatus!: MissionStatus;

  // Who is currently supposed to approve this (role only, not the actual user)
  @Column({ nullable: true })
  currentApproverRole?: string; // e.g., 'HOD', 'Dean', 'Campus Admin'

  // Optional: who last approved/rejected
  @Column({ nullable: true })
  approverId?: string;

  @Column({ nullable: true })
  role?: string; // Role of the last approver

  @Column({ nullable: true })
  decision?: string; // "approved", "rejected"

  @Column({ nullable: true })
  comment?: string;

  @Column({ nullable: true })
  fileLink?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
