'use strict';

import * as chai from 'chai';
import 'mocha';
import chaiHttp = require('chai-http');
import * as server from '../index';

chai.use(chaiHttp);
chai.should();

const baseUrl = 'http://localhost:3000/api';

// Register a student
describe('/POST register student', () => {
    // Register a student for a existing teacher
    it('it should register a student', (done) => {
        let req = {
            'teacher': 'teacher12@test.com',
            'students': [
                'student1@test.com',
                'student8@test.com'
            ]
        }
        chai.request(baseUrl)
            .post('/register')
            .set({ 'content-Type': 'application/json; charset=utf-8' })
            .send(req)
            .end((err, res) => {
                res.should.have.status(204);
                res.body.should.be.a('object');
                done();
            });
    });
    // If tries to register a student to non-existing teacher 
    it('it should throw error if teacher doesn\'t exist', (done) => {
        let req = {
            'teacher': 'teacher128@test.com',
            'students': [
                'student1@test.com',
                'student8@test.com'
            ]
        }
        chai.request(baseUrl)
            .post('/register')
            .set({ 'content-Type': 'application/json; charset=utf-8' })
            .send(req)
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                done();
            });
    });
});

// Getting common students
describe('/GET common students', () => {
    // Getting common students for existing teachers
    it('it should return a common student from list of teachers', (done) => {
        chai.request(baseUrl)
            .get('/commonstudents?teacher=teacher12@test.com&teacher=teacher22@test.com')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
    // Getting common students for non-existing teachers
    it('it should throw error if teacher doesn\'t exist', (done) => {
        chai.request(baseUrl)
            .get('/commonstudents?teacher=teacher128@test.com&teacher=teacher228@test.com')
            .set({ 'content-Type': 'application/json; charset=utf-8' })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                done();
            });
    });
});

// Suspend a student
describe('/POST suspended student', () => {
    // Suspending existing student
    it('it should suspend a student', (done) => {
        let req = {
            'student': 'student1@test.com'
        }
        chai.request(baseUrl)
            .post('/suspend')
            .set({ 'content-Type': 'application/json; charset=utf-8' })
            .send(req)
            .end((err, res) => {
                res.should.have.status(204);
                res.body.should.be.a('object');
                done();
            });
    });
    // Suspending non-existing student
    it('it should throw error if student doesn\'t exist', (done) => {
        let req = {
            'student': 'student124@test.com'
        }
        chai.request(baseUrl)
            .post('/suspend')
            .set({ 'content-Type': 'application/json; charset=utf-8' })
            .send(req)
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                done();
            });
    });
});

// Retrieve students & notify
describe('/POST retrieve for notifications', () => {
    // Retrieving list of studens to notify from an existing teacher
    it('it should retrieve a list of students who can receive a given notification', (done) => {
        let req = {
            'teacher': 'teacher12@test.com',
            'notification': 'Hello students! @student1@test'
        }
        chai.request(baseUrl)
            .post('/retrievefornotifications')
            .set({ 'content-Type': 'application/json; charset=utf-8' })
            .send(req)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
    // Retrieving list of studens to notify from non-existing teacher
    it('it should throw error if teacher doesn\'t exist', (done) => {
        let req = {
            'teacher': 'teacherken@example.com',
            'notification': 'Hello students! @student1@test.com @student2@test.com'
        }
        chai.request(baseUrl)
            .post('/retrievefornotifications')
            .set({ 'content-Type': 'application/json; charset=utf-8' })
            .send(req)
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                done();
            });
    });
});
