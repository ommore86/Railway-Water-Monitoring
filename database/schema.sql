USE railway_water_monitor;

CREATE TABLE stations (
    station_id VARCHAR(20) PRIMARY KEY,
    station_name VARCHAR(100) NOT NULL
);

CREATE TABLE trains (
    train_no VARCHAR(20) PRIMARY KEY,
    train_name VARCHAR(100) NOT NULL
);

CREATE TABLE coaches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_no VARCHAR(20),
    coach_no VARCHAR(10),

    UNIQUE(train_no, coach_no),

    FOREIGN KEY (train_no) REFERENCES trains(train_no)
        ON DELETE CASCADE
);

CREATE TABLE water_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,

    station_id VARCHAR(20),
    train_no VARCHAR(20),
    coach_no VARCHAR(10),

    water_level INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE(train_no, coach_no),

    FOREIGN KEY (station_id) REFERENCES stations(station_id) ON DELETE CASCADE,
    FOREIGN KEY (train_no) REFERENCES trains(train_no) ON DELETE CASCADE
);

SHOW TABLES;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role ENUM('superadmin','admin','user') DEFAULT 'user',
    station_id VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);