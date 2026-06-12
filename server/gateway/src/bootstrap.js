import 'dotenv/config';

if (process.env.DB_HOST && process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL
    .replace('localhost', process.env.DB_HOST)
    .replace('5433', process.env.DB_PORT || '5432');
}

if (process.env.REDIS_HOST && process.env.REDIS_URL) {
  process.env.REDIS_URL = process.env.REDIS_URL
    .replace('localhost', process.env.REDIS_HOST)
    .replace('6379', process.env.REDIS_PORT || '6379');
}
