import * as userService from "../services/users.service.js";

/* GET ALL */
export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

/* GET ONE */
export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/* CREATE */
export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/* UPDATE */
export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(
      req.params.id,
      req.body,
      req.user.userId
    );
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/* DEACTIVATE */
export const deactivateUser = async (req, res, next) => {
  try {
    await userService.deactivateUser(
      req.params.id,
      req.user.userId
    );
    res.json({ success: true, message: "User deactivated" });
  } catch (error) {
    next(error);
  }
};

/* ACTIVATE */
export const activateUser = async (req, res, next) => {
  try {
    await userService.activateUser(req.params.id);
    res.json({ success: true, message: "User activated" });
  } catch (error) {
    next(error);
  }
};