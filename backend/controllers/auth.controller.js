import * as authService from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).send({message:"registration failed", success :false})
      next(error);
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
    //res.status(500).send({message:"server error", success :false})
    next(error);
  } 
};