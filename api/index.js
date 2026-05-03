var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import { toNodeHandler } from "better-auth/node";
import express from "express";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": `generator client {
  provider = "prisma-client"
  output   = "../../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// auth schema

model User {
  id            String   @id
  name          String
  email         String
  emailVerified Boolean  @default(false)
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  role Role @default(STUDENT)

  status UserStatus @default(UNBANNED)

  sessions      Session[]
  accounts      Account[]
  tutorProfiles TutorProfile?
  bookings      Bookings[]
  reviews       Review[]

  @@unique([email])
  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}

// bookings schema

model Bookings {
  id             String  @id @default(uuid())
  studentId      String
  tutorProfileId String
  subjectId      String
  timeSlotId     String
  booking_price  Decimal @db.Decimal(10, 2)

  student User @relation(fields: [studentId], references: [id], onDelete: Cascade)

  tutorProfile TutorProfile @relation(fields: [tutorProfileId], references: [id], onDelete: Cascade)

  subject Subjects @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  timeSlot TutorTimeSlot @relation(fields: [timeSlotId], references: [id], onDelete: Cascade)

  status BookingStatus @default(PENDING)

  createdAt DateTime @default(now())
  review    Review?

  @@index([timeSlotId])
}

// tutor's schema

model TutorProfile {
  id String @id @default(uuid())

  userId String @unique

  hourlyRate Decimal @db.Decimal(10, 2)

  isFeatured Boolean @default(false)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  subjects TutorSubject[]

  createdAt      DateTime        @default(now())
  bookings       Bookings[]
  reviews        Review[]
  availabilities Availability[]
  education      Education[]
  tutorTimeSlots TutorTimeSlot[]
}

model TutorSubject {
  id              String       @id @default(uuid())
  subjectId       String
  subject         Subjects     @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  tutor_profileId String
  tutorProfile    TutorProfile @relation(fields: [tutor_profileId], references: [id], onDelete: Cascade)

  @@unique([tutor_profileId, subjectId])
}

model Availability {
  id             String       @id @default(uuid())
  tutorProfileId String
  dayOfWeek      DayOfWeek
  startTime      String
  endTime        String
  tutorProfile   TutorProfile @relation(fields: [tutorProfileId], references: [id], onDelete: Cascade)

  @@index([tutorProfileId])
}

model Education {
  id             String       @id @default(uuid())
  tutorProfileId String
  institute      String
  degree         String
  fieldOfStudy   String
  startYear      Int
  endYear        Int?
  isCurrent      Boolean      @default(false)
  tutorProfile   TutorProfile @relation(fields: [tutorProfileId], references: [id], onDelete: Cascade)

  @@index([tutorProfileId])
}

model TutorTimeSlot {
  id             String       @id @default(uuid())
  tutorProfileId String
  date           DateTime
  startTime      String
  endTime        String
  isBooked       Boolean      @default(false)
  tutorProfile   TutorProfile @relation(fields: [tutorProfileId], references: [id], onDelete: Cascade)
  bookings       Bookings[]

  createdAt DateTime @default(now())

  @@unique([tutorProfileId, date, startTime])
  @@index([tutorProfileId, date])
}

// category schema (done)

model Categories {
  id          String     @id @default(uuid())
  name        String     @unique @db.VarChar(225)
  description String     @db.Text
  createdAt   DateTime   @default(now())
  subjects    Subjects[]
}

// subject schema (done)

model Subjects {
  id          String     @id @default(uuid())
  name        String     @db.VarChar(225)
  category_id String
  category    Categories @relation(fields: [category_id], references: [id], onDelete: Cascade)

  createdAt     DateTime       @default(now())
  tutorSubjects TutorSubject[]
  bookings      Bookings[]

  @@unique([name, category_id])
}

// review schema 

