# Cyber Suraksha — Full-Stack SQL Version

This package converts the supplied Cyber Suraksha HTML site from browser `window.storage` persistence to a real Node.js/Express + MySQL backend.

## Stack
- Frontend: existing HTML/CSS/JavaScript design
- Backend: Node.js + Express
- Database: MySQL
- Auth: bcrypt password hashing + JWT in an HTTP-only cookie
- Uploads: Multer, stored in `backend/uploads/`

## Requirements
- Node.js 18+
- MySQL 8+
- VS Code (recommended)

## 1. Create the database

Open MySQL Workbench or the MySQL command line and run:

```sql
SOURCE database/schema.sql;
```

Or paste the contents of `database/schema.sql` into MySQL Workbench and execute it.

## 2. Configure the backend

Copy:

```text
backend/.env.example
```

to:

```text
backend/.env
```

Then set your MySQL credentials and a long random JWT secret.

Example:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cyber_suraksha
JWT_SECRET=change-this-to-a-long-random-secret
```

## 3. Install packages

In VS Code terminal:

```bash
cd backend
npm install
```

## 4. Start the website

```bash
npm start
```

Open:

```text
http://localhost:3000
```

The backend serves the frontend automatically, so you should open the URL above rather than double-clicking `frontend/index.html`.

## API

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/reports`
- `GET /api/reports`
- `GET /api/reports/dashboard`
- `POST /api/quiz/attempt`
- `GET /api/quiz/best`
- `GET /api/health`

## Notes

- Report screenshots are limited to 4 MB and accepted as common image formats.
- Passwords are never stored as plain text.
- The original UI and quiz questions are retained; only the persistence/authentication layer was replaced.
- For production deployment, use HTTPS, a strong secret, a managed MySQL database, and object storage for uploaded images.
