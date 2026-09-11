import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import pool from "./config/database.js"
import authRoute from "./routes/authRoute.js";
import vehicleRoute from "./routes/vehicleRoute.js";
import chargingBayRoute from "./routes/chargingBayRoute.js"
import gridSlotRoute from "./routes/gridSlotRoute.js";
import chargingSessionRoute from "./routes/chargingSessionRoute.js"
import assignmentRoute from "./routes/assignmentRoute.js";
import schedulingRoute from "./routes/schedulingRoute.js";
import powerRoute from "./routes/powerRoute.js";
import routingRoute from "./routes/routingRoute.js";
import journeyRoute from "./routes/journeyRoute.js";
import resourceAllocationRoute from "./routes/resourceAllocationRoute.js";
import benchmarkRoute from "./routes/benchmarkRoute.js";


dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


app.use(
  helmet()
);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://192.168.100.9:5173",
  "https://smart-ev-optimizer.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use("/api", apiLimiter);



app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "1mb",
  })
);

app.use(cookieParser());


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart EV Optimizer API is running",
  });
});



app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "smart-ev-optimizer-backend",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});




pool.query("SELECT NOW()")
.then(() => {
  console.log("PostgreSQL connected successfully");
})
.catch((error) => {
  console.error("PostgreSQL connection failed",error);
});



app.use("/api/auth",authRoute);
app.use("/api/vehicles", vehicleRoute);
app.use("/api/charging-bays", chargingBayRoute);
app.use("/api/grid-slots", gridSlotRoute);
app.use("/api/charging-sessions",chargingSessionRoute);

app.use("/api/assignment", assignmentRoute);
app.use("/api/scheduling",schedulingRoute);
app.use("/api/power",powerRoute);
app.use("/api/routing",routingRoute);
app.use("/api/journey",journeyRoute);
app.use("/api/resource-allocation",resourceAllocationRoute);
app.use("/api/benchmark",benchmarkRoute);







app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});



  
app.listen(PORT, () => {
  console.log(`EV Optimizer API running on port ${PORT}`);
});