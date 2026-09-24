import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/modules/app.module';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';

const parseSetCookies = (headers: Record<string, string | undefined>) => {
  const setCookiesHeader = headers['set-cookie'] as string[] | undefined;
  if (!setCookiesHeader) return {};
  return Object.fromEntries(
    setCookiesHeader.map(cookie => {
      const [name, value] = cookie.split(';')[0].split('=');
      return [name, value];
    })
  );
};

describe('Some kek', () => {
  let app: INestApplication;

  const creds = {
    email: 'test@test.tt',
    password: 'somepass',
  };

  const accessCheck = (accessToken: string) => request(app.getHttpServer())
    .get('/users/me')
    .set('Authorization', `Bearer ${accessToken}`)

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AppModule,
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init()
  });

  it('Unauthorized access', async () => {
    await request(app.getHttpServer())
      .get('/users/me')
      .expect(401);
    await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', 'Bearer SOME_INCORRECT_TOKEN')
      .expect(401);
  });

  it('register', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...creds,
        username: 'usname',
      })
      .expect(201);

    const accessToken = response.body.accessToken as string;

    await accessCheck(accessToken).expect(200);
  });

  it('login', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(creds);
    const accessToken = response.body.accessToken as string;

    await accessCheck(accessToken).expect(200);
  });

  it('login->refresh', async () => {
    let response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@test.tt',
        password: 'somepass',
      });
    let accessToken = response.body.accessToken as string;
    const refreshToken = parseSetCookies(response.headers)['refreshToken'];

    await accessCheck(accessToken).expect(200);

    response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`)

    accessToken = response.body.accessToken;

    await accessCheck(accessToken).expect(200);
  });

  it('login->logout->refresh', async () => {
    let response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@test.tt',
        password: 'somepass',
      })
      .expect(200);
    let accessToken = response.body.accessToken as string;
    const refreshToken = parseSetCookies(response.headers)['refreshToken'];

    await accessCheck(accessToken).expect(200);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(401);
  });
});
