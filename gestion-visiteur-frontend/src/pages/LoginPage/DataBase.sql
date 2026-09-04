-- Créer la base de données
CREATE DATABASE CleanVisitorDb;
GO

USE CleanVisitorDb;
GO

-- Table Visitors
CREATE TABLE IF NOT EXISTS "Visitors" (
    "Id" SERIAL PRIMARY KEY,
    "Nom" VARCHAR(100) NOT NULL,
    "Telephone" VARCHAR(50) NULL,
    "Email" VARCHAR(150) NULL,
    "DateEnregistrement" TIMESTAMP WITH TIME ZONE NULL,
    "DateCreation" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "DeletedAt" TIMESTAMP WITH TIME ZONE NULL
);
GO

-- Table User
CREATE TABLE IF NOT EXISTS "User" (
    "Id" SERIAL PRIMARY KEY,
    "Nom" VARCHAR(100) NOT NULL,
    "Prenom" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(150) UNIQUE NOT NULL,
    "Telephone" VARCHAR(50) NULL,
    "PasswordHash" TEXT NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "Role" VARCHAR(50) NOT NULL,
    "Service" VARCHAR(50) NULL,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "DeletedAt" TIMESTAMP WITH TIME ZONE NULL,
    "VisitorId" INT NULL,
    "ResetPasswordToken" TEXT NULL,
    "ResetPasswordTokenExpiry" TIMESTAMP WITH TIME ZONE NULL
);
GO

-- Table Visit
CREATE TABLE IF NOT EXISTS "Visit" (
    "Id" SERIAL PRIMARY KEY,
    "Motif" TEXT NOT NULL,
    "Date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "HeureDepart" TIMESTAMP WITH TIME ZONE NULL,
    "HeureArriver" TIMESTAMP WITH TIME ZONE NULL,
    "Statut" INT NOT NULL DEFAULT 1,
    "Service" INT NOT NULL,
    "IdVisitor" INT NOT NULL,
    "UserId" INT NULL,
    "AccessCode" VARCHAR(50) NULL,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "DeletedAt" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_Visit_Visitor" FOREIGN KEY ("IdVisitor") REFERENCES "Visitors" ("Id"),
    CONSTRAINT "FK_Visit_User" FOREIGN KEY ("UserId") REFERENCES "User" ("Id")
);
GO

-- Table Notifications
CREATE TABLE IF NOT EXISTS "Notifications" (
    "Id" SERIAL PRIMARY KEY,
    "Message" TEXT NOT NULL,
    "DateEnvoi" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "IsRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "IdVisitor" INT NULL,
    "Type" VARCHAR(100) NULL,
    "ReceiverRole" VARCHAR(100) NULL
);
GO

-- Table Dashboard 
CREATE TABLE IF NOT EXISTS "Visit" (
    "Id" SERIAL PRIMARY KEY,
    "Date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "Statut" INT NOT NULL DEFAULT 0,
    "IdVisitor" INT NOT NULL
);
GO

-- Table System Configurations
CREATE TABLE IF NOT EXISTS system_configs (
    id INT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    pass_validity_hours INT NOT NULL,
    max_concurrent_visitors INT NOT NULL,
    auto_expire_hours INT NOT NULL,
    enable_email_notifs BOOLEAN NOT NULL DEFAULT TRUE,
    company_services_json TEXT NULL
);
Go
-- "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=CleanVisitorDb;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False;"