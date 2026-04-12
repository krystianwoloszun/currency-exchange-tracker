# KursyWalut

Full-stack application for checking currency rates and gold prices based on NBP (National Bank of Poland) API data. The project combines a Spring Boot backend with a React frontend, featuring a currency calculator, historical data, and simple JWT-based authentication.

**Live Application currently available:** [https://kursywalut-seven.vercel.app](https://kursywalut-seven.vercel.app)

## About the Project

The application allows users to:

- register and log in,
- fetch current currency rates from NBP Table A,
- convert amounts between PLN and a selected currency,
- browse historical currency rates for a selected date range,
- check the current price of gold,
- browse historical gold prices published by NBP.

The backend provides a REST API, and the frontend presents data through a calculator, historical views, and sidebars with current rates.

### User interface
## Calculator
<img width="1827" height="850" alt="image" src="https://github.com/user-attachments/assets/52d28f8a-05c6-42d6-b1c3-5a1de09fba30" />

## Rates History
<img width="1882" height="884" alt="image" src="https://github.com/user-attachments/assets/c8b39970-cece-4759-a5cb-670c533597cd" />

## Login
<img width="1906" height="875" alt="image" src="https://github.com/user-attachments/assets/cb0406ab-b1c9-4c2a-baee-2cc371e50c4a" />




## Technologies

### Backend

- Java 21
- Spring Boot 3.3.3
- Spring Web
- Spring WebFlux
- Spring Data JPA
- Spring Security
- JWT (`jjwt`)
- H2 Database
- Lombok
- Maven
- JUnit 5
- Mockito
- WireMock

### Frontend

- React 19
- Vite 7
- JavaScript (ES Modules)
- CSS Modules + CSS
- ESLint
- `flag-icons`

### Integrations and Infrastructure

- NBP API
- Docker
- Render for backend hosting
- Vercel as a permitted origin for the frontend in CORS configuration

## Key Features

- Login and registration with password hashing using BCrypt.
- Endpoint protection via Spring Security and JWT filter.
- Password validation during registration:
  - minimum 8 characters,
  - at least 1 uppercase letter,
  - at least 1 lowercase letter,
  - at least 1 digit,
  - at least 1 special character.
- Fetching current currency rates and the list of available currencies from NBP.
- Amount conversion for `TO_PLN` and `FROM_PLN` directions.
- Currency rate history limited to 93 days and dates starting from `2002-01-02`.
- Gold price history limited to 93 days and dates starting from `2013-01-02`.
- Unified API error handling on the backend.

## Project Architecture

```text
kursywalut/
|- src/main/java/com/kursywalut
|  |- config
|  |- controller
|  |- exception
|  |- model
|  |- repository
|  |- security
|  |- service
|  `- validation
|- src/main/resources
|- src/test/java
`- frontend/
   |- src/api
   |- src/auth
   |- src/components
   |- src/pages
   |- src/state
   `- src/utils
```

## How to Run Locally

### Prerequisites

- Java 21
- Node.js 20+ and npm
- Maven or the included `mvnw` wrapper

### 1. Start the Backend

In the root directory of the project:

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend starts by default at:

```text
http://localhost:8080
```

### 2. Start the Frontend

In a separate terminal, go to the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

The frontend starts by default at:

```text
http://localhost:5173
```

By default, the frontend communicates with the backend at:

```text
http://localhost:8080/api
```

To change the API address, set the environment variable:

```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

## Backend Configuration

Key settings from `application.properties`:

```properties
server.port=${PORT:8080}
cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173,https://kursywalut-seven.vercel.app}

spring.datasource.url=jdbc:h2:mem:testdb
spring.h2.console.enabled=true

nbp.api.rate.url=https://api.nbp.pl/api/exchangerates/rates/A
nbp.api.table.url=https://api.nbp.pl/api/exchangerates/tables/A
nbp.api.gold.url=https://api.nbp.pl/api/cenyzlota
```

## Example API Endpoints

### Authorization

- `POST /api/auth/register`
- `POST /api/auth/login`

Example body:

```json
{
  "username": "test",
  "password": "Password123!"
}
```

### Currencies

- `GET /api/currency/available`
- `GET /api/currency/USD`
- `GET /api/currency/USD/history?startDate=2026-04-01&endDate=2026-04-08`
- `GET /api/currency/conversion?amount=100&code=EUR&direction=TO_PLN`

### Gold

- `GET /api/gold`
- `GET /api/gold/today`
- `GET /api/gold/latest?topCount=30`
- `GET /api/gold/2026-04-10`
- `GET /api/gold/history?startDate=2026-04-01&endDate=2026-04-08`

Note: Except for login and registration, endpoints are secured and require the header:

```text
Authorization: Bearer <token>
```

## Testing

The backend includes:

- Unit tests,
- Integration tests,
- Mocking external responses using WireMock.

To run tests:

```bash
./mvnw test
```

On Windows:

```powershell
.\mvnw.cmd test
```

Frontend:

```bash
cd frontend
npm run lint
```

## Docker

The repository contains a `Dockerfile` for building the backend.

Building the image:

```bash
docker build -t kursywalut .
```

Running the container:

```bash
docker run -p 8080:8080 kursywalut
```

## Limitations and Notes

- **Free Hosting Behavior:** The backend is hosted on a free tier (Render), which means the application goes to sleep after a period of inactivity. The first request after a long break (e.g., trying to log in or register) may take a while to wake up the server.
- Currency and gold data come from the public NBP API, so application availability depends on the external service.
- The JWT token is generated with a key created at application startup, so after a backend restart, previous tokens become invalid.
- The H2 database runs in-memory, so user data disappears after the application is stopped.

## Future Improvements

- Token refreshing and a persistent JWT secret from configuration,
- Production database instead of in-memory H2,
- OpenAPI / Swagger documentation,
- Frontend tests,
- Deployment in containers or via CI/CD.
