CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
INSERT INTO "User" (id, email, password, name, "updatedAt") 
VALUES ('usr_1', 'admin@find.com', '$2b$10$Wfj8BF55qVSom5G2wfRaHeYf8jqwZCImUjw5AAJfPYKjPgzWHFvra', 'Admin User', NOW()) 
ON CONFLICT (email) DO NOTHING;
