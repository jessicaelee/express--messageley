const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");
const { SECRET_KEY } = require("../config");

describe("Auth Routes Test", async function () {

    let u1;
    let u2;
    let token1;
    let m1;
    let m2;

    beforeEach(async function () {
        await db.query("DELETE FROM messages");
        await db.query("DELETE FROM users");

        u1 = await User.register({
            username: "test1",
            password: "password",
            first_name: "Test1",
            last_name: "Testy1",
            phone: "+14155550000",
        });

        let loginResp = await request(app).post('/auth/login').send({ username: "test1", password: "password" });

        token1 = loginResp.body.token;

        u2 = await User.register({
            username: "test2",
            password: "password",
            first_name: "Test2",
            last_name: "Testy2",
            phone: "+14155550000",
        });

        m1 = await Message.create({ "from_username": "test1", "to_username": "test2", "body": "message1" });

        m2 = await Message.create({ "from_username": "test2", "to_username": "test1", "body": "message1" });

    });

    // afterEach(async function () {
    //     await db.query("DELETE FROM messages");
    //     await db.query("DELETE FROM users");
    // })

    describe('GET /users', function () {
        test('can get list of users', async function () {

            let resp = await request(app).get('/users').send({ _token: token1 });

            expect(resp.statusCode).toBe(200);
            expect(resp.body).toEqual({
                users:
                    [
                        { "username": 'test1', "first_name": 'Test1', "last_name": 'Testy1' },
                        { "username": 'test2', "first_name": 'Test2', "last_name": 'Testy2' }
                    ]
            })
        })
    })



    describe('GET /users', function () {
        test('cannot get list of users with bad token', async function () {
            let resp = await request(app).get('/users').send({ _token: "badtoken" });
            expect(resp.statusCode).toBe(401);

        })
    })

    describe('GET /users', function () {
        test('cannot get list of users without token', async function () {
            let resp = await request(app).get('/users');
            expect(resp.statusCode).toBe(401);
        })
    })

    describe('GET /users/:username', function () {
        test('can get detail of user', async function () {

            let resp = await request(app).get(`/users/${u1.username}`).send({ _token: token1 });

            expect(resp.statusCode).toBe(200);
            expect(resp.body).toEqual({
                user:
                    { "username": 'test1', "first_name": 'Test1', "last_name": 'Testy1', "phone": "+14155550000", "join_at": expect.anything(), "last_login_at": expect.anything() }
            })
        })
    })

    describe('GET /users/:username', function () {
        test('cannot get detail of wrong user', async function () {

            let resp = await request(app).get(`/users/${u2.username}`).send({ _token: token1 });

            expect(resp.statusCode).toBe(401);
        })
    })

    describe('GET /users/:username', function () {
        test('cannot get detail of user with badtoken', async function () {

            let resp = await request(app).get(`/users/${u2.username}`).send({ _token: "verybadtoken" });

            expect(resp.statusCode).toBe(401);
        })
    })

    describe('GET /users/:username/to', function () {
        test('get users to messages', async function () {

            let resp = await request(app).get(`/users/${u1.username}/to`).send({ _token: token1 });

            expect(resp.statusCode).toBe(200);
            expect(resp.body).toEqual(
                { messages: [{ "from_user": { first_name: u2.first_name, last_name: u2.last_name, phone: u2.phone, username: u2.username }, "body": "message1", "id": m2.id, "read_at": null, "sent_at": expect.anything() }] })
        })
    });

    describe('GET /users/:username/to', function () {
        test('get users to messages with bad token', async function () {

            let resp = await request(app).get(`/users/${u1.username}/to`).send({ _token: "badoken" });

            expect(resp.statusCode).toBe(401);
        });
    });

    describe('GET /users/:username/to', function () {
        test('get users to messages with no token', async function () {

            let resp = await request(app).get(`/users/${u1.username}/to`);

            expect(resp.statusCode).toBe(401);
        });
    });

    describe('GET /users/:username/from', function () {
        test('get users from messages', async function () {

            let resp = await request(app).get(`/users/${u1.username}/from`).send({ _token: token1 });

            expect(resp.statusCode).toBe(200);
            expect(resp.body).toEqual({
                messages:
                    [{ "to_user": { first_name: u2.first_name, last_name: u2.last_name, phone: u2.phone, username: u2.username }, "body": "message1", "id": m1.id, "read_at": null, "sent_at": expect.anything() }]
            })
        })
    });

    describe('GET /users/:username/from', function () {
        test('get users from messages with bad token', async function () {

            let resp = await request(app).get(`/users/${u1.username}/from`).send({ _token: "badddtoken" });

            expect(resp.statusCode).toBe(401);

        })
    });

    describe('GET /users/:username/from', function () {
        test('get users from messages with no token', async function () {

            let resp = await request(app).get(`/users/${u1.username}/from`);

            expect(resp.statusCode).toBe(401);
        })
    });

    afterAll(async function () {
        await db.end();
    })
});