import { Router, Request, Response } from "express";

const router: Router = Router();

// ✅ Base User Route
router.get("/", (req: Request, res: Response) => {
    res.json({ message: "User endpoint works!" });
});

// ✅ Example Route: Get User Profile
router.get("/profile", (req: Request, res: Response) => {
    res.json({ message: "User profile route working!" });
});

// ✅ Example Route: Get All Users (Future Expansion)
router.get("/all", (req: Request, res: Response) => {
    res.json({ message: "List of all users will be returned here." });
});

export default router;
