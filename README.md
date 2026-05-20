# TuExperto - Plataforma de Marketplace de Servicios Profesionales

<div align="center">

![Estado](https://img.shields.io/badge/Estado-Activo-brightgreen)
![Versión](https://img.shields.io/badge/Versión-1.0.0-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green)

**Conecta con profesionales calificados. Solicita servicios con confianza.**

[Características](#-características) • [Instalación](#-instalación) • [Uso](#-uso) • [Arquitectura](#-arquitectura) • [APIs](#-integraciones)

</div>

---

## Descripción

**TuExperto** es una plataforma digital innovadora de marketplace que conecta usuarios que requieren servicios específicos con profesionales calificados. Similar a plataformas como Fiverr o TaskRabbit, pero enfocada en servicios técnicos y oficios en tu región.

### ¿Qué puedes hacer en TuExperto?

- **Como Cliente:**
  - 🔍 Buscar profesionales por especialidad y región
  - 📅 Reservar citas con profesionales verificados
  - 💰 Pagar de forma segura
  - ⭐ Dejar reseñas y calificaciones
  - 📝 Crear solicitudes de trabajos con presupuesto

- **Como Profesional:**
  - 🏢 Crear perfil profesional verificado
  - 📢 Publicar servicios con descripción y precio
  - 📊 Gestionar citas y solicitudes
  - 💵 Recibir pagos y retirar fondos
  - 📈 Acumular reputación con calificaciones

- **Como Administrador:**
  - 🎛️ Panel de control centralizado
  - ✅ Moderar servicios y solicitudes
  - 📋 Gestionar reclamaciones y denuncias
  - 📊 Ver estadísticas y análisis

---

## 🎯 Características Principales

### Autenticación & Usuarios

- ✅ Sistema de registro con roles (Admin, Cliente, Profesional)
- ✅ Autenticación JWT segura con bcrypt
- ✅ Verificación de email y RUT único
- ✅ Perfiles diferenciados por rol

### Gestión de Servicios

- ✅ Crear, editar y eliminar servicios
- ✅ Servicios presenciales o remotos
- ✅ Sistema de moderación admin
- ✅ Activación/desactivación de servicios
- ✅ Búsqueda y filtrado por región y profesión

### Solicitudes de Trabajos

- ✅ Crear solicitudes con presupuesto indicativo
- ✅ Búsqueda de profesionales por especialidad
- ✅ Sistema de moderación
- ✅ Activación/desactivación

### Sistema de Citas

- ✅ Reserva de citas con profesionales
- ✅ Estados: Pendiente, Confirmada, Cancelada, Completada
- ✅ Cancelación por ambas partes
- ✅ Decisión del profesional (aceptar/rechazar)
- ✅ Notificaciones automáticas por email

### Pagos & Transacciones

- ✅ **PayPal** - Checkout seguro
- ✅ Estados: Success, Pending, Failure
- ✅ Webhooks para confirmación automática

### Reseñas & Calificaciones

- ✅ Sistema de 5 estrellas
- ✅ Comentarios detallados
- ✅ Reseñas del profesional y del cliente
- ✅ Histórico de reputación

### Panel Administrativo

- ✅ Dashboard con estadísticas
- ✅ Gestión de usuarios y profesionales
- ✅ Moderación de servicios y solicitudes
- ✅ Gestión de citas y pagos
- ✅ Sistema de reclamaciones y denuncias

### Retiros & Ganancias

- ✅ Solicitud de retiro de fondos
- ✅ Tracking de balance profesional
- ✅ Historial de transacciones

---

## 🛠️ Stack Tecnológico

### Frontend

| Tecnología              | Versión | Propósito                    |
| ----------------------- | ------- | ---------------------------- |
| React                   | 19.1.1  | Framework UI                 |
| Vite                    | 7.1.2   | Build tool y dev server      |
| React Router            | 7.8.0   | Enrutamiento SPA             |
| Tailwind CSS            | 4.1.11  | Estilos CSS utilities        |
| Material UI             | 7.3.4   | Componentes UI pre-diseñados |
| React Hot Toast         | 2.6.0   | Notificaciones elegantes     |
| dayjs                   | 1.11.18 | Manejo de fechas             |
| @paypal/react-paypal-js | 8.9.2   | Integración PayPal           |

### Backend

| Tecnología | Versión | Propósito           |
| ---------- | ------- | ------------------- |
| Express    | 5.1.0   | Framework web       |
| Node.js    | latest  | Runtime             |
| PostgreSQL | 14+     | Base de datos       |
| bcrypt     | 6.0.0   | Hash de contraseñas |
| JWT        | 9.0.2   | Autenticación       |
| Multer     | 2.0.2   | Subida de archivos  |
| Morgan     | 1.10.1  | Logger HTTP         |
| CORS       | 2.8.5   | Control de CORS     |

### Integraciones Externas

- 🔐 **Brevo** - Envío de emails transaccionales
- 💳 **PayPal** - Pagos online

---

## 📦 Instalación

### Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- npm o yarn

### Pasos de Instalación

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/romeroro4444/TuExperto
cd TuExperto
```

#### 2. Configurar Base de Datos

```bash
# Crear base de datos
createdb tuexperto

# Restaurar schema
psql -U postgres -d tuexperto -f server/database/db.sql
```

#### 3. Configurar Variables de Entorno

Crear archivo `.env` en la carpeta `server/`:

```env
# PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_PASSWORD=tu_contraseña
DB_PORT=5432
DB_DATABASE=tuexperto

# Autenticación
jwtSecret=tu_clave_secreta_segura

# Servicios de Email (Brevo)
brevokey=tu_api_key_brevo

# PayPal
PAYPAL_CLIENTID=tu_paypal_client_id
PAYPAL_SECRET=tu_paypal_secret
PAYPAL_BASEURL=https://api-m.sandbox.paypal.com
PAYPAL_REDIRECT_BASE_URL=http://localhost:5173/

```

#### 4. Instalar Dependencias

**Backend:**

```bash
cd server
npm install
```

**Frontend:**

```bash
cd client
npm install
```

### Ejecutar en Desarrollo

#### Terminal 1 - Backend (Puerto 4000)

```bash
cd server
npm run dev
```

#### Terminal 2 - Frontend (Puerto 5173)

```bash
cd client
npm run dev
```

Acceder a: http://localhost:5173

### Build para Producción

**Frontend:**

```bash
cd client
npm run build
```

**Backend:**

```bash
cd server
npm start
```

---

## 📚 Estructura del Proyecto

```
TuExperto/
├── client/                              # Frontend React + Vite
│   ├── src/
│   │   ├── App.jsx                      # Enrutador principal
│   │   ├── main.jsx                     # Punto de entrada
│   │   ├── index.css                    # Estilos globales
│   │   ├── assets/                      # Recursos estáticos
│   │   └── components/
│   │       ├── admin/                   # Panel administrativo (10 vistas)
│   │       ├── appointments/            # Gestión de citas
│   │       ├── auth/                    # Login y Register
│   │       ├── common/                  # Componentes reutilizables
│   │       ├── home/                    # Landing page
│   │       ├── profile/                 # Perfil de usuario
│   │       ├── report/                  # Reportes/Denuncias
│   │       ├── requests/                # Solicitudes de servicios
│   │       └── services/                # Gestión de servicios
│   ├── vite.config.js                   # Configuración build
│   └── package.json
│
└── server/                              # Backend Express + Node.js
    ├── src/
    │   ├── index.js                     # Servidor Express (Puerto 4000)
    │   ├── config.js                    # Configuración de variables
    │   ├── db.js                        # Pool de conexión PostgreSQL
    │   ├── controllers/                 # Lógica de negocio (11 archivos)
    │   ├── routes/                      # Endpoints API (11 rutas)
    │   ├── middleware/                  # Autenticación y validación
    │   ├── services/                    # Integraciones externas
    │   └── utils/                       # Utilidades (JWT, etc)
    ├── database/
    │   ├── db.sql                       # Schema de Base de Datos
    │   └── imgs/                        # Almacenamiento de imágenes
    ├── .env                             # Variables de entorno
    └── package.json
```

---

## Endpoints API Principales

### Autenticación

```
POST   /login                    # Iniciar sesión
POST   /user                     # Registro de usuario
GET    /verify (auth)            # Verificar token
GET    /user-type (auth)         # Obtener tipo de usuario
GET    /fullname (auth)          # Obtener nombre completo
```

### Usuarios & Perfil

```
GET    /users                    # Listar usuarios
GET    /profile (auth)           # Perfil profesional
GET    /professional/:id         # Perfil público
PUT    /profile (auth)           # Editar perfil
GET    /profile-client (auth)    # Perfil cliente
```

### Servicios

```
GET    /services                 # Listar servicios
GET    /service/:id              # Servicio por ID
POST   /service (auth)           # Crear servicio
PUT    /service/:id              # Editar servicio
DELETE /service/:id              # Eliminar servicio
PUT    /service/:id/approve (admin)   # Aprobar
PUT    /service/:id/reject (admin)    # Rechazar
```

### Solicitudes

```
GET    /requests                 # Listar solicitudes
GET    /request/:id              # Solicitud por ID
POST   /request (auth)           # Crear solicitud
PUT    /request/:id              # Editar solicitud
DELETE /request/:id              # Eliminar solicitud
PUT    /request/:id/approve (admin)   # Aprobar
```

### Citas

```
GET    /appointments             # Listar citas
POST   /appointment              # Crear/reservar cita
PUT    /cancel-appointment/:id   # Cancelar cita
PUT    /decision-appointment/:id # Aceptar/rechazar
PUT    /pay-appointment/:id      # Marcar como pagada
GET    /my-appointments (auth)   # Mis citas
```

### Reseñas

```
POST   /review                   # Crear reseña
GET    /reviews                  # Todas las reseñas
GET    /service/:id/reviews      # Reseñas por servicio
```

### Pagos

```
POST   /create-order             # Crear orden (MercadoPago)
POST   /process_payment          # Procesar pago
GET    /success                  # Callback éxito
GET    /failure                  # Callback fallo
POST   /webhook                  # Webhook de pagos
```

### Denuncias

```
POST   /complaints               # Crear denuncia
GET    /complaints               # Listar denuncias
POST   /complaints/:id/decision  # Decisión admin
POST   /img/proof (upload)       # Subir evidencia
```

### Retiros

```
POST   /withdrawal (auth)        # Solicitar retiro
```

---

## Integraciones y APIs

### PayPal

- Checkout seguro y procesamiento de pagos
- Sandbox para desarrollo
- Confirmación automática de transacciones

### Brevo (Sendinblue)

- Envío de emails transaccionales
- Plantillas personalizables
- Tracking de entregas

---

## 👥 Roles de Usuario

### Cliente

- Buscar y reservar servicios
- Crear solicitudes de trabajos
- Realizar pagos
- Dejar reseñas
- Crear reclamaciones

### Profesional

- Crear perfil verificado
- Publicar servicios
- Recibir y gestionar citas
- Aceptar/rechazar solicitudes
- Retirar fondos ganados
- Acumular reputación

### Administrador

- Acceso al panel de control
- Moderar servicios y solicitudes
- Gestionar reclamaciones
- Ver estadísticas generales
- Supervisar usuarios

---

## 📊 Base de Datos

El proyecto utiliza **PostgreSQL** con 16 tablas principales:

- **users** - Datos de usuarios
- **user_types** - Tipos de usuario
- **professions** - Profesiones
- **professionals** - Perfiles profesionales
- **services** - Servicios ofrecidos
- **services_requests** - Solicitudes de trabajo
- **appointments** - Citas reservadas
- **reviews** - Reseñas y calificaciones
- **complaints** - Denuncias y reclamaciones
- **notifications** - Notificaciones enviadas
- **transactions** - Historial de retiros
- Y más...

El schema completo está en `server/database/db.sql`

---

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación JWT
- ✅ Validación de entrada en backend
- ✅ CORS configurado
- ✅ Variables de entorno para datos sensibles
- ✅ Middleware de autorización
- ✅ Encriptación de datos de pago

---

## 🐛 Troubleshooting

### La base de datos no conecta

```bash
# Verificar que PostgreSQL está corriendo
# Verificar credenciales en .env
# Recrear la BD: dropdb tuexperto && createdb tuexperto
```

### Error de CORS

```bash
# Verificar que el servidor backend está corriendo en puerto 4000
# Revisar configuración de CORS en server/src/index.js
```

### Problemas con Vite en desarrollo

```bash
cd client
npm run dev -- --port 5173
```

---

## 📝 Mejoras Futuras

- [ ] Implementar chat en tiempo real entre usuario y profesional
- [ ] Sistema de calificación automática basada en IA
- [ ] Integración con más pasarelas de pago
- [ ] App móvil nativa (React Native)
- [ ] Geolocalización avanzada
- [ ] Sistema de subscripción para profesionales
- [ ] Analytics avanzado con gráficas
- [ ] Sistema de referrals

---

## 📞 Contacto & Soporte

Para reportar bugs o sugerencias:

- 📧 Email: soporte@tuexperto.cl

---

<div align="center">

**Hecho para conectar profesionales con clientes**

</div>
