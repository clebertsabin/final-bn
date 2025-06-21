import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { UserTable } from "./UserTable";
import { SchoolTable } from "./SchoolTable";

@Entity('dep_table')
export class DepTable {
    @PrimaryGeneratedColumn("uuid")
    depId!: string;

    @OneToMany(() => UserTable, (user) => user.department)
    users!: UserTable[];

    
    @ManyToOne(() => SchoolTable, (school) => school.departments, { eager: true })
    @JoinColumn({ name: "schoolId" })
    school!: SchoolTable;

    
    @Column({ nullable: false })
    schoolId!: string;

    @Column({ nullable: false })
    depName!: string;

    @Column({ nullable: true })
    location?: string;

    @Column({ nullable: true })
    website?: string;

    @Column({ nullable: true })
    depStamp?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
