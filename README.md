# Society Maintenance Tracker

A full-stack web application for managing residential societies. The system helps administrators and residents manage complaints, notices, maintenance records, and user accounts through a modern web interface.

## Features

- User Authentication (Admin & Resident)
- Resident Dashboard
- Admin Dashboard
- Complaint Management
- Notice Management
- Profile Management
- Responsive UI
- PostgreSQL Database Integration
- Secure REST APIs using Spring Boot

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend
- Java 21
- Spring Boot
- Spring Data JPA
- Maven
- PostgreSQL
- JWT Authentication

## Project Structure

```
society-maintenance-tracker/
│
├── backend/
│   ├── src/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
```

## Installation

### Clone the repository

```bash
git clone https://github.com/AvaniKatiyar/society-maintenance-tracker.git
cd society-maintenance-tracker
```

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Database

- PostgreSQL
- Create a database named:

```
society_tracker
```

Update the database credentials in:

```
backend/src/main/resources/application.properties
```



## Future Improvements

- Payment Management
- Visitor Management
- Email Notifications
- Document Uploads
- Dashboard Analytics

## Author

**Avani Katiyar**

GitHub: https://github.com/AvaniKatiyar
