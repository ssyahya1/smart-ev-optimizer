# ⚡ Smart EV Fleet Charging and Grid Operations Optimizer

A full-stack web application for intelligently managing **Electric Vehicle (EV) fleet charging, charging-bay assignment, grid power allocation, routing, journey planning, and resource optimization**.

The system combines **Data Structures and Algorithms (DAA)** with a modern web architecture to demonstrate how algorithmic techniques can be applied to real-world Smart Grid and EV Fleet Management problems.

---

## 📌 Project Overview

Managing a large EV fleet requires more than simply assigning vehicles to charging stations.

A practical EV charging management system must consider:

* Vehicle arrival times
* Battery state of charge (SoC)
* Battery capacity
* Charging-bay availability
* Charger power limits
* Vehicle priorities
* Charging deadlines
* Grid capacity
* Electricity prices
* Routes and journey distances
* Limited charging and grid resources

The **Smart EV Fleet Charging and Grid Operations Optimizer** addresses these challenges through multiple algorithmic modules.

The application provides a web-based interface where users can interact with the system while the backend performs algorithmic processing and communicates with a PostgreSQL database.

---

# 🏗️ System Architecture

The application follows a **three-tier full-stack architecture** with an additional deployment/proxy layer.

```text
                         ┌──────────────────────────┐
                         │        User / Admin       │
                         │   Desktop / Mobile Web    │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │       React Frontend      │
                         │       Vite + CSS          │
                         │                          │
                         │ • Login / Register        │
                         │ • Dashboard               │
                         │ • Vehicles                │
                         │ • Charging Bays           │
                         │ • Grid Slots              │
                         │ • Sessions                │
                         │ • Algorithms              │
                         │ • Benchmarks              │
                         └────────────┬─────────────┘
                                      │
                              HTTPS / REST API
                                      │
                                      ▼
                    ┌──────────────────────────────────┐
                    │        Vercel API Rewrite        │
                    │                                  │
                    │  /api/* → Railway Backend        │
                    │  Same-origin browser requests    │
                    └───────────────┬──────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────────┐
                         │    Express / Node.js     │
                         │        Backend           │
                         │                          │
                         │ • Authentication         │
                         │ • Authorization          │
                         │ • REST APIs              │
                         │ • Validation             │
                         │ • Algorithms             │
                         │ • Rate Limiting          │
                         │ • Security Middleware    │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │       PostgreSQL         │
                         │                          │
                         │ • Users                  │
                         │ • Vehicles               │
                         │ • Charging Bays          │
                         │ • Grid Slots             │
                         │ • Charging Sessions      │
                         └──────────────────────────┘
```

---

# 🔄 Request Flow

A typical request follows this architecture:

```text
User
  │
  ▼
React Frontend
  │
  │  GET /api/vehicles
  ▼
Vercel
  │
  │  API Rewrite
  ▼
Railway
  │
  ▼
Express Route
  │
  ├── Authentication
  ├── Authorization
  ├── Validation
  └── Controller / Algorithm
          │
          ▼
      PostgreSQL
          │
          ▼
      JSON Response
          │
          ▼
     React Frontend
```

The frontend uses same-origin `/api/...` requests in production. Vercel forwards these requests to the Railway backend, avoiding the cross-site cookie restrictions that affected mobile browsers.

---

# 🧩 Main System Components

## 1. Authentication & Authorization

The system uses JWT-based authentication with **HttpOnly cookies**.

### Authentication flow

```text
Login
  │
  ▼
Validate credentials
  │
  ▼
Verify password using bcrypt
  │
  ▼
Generate Access Token
  │
  ▼
Generate Refresh Token
  │
  ▼
Set HttpOnly cookies
  │
  ▼
Authenticated session
```

### Security features

* JWT authentication
* HttpOnly cookies
* Secure cookies in production
* SameSite cookie configuration
* Refresh-token support
* Refresh-token rotation
* Logout / token revocation
* Password hashing with bcrypt
* Role-based authorization
* Request validation using Zod
* Helmet security headers
* CORS configuration
* Express rate limiting

