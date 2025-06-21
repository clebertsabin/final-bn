import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { UserTable } from "./UserTable";

@Entity('campus_table')
export class CampusTable {
    @PrimaryGeneratedColumn("uuid")
    campusID!: string;

    @Column({ nullable: false })
    campusName!: string;

    @Column({ nullable: false })
    location!: string;

    @Column({ nullable: true })
    website?: string;

    @Column({ nullable: true })
    campusstamp?: string; // You can use string for image URL or base64
    

    

    @OneToMany(() => UserTable, (user) => user.campus)
    users!: UserTable[];




    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
