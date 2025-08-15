CREATE DATABASE tuexperto;

CREATE TABLE users(
    user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    rut VARCHAR(12) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_date TIMESTAMP DEFAULT NULL
);

INSERT INTO users(rut, name, lastname, email, password, telefono) VALUES 
    ('21410263-3', 'Rodrigo','Romero', 'rodrigo@gmail.com', 'rodrigo123', '912345678');

CREATE TABLE USER_TYPES(
    user_type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO USER_TYPES(type_name) VALUES 
    ('ADMIN'),
    ('CLIENTE'),
    ('PROFESIONAL');

CREATE TABLE USERS_USERTYPE(
    user_usertype_id SERIAL PRIMARY KEY,
    user_type_id INT NOT NULL,
    user_id uuid NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_type_id) REFERENCES USER_TYPES(user_type_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

INSERT INTO USERS_USERTYPE (user_type_id, user_id)
VALUES (1, '4413569e-40b6-436c-9892-d8806ab5cf11');

CREATE TABLE PROFESSIONS(
    profession_id SERIAL PRIMARY KEY,
    profession_name VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO PROFESSIONS(profession_name)
VALUES ('PINTOR/A'),('CARPINTERO/A'),('CERRAJERO/A'),('RELOJERO/A'), ('JARDINERO/A'), ('ALBAÑIL'),('OBRERO/A');

CREATE TABLE PROFESSIONALS(
    professional_id SERIAL PRIMARY KEY,
    profession_id INT NOT NULL,
    user_id uuid NOT NULL,
    description TEXT,
    verified BOOLEAN DEFAULT FALSE,
    specialization VARCHAR(100),
    UNIQUE (profession_id, user_id),
    FOREIGN KEY (profession_id) REFERENCES PROFESSIONS(profession_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);