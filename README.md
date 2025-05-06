# Todo-APP

A modern, full-stack Todo application built with **Spring Boot** (backend) and **HTML/JavaScript** (frontend). This application allows users to register, log in, and manage their tasks securely using JWT-based authentication. The backend integrates with a MySQL database, and the frontend provides a clean, responsive interface for task management.

![Todo-APP Screenshot](https://github.com/user-attachments/assets/369a595d-d47c-408d-ac40-f35da8b29ba1)


## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features
- **User Authentication**:
  - Register with email and password.
  - Secure login with JWT tokens.
- **Task Management**:
  - Create, view, update, and delete tasks.
  - Mark tasks as completed (highlighted in `#ecfdf5`).
  - Receive notifications for task updates (`#10b981`).
- **Responsive Frontend**:
  - Clean login (`login.html`) and task management (`index.html`) interfaces.
  - No animations for a smooth user experience.
- **Secure Backend**:
  - JWT-based authentication for protected routes.
  - Password hashing with BCrypt.
  - CORS support for frontend integration (`http://localhost:3000`).
- **Database Integration**:
  - MySQL database (`todo_app`) for storing users and tasks.
  - Automatic table creation with Hibernate (`users`, `task`).

## Technologies
- **Backend**:
  - Spring Boot 3.3.4
  - Spring Security (JWT, BCrypt)
  - Spring Data JPA (Hibernate)
  - MySQL 9.1.0
  - JJWT 0.9.1 (JWT generation)
  - ModelMapper 3.2.0
  - Jakarta XML Bind 4.0.2 (for JJWT compatibility)
- **Frontend**:
  - HTML5, JavaScript (ES6)
  - Fetch API for HTTP requests
  - No external frameworks (vanilla JS)
- **Tools**:
  - Maven (build)
  - MySQL Server
  - Node.js (for serving frontend)
  - Java 17

## Prerequisites
Ensure you have the following installed:
- **Java 17**: [Download JDK](https://www.oracle.com/java/technologies/javase-jdk17-downloads.html)
- **Maven 3.6+**: [Download Maven](https://maven.apache.org/download.cgi)
- **MySQL 8.0+**: [Download MySQL](https://dev.mysql.com/downloads/mysql/)
- **Node.js 16+**: [Download Node.js](https://nodejs.org/) (for serving frontend)
- **Git**: [Download Git](https://git-scm.com/downloads)

## Setup
Follow these steps to set up the project locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/Todo-APP.git
   cd Todo-APP
   ```

2. **Configure MySQL**:
   - Start MySQL server.
   - Log in to MySQL:
     ```bash
     mysql -u root -p
     ```
   - Create the `todo_app` database:
     ```sql
     CREATE DATABASE todo_app;
     GRANT ALL PRIVILEGES ON todo_app.* TO 'root'@'localhost';
     FLUSH PRIVILEGES;
     EXIT;
     ```
   - Update `src/main/resources/application.properties` if your MySQL credentials differ:
     ```properties
     spring.datasource.username=root
     spring.datasource.password=your_password
     ```

3. **Build the Backend**:
   ```bash
   mvn clean install
   ```

4. **Install Frontend Dependencies**:
   - Install `serve` for hosting the frontend:
     ```bash
     npm install -g serve
     ```

## Running the Application
1. **Start the Backend**:
   ```bash
   mvn spring-boot:run
   ```
   - The backend runs on `http://localhost:8080`.
   - Hibernate will create `users` and `task` tables in the `todo_app` database.

2. **Serve the Frontend**:
   ```bash
   serve -s src/main/resources/static -p 3000
   ```
   - The frontend runs on `http://localhost:3000`.

3. **Access the Application**:
   - Open `http://localhost:3000/login.html` in your browser.

## Usage
1. **Register**:
   - Navigate to `http://localhost:3000/login.html`.
   - Click "Register" and enter an email (e.g., `john@example.com`) and password.
   - Submit to create an account (button styled in `#10b981`).

2. **Login**:
   - Enter the same email and password.
   - Submit to log in (button styled in `#indigo-600`).
   - On success, you’re redirected to `index.html`.

3. **Manage Tasks**:
   - In `index.html`, add tasks via the input form.
   - View tasks in a list, mark as completed (highlighted in `#ecfdf5`).
   - Receive notifications for updates (styled in `#10b981`).
   - Edit or delete tasks as needed.

4. **Logout**:
   - Click "Logout" to clear the JWT and return to `login.html`.

## API Endpoints
The backend exposes the following REST API endpoints:

- **Authentication**:
  - `POST /api/auth/register`: Register a new user.
    - Body: `{"email": "john@example.com", "password": "password"}`
    - Response: `{"email": "john@example.com"}` (201 Created)
  - `POST /api/auth/login`: Log in and receive a JWT.
    - Body: `{"email": "john@example.com", "password": "password"}`
    - Response: `{"token": "eyJhbGciOiJIUzI1NiJ9..."}` (200 OK)

- **Tasks** (JWT required):
  - `GET /api/tasks`: Retrieve all tasks for the authenticated user.
  - `POST /api/tasks`: Create a new task.
  - `PUT /api/tasks/{id}`: Update a task.
  - `DELETE /api/tasks/{id}`: Delete a task.

Use tools like **Postman** to test:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"john@example.com","password":"password"}' http://localhost:8080/api/auth/login
```

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please ensure code follows the existing style and includes tests where applicable.

