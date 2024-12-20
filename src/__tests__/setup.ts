import { PrismaClient } from "@prisma/client";

// Create a test database connection
const prisma = new PrismaClient();

beforeAll(async () => {
  // Connect to the test database
  await prisma.$connect();
});

afterAll(async () => {
  // Disconnect after all tests
  await prisma.$disconnect();
});
