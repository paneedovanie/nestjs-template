import { config } from 'dotenv';

const env: any = config().parsed;

if (env?.DATABASE_URL_TEST) process.env.DATABASE_URL = env.DATABASE_URL_TEST;
