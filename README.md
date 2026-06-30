# Task Manager App Repository

This repository contains the Task Manager Application backend.

## Project Structure

- `backend/`: Python Django REST Framework backend codebase. See the [Backend README](file:///c:/slf_std/task/backend/README.md) for detailed setup and API reference instructions.

## Tech Stack Summary

### Backend
- **Framework**: Django & Django REST Framework (DRF)
- **Database**: SQLite (local development) / support for PostgreSQL or MySQL
- **Auth**: SimpleJWT (JSON Web Tokens)
- **Config**: django-environ
- **CORS Handler**: django-cors-headers

## Features Implemented

1. **User Authentication (JWT + password hashing)**: JWT login, registration, and token refresh with secure credentials.
2. **Add/Edit/Delete/Complete Tasks**: Full CRUD endpoints for managing tasks.
3. **List all tasks for logged-in user**: Retrieve the list of tasks belonging exclusively to the authenticated user.
4. **Filter tasks by All, Completed, Pending**: Filter task lists using the `completed` query parameter.
5. **Automated Testing**: 10 unit tests covering all features.
