const request = require('supertest'); //supertest is the tool used for making requests.
const app = require('../../app');
const {
  mongoConnect,
  mongoDisconnect,
} = require('../../services/mongo');

describe('Launches API', () => {

  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe('Test GET /v1/launches', () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/i)
        .expect(200);
      // expect(response.statusCode).toBe(200);
    })
  })

  describe('Test POST /v1/launches', () => {
    const completeLaunchData = {
      mission: "ZTM15",
      rocket: "ZTM experimental IS1",
      target: "Kepler-296 e",
      launchDate: "April 4, 2030"
    }
    const launchDataWithoutLaunchDate = {
      mission: "ZTM15",
      rocket: "ZTM experimental IS1",
      target: "Kepler-296 e",
    }
    const launchDataWithInvalidLaunchDate = {
      mission: "ZTM15",
      rocket: "ZTM experimental IS1",
      target: "Kepler-186 f",
      launchDate: "hello"
    }
    test("It should respond with 200 success", async () => {
      const response = await request(app).post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/i)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDataWithoutLaunchDate)
    });

    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutLaunchDate)
        .expect('Content-Type', /json/i)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing launch property."
      })
    });

    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidLaunchDate)
        .expect('Content-Type', /json/i)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date."
      })
    });
  })
})
