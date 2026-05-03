import app from "./app";
import { config } from "./config";
import { prisma } from "./lib/prisma";
import { redisService } from "./lib/redis";
import { seedAdmin } from "./utils/seed";

const port = config.port || 5000;

async function main() {
  try {
    await prisma.$connect();
    await redisService.connect().catch(console.error);

    await seedAdmin();

    app.listen(port, () => {
      console.log("Server is running on the port :", port);
    });
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