The access token has a short lifetime, while the refresh token provides longer-lived sessions without requiring the user to repeatedly log in.

---

# 🚗 EV Fleet Management

The vehicle module stores important information about each EV:

* Vehicle number
* Arrival time
* Initial state of charge
* Battery capacity
* Priority
* Charging deadline

Example:

```text
Vehicle
├── Vehicle Number
├── Arrival Time
├── Initial SoC
├── Battery Capacity
├── Priority
└── Deadline
```

This information is used by the optimization algorithms to make charging decisions.

---

# 🔌 Charging Bay Management

Charging bays contain:

* Bay number
* Charger type
* Maximum charging power
* Availability status

Example:

```text
Charging Bay
├── Bay Number
├── Charger Type
├── Maximum Power (kW)
└── Status
```

The assignment algorithms use these constraints when matching EVs with charging bays.

---

# ⚡ Grid Slot Management

Grid slots represent available grid capacity during specific time periods.

Each slot contains:

* Slot time
* Maximum grid capacity
* Electricity price

This allows the system to consider both **power constraints** and **electricity cost**.

---

# 🔋 Charging Sessions

Charging sessions connect:

```text
Vehicle
      │
      ▼
Charging Bay
      │
      ▼
Grid Slot
      │
      ▼
Charging Session
```

A charging session records information such as:

* Vehicle
* Charging bay
* Grid slot
* Start time
* End time
* Charging power

---

# 🧠 DAA Algorithm Modules

The project demonstrates multiple Data Structures and Algorithms concepts.

## 1. EV-to-Charging-Bay Assignment

### Algorithms

* Greedy Assignment
* Priority Queue Assignment

### Purpose

Assign EVs to suitable charging bays while considering vehicle priority and charging constraints.

```text
EV Fleet
   │
   ├── Priority
   ├── Arrival Time
   ├── SoC
   └── Charging Requirements
          │
          ▼
   Assignment Algorithm
          │
          ▼
    Charging Bays
```

---

## 2. Charging Schedule Optimization

### Algorithms

* Greedy Scheduling
* Dynamic Programming

### Purpose

Determine an effective charging schedule while considering deadlines, available time, and charging requirements.

---

## 3. Grid Power Allocation

### Algorithms

* Max Heap Power Allocation
* Round-Robin Power Allocation

### Purpose

Distribute available grid power between charging vehicles while respecting grid capacity.

```text
Available Grid Power
        │
        ▼
 ┌───────────────┐
 │ Power Manager │
 └───────┬───────┘
         │
    ┌────┴────┐
    ▼         ▼
 Max Heap   Round Robin
    │         │
    └────┬────┘
         ▼
 Charging Vehicles
```

---

## 4. EV Routing

### Algorithms

* Breadth-First Search (BFS)
* Dijkstra's Algorithm

### Purpose

Find routes through a graph representing locations, charging stations, or road connections.

---

## 5. Journey Planning

### Algorithms

* A* Search
* Bellman-Ford Algorithm

### Purpose

Calculate efficient routes while handling weighted graphs and different path-cost scenarios.

---

## 6. Resource Allocation

### Algorithms

* Ford-Fulkerson
* Greedy Bottleneck Allocation

### Purpose

Optimize the allocation of limited charging and grid resources.

---

# 📊 Algorithm Comparison

| Module              | Algorithm 1    | Algorithm 2         | Main Objective          |
| ------------------- | -------------- | ------------------- | ----------------------- |
| Assignment          | Greedy         | Priority Queue      | EV-to-bay assignment    |
| Scheduling          | Greedy         | Dynamic Programming | Charging schedules      |
| Power               | Max Heap       | Round Robin         | Grid power distribution |
| Routing             | BFS            | Dijkstra            | Route calculation       |
| Journey             | A*             | Bellman-Ford        | Journey optimization    |
| Resource Allocation | Ford-Fulkerson | Greedy Bottleneck   | Resource optimization   |