model Review {
  id             String       @id @default(ulid())
  bookingId      String       @unique
  studentId      String
  tutorProfileId String
  rating         Decimal      @db.Decimal(3, 2)
  comment        String?
  booking        Bookings     @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  student        User         @relation(fields: [studentId], references: [id], onDelete: Cascade)
  tutorProfile   TutorProfile @relation(fields: [tutorProfileId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
}

// document embedding

model DocumentEmbedding {
  id          String                      @id @default(uuid())
  chunkKey    String                      @unique
  sourceType  String
  sourceId    String
  sourceLabel String?
  content     String
  metadata    Json?                       @default("{}")
  embedding   Unsupported("vector(2048)")
  isDeleted   Boolean                     @default(false)
  deletedAt   DateTime?
  createdAt   DateTime                    @default(now())
  updatedAt   DateTime                    @updatedAt

  @@index([sourceType])
  @@index([isDeleted])
  @@map("document_embeddings")
}

enum DayOfWeek {
  SUNDAY
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
}

enum BookingStatus {
  PENDING
  CONFIRM
  CANCELLED
  COMPLETE
}

enum Role {
  STUDENT
  TUTOR
  ADMIN
}

enum UserStatus {
  BANNED
  UNBANNED
}
`,
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"tutorProfiles","kind":"object","type":"TutorProfile","relationName":"TutorProfileToUser"},{"name":"bookings","kind":"object","type":"Bookings","relationName":"BookingsToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Bookings":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"subjectId","kind":"scalar","type":"String"},{"name":"timeSlotId","kind":"scalar","type":"String"},{"name":"booking_price","kind":"scalar","type":"Decimal"},{"name":"student","kind":"object","type":"User","relationName":"BookingsToUser"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"BookingsToTutorProfile"},{"name":"subject","kind":"object","type":"Subjects","relationName":"BookingsToSubjects"},{"name":"timeSlot","kind":"object","type":"TutorTimeSlot","relationName":"BookingsToTutorTimeSlot"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"review","kind":"object","type":"Review","relationName":"BookingsToReview"}],"dbName":null},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"hourlyRate","kind":"scalar","type":"Decimal"},{"name":"isFeatured","kind":"scalar","type":"Boolean"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfileToUser"},{"name":"subjects","kind":"object","type":"TutorSubject","relationName":"TutorProfileToTutorSubject"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"bookings","kind":"object","type":"Bookings","relationName":"BookingsToTutorProfile"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToTutorProfile"},{"name":"availabilities","kind":"object","type":"Availability","relationName":"AvailabilityToTutorProfile"},{"name":"education","kind":"object","type":"Education","relationName":"EducationToTutorProfile"},{"name":"tutorTimeSlots","kind":"object","type":"TutorTimeSlot","relationName":"TutorProfileToTutorTimeSlot"}],"dbName":null},"TutorSubject":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"subjectId","kind":"scalar","type":"String"},{"name":"subject","kind":"object","type":"Subjects","relationName":"SubjectsToTutorSubject"},{"name":"tutor_profileId","kind":"scalar","type":"String"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToTutorSubject"}],"dbName":null},"Availability":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"dayOfWeek","kind":"enum","type":"DayOfWeek"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"AvailabilityToTutorProfile"}],"dbName":null},"Education":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"institute","kind":"scalar","type":"String"},{"name":"degree","kind":"scalar","type":"String"},{"name":"fieldOfStudy","kind":"scalar","type":"String"},{"name":"startYear","kind":"scalar","type":"Int"},{"name":"endYear","kind":"scalar","type":"Int"},{"name":"isCurrent","kind":"scalar","type":"Boolean"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"EducationToTutorProfile"}],"dbName":null},"TutorTimeSlot":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"isBooked","kind":"scalar","type":"Boolean"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToTutorTimeSlot"},{"name":"bookings","kind":"object","type":"Bookings","relationName":"BookingsToTutorTimeSlot"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Categories":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"subjects","kind":"object","type":"Subjects","relationName":"CategoriesToSubjects"}],"dbName":null},"Subjects":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"category_id","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Categories","relationName":"CategoriesToSubjects"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"tutorSubjects","kind":"object","type":"TutorSubject","relationName":"SubjectsToTutorSubject"},{"name":"bookings","kind":"object","type":"Bookings","relationName":"BookingsToSubjects"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Decimal"},{"name":"comment","kind":"scalar","type":"String"},{"name":"booking","kind":"object","type":"Bookings","relationName":"BookingsToReview"},{"name":"student","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"ReviewToTutorProfile"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"DocumentEmbedding":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"chunkKey","kind":"scalar","type":"String"},{"name":"sourceType","kind":"scalar","type":"String"},{"name":"sourceId","kind":"scalar","type":"String"},{"name":"sourceLabel","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"metadata","kind":"scalar","type":"Json"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"document_embeddings"}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  AvailabilityScalarFieldEnum: () => AvailabilityScalarFieldEnum,
  BookingsScalarFieldEnum: () => BookingsScalarFieldEnum,
  CategoriesScalarFieldEnum: () => CategoriesScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  DocumentEmbeddingScalarFieldEnum: () => DocumentEmbeddingScalarFieldEnum,
  EducationScalarFieldEnum: () => EducationScalarFieldEnum,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  SubjectsScalarFieldEnum: () => SubjectsScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  TutorProfileScalarFieldEnum: () => TutorProfileScalarFieldEnum,
  TutorSubjectScalarFieldEnum: () => TutorSubjectScalarFieldEnum,
  TutorTimeSlotScalarFieldEnum: () => TutorTimeSlotScalarFieldEnum,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.3.0",
  engine: "9d6ad21cbbceab97458517b147a6a09ff43aa735"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Bookings: "Bookings",
  TutorProfile: "TutorProfile",
  TutorSubject: "TutorSubject",
  Availability: "Availability",
  Education: "Education",
  TutorTimeSlot: "TutorTimeSlot",
  Categories: "Categories",
  Subjects: "Subjects",
  Review: "Review",
  DocumentEmbedding: "DocumentEmbedding"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  role: "role",
  status: "status"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var BookingsScalarFieldEnum = {
  id: "id",
  studentId: "studentId",
  tutorProfileId: "tutorProfileId",
  subjectId: "subjectId",
  timeSlotId: "timeSlotId",
  booking_price: "booking_price",
  status: "status",
  createdAt: "createdAt"
};
var TutorProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  hourlyRate: "hourlyRate",
  isFeatured: "isFeatured",
  createdAt: "createdAt"
};
var TutorSubjectScalarFieldEnum = {
  id: "id",
  subjectId: "subjectId",
  tutor_profileId: "tutor_profileId"
};
var AvailabilityScalarFieldEnum = {
  id: "id",
  tutorProfileId: "tutorProfileId",
  dayOfWeek: "dayOfWeek",
  startTime: "startTime",
  endTime: "endTime"
};
var EducationScalarFieldEnum = {
  id: "id",
  tutorProfileId: "tutorProfileId",
  institute: "institute",
  degree: "degree",
  fieldOfStudy: "fieldOfStudy",
  startYear: "startYear",
  endYear: "endYear",
  isCurrent: "isCurrent"
};
var TutorTimeSlotScalarFieldEnum = {
  id: "id",
  tutorProfileId: "tutorProfileId",
  date: "date",
  startTime: "startTime",
  endTime: "endTime",
  isBooked: "isBooked",
  createdAt: "createdAt"
};
var CategoriesScalarFieldEnum = {
  id: "id",
  name: "name",
  description: "description",
  createdAt: "createdAt"
};
var SubjectsScalarFieldEnum = {
  id: "id",
  name: "name",
  category_id: "category_id",
  createdAt: "createdAt"
};
var ReviewScalarFieldEnum = {
  id: "id",
  bookingId: "bookingId",
  studentId: "studentId",
  tutorProfileId: "tutorProfileId",
  rating: "rating",
  comment: "comment",
  createdAt: "createdAt"
};
var DocumentEmbeddingScalarFieldEnum = {
  id: "id",
  chunkKey: "chunkKey",
  sourceType: "sourceType",
  sourceId: "sourceId",
  sourceLabel: "sourceLabel",
  content: "content",
  metadata: "metadata",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/config/index.ts
import "dotenv/config";
var config2 = {
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
  admin_password: process.env.ADMIN_PASSWORD
};

// src/lib/auth.ts
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  secret: config2.better_auth_secret,
  baseURL: "https://skill-bridge-frontend-v3.vercel.app",
  trustedOrigins: [
    "https://skill-bridge-frontend-v3.vercel.app",
    config2.frontend_url,
    config2.backend_url
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false
  },
  user: {
    additionalFields: {
      role: {
        type: "string"
      },
      status: {
        type: "string"
      }
    }
  }
});

// src/app.ts
import cors from "cors";

// src/modules/tutor/tutor.route.ts
import { Router } from "express";

// generated/prisma/enums.ts
var BookingStatus = {
  PENDING: "PENDING",
  CONFIRM: "CONFIRM",
  CANCELLED: "CANCELLED",
  COMPLETE: "COMPLETE"
};
var Role = {
  STUDENT: "STUDENT",
  TUTOR: "TUTOR",
  ADMIN: "ADMIN"
};
var UserStatus = {
  BANNED: "BANNED",
  UNBANNED: "UNBANNED"
};

// src/middlewares/authMiddleware.ts
import { fromNodeHeaders } from "better-auth/node";

// src/utils/AppErrors.ts
var AppError = class extends Error {
  statusCode;
  code;
  details;
  isOperational;
  constructor(statusCode, message, code, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};
var AppErrors_default = AppError;

// src/utils/catchAsync.ts
var catchAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
var catchAsync_default = catchAsync;

// src/middlewares/authMiddleware.ts
var authMiddleware = (...roles) => {
  return catchAsync_default(async (req, res, next) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });
    console.log(session);
    if (!session) {
      throw new AppErrors_default(
        401,
        "You are not authorized.",
        "Auth session failed",
        [
          {
            field: "Authentication",
            message: "You have to create account or login first."
          }
        ]
      );
    }
    if (roles.length && !roles.includes(session.user.role)) {
      throw new AppErrors_default(403, "Unauthorized access.", "Invalid request", [
        {
          field: "Authentication",
          message: "Please use valid identity token for access."
        }
      ]);
    }
    if (session.user.status === UserStatus.BANNED) {
      throw new AppErrors_default(
        403,
        "Your account has been banned by admin.",
        "ACCOUNT_BANNED",
        [
          {
            field: "Authentication",
            message: "You are not allowed to access the system. Please contact support."
          }
        ]
      );
    }
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      status: session.user.status
    };
    next();
  });
};
var authMiddleware_default = authMiddleware;

// src/utils/AppResponse.ts
var AppResponse = (res, payload) => {
  const { statusCode, success, message, data, path: path2 } = payload;
  return res.status(statusCode).json({ success, message, data, path: path2 });
};
var AppResponse_default = AppResponse;

// src/modules/tutor/tutor.service.ts
var isValidTimeFormat = (time) => {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
};
var isValidTimeRange = (startTime, endTime) => {
  const start = /* @__PURE__ */ new Date(`1970-01-01T${startTime}:00`);
  const end = /* @__PURE__ */ new Date(`1970-01-01T${endTime}:00`);
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return false;
  }
  return start < end;
};
var timeToMinutes = (time) => {
  const match = time.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    throw new AppErrors_default(400, "Invalid time format", "INVALID_TIME_FORMAT", [
      { field: "time", message: "Use HH:mm (00:00\u201323:59)" }
    ]);
  }
  const [, h, m] = match;
  return Number(h) * 60 + Number(m);
};
var getDayOfWeek = (date) => {
  const map = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY"
  ];
  return map[date.getUTCDay()];
};
var createTutorProfile = async (payload) => {
  if (!payload.hourlyRate || payload.hourlyRate <= 0) {
    throw new AppErrors_default(
      400,
      "Hourly rate must be greater than zero.",
      "Invalid_Hourly_Rate",
      [
        {
          field: "Tutor profile create.",
          message: "Please provide a valid hourly rate."
        }
      ]
    );
  }
  const isExistUser = await prisma.user.findUnique({
    where: {
      id: payload.userId
    },
    select: {
      status: true,
      role: true,
      tutorProfiles: true
    }
  });
  console.log(isExistUser);
  if (!isExistUser) {
    throw new AppErrors_default(404, "No user found with this id.", "Invalid_User_Id", [
      {
        field: "Tutor profile create.",
        message: "Please provide a valid user id."
      }
    ]);
  }
  if (isExistUser.tutorProfiles) {
    throw new AppErrors_default(
      409,
      "Tutor profile already exists.",
      "Tutor_Profile_Exists",
      [
        {
          field: "Tutor profile create.",
          message: "You have already created tutor profile. You can update your profile."
        }
      ]
    );
  }
  const result = await prisma.tutorProfile.create({
    data: {
      userId: payload.userId,
      hourlyRate: payload.hourlyRate
    }
  });
  return result;
};
var updateTutorHourlyRate = async (payload) => {
  if (!payload.hourlyRate || payload.hourlyRate <= 0) {
    throw new AppErrors_default(
      400,
      "Hourly rate must be greater than zero.",
      "Invalid_Hourly_Rate",
      [
        {
          field: "Tutor Hourly rate update.",
          message: "Please provide a valid hourly rate."
        }
      ]
    );
  }
  const isExistUser = await prisma.user.findUnique({
    where: {
      id: payload.userId
    },
    select: {
      status: true,
      role: true,
      tutorProfiles: true
    }
  });
  console.log(isExistUser);
  if (!isExistUser) {
    throw new AppErrors_default(404, "No user found with this id.", "Invalid_User_Id", [
      {
        field: "Tutor hourly rate update.",
        message: "Please provide a valid user id."
      }
    ]);
  }
  if (!isExistUser.tutorProfiles) {
    throw new AppErrors_default(
      409,
      "Tutor profile currently not exists.",
      "Tutor_Profile_Not_Exists",
      [
        {
          field: "Tutor hourly rate update.",
          message: "You have not created any tutor profile. Please, create tutor profile first."
        }
      ]
    );
  }
  const result = await prisma.tutorProfile.update({
    where: {
      userId: payload.userId,
      id: isExistUser.tutorProfiles.id
    },
    data: {
      hourlyRate: payload.hourlyRate
    }
  });
  return result;
};
var addTutorSubjects = async (userId, subjectIds) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId
    }
  });
  if (!tutorProfile) {
    throw new AppErrors_default(
      404,
      "Tutor profile not found",
      "Missing_tutor_profile",
      [
        {
          field: "Add tutor subject",
          message: "Please use authorized tutor id."
        }
      ]
    );
  }
  console.log(tutorProfile);
  const validSubjects = await prisma.subjects.findMany({
    where: { id: { in: subjectIds } },
    select: {
      id: true
    }
  });
  const validSubjectIds = validSubjects.map((sub) => sub.id);
  const invalidSubjectIds = subjectIds.filter(
    (id) => !validSubjectIds.includes(id)
  );
  if (invalidSubjectIds.length > 0) {
    throw new AppErrors_default(
      400,
      "Some subject ids are invalid.",
      "Invalid_Subject_Id",
      invalidSubjectIds.map((id) => ({
        field: "subjectId",
        message: `Invalid subject id: ${id}`
      }))
    );
  }
  const existingSubjects = await prisma.tutorSubject.findMany({
    where: {
      tutor_profileId: tutorProfile.id,
      subjectId: { in: validSubjectIds }
    },
    select: {
      subjectId: true
    }
  });
  const existingIds = existingSubjects.map((e) => e.subjectId);
  const newSubjectIds = validSubjectIds.filter(
    (id) => !existingIds.includes(id)
  );
  if (newSubjectIds.length === 0) {
    throw new AppErrors_default(
      409,
      "All subjects already added.",
      "Duplicate_Tutor_Subject",
      existingIds.map((id) => ({
        field: "subjectId",
        message: `Subject already added: ${id}`
      }))
    );
  }
  const result = await prisma.tutorSubject.createMany({
    data: newSubjectIds.map((subjectId) => ({
      tutor_profileId: tutorProfile.id,
      subjectId
    })),
    skipDuplicates: true
  });
  return result;
};
var removeSubject = async (userId, subjectId) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId
    },
    select: {
      id: true
    }
  });
  if (!tutorProfile) {
    throw new AppErrors_default(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Delete subject of tutor",
          message: "Please user tutor profile to delete subject."
        }
      ]
    );
  }
  const tutorSubject = await prisma.tutorSubject.findFirst({
    where: {
      tutor_profileId: tutorProfile.id,
      subjectId
    }
  });
  if (!tutorSubject) {
    throw new AppErrors_default(
      404,
      "Subject not found in your profile",
      "Subject_Not_Assigned",
      [
        {
          field: "Delete subject of tutor",
          message: "Subject is not exist in your profile."
        }
      ]
    );
  }
  const bookingExists = await prisma.bookings.findFirst({
    where: {
      tutorProfileId: tutorProfile.id,
      subjectId
    }
  });
  if (bookingExists?.status == BookingStatus.CONFIRM) {
    throw new AppErrors_default(
      409,
      "Subject cannot be removed due to active bookings",
      "Subject_In_Use",
      [
        {
          field: "Delete subject of tutor.",
          message: "There is an active booking agreement"
        }
      ]
    );
  }
  const result = await prisma.tutorSubject.delete({
    where: {
      id: tutorSubject.id
    }
  });
  return result;
};
var addEducation = async (userId, payload) => {
  if (payload.endYear && payload.startYear > payload.endYear) {
    throw new AppErrors_default(
      400,
      "startYear cannot be greater than endYear",
      "Invalid_Education_Years"
    );
  }
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId
    },
    select: {
      id: true
    }
  });
  if (!tutorProfile) {
    throw new AppErrors_default(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor education",
          message: "Please user tutor profile add education."
        }
      ]
    );
  }
  const result = await prisma.education.create({
    data: {
      tutorProfileId: tutorProfile.id,
      ...payload
    }
  });
  return result;
};
var updateEducation = async (userId, educationId, payload) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId
    },
    select: {
      id: true
    }
  });
  if (!tutorProfile) {
    throw new AppErrors_default(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor education Update",
          message: "Please user tutor profile to update education."
        }
      ]
    );
  }
  const education = await prisma.education.findUnique({
    where: {
      id: educationId
    }
  });
  if (!education || education.tutorProfileId !== tutorProfile.id) {
    throw new AppErrors_default(
      404,
      "Education not found for this tutor of this id",
      "Education_Not_found",
      [
        {
          field: "Tutor education update",
          message: "Please use valid education profile id. "
        }
      ]
    );
  }
  const result = await prisma.education.update({
    where: {
      id: educationId
    },
    data: payload
  });
  return result;
};
var deleteEducation = async (userId, educationId) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId
    },
    select: {
      id: true
    }
  });
  if (!tutorProfile) {
    throw new AppErrors_default(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor education Delete",
          message: "Please user tutor profile to delete education."
        }
      ]
    );
  }
  const education = await prisma.education.findUnique({
    where: {
      id: educationId
    }
  });
  if (!education || education.tutorProfileId !== tutorProfile.id) {
    throw new AppErrors_default(
      404,
      "Education not found for this tutor",
      "Education_Not_found",
      [
        {
          field: "Tutor education Delete",
          message: "Please use valid education profile id. "
        }
      ]
    );
  }
  const result = await prisma.education.delete({
    where: {
      id: educationId
    }
  });
  return result;
};
var addAvailability = async (userId, payload) => {
  if (!isValidTimeRange(payload.startTime, payload.endTime)) {
    throw new AppErrors_default(
      400,
      "Invalid time format or range",
      "Invalid_Time_Range",
      [
        {
          field: "time",
          message: "Time must be in HH:mm format (e.g. 10:00) and startTime must be earlier than endTime"
        }
      ]
    );
  }
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId
    },
    select: {
      id: true
    }
  });
  if (!tutorProfile) {
    throw new AppErrors_default(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor Availability",
          message: "Please user tutor profile to add availabilities."
        }
      ]
    );
  }
  const result = await prisma.availability.create({
    data: {
      tutorProfileId: tutorProfile.id,
      ...payload
    }
  });
  return result;
};
var updateAvailability = async (userId, availabilityId, payload) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId
    },
    select: {
      id: true
    }
  });
  if (!tutorProfile) {
    throw new AppErrors_default(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor Availability",
          message: "Please user tutor profile to update availability."
        }
      ]
    );
  }
  const availability = await prisma.availability.findUnique({
    where: {
      id: availabilityId
    }
  });
  if (!availability || availability.tutorProfileId !== tutorProfile.id) {
    throw new AppErrors_default(
      404,
      "Availability not found for this tutor",
      "Availability_Not_Found",
      [
        {
          field: "Tutor Availability",
          message: "Tutor availability not found on this id.."
        }
      ]
    );
  }
  const finalStartTime = payload.startTime ?? availability.startTime;
  const finalEndTime = payload.endTime ?? availability.endTime;
  if (!isValidTimeRange(finalStartTime, finalEndTime)) {
    throw new AppErrors_default(400, "Invalid time range", "Invalid_Time_Range", [
      {
        field: "time",
        message: "startTime must be earlier than endTime"
      }
    ]);
  }
  const result = await prisma.availability.update({
    where: {
      id: availabilityId
    },
    data: payload
  });
  return result;
};
var deleteAvailability = async (userId, availabilityId) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId
    },
    select: {
      id: true
    }
  });
  if (!tutorProfile) {
    throw new AppErrors_default(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor Availability",
          message: "Please user tutor profile to update availability."
        }
      ]
    );
  }
  const availability = await prisma.availability.findUnique({
    where: {
      id: availabilityId
    }
  });
  if (!availability || availability.tutorProfileId !== tutorProfile.id) {
    throw new AppErrors_default(
      404,
      "Availability not found for this tutor",
      "Availability_Not_Found",
      [
        {
          field: "Tutor Availability",
          message: "Tutor availability not found on this id.."
        }
      ]
    );
  }
  const result = await prisma.availability.delete({
    where: {
      id: availabilityId
    }
  });
  return result;
};
var createTutorTimeSlot = async (userId, payload) => {
  const slotDate = typeof payload.date === "string" ? new Date(payload.date) : payload.date;
  if (isNaN(slotDate.getTime())) {
    throw new AppErrors_default(400, "Invalid date format", "INVALID_DATE", [
      {
        field: "date",
        message: "Date must be a valid ISO date string (YYYY-MM-DD)"
      }
    ]);
  }
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId
    },
    select: {
      id: true
    }
  });
  if (!tutorProfile) {
    throw new AppErrors_default(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor Time slot ",
          message: "Please user tutor profile to create time slot."
        }
      ]
    );
  }
  const slotStart = timeToMinutes(payload.startTime);
  const slotEnd = timeToMinutes(payload.endTime);
  if (slotStart >= slotEnd) {
    throw new AppErrors_default(400, "Invalid time range", "Invalid_Time_Range", [
      {
        field: "time",
        message: "startTime must be earlier than endTime"
      }
    ]);
  }
  const dayOfWeek = getDayOfWeek(slotDate);
  console.log(dayOfWeek);
  const availabilities = await prisma.availability.findMany({
    where: {
      tutorProfileId: tutorProfile.id,
      dayOfWeek
    }
  });
  if (availabilities.length === 0) {
    throw new AppErrors_default(
      404,
      "Tutor is not availability on this day",
      "Availability_Not_Found",
      [
        {
          field: "Tutor Time slot",
          message: `Tutor availability not found for this ${payload.date} date (${dayOfWeek}).`
        }
      ]
    );
  }
  const fitsAvailability = availabilities.some((a) => {
    const availStart = timeToMinutes(a.startTime);
    const availEnd = timeToMinutes(a.endTime);
    return slotStart >= availStart && slotEnd <= availEnd;
  });
  if (!fitsAvailability) {
    throw new AppErrors_default(
      400,
      "Time slot outside availability",
      "OUTSIDE_AVAILABILITY",
      [
        {
          field: "Tutor Time slot",
          message: `Tutor availability time is not exist from ${payload.startTime} to ${payload.endTime} on this ${payload.date} date (${dayOfWeek}).`
        }
      ]
    );
  }
  const overlappingSlot = await prisma.tutorTimeSlot.findFirst({
    where: {
      tutorProfileId: tutorProfile.id,
      date: slotDate,
      NOT: {
        OR: [
          { endTime: { lte: payload.startTime } },
          { startTime: { gte: payload.endTime } }
        ]
      }
    }
  });
  if (overlappingSlot) {
    throw new AppErrors_default(
      409,
      "Time slot overlaps with existing slot",
      "SLOT_OVERLAP",
      [
        {
          field: "Tutor Time slot",
          message: `There is also an exist slot between this time ${payload.startTime} to ${payload.endTime} on this ${payload.date} date (${dayOfWeek}).`
        }
      ]
    );
  }
  const result = await prisma.tutorTimeSlot.create({
    data: {
      tutorProfileId: tutorProfile.id,
      date: slotDate,
      startTime: payload.startTime,
      endTime: payload.endTime
    }
  });
  return result;
};
var updateTimeSlot = async (userId, timeSlotId, payload) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId
    },
    select: {
      id: true
    }
  });
  if (!tutorProfile) {
    throw new AppErrors_default(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor Time slot ",
          message: "Please user tutor profile to update time slot."
        }
      ]
    );
  }
  const existTimeSlot = await prisma.tutorTimeSlot.findUnique({
    where: {
      id: timeSlotId
    }
  });
  if (!existTimeSlot || existTimeSlot.tutorProfileId !== tutorProfile.id) {
    throw new AppErrors_default(
      404,
      "Time Slot not found for this tutor",
      "TimeSlot_Not_Found",
      [
        {
          field: "Tutor Time Slot.",
          message: "Tutor Time slot not found for this id."
        }
      ]
    );
  }
  const finalDate = payload.date ? new Date(payload.date) : existTimeSlot.date;
  const finalStartTime = payload.startTime ?? existTimeSlot.startTime;
  const finalEndTime = payload.endTime ?? existTimeSlot.endTime;
  if (isNaN(new Date(finalDate).getTime())) {
    throw new AppErrors_default(400, "Invalid date format", "INVALID_DATE", [
      {
        field: "date",
        message: "Date must be a valid ISO date string (YYYY-MM-DD)"
      }
    ]);
  }
  const slotStart = timeToMinutes(finalStartTime);
  const slotEnd = timeToMinutes(finalEndTime);
  if (slotStart >= slotEnd) {
    throw new AppErrors_default(400, "Invalid time range", "Invalid_Time_Range", [
      {
        field: "time",
        message: "startTime must be earlier than endTime"
      }
    ]);
  }
  const dayOfWeek = getDayOfWeek(new Date(finalDate));
  const availabilities = await prisma.availability.findMany({
    where: {
      tutorProfileId: tutorProfile.id,
      dayOfWeek
    }
  });
  if (availabilities.length === 0) {
    throw new AppErrors_default(
      404,
      "Availability not found for this day",
      "Availability_Not_Found",
      [
        {
          field: "Tutor Time slot",
          message: `Tutor availability not found for this ${payload.date} date (${dayOfWeek}).`
        }
      ]
    );
  }
  const fitsAvailability = availabilities.some((a) => {
    const availStart = timeToMinutes(a.startTime);
    const availEnd = timeToMinutes(a.endTime);
    return slotStart >= availStart && slotEnd <= availEnd;
  });
  if (!fitsAvailability) {
    throw new AppErrors_default(
      400,
      "Time slot outside availability",
      "OUTSIDE_AVAILABILITY",
      [
        {
          field: "Tutor Time slot",
          message: `Tutor availability time is not exist from ${payload.startTime} to ${payload.endTime} on this ${payload?.date} date (${dayOfWeek}).`
        }
      ]
    );
  }
  const overlappingSlot = await prisma.tutorTimeSlot.findFirst({
    where: {
      tutorProfileId: tutorProfile.id,
      date: finalDate,
      id: { not: timeSlotId },
      NOT: {
        OR: [
          { endTime: { lte: finalStartTime } },
          { startTime: { gte: finalEndTime } }
        ]
      }
    }
  });
  if (overlappingSlot) {
    throw new AppErrors_default(
      409,
      "Time slot overlaps with existing slot",
      "SLOT_OVERLAP",
      [
        {
          field: "Tutor Time slot",
          message: `There is also an exist slot between this time ${payload?.startTime} to ${payload.endTime} on this ${payload.date} date (${dayOfWeek}).`
        }
      ]
    );
  }
  const result = await prisma.tutorTimeSlot.update({
    where: { id: timeSlotId },
    data: {
      date: finalDate,
      startTime: finalStartTime,
      endTime: finalEndTime
    }
  });
  return result;
};
var deleteTutorSlot = async (userId, timeSlotId) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId
    },
    select: {
      id: true
    }
  });
  if (!tutorProfile) {
    throw new AppErrors_default(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor Time slot ",
          message: "Please user tutor profile to delete time slot."
        }
      ]
    );
  }
  const existTimeSlot = await prisma.tutorTimeSlot.findUnique({
    where: {
      id: timeSlotId
    }
  });
  if (!existTimeSlot || existTimeSlot.tutorProfileId !== tutorProfile.id) {
    throw new AppErrors_default(
      404,
      "Time Slot not found for this tutor",
      "TimeSlot_Not_Found",
      [
        {
          field: "Tutor Time Slot.",
          message: "Tutor Time slot not found for this id."
        }
      ]
    );
  }
  if (existTimeSlot.isBooked) {
    throw new AppErrors_default(
      409,
      "Time slot already booked",
      "TimeSlot_Already_Booked",
      [
        {
          field: "Tutor Time Slot",
          message: "You cannot delete this time slot because it has an active booking."
        }
      ]
    );
  }
  const result = await prisma.tutorTimeSlot.delete({
    where: {
      id: timeSlotId
    }
  });
  return result;
};
var confirmBooking = async (userId, bookingId) => {
  const booking = await prisma.bookings.findUnique({
    where: {
      id: bookingId
    },
    include: {
      tutorProfile: {
        include: {
          user: true
        }
      },
      student: true
    }
  });
  if (!booking) {
    throw new AppErrors_default(404, "Booking not found", "Booking_Not_Found", [
      {
        field: "Confirm Booking",
        message: "Please user proper booking id to confirm."
      }
    ]);
  }
  if (booking.status !== BookingStatus.PENDING) {
    throw new AppErrors_default(
      404,
      "Only pending booking can be confirm",
      "INVALID_BOOKING_STATUS",
      [
        {
          field: "Confirm Booking",
          message: "Please user proper booking status to confirm."
        }
      ]
    );
  }
  if (booking.tutorProfile.userId !== userId) {
    throw new AppErrors_default(
      403,
      "You are not allowed to confirm this booking",
      "NOT_AUTHORIZED"
    );
  }
  if (booking.tutorProfile.user.status === UserStatus.BANNED) {
    throw new AppErrors_default(403, "Tutor account is banned.", "ACCOUNT_BANNED", [
      {
        field: "Authentication",
        message: "You are not allowed to access the system. Please contact support."
      }
    ]);
  }
  if (booking.student.status === UserStatus.BANNED) {
    throw new AppErrors_default(403, "Student account is banned.", "ACCOUNT_BANNED", [
      {
        field: "Authentication",
        message: "This student has been banned by admin."
      }
    ]);
  }
  const updatedBooking = await prisma.bookings.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CONFIRM }
  });
  return updatedBooking;
};
var cancelBooking = async (userId, bookingId) => {
  return prisma.$transaction(async (txx) => {
    const booking = await txx.bookings.findUnique({
      where: {
        id: bookingId
      },
      include: {
        timeSlot: true
      }
    });
    if (!booking) {
      throw new AppErrors_default(404, "Booking not found.", "Booking_NOt_Found", [
        {
          field: "Booking slot",
          message: "Please  provide valid booking id."
        }
      ]);
    }
    if (booking.tutorProfileId !== userId) {
      throw new AppErrors_default(403, "Unauthorized access", "UNAUTHORIZED", [
        {
          field: "Cancel Booking",
          message: "You are not authorized to cancel this booking slot"
        }
      ]);
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new AppErrors_default(
        400,
        "Booking already cancelled",
        "ALREADY_CANCELLED",
        [
          {
            field: "Cancel Booking",
            message: "You are not authorized to cancel this booking slot"
          }
        ]
      );
    }
    if (booking.status === BookingStatus.CONFIRM) {
      throw new AppErrors_default(
        400,
        "Booking has been confirmed by tutor.",
        "BOOKING_CONFIRMED",
        [
          {
            field: "Cancel Booking",
            message: "You are not authorized to cancel this booking slot because of tutor already confirmed this booking"
          }
        ]
      );
    }
    if (booking.status === BookingStatus.COMPLETE) {
      throw new AppErrors_default(
        400,
        "Completed booking cannot be cancelled",
        "CANNOT_CANCEL_COMPLETE",
        [
          {
            field: "Cancel Booking",
            message: "You are not authorized to cancel this booking slot because booking has already been completed."
          }
        ]
      );
    }
    const result = await txx.bookings.update({
      where: {
        id: bookingId
      },
      data: {
        status: BookingStatus.CANCELLED
      }
    });
    await txx.tutorTimeSlot.update({
      where: {
        id: booking.timeSlotId
      },
      data: {
        isBooked: false
      }
    });
    return result;
  });
};
var completeBooking = async (userId, bookingId) => {
  const booking = await prisma.bookings.findUnique({
    where: {
      id: bookingId
    },
    include: {
      tutorProfile: {
        include: { user: true }
      },
      student: true
    }
  });
  if (!booking) {
    throw new AppErrors_default(404, "Booking not found", "Booking_Not_Found", [
      {
        field: "Complete Booking",
        message: "Please user proper booking id to complete."
      }
    ]);
  }
  if (booking.status !== BookingStatus.CONFIRM) {
    throw new AppErrors_default(
      404,
      "Only confirm booking can be complete",
      "INVALID_BOOKING_STATUS",
      [
        {
          field: "Confirm Booking",
          message: "Please user proper booking status to complete booking."
        }
      ]
    );
  }
  if (booking.tutorProfile.userId !== userId) {
    throw new AppErrors_default(
      403,
      "You are not allowed to confirm this booking",
      "NOT_AUTHORIZED"
    );
  }
  if (booking.tutorProfile.user.status === UserStatus.BANNED) {
    throw new AppErrors_default(403, "Tutor account is banned.", "ACCOUNT_BANNED", [
      {
        field: "Authentication",
        message: "You are not allowed to access the system. Please contact support."
      }
    ]);
  }
  if (booking.student.status === UserStatus.BANNED) {
    throw new AppErrors_default(403, "Student account is banned.", "ACCOUNT_BANNED", [
      {
        field: "Authentication",
        message: "This student has been banned by admin."
      }
    ]);
  }
  const updatedBooking = await prisma.bookings.update({
    where: { id: bookingId },
    data: { status: BookingStatus.COMPLETE }
  });
  return updatedBooking;
};
var getTutorProfile = async (userId) => {
  const tutorProfile = await prisma.user.findUnique({
    where: {
      id: userId
    },
    include: {
      tutorProfiles: {
        include: {
          subjects: {
            include: {
              subject: {
                include: {
                  category: true
                }
              }
            }
          },
          education: true,
          availabilities: true,
          tutorTimeSlots: true,
          bookings: {
            include: {
              student: true,
              subject: true,
              timeSlot: true,
              review: true
            }
          },
          reviews: true
        }
      }
    }
  });
  console.log(tutorProfile);
  if (!tutorProfile) {
    throw new AppErrors_default(404, "No user found with this id.", "Invalid_User_Id", [
      {
        field: "Tutor profile create.",
        message: "Please provide a valid user id."
      }
    ]);
  }
  return tutorProfile;
};
var tutorService = {
  createTutorProfile,
  updateTutorHourlyRate,
  addTutorSubjects,
  removeSubject,
  addEducation,
  updateEducation,
  deleteEducation,
  addAvailability,
  updateAvailability,
  deleteAvailability,
  createTutorTimeSlot,
  updateTimeSlot,
  deleteTutorSlot,
  confirmBooking,
  cancelBooking,
  completeBooking,
  getTutorProfile
};

// src/modules/tutor/tutor.controller.ts
var createTutorProfile2 = catchAsync_default(async (req, res) => {
  const userId = req?.user?.id;
  const role = req?.user?.role;
  const { hourlyRate } = req?.body;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor profile creation",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (typeof hourlyRate !== "number") {
    throw new AppErrors_default(
      400,
      "Invalid hourly rate type",
      "Invalid_HourlyRate_Type",
      [
        {
          field: "Tutor profile creation",
          message: "Please give valid type of hourly rate."
        }
      ]
    );
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor profile creation",
          message: "Only tutor role can create tutor profile."
        }
      ]
    );
  }
  const result = await tutorService.createTutorProfile({
    userId,
    hourlyRate
  });
  console.log(result);
  return AppResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Tutor profile created successfully.",
    data: result
  });
});
var updateHourlyRate = catchAsync_default(async (req, res) => {
  const userId = req?.user?.id;
  const role = req?.user?.role;
  const { hourlyRate } = req?.body;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Hourly rate update.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (typeof hourlyRate !== "number") {
    throw new AppErrors_default(
      400,
      "Invalid hourly rate type",
      "Invalid_HourlyRate_Type",
      [
        {
          field: "Tutor Hourly rate update.",
          message: "Please give valid type of hourly rate."
        }
      ]
    );
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor hourly rate update.",
          message: "Only tutor role can create tutor profile."
        }
      ]
    );
  }
  const result = await tutorService.updateTutorHourlyRate({
    userId,
    hourlyRate
  });
  console.log(result);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Tutor hourly rate update  successfully.",
    data: result
  });
});
var addTutorSubjects2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const { subjects } = req.body;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor subjects addition.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor Subjects.",
          message: "Only tutor role can add subjects in their table."
        }
      ]
    );
  }
  if (!Array.isArray(subjects) || subjects.length === 0) {
    throw new AppErrors_default(
      400,
      "Subject ids must be a non-empty array.",
      "Invalid_Subject_List",
      []
    );
  }
  const subjectIds = subjects.map((sub) => sub.subjectId);
  const uniqueId = [...new Set(subjectIds)];
  const result = await tutorService.addTutorSubjects(userId, uniqueId);
  console.log(result);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Subject added successfully.",
    data: result
  });
});
var removeTutorSubject = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const { subjectId } = req.params;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor subject delete..",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor Subjects delete.",
          message: "Only tutor role can remove subjects in their table."
        }
      ]
    );
  }
  if (typeof subjectId !== "string") {
    throw new AppErrors_default(400, "Invalid subject id type", "Invalid_Subject_Id", [
      {
        field: "Tutor subject delete..",
        message: "Please give valid type of id."
      }
    ]);
  }
  const result = await tutorService.removeSubject(userId, subjectId);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Subject removed successfully",
    data: result
  });
});
var addEducation2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const { institute, degree, fieldOfStudy, startYear, endYear, isCurrent } = req.body;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Education.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor Education.",
          message: "Only tutor role can add education."
        }
      ]
    );
  }
  if (!institute || !degree || !fieldOfStudy || !startYear) {
    throw new AppErrors_default(
      400,
      "Missing required fields",
      "Invalid_Education_Data",
      [
        {
          field: "Tutor Education",
          message: "institute, degree, fieldOfStudy, and startYear are required."
        }
      ]
    );
  }
  const result = await tutorService.addEducation(userId, {
    institute,
    degree,
    fieldOfStudy,
    startYear,
    endYear,
    isCurrent: !!isCurrent
  });
  return AppResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Education added successfully",
    data: result
  });
});
var updateEducation2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const educationId = req.params.id;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Education.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (typeof educationId !== "string") {
    throw new AppErrors_default(
      400,
      "Invalid education id type",
      "Invalid_Education_Id",
      [
        {
          field: "Tutor Education.",
          message: "Please give valid type of id."
        }
      ]
    );
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor Education.",
          message: "Only tutor role can update education."
        }
      ]
    );
  }
  const result = await tutorService.updateEducation(
    userId,
    educationId,
    req.body
  );
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Education updated successfully",
    data: result
  });
});
var deleteEducation2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const educationId = req.params.id;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Education.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (typeof educationId !== "string") {
    throw new AppErrors_default(
      400,
      "Invalid education id type",
      "Invalid_Education_Id",
      [
        {
          field: "Tutor Education.",
          message: "Please give valid type of id."
        }
      ]
    );
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor Education.",
          message: "Only tutor role can update education."
        }
      ]
    );
  }
  const result = await tutorService.deleteEducation(userId, educationId);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Education deleted successfully",
    data: result
  });
});
var addAvailability2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const { dayOfWeek, startTime, endTime } = req.body;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Education.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor Education.",
          message: "Only tutor role can update education."
        }
      ]
    );
  }
  if (!dayOfWeek || !startTime || !endTime) {
    throw new AppErrors_default(
      400,
      "Missing required fields",
      "Invalid_Availability_Data",
      [
        {
          field: "Availability",
          message: "dayOfWeek, startTime, endTime are required"
        }
      ]
    );
  }
  const result = await tutorService.addAvailability(userId, {
    dayOfWeek,
    startTime,
    endTime
  });
  return AppResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Availability added successfully",
    data: result
  });
});
var updateAvailability2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const availabilityId = req.params.id;
  const payload = req.body;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Education.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (!availabilityId || typeof availabilityId !== "string") {
    throw new AppErrors_default(
      400,
      "Invalid availability id type or missing availability id",
      "Invalid_Availability_Id",
      [
        {
          field: "Tutor Education.",
          message: "Please give valid type of id."
        }
      ]
    );
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor Education.",
          message: "Only tutor role can update education."
        }
      ]
    );
  }
  const result = await tutorService.updateAvailability(
    userId,
    availabilityId,
    payload
  );
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Availability updated successfully",
    data: result
  });
});
var deleteAvailability2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const availabilityId = req.params.id;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Education.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (!availabilityId || typeof availabilityId !== "string") {
    throw new AppErrors_default(
      400,
      "Invalid availability id type or missing availability id",
      "Invalid_Availability_Id",
      [
        {
          field: "Tutor Education.",
          message: "Please give valid type of id."
        }
      ]
    );
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor Education.",
          message: "Only tutor role can update education."
        }
      ]
    );
  }
  const result = await tutorService.deleteAvailability(userId, availabilityId);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Availability deleted successfully",
    data: result
  });
});
var createTutorTimeSlot2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const { date, startTime, endTime } = req.body;
  console.log(date, startTime, endTime);
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Time Slot.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor time slot.",
          message: "Only tutor role can create valid time slot."
        }
      ]
    );
  }
  if (!date || !startTime || !endTime) {
    throw new AppErrors_default(
      400,
      "Missing required fields",
      "Invalid_TimeSlot_Data",
      [
        {
          field: "Tutor Time slot",
          message: "Date, start time, end time  are required."
        }
      ]
    );
  }
  const result = await tutorService.createTutorTimeSlot(userId, {
    date,
    startTime,
    endTime
  });
  return AppResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Time slot created successfully",
    data: result
  });
});
var updateTimeSlot2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const timeSlotId = req.params.id;
  const payload = req.body;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Time Slot.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (typeof timeSlotId !== "string") {
    throw new AppErrors_default(
      400,
      "Invalid time slot id type",
      "Invalid_TimeSlot_Id",
      [
        {
          field: "Tutor Time Slot.",
          message: "Please give valid type of time slot id."
        }
      ]
    );
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor time slot.",
          message: "Only tutor role can update time slot."
        }
      ]
    );
  }
  const result = await tutorService.updateTimeSlot(userId, timeSlotId, payload);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Time slot updated successfully",
    data: result
  });
});
var deleteTutorSlot2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const timeSlotId = req.params.id;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Time Slot.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (typeof timeSlotId !== "string") {
    throw new AppErrors_default(
      400,
      "Invalid time slot id type",
      "Invalid_TimeSlot_Id",
      [
        {
          field: "Tutor Time Slot.",
          message: "Please give valid type of time slot id."
        }
      ]
    );
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor time slot.",
          message: "Only tutor role can delete time slot."
        }
      ]
    );
  }
  const result = await tutorService.deleteTutorSlot(userId, timeSlotId);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Time slot deleted successfully",
    data: result
  });
});
var confirmBooking2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const bookingId = req.params?.id;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Confirm Booking.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (typeof bookingId !== "string") {
    throw new AppErrors_default(400, "Invalid Booking id type", "Invalid_Booking_Id", [
      {
        field: "Confirm Booking.",
        message: "Please give valid type of Booking id."
      }
    ]);
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Confirm Booking.",
          message: "Only tutor role can complete booking."
        }
      ]
    );
  }
  const result = await tutorService.confirmBooking(userId, bookingId);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Booking Confirm  successfully",
    data: result
  });
});
var cancelBooking2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const bookingId = req.params.id;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid tutor id type", "Invalid_TUTOR_Id", [
      {
        field: "Book Time Slot.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (typeof bookingId !== "string") {
    throw new AppErrors_default(400, "Invalid booking id type", "Invalid_Booking_Id", [
      {
        field: "Cancel Booking slot.",
        message: "Please give valid type of booking id."
      }
    ]);
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Booking time slot.",
          message: "Only tutor can book time slot."
        }
      ]
    );
  }
  const result = await tutorService.cancelBooking(userId, bookingId);
  return AppResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Booking cancelled successfully",
    data: result
  });
});
var completeBooking2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const bookingId = req.params?.id;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Complete Booking.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (typeof bookingId !== "string") {
    throw new AppErrors_default(400, "Invalid Booking id type", "Invalid_Booking_Id", [
      {
        field: "Complete Booking.",
        message: "Please give valid type of Booking id."
      }
    ]);
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Complete Booking.",
          message: "Only tutor role can complete booking."
        }
      ]
    );
  }
  const result = await tutorService.completeBooking(userId, bookingId);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Booking completed  successfully",
    data: result
  });
});
var getTutorProfile2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Complete Booking.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (role !== Role.TUTOR) {
    throw new AppErrors_default(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Complete Booking.",
          message: "Only tutor role can complete booking."
        }
      ]
    );
  }
  const result = await tutorService.getTutorProfile(userId);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Tutor profile retrieve successfully",
    data: result
  });
});
var tutorController = {
  createTutorProfile: createTutorProfile2,
  updateHourlyRate,
  addTutorSubjects: addTutorSubjects2,
  removeTutorSubject,
  addEducation: addEducation2,
  updateEducation: updateEducation2,
  deleteEducation: deleteEducation2,
  addAvailability: addAvailability2,
  updateAvailability: updateAvailability2,
  deleteAvailability: deleteAvailability2,
  createTutorTimeSlot: createTutorTimeSlot2,
  updateTimeSlot: updateTimeSlot2,
  deleteTutorSlot: deleteTutorSlot2,
  confirmBooking: confirmBooking2,
  cancelBooking: cancelBooking2,
  completeBooking: completeBooking2,
  getTutorProfile: getTutorProfile2
};

// src/modules/tutor/tutor.route.ts
var router = Router();
router.get("/me", authMiddleware_default("TUTOR"), tutorController.getTutorProfile);
router.post("/", authMiddleware_default("TUTOR"), tutorController.createTutorProfile);
router.patch(
  "/update/hourly_rate",
  authMiddleware_default("TUTOR"),
  tutorController.updateHourlyRate
);
router.post(
  "/subjects",
  authMiddleware_default("TUTOR"),
  tutorController.addTutorSubjects
);
router.delete(
  "/subjects/:subjectId",
  authMiddleware_default("TUTOR"),
  tutorController.removeTutorSubject
);
router.post(
  "/education",
  authMiddleware_default("TUTOR"),
  tutorController.addEducation
);
router.patch(
  "/education/:id",
  authMiddleware_default("TUTOR"),
  tutorController.updateEducation
);
router.delete(
  "/education/:id",
  authMiddleware_default("TUTOR"),
  tutorController.deleteEducation
);
router.post(
  "/availabilities",
  authMiddleware_default("TUTOR"),
  tutorController.addAvailability
);
router.patch(
  "/availabilities/:id",
  authMiddleware_default("TUTOR"),
  tutorController.updateAvailability
);
router.delete(
  "/availabilities/:id",
  authMiddleware_default("TUTOR"),
  tutorController.deleteAvailability
);
router.post(
  "/time-slot",
  authMiddleware_default("TUTOR"),
  tutorController.createTutorTimeSlot
);
router.patch(
  "/time-slot/:id",
  authMiddleware_default("TUTOR"),
  tutorController.updateTimeSlot
);
router.delete(
  "/time-slot/:id",
  authMiddleware_default("TUTOR"),
  tutorController.deleteTutorSlot
);
router.patch(
  "/bookings/confirm/:id",
  authMiddleware_default("TUTOR"),
  tutorController.confirmBooking
);
router.patch(
  "/bookings/cancel/:id",
  authMiddleware_default("TUTOR"),
  tutorController.confirmBooking
);
router.patch(
  "/bookings/complete/:id",
  authMiddleware_default("TUTOR"),
  tutorController.completeBooking
);
var tutorRoutes = router;

// src/middlewares/notFoundError.ts
var notFoundError = (req, res, next) => {
  next(
    new AppErrors_default(
      404,
      `Can not ${req.method} from ${req.originalUrl} this path.`,
      "Error Path request",
      [
        {
          field: "Path",
          message: "Invalid path"
        }
      ]
    )
  );
};
var notFoundError_default = notFoundError;

// src/middlewares/globalErrorHandler.ts
import { ZodError } from "zod";

// src/utils/AppErrorResponse.ts
var AppErrorResponse = (res, error, path2) => {
  return res.status(error.statusCode).json({
    success: false,
    error,
    path: path2,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
};
var AppErrorResponse_default = AppErrorResponse;

// src/middlewares/globalErrorHandler.ts
var globalErrorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = "Internal server error.";
  let name = error?.name || "Error";
  let code = void 0;
  let details = void 0;
  if (config2.node_env !== "production") {
    console.error("ERROR:", error);
  }
  const isAuthError = (err) => {
    return typeof err === "object" && err !== null && "code" in err && typeof err.code === "string";
  };
  if (error instanceof AppErrors_default) {
    statusCode = error.statusCode;
    message = error.message;
    name = error.name;
    code = error.code;
    details = error.details;
  } else if (error instanceof SyntaxError && "body" in error) {
    statusCode = 400;
    message = "Invalid JSON payload";
    name = "SyntaxError";
  } else if (error instanceof Error && error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    name = "AuthError";
  } else if (error instanceof Error && error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    name = "AuthError";
  } else if (error instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        statusCode = 409;
        message = `Duplicate value for field ${error.meta?.target}`;
        name = "DatabaseError";
        code = "P2002";
        break;
      case "P2025":
        statusCode = 404;
        message = "Resource not found";
        name = "DatabaseError";
        code = "P2025";
        break;
      default:
        statusCode = 400;
        message = "Database error";
        name = "DatabaseError";
    }
  } else if (error instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid database input";
    name = "DatabaseValidationError";
  } else if (error instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = 500;
    message = "Database query execution error";
    name = "DatabaseError";
  } else if (error instanceof prismaNamespace_exports.PrismaClientRustPanicError) {
    statusCode = 500;
    message = "Critical database error";
    name = "DatabaseError";
  } else if (error instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    switch (error.errorCode) {
      case "P1000":
        statusCode = 401;
        message = "Database authentication failed";
        break;
      case "P1001":
        statusCode = 400;
        message = "Cannot reach database server";
        break;
      case "P1002":
        statusCode = 400;
        message = "Database failed";
        break;
      default:
        statusCode = 400;
        message = "Database initialization error";
    }
    name = "DatabaseError";
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    name = "ValidationError";
    details = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message
    }));
  } else if (isAuthError(error)) {
    const authError = error;
    name = "AuthError";
    code = authError.code;
    switch (authError.code) {
      case "INVALID_CREDENTIALS":
        statusCode = 401;
        message = "Invalid email or password";
        break;
      case "EMAIL_ALREADY_EXISTS":
        statusCode = 409;
        message = "Email already registered";
        break;
      case "USER_NOT_FOUND":
        statusCode = 404;
        message = "User not found";
        break;
      case "MISSING_OR_NULL_ORIGIN":
        statusCode = 403;
        message = "Origin not allowed";
        break;
      case "UNAUTHORIZED":
        statusCode = 401;
        message = "Unauthorized access";
        break;
      case "FORBIDDEN":
        statusCode = 403;
        message = "Access denied";
        break;
      case "VALIDATION_ERROR":
        statusCode = 400;
        message = "Validation failed";
        const matchedField = authError.message?.match(/\[body.(.+?)\]/)?.[1];
        details = [
          {
            ...matchedField !== void 0 ? { field: matchedField } : {},
            message: authError.message?.replace(/\[body\..+?\]\s*/, "") || ""
          }
        ];
        break;
      default:
        statusCode = 400;
        message = authError.message || "Authentication error";
    }
  } else {
    message = error?.message || message;
    name = error?.name || name;
  }
  return AppErrorResponse_default(
    res,
    {
      statusCode,
      name,
      ...code ? { code } : {},
      message,
      ...details ? { details } : {}
    },
    req.originalUrl
  );
};
var globalErrorHandler_default = globalErrorHandler;

// src/modules/admin/admin.route.ts
import { Router as Router2 } from "express";

// src/modules/admin/admin.service.ts
var getAllUser = async () => {
  const result = await prisma.user.findMany({
    include: {
      tutorProfiles: {
        include: {
          education: true,
          availabilities: true,
          tutorTimeSlots: true,
          // bookings received as tutor
          bookings: {
            include: {
              student: true,
              subject: true,
              review: true
            }
          },
          //  reviews received as tutor
          reviews: {
            include: {
              student: true
            }
          },
          subjects: {
            include: {
              subject: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      },
      //  bookings made as student
      bookings: {
        include: {
          tutorProfile: true,
          subject: true
        }
      },
      // reviews written as student
      reviews: true
    }
  });
  return result;
};
var updateUserStatus = async (id, status) => {
  if (!id) {
    throw new AppErrors_default(
      400,
      "User id is required to update status.",
      "Missing User id",
      [
        {
          field: "Update User status",
          message: "Please give User id."
        }
      ]
    );
  }
  const isExistUser = await prisma.user.findUnique({
    where: {
      id
    },
    select: {
      status: true
    }
  });
  if (!isExistUser) {
    throw new AppErrors_default(404, "No user found with this id.", "Invalid_User_Id", [
      {
        field: "Update User Status",
        message: "Please provide a valid user id."
      }
    ]);
  }
  if (isExistUser?.status === status) {
    throw new AppErrors_default(
      400,
      "User status is already update.",
      "User_already_updated",
      [
        {
          field: "Update user status",
          message: "Already updated user."
        }
      ]
    );
  }
  const result = await prisma.user.update({
    where: {
      id
    },
    data: {
      status
    }
  });
  return result;
};
var featureTutor = async (id, isFeatured) => {
  if (!id) {
    throw new AppErrors_default(
      400,
      "User id is required to update feature tutor.",
      "Missing tutor id",
      [
        {
          field: "Update User status",
          message: "Please give User id."
        }
      ]
    );
  }
  const isExistUser = await prisma.tutorProfile.findUnique({
    where: {
      id
    },
    select: {
      isFeatured: true
    }
  });
  if (!isExistUser) {
    throw new AppErrors_default(
      404,
      "No tutor profile found with this id.",
      "Invalid_User_Id",
      [
        {
          field: "Update User Status",
          message: "Please provide a valid user id."
        }
      ]
    );
  }
  const result = await prisma.tutorProfile.update({
    where: {
      id
    },
    data: {
      isFeatured
    }
  });
  return result;
};
var getAllBookings = async () => {
  const result = await prisma.bookings.findMany({
    include: {
      tutorProfile: {
        include: {
          subjects: {
            include: {
              subject: true
            }
          },
          education: true,
          availabilities: true,
          tutorTimeSlots: true,
          user: true
        }
      },
      student: true,
      timeSlot: true,
      subject: true
    }
  });
  return result;
};
var adminService = {
  updateUserStatus,
  getAllUser,
  featureTutor,
  getAllBookings
};

// src/modules/admin/admin.controller.ts
var getAllUser2 = catchAsync_default(async (req, res) => {
  const result = await adminService.getAllUser();
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "All user retrieve successfully.",
    data: result
  });
});
var updateUser = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (typeof id !== "string") {
    throw new AppErrors_default(400, "User id types error", "Invalid_User_id", [
      {
        field: "Update user status.",
        message: "Please give valid type of user id."
      }
    ]);
  }
  const result = await adminService.updateUserStatus(id, status);
  console.log(result);
  return AppResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "User status updated successfully.",
    data: result
  });
});
var featureTutor2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const { isFeatured } = req.body;
  if (typeof id !== "string") {
    throw new AppErrors_default(400, "Tutor id types error", "Invalid_Tutor_id", [
      {
        field: "Feature Tutor.",
        message: "Please give valid type of Tutor id."
      }
    ]);
  }
  if (typeof isFeatured !== "boolean") {
    throw new AppErrors_default(400, "Invalid feature flag", "Invalid_isFeatured", [
      {
        field: "Feature Tutor",
        message: "isFeatured must be a boolean value."
      }
    ]);
  }
  const result = await adminService.featureTutor(id, isFeatured);
  console.log(result);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Updated feature tutor status successfully.",
    data: result
  });
});
var getAllBookings2 = catchAsync_default(async (req, res) => {
  const result = await adminService.getAllBookings();
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "All bookings retrieve successfully.",
    data: result
  });
});
var adminController = {
  updateUser,
  getAllUser: getAllUser2,
  featureTutor: featureTutor2,
  getAllBookings: getAllBookings2
};

// src/modules/admin/admin.route.ts
var router2 = Router2();
router2.get("/users", authMiddleware_default("ADMIN"), adminController.getAllUser);
router2.get(
  "/bookings",
  authMiddleware_default("ADMIN"),
  adminController.getAllBookings
);
router2.patch("/users/:id", authMiddleware_default("ADMIN"), adminController.updateUser);
router2.patch(
  "/tutors/:id/featured",
  authMiddleware_default("ADMIN"),
  adminController.featureTutor
);
var adminRoutes = router2;

// src/modules/categories/categories.route.ts
import { Router as Router3 } from "express";

// src/modules/categories/categories.service.ts
var getAllCategory = async () => {
  const result = await prisma.categories.findMany({
    include: {
      subjects: true
    }
  });
  return result;
};
var createCategory = async (payload) => {
  if (!payload.name) {
    throw new AppErrors_default(
      400,
      "Please give category name",
      "Missing category name",
      [
        {
          field: "Category creation",
          message: "Please give category name."
        }
      ]
    );
  }
  const categoryName = payload.name.trim().toUpperCase();
  const findingCategory = await prisma.categories.findFirst({
    where: {
      name: categoryName
    },
    select: {
      id: true
    }
  });
  console.log(findingCategory);
  if (findingCategory) {
    throw new AppErrors_default(
      400,
      "Category already exist.",
      "Duplicate category name.",
      [
        {
          field: "Category creation",
          message: "Please give another category name."
        }
      ]
    );
  }
  const result = await prisma.categories.create({
    data: {
      name: categoryName,
      description: payload.description
    }
  });
  return result;
};
var updateCategory = async (id, payload) => {
  if (!id) {
    throw new AppErrors_default(
      400,
      "Category id required to update.",
      "Missing category id",
      [
        {
          field: "Update Category",
          message: "Please give category id."
        }
      ]
    );
  }
  const findingCategory = await prisma.categories.findUnique({
    where: {
      id
    },
    select: {
      id: true
    }
  });
  if (!findingCategory) {
    throw new AppErrors_default(
      400,
      "No category found in this id.",
      "Invalid_Category_id",
      [
        {
          field: "Update category.",
          message: "Please give valid category id."
        }
      ]
    );
  }
  if (payload.name) {
    payload.name = payload.name?.trim().toUpperCase();
    const duplicateCategory = await prisma.categories.findFirst({
      where: {
        name: payload.name,
        NOT: {
          id
        }
      },
      select: {
        id: true
      }
    });
    if (duplicateCategory) {
      throw new AppErrors_default(
        400,
        "Duplicate category name.",
        "Duplicate_Category_Name",
        [
          {
            field: "Update category.",
            message: "Please give category name without any duplication."
          }
        ]
      );
    }
  }
  const updateCategory3 = await prisma.categories.update({
    where: {
      id
    },
    data: payload
  });
  return updateCategory3;
};
var deleteCategory = async (id) => {
  if (!id) {
    throw new AppErrors_default(400, "Category id is required.", "Missing_Category_Id", [
      {
        field: "Delete Category",
        message: "Please provide category id."
      }
    ]);
  }
  const isExistCategory = await prisma.categories.findUnique({
    where: {
      id
    },
    select: {
      id: true
    }
  });
  if (!isExistCategory) {
    throw new AppErrors_default(
      400,
      "No category found in this id.",
      "Invalid_Category_id",
      [
        {
          field: "Delete category.",
          message: "Please give valid category id."
        }
      ]
    );
  }
  const result = await prisma.categories.delete({
    where: {
      id
    }
  });
  return result;
};
var categoryService = {
  getAllCategory,
  createCategory,
  updateCategory,
  deleteCategory
};

// src/modules/categories/categories.controller.ts
var getAllCategory2 = catchAsync_default(async (req, res) => {
  const result = await categoryService.getAllCategory();
  console.log(result);
  return AppResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully.",
    data: result
  });
});
var createCategory2 = catchAsync_default(async (req, res) => {
  const user = req.user;
  const { name, description } = req.body;
  if (user?.role !== Role.ADMIN) {
    throw new AppErrors_default(401, "Invalid request.", "Invalid user role", [
      {
        field: "Create category.",
        message: "Only admin can create category."
      }
    ]);
  }
  const result = await categoryService.createCategory({ name, description });
  console.log(result);
  return AppResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully.",
    data: result
  });
});
var updateCategory2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  if (typeof id !== "string") {
    throw new AppErrors_default(400, "Category Id type error", "Error id type", [
      {
        field: "Update category",
        message: "Please give valid type  category id."
      }
    ]);
  }
  const result = await categoryService.updateCategory(id, req.body);
  console.log(result);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Category updated successfully.",
    data: result
  });
});
var deleteCategory2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  if (typeof id !== "string") {
    throw new AppErrors_default(400, "Category Id type error", "Error id type", [
      {
        field: "Update category",
        message: "Please give valid type  category id."
      }
    ]);
  }
  const result = await categoryService.deleteCategory(id);
  console.log(result);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Category deleted successfully.",
    data: result
  });
});
var categoryController = {
  createCategory: createCategory2,
  updateCategory: updateCategory2,
  getAllCategory: getAllCategory2,
  deleteCategory: deleteCategory2
};

// src/modules/categories/categories.route.ts
var router3 = Router3();
router3.get("/", categoryController.getAllCategory);
router3.post("/", authMiddleware_default("ADMIN"), categoryController.createCategory);
router3.patch(
  "/:id",
  authMiddleware_default("ADMIN"),
  categoryController.updateCategory
);
router3.delete(
  "/:id",
  authMiddleware_default("ADMIN"),
  categoryController.deleteCategory
);
var categoryRoutes = router3;

// src/modules/subjects/subjects.route.ts
import { Router as Router4 } from "express";

// src/modules/subjects/subjects.service.ts
var addSubject = async (payload) => {
  if (!payload.category_id) {
    throw new AppErrors_default(400, "Category id is required.", "Missing_Category_Id", [
      {
        field: "Add Subject.",
        message: "Please provide category id."
      }
    ]);
  }
  const checkCategory = await prisma.categories.findUnique({
    where: {
      id: payload.category_id
    },
    select: {
      id: true
    }
  });
  if (!checkCategory) {
    throw new AppErrors_default(
      400,
      "No category found for the given id.",
      "Missing_Category",
      [
        {
          field: "Add subject.",
          message: "Please give listed category_id from the database."
        }
      ]
    );
  }
  if (!payload.name) {
    throw new AppErrors_default(400, "Subject is required.", "Missing_Subject_Name", [
      {
        field: "Add Subject.",
        message: "Please provide subject name."
      }
    ]);
  }
  payload.name = payload.name.trim().toUpperCase();
  const existSubject = await prisma.subjects.findFirst({
    where: {
      category_id: payload.category_id,
      name: payload.name
    }
  });
  console.log(existSubject);
  if (existSubject) {
    throw new AppErrors_default(
      400,
      "Subject already exist under this category.",
      "Duplicate_Subject_Name",
      [
        {
          field: "Add Subject.",
          message: "Please provide subject name without duplication."
        }
      ]
    );
  }
  const result = await prisma.subjects.create({
    data: {
      category_id: payload.category_id,
      name: payload.name
    }
  });
  return result;
};
var getAllSubjects = async () => {
  const result = await prisma.subjects.findMany({
    include: {
      category: true
    }
  });
  return result;
};
var updateSubject = async (id, name) => {
  if (!id) {
    throw new AppErrors_default(
      400,
      "Subject id is required to update.",
      "Missing Subject id",
      [
        {
          field: "Update subject",
          message: "Please give subject id."
        }
      ]
    );
  }
  const findingSubject = await prisma.subjects.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      category_id: true
    }
  });
  if (!findingSubject) {
    throw new AppErrors_default(
      400,
      "No subject found in this id.",
      "Invalid_Subject_id",
      [
        {
          field: "Update Subject.",
          message: "Please give valid Subject id."
        }
      ]
    );
  }
  if (!name || !name.trim()) {
    throw new AppErrors_default(
      400,
      "Subject name is required.",
      "Missing_Subject_Name",
      [
        {
          field: "Update Subject",
          message: "Please provide valid subject name."
        }
      ]
    );
  }
  const updateName = name.trim().toUpperCase();
  if (updateName) {
    const duplicateSubject = await prisma.subjects.findFirst({
      where: {
        name: updateName,
        category_id: findingSubject.category_id,
        NOT: {
          id
        }
      },
      select: {
        id: true
      }
    });
    if (duplicateSubject) {
      throw new AppErrors_default(
        400,
        "Duplicate subject name in this category.",
        "Duplicate_Subject_Name",
        [
          {
            field: "Subject category.",
            message: "Subject must be unique within the category."
          }
        ]
      );
    }
  }
  const updateSubject2 = await prisma.subjects.update({
    where: {
      id
    },
    data: {
      name: updateName
    }
  });
  return updateSubject2;
};
var deleteSubject = async (id) => {
  if (!id) {
    throw new AppErrors_default(400, "Subject id is required.", "Missing_Subject_Id", [
      {
        field: "Delete Subject",
        message: "Please provide subject id."
      }
    ]);
  }
  const isExistSubject = await prisma.subjects.findUnique({
    where: {
      id
    },
    select: {
      id: true
    }
  });
  if (!isExistSubject) {
    throw new AppErrors_default(
      400,
      "No subject found in this id.",
      "Invalid_Subject_id",
      [
        {
          field: "Delete Subject.",
          message: "Please give valid subject id."
        }
      ]
    );
  }
  const result = await prisma.subjects.delete({
    where: {
      id
    }
  });
  return result;
};
var subjectsService = {
  addSubject,
  getAllSubjects,
  updateSubject,
  deleteSubject
};

// src/modules/subjects/subjects.controller.ts
var addSubject2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (typeof id !== "string") {
    throw new AppErrors_default(
      400,
      "Invalid category id type.",
      "Invalid_Category_Id_Type",
      [
        {
          field: "Add Subject.",
          message: "Please provide Valid type of  category_id."
        }
      ]
    );
  }
  const result = await subjectsService.addSubject({ category_id: id, name });
  console.log(result);
  return AppResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Subject added successfully.",
    data: result
  });
});
var getAllSubjects2 = catchAsync_default(async (req, res) => {
  const result = await subjectsService.getAllSubjects();
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "All subjects retrieve successfully.",
    data: result
  });
});
var updateSubjectName = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  if (typeof id !== "string") {
    throw new AppErrors_default(400, "Subject Id type error", "Error_id_type", [
      {
        field: "Update Subject",
        message: "Please give valid type  subject id."
      }
    ]);
  }
  const result = await subjectsService.updateSubject(id, req.body.name);
  console.log(result);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Subject updated successfully.",
    data: result
  });
});
var deleteSubject2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  if (typeof id !== "string") {
    throw new AppErrors_default(400, "Subject Id type error", "Error id type", [
      {
        field: "Delete Subject",
        message: "Please give valid type  subject id."
      }
    ]);
  }
  const result = await subjectsService.deleteSubject(id);
  console.log(result);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Subject deleted successfully.",
    data: result
  });
});
var subjectController = {
  addSubject: addSubject2,
  getAllSubjects: getAllSubjects2,
  updateSubjectName,
  deleteSubject: deleteSubject2
};

// src/modules/subjects/subjects.route.ts
var router4 = Router4();
router4.get("/", subjectController.getAllSubjects);
router4.post("/:id", authMiddleware_default("ADMIN"), subjectController.addSubject);
router4.patch(
  "/:id",
  authMiddleware_default("ADMIN"),
  subjectController.updateSubjectName
);
router4.delete("/:id", authMiddleware_default("ADMIN"), subjectController.deleteSubject);
var subjectsRoutes = router4;

// src/modules/student/student.route.ts
import { Router as Router5 } from "express";

// src/modules/student/student.service.ts
var createBooking = async (studentId, timeSlotId, payload) => {
  return prisma.$transaction(async (txx) => {
    const slot = await txx.tutorTimeSlot.findUnique({
      where: {
        id: timeSlotId
      },
      include: {
        tutorProfile: {
          include: {
            user: true
          }
        }
      }
    });
    if (!slot) {
      throw new AppErrors_default(
        404,
        "Tutor time slot not found",
        "Tutor_TimeSlot_Not_Found",
        [
          {
            field: "Tutor Time slot ",
            message: "Please use valid tutor time slot for booking time slot."
          }
        ]
      );
    }
    if (slot.isBooked) {
      throw new AppErrors_default(
        409,
        "Tutor time slot already booked",
        "Tutor_TimeSlot_Already_Booked",
        [
          {
            field: "Tutor Time slot ",
            message: "Please try to book another slot."
          }
        ]
      );
    }
    if (slot.tutorProfile.user.status === UserStatus.BANNED) {
      throw new AppErrors_default(403, "Tutor's account is banned.", "ACCOUNT_BANNED", [
        {
          field: "Authentication",
          message: "This tutor is banned. Please try another tutor."
        }
      ]);
    }
    const isExistSubject = await txx.tutorSubject.findFirst({
      where: {
        tutor_profileId: slot.tutorProfileId,
        subjectId: payload.subjectId
      }
    });
    if (!isExistSubject) {
      throw new AppErrors_default(
        400,
        "Tutor does not teach this subject",
        "Tutor_Does't_Teach_This_Subject",
        [
          {
            field: "Tutor Time slot ",
            message: "Please select valid subject for booking time slot."
          }
        ]
      );
    }
    const existingBooking = await txx.bookings.findFirst({
      where: {
        timeSlotId,
        status: {
          in: [
            BookingStatus.PENDING,
            BookingStatus.CONFIRM,
            BookingStatus.COMPLETE
          ]
        }
      }
    });
    if (existingBooking) {
      throw new AppErrors_default(
        409,
        "Slot already under booking process or booked or completed",
        "SLOT_ALREADY_BOOKING_PROCESS",
        [
          {
            field: "Tutor Time slot ",
            message: "Please  select another valid slot for booking time slot."
          }
        ]
      );
    }
    const startTime = timeToMinutes(slot.startTime);
    const endTime = timeToMinutes(slot.endTime);
    const durationInHours = (endTime - startTime) / 60;
    const tutorHourlyRate = Number(slot?.tutorProfile?.hourlyRate);
    if (typeof tutorHourlyRate !== "number") {
      throw new AppErrors_default(400, "Invalid price type", "Invalid_Student_Id", [
        {
          field: "Book Time Slot.",
          message: "Please give valid type of tutor hourly rate."
        }
      ]);
    }
    const price = durationInHours * tutorHourlyRate;
    const booking = await txx.bookings.create({
      data: {
        studentId,
        tutorProfileId: slot.tutorProfileId,
        subjectId: payload.subjectId,
        timeSlotId,
        booking_price: price
      }
    });
    await txx.tutorTimeSlot.update({
      where: {
        id: timeSlotId
      },
      data: { isBooked: true }
    });
    return booking;
  });
};
var cancelBooking3 = async (userId, bookingId) => {
  return prisma.$transaction(async (txx) => {
    const booking = await txx.bookings.findUnique({
      where: {
        id: bookingId
      },
      include: {
        timeSlot: true
      }
    });
    if (!booking) {
      throw new AppErrors_default(404, "Booking not found.", "Booking_NOt_Found", [
        {
          field: "Booking slot",
          message: "Please  provide valid booking id."
        }
      ]);
    }
    if (booking.studentId !== userId) {
      throw new AppErrors_default(403, "Unauthorized access", "UNAUTHORIZED", [
        {
          field: "Cancel Booking",
          message: "You are not authorized to cancel this booking slot"
        }
      ]);
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new AppErrors_default(
        400,
        "Booking already cancelled",
        "ALREADY_CANCELLED",
        [
          {
            field: "Cancel Booking",
            message: "You are not authorized to cancel this booking slot"
          }
        ]
      );
    }
    if (booking.status === BookingStatus.CONFIRM) {
      throw new AppErrors_default(
        400,
        "Booking has been confirmed by tutor.",
        "BOOKING_CONFIRMED",
        [
          {
            field: "Cancel Booking",
            message: "You are not authorized to cancel this booking slot because of tutor already confirmed this booking"
          }
        ]
      );
    }
    if (booking.status === BookingStatus.COMPLETE) {
      throw new AppErrors_default(
        400,
        "Completed booking cannot be cancelled",
        "CANNOT_CANCEL_COMPLETE",
        [
          {
            field: "Cancel Booking",
            message: "You are not authorized to cancel this booking slot because booking has already been completed."
          }
        ]
      );
    }
    const result = await txx.bookings.update({
      where: {
        id: bookingId
      },
      data: {
        status: BookingStatus.CANCELLED
      }
    });
    await txx.tutorTimeSlot.update({
      where: {
        id: booking.timeSlotId
      },
      data: {
        isBooked: false
      }
    });
    return result;
  });
};
var createReview = async (userId, bookingId, payload) => {
  const booking = await prisma.bookings.findUnique({
    where: {
      id: bookingId
    },
    include: {
      review: true
    }
  });
  if (!booking) {
    throw new AppErrors_default(404, "Booking not found.", "Booking_NOt_Found", [
      {
        field: "Making Review",
        message: "Please  provide valid booking id."
      }
    ]);
  }
  if (booking.studentId !== userId) {
    throw new AppErrors_default(403, "Unauthorized access", "UNAUTHORIZED", [
      {
        field: "Making Review",
        message: "You are not authorized to make review for this booking."
      }
    ]);
  }
  if (booking.status !== BookingStatus.CONFIRM) {
    throw new AppErrors_default(
      400,
      "You can only review after session is complete.",
      "SESSION_NOT_CONFIRM",
      [
        {
          field: "Making Review",
          message: "Please complete the session and then make review."
        }
      ]
    );
  }
  if (booking.review) {
    throw new AppErrors_default(
      409,
      "You have already reviewed this session",
      "REVIEW_ALREADY_EXISTS",
      [
        {
          field: "Making Review",
          message: "Only one review can give against each booking after complete session."
        }
      ]
    );
  }
  if (payload.rating > 5 || payload.rating < 0) {
    throw new AppErrors_default(409, "Rating must be between 0-5.", "INVALID_RATING", [
      {
        field: "Making Review",
        message: "Rating must be greater then 0 and less than 5 and can be fractional."
      }
    ]);
  }
  const result = await prisma.$transaction(async (txx) => {
    const updatedBooking = await txx.bookings.update({
      where: { id: bookingId },
      data: { status: BookingStatus.COMPLETE }
    });
    if (updatedBooking) {
      const createReview3 = await txx.review.create({
        data: {
          bookingId: booking.id,
          studentId: userId,
          tutorProfileId: booking.tutorProfileId,
          rating: payload.rating,
          comment: payload.comment ?? null
        }
      });
      return { updatedBooking, createReview: createReview3 };
    }
  });
  return result;
};
var getStudentProfile = async (userId) => {
  const studentProfile = await prisma.user.findUnique({
    where: {
      id: userId
    },
    include: {
      bookings: {
        include: {
          review: {
            include: {
              booking: {
                include: {
                  subject: true
                }
              }
            }
          },
          subject: true,
          timeSlot: true,
          tutorProfile: {
            include: {
              user: true
            }
          }
        }
      },
      tutorProfiles: true,
      reviews: {
        include: {
          tutorProfile: {
            include: {
              user: true
            }
          },
          booking: {
            include: {
              student: true,
              subject: true,
              timeSlot: true
            }
          }
        }
      }
    }
  });
  if (!studentProfile) {
    throw new AppErrors_default(404, "No user found with this id.", "Invalid_User_Id", [
      {
        field: "Retrieve student profile.",
        message: "Please provide a valid user id."
      }
    ]);
  }
  return studentProfile;
};
var studentService = {
  createBooking,
  cancelBooking: cancelBooking3,
  createReview,
  getStudentProfile
};

// src/modules/student/student.controller.ts
var createBooking2 = catchAsync_default(async (req, res) => {
  const studentId = req.user?.id;
  const role = req.user?.role;
  const timeSlotId = req.params.id;
  const status = req.user?.role;
  const { subjectId } = req.body;
  if (status === UserStatus.BANNED) {
    throw new AppErrors_default(403, "Banned user", "Banned_User", [
      {
        field: "Book Time Slot.",
        message: "You are not eligible to book tutor slot. You have been banned by admin."
      }
    ]);
  }
  if (typeof studentId !== "string") {
    throw new AppErrors_default(400, "Invalid student id type", "Invalid_Student_Id", [
      {
        field: "Book Time Slot.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (typeof timeSlotId !== "string") {
    throw new AppErrors_default(
      400,
      "Invalid time slot id type",
      "Invalid_TimeSlot_Id",
      [
        {
          field: "Book Time Slot.",
          message: "Please give valid type of time slot id."
        }
      ]
    );
  }
  if (role !== Role.STUDENT) {
    throw new AppErrors_default(
      403,
      "Only student can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Booking time slot.",
          message: "Only student can book time slot."
        }
      ]
    );
  }
  const result = await studentService.createBooking(studentId, timeSlotId, {
    subjectId
  });
  return AppResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Booking created successfully",
    data: result
  });
});
var cancelBooking4 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const bookingId = req.params.id;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid student id type", "Invalid_Student_Id", [
      {
        field: "Book Time Slot.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (typeof bookingId !== "string") {
    throw new AppErrors_default(400, "Invalid booking id type", "Invalid_Booking_Id", [
      {
        field: "Cancel Booking slot.",
        message: "Please give valid type of booking id."
      }
    ]);
  }
  if (role !== Role.STUDENT) {
    throw new AppErrors_default(
      403,
      "Only student can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Booking time slot.",
          message: "Only student can book time slot."
        }
      ]
    );
  }
  const result = await studentService.cancelBooking(userId, bookingId);
  return AppResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Booking cancelled successfully",
    data: result
  });
});
var createReview2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const bookingId = req.params?.id;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid student id type", "Invalid_Student_Id", [
      {
        field: "Making Review.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (typeof bookingId !== "string") {
    throw new AppErrors_default(400, "Invalid booking id type", "Invalid_Booking_Id", [
      {
        field: "Making Review.",
        message: "Please give valid type of booking id."
      }
    ]);
  }
  if (role !== Role.STUDENT) {
    throw new AppErrors_default(
      403,
      "Only student can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Making Review.",
          message: "Only student can make review."
        }
      ]
    );
  }
  const result = await studentService.createReview(userId, bookingId, req.body);
  return AppResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Review made successfully",
    data: result
  });
});
var getStudentProfile2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  if (typeof userId !== "string") {
    throw new AppErrors_default(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Complete Booking.",
        message: "Please give valid type of id."
      }
    ]);
  }
  if (role !== Role.STUDENT) {
    throw new AppErrors_default(
      403,
      "Only student can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Retrieve my profile.",
          message: "Only tutor role can complete booking."
        }
      ]
    );
  }
  const result = await studentService.getStudentProfile(userId);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Student profile retrieve successfully",
    data: result
  });
});
var studentController = {
  createBooking: createBooking2,
  cancelBooking: cancelBooking4,
  createReview: createReview2,
  getStudentProfile: getStudentProfile2
};

// src/modules/student/student.route.ts
var router5 = Router5();
router5.get(
  "/me",
  authMiddleware_default("STUDENT"),
  studentController.getStudentProfile
);
router5.post(
  "/bookings/:id",
  authMiddleware_default("STUDENT"),
  studentController.createBooking
);
router5.patch(
  "/bookings/cancel/:id",
  authMiddleware_default("STUDENT"),
  studentController.cancelBooking
);
router5.post(
  "/bookings/review/:id",
  authMiddleware_default("STUDENT"),
  studentController.createReview
);
var studentRoutes = router5;

// src/modules/public/public.route.ts
import { Router as Router6 } from "express";

// src/modules/public/public.service.ts
var getAllFeaturedTutor = async () => {
  const result = await prisma.tutorProfile.findMany({
    where: {
      isFeatured: true
    },
    include: {
      user: true,
      education: true,
      subjects: {
        include: {
          subject: {
            include: {
              category: true
            }
          }
        }
      }
    }
  });
  return result;
};
var getAllTutor = async (payload) => {
  const { search, rating, minPrice, maxPrice, category, page, limit, skip } = payload;
  const andConditions = [];
  if (search) {
    andConditions.push({
      subjects: {
        some: {
          subject: {
            name: {
              contains: search,
              mode: "insensitive"
            }
          }
        }
      }
    });
  }
  if (category) {
    andConditions.push({
      subjects: {
        some: {
          subject: {
            category: {
              name: {
                equals: category,
                mode: "insensitive"
              }
            }
          }
        }
      }
    });
  }
  if (minPrice !== void 0 || maxPrice !== void 0) {
    andConditions.push({
      hourlyRate: {
        ...minPrice !== void 0 && { gte: minPrice },
        ...maxPrice !== void 0 && { lte: maxPrice }
      }
    });
  }
  const tutors = await prisma.tutorProfile.findMany({
    where: {
      AND: andConditions
    },
    include: {
      user: true,
      subjects: {
        include: {
          subject: {
            include: {
              category: true
            }
          }
        }
      },
      education: true,
      availabilities: true,
      tutorTimeSlots: true,
      reviews: true
    }
  });
  let filteredTutors = tutors;
  if (rating !== void 0) {
    filteredTutors = tutors.filter((tutor) => {
      if (!tutor.reviews.length) return false;
      const avg = tutor.reviews.reduce((sum, r) => sum + Number(r.rating), 0) / tutor.reviews.length;
      return avg >= rating;
    });
  }
  const total = filteredTutors.length;
  const paginatedData = filteredTutors.slice(skip, skip + limit);
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit)
    },
    data: paginatedData
  };
};
var getTutorById = async (id) => {
  if (!id) {
    throw new AppErrors_default(
      400,
      "Tutor id is required to update status.",
      "Missing User id",
      [
        {
          field: "Tutor public profile",
          message: "Please give tutor id."
        }
      ]
    );
  }
  const result = await prisma.tutorProfile.findUnique({
    where: {
      id
    },
    include: {
      user: true,
      education: true,
      subjects: {
        include: {
          subject: {
            include: {
              category: true
            }
          }
        }
      },
      availabilities: true,
      tutorTimeSlots: true,
      reviews: {
        include: {
          student: true
        }
      },
      bookings: true
    }
  });
  console.log(result);
  if (!result) {
    throw new AppErrors_default(
      404,
      "No tutor found with this id.",
      "Invalid_tutor_Id",
      [
        {
          field: "Retrieve tutor by id.",
          message: "Please provide a valid tutor id."
        }
      ]
    );
  }
  return result;
};
var publicService = {
  getAllFeaturedTutor,
  getAllTutor,
  getTutorById
};

// src/utils/paginationHealper.ts
var paginationHelper = (options) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 5;
  const skip = limit * (page - 1);
  return { page, limit, skip };
};
var paginationHealper_default = paginationHelper;

// src/modules/public/public.controller.ts
var getAllFeaturedTutor2 = catchAsync_default(async (req, res) => {
  const result = await publicService.getAllFeaturedTutor();
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Review featured tutor successfully",
    data: result
  });
});
var getTutors = catchAsync_default(async (req, res) => {
  const { subject, rating, minPrice, maxPrice, category } = req.query;
  const search = typeof req.query.search === "string" ? req.query.search : "";
  const tutorRating = typeof rating === "string" ? Number(rating) : void 0;
  const tutorMinPrice = typeof minPrice === "string" ? Number(minPrice) : void 0;
  const tutorMaxPrice = typeof maxPrice === "string" ? Number(maxPrice) : void 0;
  const subjectCategory = typeof category === "string" ? category : void 0;
  console.log(subject);
  const { page, limit, skip } = paginationHealper_default(req.query);
  console.log({ page, limit, skip });
  const result = await publicService.getAllTutor({
    search,
    rating: tutorRating,
    minPrice: tutorMinPrice,
    maxPrice: tutorMaxPrice,
    category: subjectCategory,
    page,
    limit,
    skip
  });
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Review featured tutor successfully",
    data: result
  });
});
var getTutorById2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  if (typeof id !== "string") {
    throw new AppErrors_default(400, "User id types error", "Invalid_User_id", [
      {
        field: "Update user status.",
        message: "Please give valid type of user id."
      }
    ]);
  }
  const result = await publicService.getTutorById(id);
  console.log(result);
  return AppResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Tutor retrieve successfully.",
    data: result
  });
});
var publicController = {
  getAllFeaturedTutor: getAllFeaturedTutor2,
  getTutors,
  getTutorById: getTutorById2
};

// src/modules/public/public.route.ts
var router6 = Router6();
router6.get("/", publicController.getTutors);
router6.get("/features", publicController.getAllFeaturedTutor);
router6.get("/tutor/:id", publicController.getTutorById);
var publicRoutes = router6;

// src/modules/rag/rag.route.ts
import { Router as Router7 } from "express";

// src/modules/rag/embedding.service.ts
var EmbeddingService = class {
  apikey;
  apiurl = "https://openrouter.ai/api/v1";
  embeddingModel;
  constructor() {
    this.apikey = config2.openrouter_api_key || "";
    this.embeddingModel = config2.openrouter_embedding_model;
    if (!this.apikey) throw new AppErrors_default(500, "OpenRouter API key is required");
  }
  async generateEmbedding(content) {
    try {
      const response = await fetch(`${this.apiurl}/embeddings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apikey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ input: content, model: this.embeddingModel })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new AppErrors_default(422, `Embedding failed: ${errorText}`);
      }
      const data = await response.json();
      return data.data[0].embedding;
    } catch (err) {
      console.error("Embedding error:", err);
      throw new AppErrors_default(500, err.message || "Failed to generate embedding");
    }
  }
};

