import app from "./app";
import { config } from "./config";
import { prisma } from "./lib/prisma";

const port = config.port || 5000;

async function main() {
  try {
    await prisma.$connect();
    console.log("Database connect successfully.");

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