The paired algorithms allow the project to compare different algorithmic approaches to the same problem.

---

# 🧪 Benchmarking

The project includes benchmarking functionality to evaluate algorithm performance as the system size increases.

### Vehicle benchmarks

```text
20
100
500
1,000 vehicles
```

### Charging-bay benchmarks

```text
5
15
30
50 bays
```

### Graph/node benchmarks

```text
20
100
500
1,000 nodes
```

The benchmark module can be used to compare:

* Execution time
* Scalability
* Algorithmic efficiency
* Performance as input size increases

This helps demonstrate the practical differences between the implemented algorithms.

---

# 🛡️ Security Architecture

Security is integrated throughout the application.

```text
                 Incoming Request
                       │
                       ▼
                  HTTPS / CORS
                       │
                       ▼
                    Helmet
                       │
                       ▼
                Rate Limiting
                       │
                       ▼
               Cookie Processing
                       │
                       ▼
             JWT Authentication
                       │
                       ▼
              Role Authorization
                       │
                       ▼
               Request Validation
                       │
                       ▼
                 API Controller
                       │
                       ▼
                  PostgreSQL
```

### Implemented security controls

* HttpOnly authentication cookies
* Secure cookies in production
* JWT access tokens
* Refresh tokens
* Token revocation
* bcrypt password hashing
* Zod input validation
* Helmet
* CORS with allowed origins
* API rate limiting
* Protected routes
* Role-based access control
* Parameterized PostgreSQL queries

---

# 🧪 Testing

The backend includes automated tests using:

* Vitest
* Supertest

Testing covers:

* Authentication
* API endpoints
* Algorithm implementations
* Edge cases
* Security-related behavior
* Database/API integration scenarios

The project currently has a substantial automated test suite covering the backend and algorithmic components.

---

# 🛠️ Technology Stack

## Frontend

* React 19
* Vite
* JavaScript
* JSX
* CSS
* Fetch API
* React Router

## Backend

* Node.js
* Express 5
* JavaScript
* REST API
* JWT
* bcrypt
* Zod
* Helmet
* CORS
* express-rate-limit
* cookie-parser

## Database

* PostgreSQL
* node-postgres (`pg`)

## Testing

* Vitest
* Supertest

## Deployment

* Vercel — Frontend
* Railway — Backend
* PostgreSQL — Production database

---

# 📁 Project Structure

```text
smart-ev-optimizer/
│
├── backend/
│   │
│   ├── src/
│   │   ├── algorithms/
│   │   │   ├── assignment/
│   │   │   ├── journey/
│   │   │   ├── power/
│   │   │   ├── routing/
│   │   │   └── resourceAllocation/
│   │   │
│   │   ├── config/
│   │   │   └── database.js
│   │   │
│   │   ├── controllers/
│   │   │
│   │   ├── middleware/
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoute.js
│   │   │   ├── vehicleRoute.js
│   │   │   ├── chargingBayRoute.js
│   │   │   ├── gridSlotRoute.js
│   │   │   ├── chargingSessionRoute.js
│   │   │   ├── assignmentRoute.js
│   │   │   ├── schedulingRoute.js
│   │   │   ├── powerRoute.js
│   │   │   ├── routingRoute.js
│   │   │   ├── journeyRoute.js
│   │   │   ├── resourceAllocationRoute.js
│   │   │   └── benchmarkRoute.js
│   │   │
│   │   └── app.js
│   │
│   ├── tests/
│   │
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   │
│   ├── api/
│   │   └── [...path].js
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── vite.config.js
│   ├── vercel.json
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

# 🔗 API Endpoints

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

## Vehicles

```text
GET    /api/vehicles
POST   /api/vehicles
PUT    /api/vehicles/:id
DELETE /api/vehicles/:id
```

## Charging Bays

```text
GET    /api/charging-bays
POST   /api/charging-bays
PUT    /api/charging-bays/:id
DELETE /api/charging-bays/:id
```

## Grid Slots

```text
GET    /api/grid-slots
POST   /api/grid-slots
PUT    /api/grid-slots/:id
DELETE /api/grid-slots/:id
```

## Charging Sessions

```text
GET    /api/charging-sessions
POST   /api/charging-sessions
PUT    /api/charging-sessions/:id
DELETE /api/charging-sessions/:id
```

## Algorithm APIs

```text
POST /api/assignment
POST /api/scheduling
POST /api/power
POST /api/routing
POST /api/journey
POST /api/resource-allocation
POST /api/benchmark
```

---

# 🚀 Running the Project Locally

## 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd smart-ev-optimizer
```