// src/modules/rag/indexing.service.ts
var toVectorLiteral = (vector) => `[${vector.join(",")}]`;
var IndexingService = class {
  embeddingService;
  constructor() {
    this.embeddingService = new EmbeddingService();
  }
  async indexDocument(chunkKey, sourceType, sourceId, content, sourceLabel, metadata) {
    try {
      const embedding = await this.embeddingService.generateEmbedding(content);
      const vectorLiteral = toVectorLiteral(embedding);
      await prisma.$executeRaw(prismaNamespace_exports.sql`
        INSERT INTO "document_embeddings"
        ("id", "chunkKey", "sourceType", "sourceId", "sourceLabel", "content", "metadata", "embedding", "updatedAt")
        VALUES (
          ${prismaNamespace_exports.raw("gen_random_uuid()::TEXT")}, ${chunkKey}, ${sourceType}, ${sourceId},
          ${sourceLabel || null}, ${content}, ${JSON.stringify(metadata || {})}::jsonb,
          CAST(${vectorLiteral} AS vector), NOW()
        )
        ON CONFLICT ("chunkKey") DO UPDATE SET
          "content" = EXCLUDED."content", "metadata" = EXCLUDED."metadata",
          "embedding" = EXCLUDED."embedding", "updatedAt" = NOW(), "isDeleted" = false
      `);
    } catch (error) {
      console.error(`Index error: ${error.message}`);
      throw new AppErrors_default(500, error.message);
    }
  }
  async indexTutorsData() {
    console.log("\u{1F4DA} Indexing tutors...");
    const tutors = await prisma.user.findMany({
      where: { role: "TUTOR", status: "UNBANNED" },
      include: {
        tutorProfiles: {
          include: {
            subjects: { include: { subject: { include: { category: true } } } },
            education: true,
            reviews: true
          }
        }
      }
    });
    let count = 0;
    for (const tutor of tutors) {
      const profile = tutor.tutorProfiles;
      if (!profile) continue;
      const subjects = profile.subjects.map((s) => s.subject?.name).filter(Boolean).join(", ");
      const education = profile.education.map((e) => `${e.degree} in ${e.fieldOfStudy} from ${e.institute}`).join("; ");
      const avgRating = profile.reviews.length > 0 ? (profile.reviews.reduce(
        (a, r) => a + r.rating,
        0
      ) / profile.reviews.length).toFixed(1) : "No ratings";
      const content = `Tutor: ${tutor.name}
Email: ${tutor.email}
Hourly Rate: $${profile.hourlyRate}/hr
Subjects: ${subjects}
Education: ${education}
Average Rating: ${avgRating}/5
Featured: ${profile.isFeatured ? "Yes" : "No"}`;
      await this.indexDocument(
        `tutor-${tutor.id}`,
        "TUTOR",
        tutor.id,
        content,
        tutor.name,
        {
          tutorId: profile.id,
          userId: tutor.id,
          name: tutor.name,
          hourlyRate: profile.hourlyRate,
          subjects,
          averageRating: avgRating,
          isFeatured: profile.isFeatured
        }
      );
      count++;
    }
    console.log(`\u2705 Indexed ${count} tutors`);
    return { success: true, indexedCount: count };
  }
  async indexSubjectsData() {
    console.log("\u{1F4DA} Indexing subjects...");
    const subjects = await prisma.subjects.findMany({
      include: { category: true }
    });
    let count = 0;
    for (const subject of subjects) {
      const content = `Subject: ${subject.name}
Category: ${subject.category?.name || "Uncategorized"}
Description: ${subject.category?.description || "No description"}`;
      await this.indexDocument(
        `subject-${subject.id}`,
        "SUBJECT",
        subject.id,
        content,
        subject.name,
        {
          subjectId: subject.id,
          categoryId: subject.category_id
        }
      );
      count++;
    }
    console.log(`\u2705 Indexed ${count} subjects`);
    return { success: true, indexedCount: count };
  }
  async indexFAQsData() {
    console.log("\u{1F4DA} Indexing FAQs...");
    const faqs = [
      {
        id: "faq-1",
        q: "How do I book a session?",
        a: "Browse tutors, select one, pick a time slot, and confirm. First session is free!"
      },
      {
        id: "faq-2",
        q: "How do I become a tutor?",
        a: "Register as Tutor, complete your profile with hourly rate, education, subjects, and availability."
      },
      {
        id: "faq-3",
        q: "How does pricing work?",
        a: "Tutors set rates ($15-$100/hr). Pay after session. Accept credit/debit cards."
      },
      {
        id: "faq-4",
        q: "Can I cancel?",
        a: "Yes, cancel from Dashboard > Bookings. Free up to 24h before."
      },
      {
        id: "faq-5",
        q: "What subjects?",
        a: "50+ subjects: Math, Physics, Chemistry, Biology, English, Programming, Data Science, and more!"
      },
      {
        id: "faq-6",
        q: "Refunds?",
        a: "Request refund within 24h if unsatisfied. Satisfaction guaranteed."
      },
      {
        id: "faq-7",
        q: "Tutor vetting?",
        a: "Background checks, ID verification, qualification validation. <5% accepted."
      }
    ];
    let count = 0;
    for (const faq of faqs) {
      const content = `Q: ${faq.q}
A: ${faq.a}`;
      await this.indexDocument(`faq-${faq.id}`, "FAQ", faq.id, content, faq.q, {
        question: faq.q
      });
      count++;
    }
    console.log(`\u2705 Indexed ${count} FAQs`);
    return { success: true, indexedCount: count };
  }
  async indexAllData() {
    const tutors = await this.indexTutorsData();
    const subjects = await this.indexSubjectsData();
    const faqs = await this.indexFAQsData();
    return {
      tutors: tutors.indexedCount,
      subjects: subjects.indexedCount,
      faqs: faqs.indexedCount,
      total: tutors.indexedCount + subjects.indexedCount + faqs.indexedCount
    };
  }
};

