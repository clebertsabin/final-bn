import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { UserTable } from "./UserTable";
import { DepTable } from "./DepartmentTable";

@Entity('school_table')
export class SchoolTable {
    @PrimaryGeneratedColumn("uuid")
    schoolId!: string;


    @OneToMany(() => UserTable, (user) => user.school)
    users!: UserTable[];

       @OneToMany(() => DepTable, (dep) => dep.school)
    departments!: DepTable[];


    @Column({ nullable: false })
    campusId!: string;

    @Column({ nullable: false })
    schoolName!: string;

    @Column({ nullable: false })
    location!: string;

    @Column({ nullable: true })
    website?: string;

    @Column({ nullable: true })
    schoolStamp?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
