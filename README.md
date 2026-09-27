# ⚡ Smart EV Fleet Charging & Grid Operations Optimizer

A full-stack web application built to explore how **Data Structures and Algorithms can be used to solve real-world EV fleet charging and smart-grid problems**.

The system allows users to manage electric vehicles, charging bays, grid slots, and charging sessions. It also includes different algorithms for vehicle assignment, charging scheduling, power allocation, routing, journey planning, and resource allocation.

The project was developed as an academic project, but the goal was to build it like a real application rather than creating separate, disconnected algorithm demonstrations.

---

## 📌 What is this project?

As the number of electric vehicles increases, managing their charging becomes more complicated.

Imagine a fleet where several vehicles arrive at the same time, but there are only a few charging bays available. Some vehicles may have a low battery, some may have a higher priority, and others may need to finish charging before a specific deadline.

At the same time, the electrical grid cannot provide unlimited power.

This creates a number of problems:

* Which vehicle should be charged first?
* Which charging bay should a vehicle use?
* How should limited grid power be distributed?
* How should charging be scheduled around deadlines?
* What is an efficient route between locations?
* How can limited resources be allocated?

This project tries to solve these problems using different Data Structures and Algorithms while providing a complete web-based system around them.

---

# 🎯 Main Goals

The main goals of the project were to:

* Build a complete EV fleet management system
* Apply DAA concepts to practical problems
* Implement and compare different algorithms
* Manage charging infrastructure
* Manage grid capacity
* Provide secure user authentication
* Implement role-based administration
* Benchmark algorithm performance
* Deploy the application online
* Gain practical experience with full-stack development

---

# ✨ Features

## 👤 User Management

Users can:

* Create an account
* Log in securely
* Maintain an authenticated session
* Log out
* Manage their own EV fleet
* Access charging and optimization features

Authentication uses JWTs with HttpOnly cookies and refresh-token support.

---

## 🚗 EV Fleet Management

Users can manage their electric vehicles and store information such as:

* Vehicle number
* Arrival time
* Battery capacity
* Initial State of Charge (SoC)
* Priority
* Charging deadline

For example:

```text
Vehicle
├── Vehicle Number
├── Arrival Time
├── Battery Capacity
├── Initial SoC
├── Priority
└── Charging Deadline
```

This information is later used by the optimization algorithms.

---

## 🔌 Charging Bay Management

The system manages charging infrastructure including:

* Charging bay number
* Charger type
* Maximum charging power
* Availability status

These values are used when determining whether a vehicle can be assigned to a particular charging bay.

---

## ⚡ Grid Slot Management

Grid slots represent the available electricity capacity during different time periods.

Each grid slot can contain:

* Time
* Maximum grid capacity
* Electricity price

This allows the system to take grid limitations into account when performing power allocation and charging-related operations.

---

## 🔋 Charging Sessions

Charging sessions connect vehicles with charging bays and grid slots.

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

A charging session can contain:

* Vehicle
* Charging bay
* Grid slot
* Start time
* End time
* Charging power

---

# 👨‍💼 Admin Dashboard

The project also includes a separate administrator interface.

The admin dashboard is intentionally different from the normal user interface.

### Admins can manage:

* Users
* User roles
* All vehicles in the system
* Charging sessions
* Charging bays
* Grid slots
* System information

Normal users only see their own fleet-related features.

Admins are not treated as normal fleet users in the frontend. When an administrator logs in, they are taken directly to the admin dashboard.

```text
                    Login
                      │
             ┌────────┴────────┐
             │                 │
          User               Admin
             │                 │
             ▼                 ▼
       User Dashboard     Admin Dashboard
             │                 │
             ▼                 ▼
       Personal Fleet     System Management
```

The frontend uses role-based routing and navigation, while the backend independently verifies administrator permissions.

---

# 🧠 Data Structures & Algorithms

The main academic part of this project is the use of different Data Structures and Algorithms to solve EV and smart-grid problems.

Instead of implementing algorithms separately, they are connected to actual application features.

---

## 🚗 1. EV-to-Charging-Bay Assignment

### Algorithms

* Greedy Assignment
* Priority Queue Assignment

The assignment module decides how EVs can be matched with available charging bays.

The decision can take into account:

* Vehicle priority
* Arrival time
* Battery requirements
* Charging requirements
* Available charging bays

A priority queue is useful when higher-priority vehicles need to be considered before lower-priority vehicles.

---

## ⏱️ 2. Charging Schedule Optimization

### Algorithms

