require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/errorController");
const imageRouter = require("./routes/imageRoute");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/api/v1/images", imageRouter);

// app.all("*", (req, res, next) => {
//   next(new AppError(`The route ${req.originalUrl} does not exist`, 404));
// });

// global error handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Listening to request on port " + PORT);
});
