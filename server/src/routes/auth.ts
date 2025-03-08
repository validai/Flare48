import express, { Router, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { register, login, protectedRoute } from "../../controllers/authControllers";

dotenv.config();

const router: Router = express.Router();

// ✅ Base route to check if auth API is reachable
router.get("/", (req: Request, res: Response) => {
    res.json({ message: "Auth API is working!" });
});

// ✅ User Registration Route (Controller handles logic)
router.post("/register", register);

// ✅ User Login Route
router.post("/login", login);

// ✅ Protected Route (Requires JWT)
router.get("/protected", verifyToken, protectedRoute);

// ✅ Middleware to Verify JWT Token
function verifyToken(req: Request, res: Response, next: NextFunction): void {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        res.status(401).json({ error: "Access Denied: No token provided" });
        return;
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).user = verified; // ✅ Attach user to request object
        next();
    } catch (error: any) {
        console.error("Invalid Token Error:", error);
        res.status(400).json({ error: "Invalid Token", details: error.message });
    }
}

export default router;