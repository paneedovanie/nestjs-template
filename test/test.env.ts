import { config } from 'dotenv';

const env: any = config().parsed;

process.env.DATABASE_URL = env.DATABASE_URL_TEST;
