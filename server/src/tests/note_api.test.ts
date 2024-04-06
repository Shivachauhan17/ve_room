import {test,after} from "node:test"
import mongoose from "mongoose"
import supertest from "supertest"
import app from "../server"

const api=supertest(app)

test('notes are returned as json', async () => {
    await api
      .get('/test')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })


after(async () => {
    await mongoose.connection.close()
})