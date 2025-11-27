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

CREATE TABLE APPOINTMENTS(
    appointment_id SERIAL PRIMARY KEY,
    service_id INT NOT NULL,
    user_id uuid NOT NULL,
    reservation_date TIMESTAMP NOT NULL,
    status VARCHAR(255) NOT NULL,
    FOREIGN KEY (service_id) REFERENCES SERVICES(service_id),
    FOREIGN KEY (user_id) REFERENCES USERS(user_id)
);

ALTER TABLE appointments
ALTER COLUMN status SET DEFAULT 'PENDIENTE';

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_service_id_fkey;
ALTER TABLE appointments
ADD CONSTRAINT appointments_service_id_fkey
FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE;

CREATE TABLE NOTIFICATIONS(
    notification_id SERIAL PRIMARY KEY,
    appointment_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    mesagge TEXT,
    date_sent TIMESTAMP NOT NULL,
    sent_status VARCHAR(50) NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES APPOINTMENTS(appointment_id)
);

CREATE TABLE AUDIT(
    audit_id SERIAL PRIMARY KEY,
    user_id uuid NOT NULL,
    affected_table VARCHAR(50) NOT NULL,
    affected_record_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

ALTER TABLE audit
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE audit
DROP CONSTRAINT audit_user_id_fkey,
ADD CONSTRAINT audit_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;

CREATE TABLE REVIEWS(
    review_id SERIAL PRIMARY KEY,
    appointment_id INT NOT NULL,
    comment TEXT,
    rating INT NOT NULL,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES APPOINTMENTS(appointment_id)
);

ALTER TABLE reviews ADD COLUMN done BOOLEAN DEFAULT FALSE;

ALTER TABLE notifications
DROP CONSTRAINT notifications_appointment_id_fkey;

ALTER TABLE notifications
ADD CONSTRAINT notifications_appointment_id_fkey
FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
ON DELETE CASCADE;

ALTER TABLE reviews
DROP CONSTRAINT reviews_appointment_id_fkey;

ALTER TABLE reviews
ADD CONSTRAINT reviews_appointment_id_fkey
FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
ON DELETE CASCADE;

CREATE TABLE COMPLAINTS(
    complaint_id SERIAL PRIMARY KEY,
    appointment_id INT NOT NULL,
    service_id INT NOT NULL,
    reason VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    claim_status VARCHAR(50) NOT NULL,
    date_of_complaint TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_of_incident TIMESTAMP NOT NULL,
    evidence VARCHAR(255),
    FOREIGN KEY (appointment_id) REFERENCES APPOINTMENTS(appointment_id),
    FOREIGN KEY (service_id) REFERENCES SERVICES(service_id)
);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS decision_comment TEXT;

CREATE TABLE TRANSACTIONS(
    transaction_id SERIAL PRIMARY KEY,
    professional_id uuid NOT NULL,
    amount DECIMAL(12,2),
    transfer_details TEXT NOT NULL,
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (professional_id) REFERENCES PROFESSIONALS(professional_id)
);

ALTER TABLE PROFESSIONALS
ADD COLUMN IF NOT EXISTS balance DECIMAL(12,2) DEFAULT 0.00 NOT NULL;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS region VARCHAR(100),
ADD COLUMN IF NOT EXISTS comuna VARCHAR(100);

ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0 NOT NULL;

ALTER TABLE SERVICES
ADD COLUMN IF NOT EXISTS status VARCHAR(50),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE SERVICES_REQUESTS
ADD COLUMN IF NOT EXISTS status VARCHAR(50),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE services
ALTER COLUMN active SET DEFAULT FALSE;