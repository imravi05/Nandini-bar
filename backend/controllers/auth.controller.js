import * as authService from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    // Explicitly return to ensure no further code executes
    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    // If a user with that email already exists, Prisma throws an error
    console.error("Registration Error:", error.message);
    res.status(400).json({ 
      success: false, 
      message: error.code === 'P2002' ? "Email already registered" : "Registration failed" 
    });
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(
      req.body.email,
      req.body.password
    );
    res.json({ success: true, ...result });

  } catch (error) {
    
    console.error("Login Error:", error.message); // This will show why it failed in your terminal
    res.status(401).json({ 
      success: false, 
      message: error.message });
  } 
};