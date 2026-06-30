-- Créer la base de données
CREATE DATABASE CleanVisitorDb;
GO

USE CleanVisitorDb;
GO

-- Table Visitors
CREATE TABLE Visitors (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nom NVARCHAR(100) NOT NULL,
    Telephone NVARCHAR(20),
    Email NVARCHAR(150),
    DateEnregistrement DATETIME,
    DateCreation DATETIME DEFAULT GETDATE(),
    IsDeleted BIT DEFAULT 0,
    DeletedAt DATETIME NULL
);
GO

-- Table User
CREATE TABLE [User] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nom NVARCHAR(100) NOT NULL,
    Prenom NVARCHAR(100),
    Email NVARCHAR(150) NOT NULL,
    Role NVARCHAR(50),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    PasswordHash NVARCHAR(255),
    IsDeleted BIT DEFAULT 0,
    DeletedAt DATETIME NULL,
    VisitorId INT NULL,
    ResetPasswordToken NVARCHAR(255) NULL,
    ResetPasswordTokenExpiry DATETIME NULL,
    FOREIGN KEY (VisitorId) REFERENCES Visitors(Id)
);
GO

-- Table Visit
CREATE TABLE Visit (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Motif NVARCHAR(255),
    Date DATETIME,
    HeureArriver DATETIME,
    HeureDepart DATETIME NULL,
    Statut NVARCHAR(50),
    IdVisitor INT NOT NULL,
    Service NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    DeletedAt DATETIME NULL,
    FOREIGN KEY (IdVisitor) REFERENCES Visitors(Id)
);
GO

-- Table Notifications
CREATE TABLE Notifications (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Message NVARCHAR(500),
    DateEnvoi DATETIME DEFAULT GETDATE(),
    IsRead BIT DEFAULT 0,
    IdVisitor INT NULL,
    Type NVARCHAR(50),
    ReceiverRole NVARCHAR(50),
    FOREIGN KEY (IdVisitor) REFERENCES Visitors(Id)
);
GO
-- "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=CleanVisitorDb;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False;"