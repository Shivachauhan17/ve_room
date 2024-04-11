import supertest from "supertest";
import mongoose from "mongoose";
import User from '../models/user'
import app from '../server'
import { describe } from "node:test";

const api=supertest(app)

const initialData=[
    {
        username:"shiva",
        name:"shiva chauhan",
        passwordHash:" "
    },
    {
        username:"jack",
        name:"jack jordan",
        passwordHash:" "
    },
]

beforeEach(async()=>{
    const initialMappedData=initialData.map(elem=>new User(elem))
    await User.deleteMany({})
    const promiseArray = initialMappedData.map(elem => elem.save())
    await Promise.all(promiseArray)
})

afterAll(async () => {
    // Close the MongoDB connection after all tests have finished
    await mongoose.disconnect();
});

afterEach(async () => {
    await User.deleteMany({});
});

describe('register  and login tests',()=>{

    

    test('register api test for passwords equivalence negative',async()=>{
        await api.post('/register')
            .send(
                {
                    username:"ap",
                    name:"cp",
                    password:"coder",
                    confirmPassword:"confirmPassword"
                }
            )
            .expect(400)
    })

    test('register api test for existing user',async()=>{
        await api.post('/register')
            .send(
                {
                    username:"shiva",
                    name:"cp",
                    password:"coder",
                    confirmPassword:"coder"
                }
            )
            .expect(409)
    })

    test('register api test for new user', async () => {
        await api.post('/register')
            .send({
                username: "newuser",
                name: "New User",
                password: "newpassword",
                confirmPassword: "newpassword"
            })
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                expect(response.body.token).toBeDefined();
                expect(response.body.username).toBe("newuser");
                expect(response.body.name).toBe("New User");
            });
    });

    test('login api test', async () => {
        await api.post('/login')
            .send({
                username: "newuser",
                password: "newpassword"
            })
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
                expect(response.body.token).toBeDefined();
                expect(response.body.username).toBe("newuser");
                expect(response.body.name).toBe("New User");
            });
    });
    
})