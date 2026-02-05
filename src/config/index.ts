import "dotenv/config";

export const config = {
  port: process.env.PORT,
  db_url: process.env.DATABASE_URL,
  better_auth_secret: process.env.BETTER_AUTH_SECRET,
  better_auth_url: process.env.BETTER_AUTH_URL,
  frontend_url: process.env.FRONTEND_URL,
  backend_url: process.env.BACKEND_URL,
  node_env: process.env.NODE_ENV,
};
