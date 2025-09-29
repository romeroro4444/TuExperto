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
    professional_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    profession_id INT NOT NULL,
    user_id uuid NOT NULL,
    description TEXT,
    verified BOOLEAN DEFAULT FALSE,
    specialization VARCHAR(100),
    UNIQUE (profession_id, user_id),
    FOREIGN KEY (profession_id) REFERENCES professions(profession_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS USERS_USERTYPE;

CREATE TABLE USERS_USERTYPE(
    user_type_id INT NOT NULL,
    user_id uuid NOT NULL,
    assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (user_type_id, user_id)
);

DROP TABLE IF EXISTS PROFESSIONALS;

CREATE TABLE PROFESSIONALS(
    professional_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    profession_id INT NOT NULL,
    user_id uuid NOT NULL,
    description TEXT,
    verified BOOLEAN DEFAULT FALSE,
    UNIQUE (profession_id, user_id),
    FOREIGN KEY (profession_id) REFERENCES professions(profession_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE SPECIALIZATIONS(
    specialization_id SERIAL PRIMARY KEY,
    specialization_name VARCHAR(255) NOT NULL
);

CREATE TABLE PROFESSIONALS_SPECIALIZATION(
    professional_id uuid NOT NULL,
    specialization_id INT NOT NULL,
    PRIMARY KEY (professional_id, specialization_id)
);

CREATE TABLE SERVICES(
    service_id SERIAL PRIMARY KEY,
    professional_id uuid NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    modality VARCHAR(255),
    duration VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    publication_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professional_id) REFERENCES PROFESSIONALS(professional_id) ON DELETE CASCADE
);

CREATE TABLE SERVICES_REQUESTS(
    request_id SERIAL PRIMARY KEY,
    user_id uuid NOT NULL,
    profession_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget INT NOT NULL,
    publication_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (profession_id) REFERENCES professions(profession_id)
);