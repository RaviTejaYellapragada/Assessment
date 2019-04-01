import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Teacher } from './teachers';

@Entity()
export class Student {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    studentEmail: string;
    
    @Column()
    isStudentSuspended: boolean;

    @ManyToMany(type => Teacher, teacher => teacher.students)
    teachers: Teacher[];

}
