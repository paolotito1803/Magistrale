# Amateur Volleyball Tournament (Microservices)

## Prerequisites
1. **Docker Desktop** (Running)
2. **Ports Available:** 8080 (Gateway), 3000 (Frontend), 5432 (DB), 5672 (RabbitMQ), 15672 (RabbitMQ Management)

## Installation & Setup
1.  **Clone the repository:**

2.  **Configure Environment:**
    No need to copy and populate the .env file, as we have committed it to this repository for demonstration purposes, so that the project runs out of the box. 
    In a proper production environment, this file would be excluded from version control.

3.  **Run with Docker:**
    Execute the following command in the root directory:
       ```bash
       docker compose up -d --build
       ```
    
4.  **Wait a bit to let the services run and the seeding process to finish**

## Access
- Frontend Application: http://localhost:3000
Are also available:
- API Gateway Test: http://localhost:8080/api/teams/test
- RabbitMQ Dashboard: http://localhost:15672 (User: `guest`, Pass: `guest`)

Testing the Application:
The application automatically seeds the database with demo users and data on startup, and provides a quick login option to avoid having to write credentials every time.
