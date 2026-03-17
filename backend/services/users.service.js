import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";

/* GET ALL USERS */
export const getUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });
};

/* GET SINGLE USER */
export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true
    }
  });

  if (!user) throw new Error("User not found");

  return user;
};

/* CREATE USER */
export const createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role
    }
  });
};

/* UPDATE USER */
export const updateUser = async (id, data, currentUserId) => {

  if (id === currentUserId) {
    throw new Error("You cannot modify your own role");
  }

  return prisma.user.update({
    where: { id },
    data
  });
};

/* DEACTIVATE USER */
export const deactivateUser = async (id, currentUserId) => {

  if (id === currentUserId) {
    throw new Error("You cannot deactivate yourself");
  }

  return prisma.user.update({
    where: { id },
    data: { isActive: false }
  });
};

/* ACTIVATE USER */
export const activateUser = async (id) => {
  return prisma.user.update({
    where: { id },
    data: { isActive: true }
  });
};