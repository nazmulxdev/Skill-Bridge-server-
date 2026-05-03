import "dotenv/config";

export const config = {
  port: process.env.PORT,
  db_url: process.env.DATABASE_URL,
  better_auth_secret: process.env.BETTER_AUTH_SECRET,
  better_auth_url: process.env.BETTER_AUTH_URL,
  frontend_url: process.env.FRONTEND_URL,
  backend_url: process.env.BACKEND_URL,
  node_env: process.env.NODE_ENV,
  openrouter_embedding_model: process.env.OPENROUTER_EMBEDING_MODEL,
  openrouter_api_key: process.env.OPENROUTER_API_KEY,
  openrouter_llm_model: process.env.OENROUTER_LLM_MODEL,
  redis_url: process.env.REDIS_URL,
  admin_email: process.env.ADMIN_EMAIL,
  admin_password: process.env.ADMIN_PASSWORD,
};
