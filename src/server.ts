/**
 * Main server configuration file for the OAuth service
 * Sets up Express server with necessary middleware and routes
 */

import express, { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';


import {authRouter} from "./entities/auth";
import {subscriberRouter} from "./entities/subscriber/route";

dotenv.config();

const app = express(); // Create app but do NOT listen here

// Configure middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(helmet()); // Security headers

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);


// Mount OAuth routes
app.use("/api/oauth", authRouter);
app.use("/api/ims", subscriberRouter);

// --- Error Handling ---

// 404 Not Found Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: "Not Found", message: `Cannot ${req.method} ${req.url}` });
});


// Global Error Handler
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("Global Error Handler:", err);

  // Customize error responses based on error type
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({error: "Unauthorized", message: err.message || "Invalid token or authorization missing"});
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation Error', message: err.message || 'Invalid request data' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: "Bad Request", message: "Invalid JSON format" });
  }
  if (err.status === 404) {
    return res.status(404).json({error: "Not Found", message: err.message || "Resource not found"})
  }
  if (err.status === 400) {
    return res.status(400).json({ error: "Bad Request", message: err.message || "Bad Request" })
  }

  // Default error response
  res.status(500).json({ error: "Internal Server Error", message: err.message || "Something went wrong on the server." });
};

app.use(errorHandler);

// Start server only if not in test environment
if (process.env.NODE_ENV  === "development") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export { app }; // Export the app instead of starting a new instance