// src/modules/rag/llm.service.ts
var LLMService = class {
  apikey;
  apiurl = "https://openrouter.ai/api/v1";
  model;
  constructor() {
    this.apikey = config2.openrouter_api_key || "";
    this.model = config2.openrouter_llm_model;
    if (!this.apikey) throw new AppErrors_default(500, "OpenRouter API key is required");
  }
  async generateResponse(prompt, context) {
    try {
      let fullPrompt = context.length > 0 ? `Context information:
${context.join("\n")}

Question: ${prompt}

Answer based on context. If not found, say "I don't have that information." Be concise and helpful.` : prompt;
      const response = await fetch(`${this.apiurl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apikey}`,
          "Content-Type": "application/json",
          "X-Title": "SkillBridge"
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: "You are SkillBridge AI assistant. Help with tutors, subjects, booking, pricing."
            },
            { role: "user", content: fullPrompt }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new AppErrors_default(response.status, `LLM error: ${errorText}`);
      }
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("LLM error:", error);
      throw new AppErrors_default(500, "Failed to generate response");
    }
  }
};

// src/modules/rag/rag.service.ts
var toVectorLiteral2 = (vector) => `[${vector.join(",")}]`;
var RagService = class {
  embeddingService;
  llmService;
  indexingService;
  constructor() {
    this.embeddingService = new EmbeddingService();
    this.llmService = new LLMService();
    this.indexingService = new IndexingService();
  }
  async ingestAllData() {
    return this.indexingService.indexAllData();
  }
  async retrieveRelevantDocuments(query, limit = 5, sourceType) {
    try {
      const embedding = await this.embeddingService.generateEmbedding(query);
      const vectorLiteral = toVectorLiteral2(embedding);
      const result = await prisma.$queryRaw(prismaNamespace_exports.sql`
        SELECT "id", "chunkKey", "sourceType", "sourceId", "sourceLabel", "content", "metadata", "createdAt",
        1 - (embedding <=> CAST(${vectorLiteral} AS vector)) AS similarity
        FROM "document_embeddings"
        WHERE "isDeleted" = false
        ${sourceType ? prismaNamespace_exports.sql` AND "sourceType" = ${sourceType}` : prismaNamespace_exports.empty}
        ORDER BY embedding <=> CAST(${vectorLiteral} AS vector)
        LIMIT ${limit}
      `);
      return result;
    } catch (error) {
      console.error(`Retrieve error: ${error.message}`);
      throw new AppErrors_default(500, error.message);
    }
  }
  async generateAnswer(query, limit = 5, sourceType) {
    try {
      const relevantDocs = await this.retrieveRelevantDocuments(
        query,
        limit,
        sourceType
      );
      const context = relevantDocs.filter((d) => d.content).map((d) => d.content);
      const answer = await this.llmService.generateResponse(query, context);
      return {
        answer,
        sources: relevantDocs.map((doc) => ({
          id: doc.id,
          sourceType: doc.sourceType,
          sourceLabel: doc.sourceLabel,
          similarity: doc.similarity
        })),
        contextUsed: context.length > 0
      };
    } catch (error) {
      console.error(`Generate error: ${error.message}`);
      throw new AppErrors_default(500, error.message);
    }
  }
};

