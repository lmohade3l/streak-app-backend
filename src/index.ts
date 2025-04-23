import express, { Request, Response } from "express";
import { initializeDatabase, AppDataSource } from "./config/database";
import { User } from "./entities/User";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

// Middleware to parse JSON bodies
app.use(express.json());

// Create a new user
app.post("/users", async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;
    const user = new User();
    user.name = name;
    user.password = password;

    await AppDataSource.manager.save(user);
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});

// Get all users
app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await AppDataSource.manager.find(User);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
