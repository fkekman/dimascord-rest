import { Test } from '@nestjs/testing';
import request from 'supertest';
import { faker } from '@faker-js/faker'
import { AppModule } from '../src/modules/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';




describe('Auth module', () => {
  let app: INestApplication;
  const users: any[] = [];

  const getFriends = (user: any) => request(app.getHttpServer())
    .get('/friends')
    .set('Authorization', `Bearer ${user.accessToken}`)

  const getOutgoing = (user: any) => request(app.getHttpServer())
    .get('/friends/outgoing')
    .set('Authorization', `Bearer ${user.accessToken}`)

  const getIncoming = (user: any) => request(app.getHttpServer())
    .get('/friends/incoming')
    .set('Authorization', `Bearer ${user.accessToken}`)


  const sendRequest = (user: any, friend: any) => request(app.getHttpServer())
    .post('/friends/send')
    .set('Authorization', `Bearer ${user.accessToken}`)
    .send({ friendId: friend.id })

  const acceptRequest = (user: any, requestId: string) => request(app.getHttpServer())
    .post('/friends/accept')
    .set('Authorization', `Bearer ${user.accessToken}`)
    .send({ requestId })

  const denyRequest = (user: any, requestId: string) => request(app.getHttpServer())
    .post('/friends/deny')
    .set('Authorization', `Bearer ${user.accessToken}`)
    .send({ requestId })


  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AppModule,
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init()
  });

  beforeAll(async () => {
    for (let i = 0; i < 3; i++) {

      const userCreds = {
        email: faker.internet.email(),
        password: faker.internet.password({
          prefix: '@pPe)_2',
        }),
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...userCreds,
          username: faker.internet.username(),
        })
        .expect(201);

      const accessToken = response.body.accessToken as string;

      const userInfo = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(res => res.body);

      users.push({
        ...userInfo,
        ...userCreds,
        accessToken,
      });
    }
  });

  it('send->deny', async () => {
    await getFriends(users[0])
      .expect(200)
      .expect([])

    await sendRequest(users[0], users[1])
      .expect(200);

    await getOutgoing(users[0])
      .expect(200)
      .then(res => {
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({
          userId: users[0].id,
          friendId: users[1].id,
          status: 'pending',
        })
      })

    const requests = await getIncoming(users[1])
      .expect(200)
      .then(res => {
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({
          userId: users[0].id,
          friendId: users[1].id,
          status: 'pending',
        })
        return res.body;
      })

    await denyRequest(users[1], requests[0].id)
      .expect(200);

    await getOutgoing(users[0])
      .expect(200)
      .expect([]);

    await getIncoming(users[1])
      .expect(200)
      .expect([]);
  });

  it('send->accept', async () => {
    await getFriends(users[0])
      .expect(200)
      .expect([])

    await sendRequest(users[0], users[1])
      .expect(200);

    await getOutgoing(users[0])
      .expect(200)
      .then(res => {
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({
          userId: users[0].id,
          friendId: users[1].id,
          status: 'pending',
        })
      })

    const requests = await getIncoming(users[1])
      .expect(200)
      .then(res => {
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({
          userId: users[0].id,
          friendId: users[1].id,
          status: 'pending',
        })
        return res.body;
      })

    await acceptRequest(users[1], requests[0].id)
      .expect(200);

    await getFriends(users[0])
      .expect(200)
      .then(res => {
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({
          userId: users[0].id,
          friendId: users[1].id,
          status: 'accepted',
        })
      })

    await getFriends(users[1])
      .expect(200)
      .then(res => {
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({
          userId: users[0].id,
          friendId: users[1].id,
          status: 'accepted',
        })
        return res.body;
      })
  });

  it('unfriend', async () => {
    //TODO:
  });
});