// src/lib/redis.ts
import { createClient } from "redis";
var RedisService = class {
  client = null;
  isConnected = false;
  async connect() {
    try {
      const redisUrl = config2.redis_url;
      this.client = createClient({ url: redisUrl });
      this.client.on("error", (error) => {
        console.error("Redis Error:", error);
        this.isConnected = false;
      });
      this.client.on("connect", () => {
        this.isConnected = true;
        console.log("Redis connected");
      });
      this.client.on("ready", () => {
        this.isConnected = true;
        console.log("Redis ready");
      });
      this.client.on("reconnecting", () => {
        this.isConnected = false;
        console.log("Redis reconnecting");
      });
      this.client.on("end", () => {
        this.isConnected = false;
        console.log("Redis disconnected");
      });
      await this.client.connect();
      this.isConnected = true;
      console.log("Redis connected successfully");
    } catch (error) {
      this.isConnected = false;
      console.error("Redis connection error:", error);
    }
  }
  // Ensure redis connection is established and client is ready
  ensureConnection() {
    if (!this.client) {
      throw new AppErrors_default(
        500,
        "Redis is not connected",
        "REDIS_CONNECTION_ERROR"
      );
    }
    if (!this.isConnected) {
      throw new AppErrors_default(500, "Redis is not ready to use", "REDIS_NOT_READY");
    }
    return this.client;
  }
  async get(key) {
    try {
      const client = this.ensureConnection();
      return await client.get(key);
    } catch (error) {
      console.error("Error getting data from Redis:", error);
      return null;
    }
  }
  async set(key, value, ttl) {
    try {
      const client = this.ensureConnection();
      const stringValue = typeof value === "string" ? value : JSON.stringify(value);
      await client.set(key, stringValue, ttl ? { EX: ttl } : void 0);
    } catch (error) {
      console.error("Error setting data in Redis:", error);
    }
  }
  async update(key, value, ttl) {
    try {
      const client = this.ensureConnection();
      const stringValue = typeof value === "string" ? value : JSON.stringify(value);
      await client.set(key, stringValue, ttl ? { EX: ttl } : void 0);
    } catch (error) {
      console.error("Error updating data in Redis:", error);
    }
  }
  async delete(key) {
    try {
      const client = this.ensureConnection();
      await client.del(key);
    } catch (error) {
      console.error("Error deleting data from Redis:", error);
    }
  }
  async isAvailable() {
    try {
      const client = this.ensureConnection();
      await client.ping();
      return true;
    } catch (error) {
      console.error("Error checking Redis availability:", error);
      return false;
    }
  }
  async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.quit();
        this.isConnected = false;
        console.log("Redis disconnected");
      }
    } catch (error) {
      console.error("Error disconnecting from Redis:", error);
    }
  }
};
var redisService = new RedisService();

