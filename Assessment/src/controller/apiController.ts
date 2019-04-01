import { getRepository, In } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { Teacher } from '../entity/teachers';
import { Student } from '../entity/students';

export class ApiController {
    public teacherRepository = getRepository(Teacher);
    public studentRepository = getRepository(Student);

    // Register student to a teacher
    async registerStudent(request: Request, response: Response, next: NextFunction) {
        try {
            const req = request.body;
            const teacherEmail = req.teacher;
            const studentEmail = req.students;
            let existingStudentsArr = [];
            let newStudentsArr = [];

            // returns the students list from db
            let studentsList = await this.studentRepository.createQueryBuilder("student")
                .where("student.studentEmail IN (:...studentsArr)", { studentsArr: req.students })
                .getMany();
          
            // Pushed existing students in an Array
            studentsList.map((el) => {
                existingStudentsArr.push(el['studentEmail']);
            });

            // Pushed non-existing students in an Array
            newStudentsArr = studentEmail.filter((item) => {
                return existingStudentsArr.indexOf(item) == -1;
            });

            // Pushed non-existing students to an object
            const newStudents = newStudentsArr.map((item) => {
                return { 'studentEmail': item };
            });

            // Adding the non existing students to 
            let newstudentsList;
            if (newStudentsArr.length) {
                await this.studentRepository.insert(newStudents);
                newstudentsList = await this.studentRepository.createQueryBuilder("student")
                .where("student.studentEmail IN (:...studentsArr)", { studentsArr: req.students })
                .getMany();
            }            

            // checking whether teacher exists in db
            const teacher = await this.teacherRepository.findOne({ teacherEmail: teacherEmail });
            
            // If teacher exists, registering students to teacher
            if (teacher) {
                if (studentsList) {
                    teacher['students'] = studentsList;
                }
                if (newstudentsList) {
                    teacher['students'] = newstudentsList;
                }
                response.status(204);
                return await this.teacherRepository.save(teacher);
            } else {
                response.status(400).send({ message: 'Teacher not found' });
            }
        }
        catch (error) {
            next(Error);
        }
    }

    // Get common students from the given list of teachers
    async getCommonStudents(request: Request, response: Response, next: NextFunction) {
        try {
            let reqParams = request.query['teacher'];
            let isTeacherExists = false;
            const teachersReq = Array.isArray(reqParams) ? In(reqParams) : reqParams;

            // Adding teacher student relationship
            const studentsData = await this.teacherRepository.find({
                relations: ["students"], where: { teacherEmail: teachersReq }
            });

            if (Array.isArray(reqParams)) {
                isTeacherExists = (studentsData.length === reqParams.length) ? true : false;
            } else {
                isTeacherExists = studentsData.length === 0 ? false : true;
            }

            // Getting students assigned to the given teachers
            if (isTeacherExists) {
                const studentsList = [];
                studentsData.filter((item) => {
                    const tempArr = [];
                    item['students'].map((el) => {
                        tempArr.push(el['studentEmail']);
                    });
                    studentsList.push(tempArr);
                });

                // Getting common students from the list of teachers
                const result = studentsList.shift().filter((item) => {
                    return studentsList.every((el) => {
                        return el.indexOf(item) !== -1;
                    });
                });
                const commonStudents = {
                    "students": result
                }
                response.status(200).send(commonStudents);
            } else {
                response.status(400).send({ message: 'Teacher not found' });
            }
        }
        catch (error) {
            next(Error);
        }
    }

    // Suspend a student
    async suspendStudent(request: Request, response: Response, next: NextFunction) {
        try {
            const req = request.body;

            // Record of student to be suspended
            let suspendMail = await this.studentRepository.findOne({ studentEmail: req['student'] });

            // Check for an existing student & suspend
            if (suspendMail) {
                suspendMail['isStudentSuspended'] = true;
                response.status(204);
                return await this.studentRepository.save(suspendMail);
            } else {
                response.status(400).send({ message: 'Student not found' });
            }
        }
        catch (error) {
            next(Error);
        }
    }

    // Retrieve students && notify them
    async retrieveStudents(request: Request, response: Response, next: NextFunction) {
        try {
            const req = request.body;
            const teacherEmail = req['teacher'];

            // checking whether teacher exists in db
            const teacher = await this.teacherRepository.findOne({ teacherEmail: teacherEmail });
            if (teacher) {
                // List of students to be notified
                const notifyEmails = req['notification'].split(' @');
                notifyEmails.shift();

                // Getting the list of teacher students relations
                const studentsList = await this.teacherRepository.find({ relations: ["students"] });
                let studentsData;
                studentsList.filter((item) => {
                    if (teacherEmail === item['teacherEmail']) {
                        studentsData = item['students'];
                    }
                });

                // Students who are not suspended
                const activeStudents = [];
                studentsData.map((item) => {
                    if (!item['isStudentSuspended']) {
                        activeStudents.push(item['studentEmail']);
                    }
                });
                const recipients = {
                    'recipients': Array.from(new Set([...notifyEmails, ...activeStudents]))
                }
                response.status(200).send(recipients);
            } else {
                response.status(400).send({ message: 'Teacher not found' });
            }
        }
        catch (error) {
            next(Error);
        }
    }
}
