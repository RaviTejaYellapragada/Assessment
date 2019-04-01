import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
import { Teacher } from "./entity/teachers";
import { Student } from "./entity/students";

createConnection().then(async connection => {

    // create express app
    const app = express();
    app.use(bodyParser.json());
    
    app.use((err, req, res, next) => {
        if (!err) return next();
        res.send("error!!!");
    });

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next);
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

            } else if (result !== null && result !== undefined) {
                res.json(result);
            }
        });
    });

    // start express server
    app.listen(3000);

    // Added default records when creating db
    const teachers = await connection.manager.find(Teacher);
    const students = await connection.manager.find(Student);

    if(!teachers.length) {
        await connection.manager
        .createQueryBuilder()
        .insert()
        .into(Teacher)
        .values([
            { teacherEmail: "teacher11@test.com" }, 
            { teacherEmail: "teacher22@test.com" }
         ])
        .execute();
    }
    
    if(!students.length) {
        await connection.manager
        .createQueryBuilder()
        .insert()
        .into(Student)
        .values([
            { studentEmail: "student1@test.com", isStudentSuspended: true }, 
            { studentEmail: "student8@test.com", isStudentSuspended: false }
         ])
        .execute();
    }

    console.log("Express server has started on port 3000. Open http://localhost:3000/ to see results");

}).catch(error => console.log(error));
