"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const user_1 = __importDefault(require("../models/user"));
const server_1 = __importDefault(require("../server"));
const node_test_1 = require("node:test");
const api = (0, supertest_1.default)(server_1.default);
jest.setTimeout(40000);
const initialData = [
    {
        username: "shiva",
        name: "shiva chauhan",
        passwordHash: ""
    },
    {
        username: "jack",
        name: "jack jordan",
        passwordHash: ""
    },
];
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    const initialMappedData = initialData.map(elem => new user_1.default(elem));
    yield user_1.default.deleteMany({});
    const promiseArray = initialMappedData.map(elem => elem.save());
    yield Promise.all(promiseArray);
}));
(0, node_test_1.describe)('register  and login tests', () => {
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield user_1.default.deleteMany({});
    }));
    test('register api test for passwords equivalence negative', () => __awaiter(void 0, void 0, void 0, function* () {
        yield api.post('/register')
            .send({
            username: "ap",
            name: "cp",
            password: "coder",
            confirmPassword: "confirmPassword"
        })
            .expect(400);
    }));
    test('register api test for existing user', () => __awaiter(void 0, void 0, void 0, function* () {
        yield api.post('/register')
            .send({
            username: "shiva",
            name: "cp",
            password: "coder",
            confirmPassword: "coder"
        })
            .expect(409);
    }));
    test('register api test for new user', () => __awaiter(void 0, void 0, void 0, function* () {
        yield api.post('/register')
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
    }));
    test('login api test', () => __awaiter(void 0, void 0, void 0, function* () {
        yield api.post('/login')
            .send({
            username: "shiva",
            password: "coder"
        })
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then(response => {
            expect(response.body.token).toBeDefined();
            expect(response.body.username).toBe("shiva");
            expect(response.body.name).toBe("cp");
        });
    }));
});