* Greedy Scheduling
* Dynamic Programming

The scheduling module works with charging requirements and deadlines.

The purpose is to determine how vehicles can be scheduled within the available charging time and resources.

The project allows the two approaches to be compared so that their behavior and performance can be studied.

---

## ⚡ 3. Grid Power Allocation

### Algorithms

* Max Heap
* Round Robin

The power allocation module distributes available grid power between charging vehicles.

```text
Available Grid Power
        │
        ▼
   Power Manager
      /     \
     /       \
 Max Heap   Round Robin
     │          │
     └────┬─────┘
          ▼
    Charging Vehicles
```

The max-heap approach can prioritize vehicles, while round-robin allocation provides a more cyclic distribution of resources.

---

## 🗺️ 4. EV Routing

### Algorithms

* Breadth-First Search (BFS)
* Dijkstra's Algorithm

The routing module treats locations and connections as a graph.

BFS can be used for unweighted paths, while Dijkstra's algorithm can be used when different connections have different costs.

---

## 🧭 5. Journey Planning

### Algorithms

* A* Search
* Bellman-Ford

These algorithms are used for graph-based journey planning.

A* uses a heuristic to guide the search toward a destination, while Bellman-Ford works with weighted graphs and provides a different approach to shortest-path problems.

---

## 🔗 6. Resource Allocation

### Algorithms

* Ford-Fulkerson
* Greedy Bottleneck Allocation

This module focuses on allocating limited resources.

Ford-Fulkerson is used for maximum-flow style problems, while the greedy approach focuses on allocating resources around bottlenecks.

---

# 📊 Algorithm Comparison

| Problem             | Algorithm 1    | Algorithm 2         |
| ------------------- | -------------- | ------------------- |
| EV Assignment       | Greedy         | Priority Queue      |
| Charging Scheduling | Greedy         | Dynamic Programming |
| Power Allocation    | Max Heap       | Round Robin         |
| Routing             | BFS            | Dijkstra            |
| Journey Planning    | A*             | Bellman-Ford        |
| Resource Allocation | Ford-Fulkerson | Greedy Bottleneck   |

The purpose of having two approaches for several problems is to understand how different algorithms behave when applied to the same type of problem.

---

# 📈 Benchmarking

The project includes a benchmarking module to see how the algorithms perform as the input size increases.

### Vehicle sizes

```text
20
100
500
1,000
```

### Charging-bay sizes

```text
5
15
30
50
```

### Graph sizes

```text
20
100
500
1,000 nodes
```

The benchmarks can be used to examine:

* Execution time
* Scalability
* Algorithmic efficiency
* Performance with larger inputs

This is particularly useful for comparing the practical behavior of the algorithms with their expected computational complexity.

---

# 🔐 Authentication & Security

Security was treated as an important part of the application rather than something added at the end.

The application uses JWT authentication with HttpOnly cookies.

### Login flow

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
Generate access token
  │
  ▼
Generate refresh token
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
* Access and refresh tokens
* Refresh-token rotation
* Refresh-token revocation
* bcrypt password hashing
* Zod request validation
* Helmet security headers
* CORS configuration
* API rate limiting
* Protected routes
* Role-based authorization
* Parameterized PostgreSQL queries
* User ownership checks

The backend remains responsible for actually enforcing permissions. Frontend role checks are used mainly for navigation and user experience.

---

# 🏗️ System Architecture

The application uses a frontend, backend, and database architecture.

```text
                 User / Admin
                      │
                      ▼
              React + Vite
                  Frontend
                      │
                      │ /api/*
                      ▼
                   Vercel
                      │
                API Rewrite
                      │
                      ▼
              Node.js + Express
                   Backend
                      │
          ┌───────────┼───────────┐
          │           │           │
     Auth & RBAC   Algorithms   Validation
          │           │           │
          └───────────┼───────────┘
                      │
                      ▼
                 PostgreSQL
```

The production frontend uses `/api/*` requests, which are forwarded to the Railway backend.

This allows the frontend and API to remain separately deployed while providing a same-origin API path to the browser.

---

# 🔄 Example Request Flow

For example, when a user requests their vehicles:

```text
React Frontend
      │
      │ GET /api/vehicles
      ▼
    Vercel
      │
      │ API Rewrite
      ▼
   Railway
      │
      ▼
Express Route
      │
      ├── Authentication
      ├── Authorization
      ├── Validation
      └── Controller
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

---

# 🗄️ Database

The project uses **PostgreSQL** as its main database.

The main tables are:

* `users`
* `vehicles`
* `charging_bays`
* `grid_slots`
* `charging_sessions`
* `refresh_tokens`

The basic relationship is:

```text
Users
  │
  │ owns
  ▼