// src/modules/rag/rag.controller.ts
var ragService = new RagService();
var ingestData = catchAsync_default(async (req, res) => {
  const result = await ragService.ingestAllData();
  AppResponse_default(res, {
    message: "All data indexed",
    statusCode: 200,
    success: true,
    data: result
  });
});
var queryRag = catchAsync_default(async (req, res) => {
  const { query, limit, sourceType } = req.body;
  if (!query) throw new AppErrors_default(400, "Query is required");
  const cacheKey = `rag:query:${query}:${limit ?? 5}:${sourceType || "all"}`;
  try {
    const cacheData = await redisService.get(cacheKey);
    if (cacheData) {
      AppResponse_default(res, {
        message: "Query successful from cache",
        statusCode: 200,
        success: true,
        data: JSON.parse(cacheData)
      });
      return;
    }
  } catch (error) {
    console.warn();
  }
  const result = await ragService.generateAnswer(query, limit ?? 5, sourceType);
  try {
    await redisService.set(cacheKey, JSON.stringify(result), 600);
  } catch (error) {
    console.error("Error setting data in Redis", error);
  }
  AppResponse_default(res, {
    message: "Query successful",
    statusCode: 200,
    success: true,
    data: result
  });
});

// src/modules/rag/rag.route.ts
var router7 = Router7();
router7.post("/ingest", ingestData);
router7.post("/query", queryRag);
var ragRoutes = router7;

// src/app.ts
var app = express();
app.use(express.json());
app.use(
  cors({
    origin: [config2.frontend_url, config2.backend_url],
    credentials: true
  })
);
app.all(
  "/api/auth/*splat",
  async (req, res, next) => {
    try {
      await toNodeHandler(auth)(req, res);
    } catch (err) {
      next(err);
    }
  }
);
app.use("/api/public", publicRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rag", ragRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the skill bridge server.");
});
app.use(notFoundError_default);
app.use(globalErrorHandler_default);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
