import express from "express";
import Environment from "./data/config/environment.js";
import { connectToDatabase } from "./data/config/database.js";
import { AppError } from "./business/utils/errorUtils.js";
import { configureMiddleware } from "./presentation/middleware/middlewareConfig.js";
import routes from "./presentation/routes/index.js";
import { errorHandler } from "./presentation/middleware/errorHandler.js";
import { displayWelcomeMessage, stopAnimation } from "./business/utils/pathfinderAnimation.js"; // Ajusta la ruta

const app = express();

connectToDatabase()
  .then(() => {
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });

configureMiddleware(app);

app.get("/api", (req, res) => res.json({ message: "Welcome to the API" }));

app.use("/api", routes);

app.use("*", (req, res, next) => {
  next(AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    displayWelcomeMessage();
  });
}

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  stopAnimation();
  process.exit(1);
});

export default app;