Vehicles
  │
  │ used in
  ▼
Charging Sessions
  │
  ├── Charging Bay
  │
  └── Grid Slot
```

User ownership is used to ensure that normal users can access their own fleet data, while authorized administrators can manage system-wide resources.

---

# 🧪 Testing

Testing was included throughout the development process.

### Backend testing

The backend uses:

* Vitest
* Supertest

Testing covers areas such as:

* Authentication
* API endpoints
* Algorithms
* Edge cases
* Authorization
* Database/API integration

### Frontend testing

The frontend uses:

* Vitest
* React testing utilities

Frontend tests cover areas such as:

* Authentication
* Route protection
* Role-based access
* Component behavior

The latest frontend verification resulted in:

```text
13 test files
70 tests passed
Production build successful
```

---

# 🌐 Deployment

The project is deployed using separate services.

```text
┌─────────────────────────┐
│         Vercel          │
│     React Frontend      │
└────────────┬────────────┘
             │
             │ /api/*
             ▼
┌─────────────────────────┐
│        Railway          │
│    Express Backend      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│    Neon PostgreSQL      │
│      Production DB      │
└─────────────────────────┘
```

### Live application

**Frontend**

https://smart-ev-optimizer.vercel.app

**Backend**

https://smart-ev-optimizer-production.up.railway.app

### Backend health check

```text
GET /api/health
```

---

# 🛠️ Technology Stack

### Frontend

* React 19
* Vite
* JavaScript
* JSX
* CSS
* React Router
* Fetch API

### Backend

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

### Database

* PostgreSQL
* node-postgres (`pg`)
* Neon PostgreSQL

### Testing

* Vitest
* Supertest

### Deployment

* Vercel
* Railway
* Neon

---

# 📁 Project Structure

```text
smart-ev-optimizer/
│
├── backend/
│   ├── src/
│   │   ├── algorithms/
│   │   │   ├── assignment/
│   │   │   ├── journey/
│   │   │   ├── power/
│   │   │   ├── routing/
│   │   │   └── resourceAllocation/
│   │   │
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── app.js
│   │
│   ├── tests/
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── api/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Vehicles/
│   │   │   ├── ChargingBays/
│   │   │   ├── ChargingSessions/
│   │   │   └── Optimization/
│   │   ├── routes/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── vite.config.js
│   ├── vercel.json
│   └── package.json
│
├── .gitignore
└── README.md
```

---

# 🚀 Running the Project Locally

## 1. Clone the repository

```bash
git clone <repository-url>
cd smart-ev-optimizer
```

## 2. Start the backend

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

Run:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

## 3. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend normally runs on:

```text
http://localhost:5173
```

---

# 📚 What I Learned From This Project

One of the main reasons for building this project was to understand how different parts of software development work together.

Through the project, I worked with:

* Data Structures and Algorithms
* REST API development
* React
* Node.js and Express
* PostgreSQL
* Authentication
* Authorization
* JWT and refresh tokens
* HttpOnly cookies
* API security
* Input validation
* Rate limiting
* Automated testing
* Database relationships
* Cloud deployment
* Performance benchmarking

More importantly, the project helped connect the theoretical concepts from DAA with a practical application.

For example, a priority queue is no longer just a data-structure exercise; it can be used to decide which EV should be considered for charging first.

Similarly, graph algorithms such as Dijkstra and A* can be applied to actual routing and journey-planning problems.

---

# 🔮 Future Improvements

There are several features that could be added in future versions:

* Real-time EV telemetry
* WebSocket-based live updates
* Live charging status
* Dynamic electricity pricing
* Machine-learning-based demand prediction
* Renewable-energy integration
* Solar and battery storage optimization
* Advanced charging schedules
* Real-time traffic-aware routing
* Energy consumption analytics
* Historical fleet analytics
* More advanced grid optimization

---

# 🎓 Academic Purpose

This project was developed as an academic project with the goal of demonstrating how **Data Structures and Algorithms can be applied to a real-world Smart Grid and EV fleet management problem**.

Rather than implementing algorithms as separate examples, the project integrates them into a complete web application with authentication, database management, security, testing, and deployment.

This makes it possible to study both the theoretical side of the algorithms and their practical implementation in a working software system.

---

# 📄 License

This project was developed for academic and educational purposes.
