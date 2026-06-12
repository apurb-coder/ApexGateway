import 'dotenv/config';

if (process.env.DB_HOST && process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL
    .replace('localhost', process.env.DB_HOST)
    .replace('5433', process.env.DB_PORT || '5432');
}