---

## 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret
COOKIE_NAME=ev_optimizer_token
REFRESH_COOKIE_NAME=ev_optimizer_refresh_token
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

or:

```bash
npm start
```

---

## 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will normally run at:

```text
http://localhost:5173
```

---

# 🌐 Production Deployment

## Frontend

The React/Vite frontend is deployed on Vercel.

```text
https://smart-ev-optimizer.vercel.app
```

## Backend

The Express backend is deployed on Railway.

```text
https://smart-ev-optimizer-production.up.railway.app
```

## Health Check

```text
GET /api/health
```

Example response:

```json
{
  "success": true,
  "service": "smart-ev-optimizer-backend",
  "status": "healthy"
}
```

---

# 🔐 Production API Architecture

The production frontend uses same-origin API requests:

```text
https://smart-ev-optimizer.vercel.app/api/*
```

Vercel rewrites these requests to:

```text
https://smart-ev-optimizer-production.up.railway.app/api/*
```

This architecture allows the browser to communicate with the API through the frontend's origin while the backend remains independently deployed on Railway.

It also allows the HttpOnly authentication cookies to work correctly on mobile browsers without requiring third-party cookies to be enabled.

---

# 🗄️ Database Design

The core database contains the following entities:

```text
┌──────────────┐
│    Users     │
└──────┬───────┘
       │
       │ authentication
       │
       ▼
┌──────────────┐
│   Vehicles   │
└──────┬───────┘
       │
       │ assigned to
       ▼
┌──────────────────┐
│ Charging Bays    │
└────────┬─────────┘
         │
         │ charging session
         ▼
┌──────────────────────┐
│ Charging Sessions    │
└──────────┬───────────┘
           │
           │ uses
           ▼
┌──────────────────┐
│   Grid Slots     │
└──────────────────┘
```

---

# 🎯 Academic Objectives

The project demonstrates how Data Structures and Algorithms can be applied to a real-world Smart Grid problem.

The major objectives are:

1. Optimize EV charging-bay assignment.
2. Develop efficient charging schedules.
3. Allocate limited grid power.
4. Calculate efficient routes.
5. Optimize EV journeys.
6. Allocate constrained resources.
7. Compare algorithmic approaches.
8. Benchmark scalability.
9. Integrate algorithms into a practical full-stack application.
10. Apply security principles to a production-style web system.

---

# 📈 Future Improvements

Potential future extensions include:

* Real-time EV telemetry
* Live charging status
* Dynamic electricity pricing
* Machine-learning-based demand prediction
* Renewable-energy integration
* Solar/battery storage optimization
* Advanced scheduling optimization
* Real-time traffic-aware routing
* WebSocket-based live dashboard updates
* More advanced grid optimization techniques

---

# 👨‍💻 Project

**Smart EV Fleet Charging and Grid Operations Optimizer**

**Domain:** Smart Grid Energy Management & EV Fleet Logistics

**Architecture:** React + Node.js/Express + PostgreSQL

**Authentication:** JWT + HttpOnly Cookies

**Deployment:** Vercel + Railway

---

## 📄 License

This project is developed for academic and educational purposes.
