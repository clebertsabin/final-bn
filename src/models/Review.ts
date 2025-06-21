// import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
// import { User } from "./User";
// import { Property } from "./Property";

// @Entity("reviews")
// export class Review {
//   @PrimaryGeneratedColumn("uuid")
//   id!: string;

  

//   @ManyToOne(() => User, user => user.id, { nullable: false, onDelete: "CASCADE" })
//   @JoinColumn({ name: "user_id" })
//   host!: User;

//   @ManyToOne(() => Property, property => property.id, { nullable: false, onDelete: "CASCADE" })
//   @JoinColumn({ name: "property_id" })
//   property!: Property;

//   @Column({ type: "text", nullable: false })
//   comment!: string;

//   @Column({ type: "int", default: 1 })
//   rating!: number; // Rating should be between 1-5

//   @CreateDateColumn()
//   createdAt!: Date;
// }
