import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from 'supertest';
import { AppModule } from "../src/modules/app.module";

describe('Some kek', () => {
  let app: INestApplication;

  const creds = {
    email: 'test@test.tt',
    password: 'S0meP@assssd',
  };

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

  });

  it('')
});
