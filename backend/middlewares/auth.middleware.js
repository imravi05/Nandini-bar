import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticate = (req, res, next) => {
  // Add this bypass line
  // remember to remove this in production or set NODE_ENC to production in your .en
  if (process.env.NODE_ENV === "development") {
     req.user = { userId: "dev-user", role: "ADMIN" }; // Mock a superuser
     return next();
   }
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
