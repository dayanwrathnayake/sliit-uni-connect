# SLIIT UNI Connect

A social platform for SLIIT university students — clubs, feeds, events, and notifications, all in one place.

---

## What's inside

- **Frontend** - React 18 + Vite + Tailwind CSS
- **Backend** - Spring Boot + MongoDB Atlas
- **Real-time** - WebSocket notifications via STOMP over SockJS

---

## Before you start

Make sure you have these installed:

- [Node.js](https://nodejs.org) v18 or newer
- [Java 21](https://adoptium.net)
- [Maven](https://maven.apache.org) (or use the `./mvnw` wrapper in the backend folder)
- A MongoDB Atlas account (or use the existing connection string in `application.properties`)

---

## First time setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd sliit-uni-connect
```

### 2. Backend — configure environment

Open `backend/src/main/resources/application.properties` and fill in:

```properties
-- contact me i will give you the credentials
```

### 3. Frontend — install dependencies

```bash
cd frontend
npm install
```

That's it for setup.

---

## Running the project

You need two terminals open — one for the backend, one for the frontend.

### Terminal 1 — Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

Or if you have Maven installed globally:

```bash
mvn spring-boot:run
```

Backend starts on **http://localhost:8080**

### Terminal 2 — Start the frontend

```bash
cd frontend
npm run dev
```

Frontend starts on **http://localhost:5173** (or 5174 if 5173 is busy)

Open that URL in your browser and you're good to go.

---

## Useful URLs

| URL | What it is |
|-----|------------|
| `http://localhost:5173` | The app |
| `http://localhost:8080/swagger-ui/index.html` | API docs (Swagger) |
| `http://localhost:8080/api/...` | REST API base |

---

## Default accounts

The database is on MongoDB Atlas — accounts are created through the registration flow.

To create a **System Admin** account, you'll need to insert a staff user directly into the `staff_users` collection in MongoDB Atlas with role `SYSTEM_ADMIN`.

---

## Project structure

```
sliit-uni-connect/
├── backend/          Spring Boot API
│   └── src/main/
│       ├── java/     Controllers, services, models
│       └── resources/application.properties
└── frontend/         React app
    └── src/
        ├── pages/
        ├── components/
        ├── api/
        ├── hooks/
        └── store/
```

---

## Common issues

**Backend won't start**
→ Check that Java 21 is installed: `java -version`
→ Check your MongoDB URI is correct in `application.properties`

**Frontend shows blank page**
→ Make sure the backend is running first
→ Try a hard refresh: `Ctrl + Shift + R`
