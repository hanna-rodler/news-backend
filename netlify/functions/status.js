import express, { Router } from "express";
import serverless from "serverless-http";

const api = express();
const router = Router();

router.get("/hello", (req, res) => res.send("Hello World!"));
router.get("/hello", (req, res) => res.send("✅ Server is running"));

api.use("/api/", router);

export const handler = serverless(api);
