import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Student } from './students';

@Entity()
export class Teacher {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    teacherEmail: string;

    @ManyToMany(type => Student, student => student.teachers)
    @JoinTable()
    students: Student[];

}
