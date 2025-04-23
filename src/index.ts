import express from "express";
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
app.post("/users", async (req:any, res:any) => { 
  try {
    const { name, password } = req.body;

    // Validate input
    if (!name || !password) {
      return res.status(400).json({
        error: "Name and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await AppDataSource.manager.findOne(User, {
      where: { name },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User with this name already exists",
      });
    }

    // Create new user
    const user = new User();
    user.name = name;
    user.password = password; // Note: In a real app, you should hash the password

    // Save user to database
    await AppDataSource.manager.save(user);

    // Return success response (excluding password)
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await AppDataSource.manager.find(User);
    // Don't send passwords in response
    const safeUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
    }));
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
