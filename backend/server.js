import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown handling
process.on("SIGINT", () => {
  console.log("🛑 Shutting down server...");
  server.close(() => {
    process.exit(0);
  });
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
  server.close(() => process.exit(1));
});