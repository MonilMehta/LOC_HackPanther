import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import initializeSocket from "./socket.js";

const app = express();
const server = http.createServer(app);

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST"],
};

app.use(cors(corsOptions));

app.use(express.json())

app.use(express.urlencoded({
    extended: true,
}))

app.use(express.static("public"))

app.use(cookieParser())

const io = initializeSocket(server, corsOptions);

app.use((req, _, next) => {
    req.io = io;
    next();
});

// import routes
import userRouter from './routes/user.routes.js';
import caseRouter from './routes/case.routes.js';
import reportRouter from './routes/report.routes.js';
import citizenRouter from './routes/citizen.routes.js';
import chatRouter from "./routes/chat.routes.js";
import alertRouter from './routes/alert.routes.js';
import wantedRouter from './routes/wanted.routes.js'
import leaveRouter from './routes/leave.routes.js';
import attendanceRouter from './routes/attendance.routes.js';
import bulletinRouter from './routes/bulletin.routes.js';
import evidenceRouter from './routes/evidence.routes.js';


// declare routes
app.use("/api/users", userRouter);
app.use("/api/citizens", citizenRouter);
app.use("/api/case",caseRouter);
app.use("/api/report",reportRouter);
app.use("/api/chats", chatRouter);
app.use("/api/alert",alertRouter);
app.use("/api/wanted",wantedRouter);
app.use("/api/leave",leaveRouter);
app.use("/api/attendance",attendanceRouter);
app.use("/api/bulletin", bulletinRouter);
app.use("/api/evidence", evidenceRouter);


app.use((err, _, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({ success: false, message });
});

export { app, server }