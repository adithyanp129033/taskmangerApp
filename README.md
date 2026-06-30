# Task Manager

This is a Task Manager application with a Django REST Framework backend and a React frontend. It implements JWT Authentication, full CRUD operations on tasks, task owner isolation, and status-based task filtering.

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Login
![Login](screenshots/login.png)

### Register
![Register](screenshots/register.png)

## Features

- **Authentication**: JWT authentication (via `djangorestframework-simplejwt`) with password hashing.
- **Task CRUD**: Authenticated users can Create, Read, Update, and Delete tasks.
- **Data Isolation**: Users can only view, modify, or delete their own tasks.
- **Query Capabilities**:
  - Filter tasks by completed status (`completed=true` or `completed=false`).
  - View all tasks by querying the task list without filtering.

---

## Tech Stack

- **Framework**: Django & Django REST Framework (DRF)
- **Frontend**: React
- **Authentication**: SimpleJWT
- **Database**: PostgreSQL, configured through `DATABASE_URL`
- **Configuration**: django-environ
- **CORS Handler**: django-cors-headers
- **Deployment**: Render backend and Vercel frontend

---

## Installation & Setup

### Prerequisites
- Python 3.10+
- pip

### 1. Set Up Virtual Environment
Navigate to the `backend` directory and create/activate a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
Install all package requirements:
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the `backend` directory based on the `.env.example` file:
```bash
cp .env.example .env
```
Ensure you have the required variables configured inside `.env`:
```ini
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://user:password@host:5432/dbname
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Database Migrations
Apply migrations to build the database schema:
```bash
python manage.py migrate
```

### 5. Running the Application
Start the Django development server:
```bash
python manage.py runserver
```
The server will start at `http://127.0.0.1:8000/`.

---

## Frontend Setup

In the React frontend project, configure the deployed backend URL.

For Vite React, add this environment variable:
```ini
VITE_API_URL=https://your-render-backend.onrender.com
```

Use it in API calls:
```js
const API_URL = import.meta.env.VITE_API_URL;
```

Example registration request:
```js
fetch(`${API_URL}/api/auth/register/`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username,
    email,
    password,
  }),
});
```

For Create React App, use:
```ini
REACT_APP_API_URL=https://your-render-backend.onrender.com
```

---

## Deployment

### Render Backend

Use this build command:
```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
```

Use this start command:
```bash
gunicorn task_manager.wsgi:application
```

Required Render environment variables:
```ini
SECRET_KEY=your-production-secret-key
DEBUG=False
DATABASE_URL=your-postgresql-database-url
ALLOWED_HOSTS=your-render-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://your-vercel-frontend.vercel.app
```

### Vercel Frontend

For a Vite React frontend:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: `VITE_API_URL=https://your-render-backend.onrender.com`

If the frontend uses React Router, add `vercel.json` in the frontend root:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

After Vercel deployment, add the Vercel URL to `CORS_ALLOWED_ORIGINS` in Render and redeploy the backend.



## API Endpoints Reference

### Authentication Endpoints

#### Register User
- **URL**: `/api/auth/register/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
  ```

#### Login (Obtain Tokens)
- **URL**: `/api/auth/login/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access": "JWT_ACCESS_TOKEN_HERE",
    "refresh": "JWT_REFRESH_TOKEN_HERE"
  }
  ```

#### Refresh Token
- **URL**: `/api/auth/token/refresh/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "refresh": "JWT_REFRESH_TOKEN_HERE"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access": "NEW_JWT_ACCESS_TOKEN_HERE"
  }
  ```

---

### Task Endpoints (Authenticated)
*All requests require the `Authorization: Bearer <access_token>` header.*

#### List All Tasks
- **URL**: `/api/tasks/`
- **Method**: `GET`
- **Query Parameters**:
  - `completed` (boolean): `true` (Completed) or `false` (Pending). Omit parameter to list All tasks.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "title": "Finish Assignment",
      "description": "Complete backend task manager with Django",
      "completed": false,
      "user": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com"
      },
      "created_at": "2026-06-30T20:15:00Z",
      "updated_at": "2026-06-30T20:15:00Z"
    }
  ]
  ```

#### Create a Task
- **URL**: `/api/tasks/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "title": "Buy groceries",
    "description": "Eggs, bread, milk"
  }
  ```
- **Response (201 Created)**:
  *(Returns the created task resource. The `user` field is automatically set to the authenticated user.)*

#### Retrieve Task Detail
- **URL**: `/api/tasks/<id>/`
- **Method**: `GET`
- **Response (200 OK)**:
  *(Returns the full task details)*

#### Update a Task (Full or Partial)
- **URL**: `/api/tasks/<id>/`
- **Method**: `PUT` or `PATCH`
- **Request Body**:
  ```json
  {
    "completed": true
  }
  ```
- **Response (200 OK)**:
  *(Returns the updated task resource)*

#### Delete a Task
- **URL**: `/api/tasks/<id>/`
- **Method**: `DELETE`
- **Response**: `204 No Content`
