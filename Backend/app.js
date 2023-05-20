const path = require("path");
const fs = require("fs/promises");

const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { default: mongoose } = require("mongoose");

const auth = require("./middleware/auth");
const graphqlSchema = require("./graphql/schema");
const graphqlResolvers = require("./graphql/resolver");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.use((req, res, next) => {
  if (req.headers["content-type"]) {
    if (req.headers["content-type"].includes("multipart/form-data")) {
      if (!process.env.ADMIN_USER_EMAILS.split(" ").includes(req.email)) {
        const message = "Unauthorized!";
        const status = 403;
        return res.status(status).json({ status, message });
      }
    }
  }

  next();
}, multer({ storage: fileStorage, fileFilter }).array("images", 4));

app.put("/post-image", (req, res, next) => {
  if (!req.files || req.files.length !== 4) {
    if (req.files.length) {
      req.files.forEach(async (f) => {
        await fs.unlink(
          path.join(path.dirname(require.main.filename), "images", f.filename)
        );
      });
    }
    const message = "Invalid product data entered!";
    const status = 422;
    const data = { images: "invalid" };
    return res.status(status).json({ status, message, data });
  }
  if (req.body.oldImagesPath) {
    console.log(req.body.oldImagesPath);
    req.body.oldImagesPath.forEach(async (f) => {
      await fs.unlink(path.join(path.dirname(require.main.filename), f));
    });
  }
  const filesPath = req.files.map((f) => "images/" + f.filename);
  res.status(201).json({ message: "File stored!", filesPath: filesPath });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.originalError.message || "An error occured.";
      const status = err.originalError.status || 500;
      return { message, status, data };
    },
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.duir4ci.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("connected");
    app.listen(process.env.PORT || 8080);
  })
  .catch((err) => {
    console.log(err);
    console.log("failed connecting.");
  });
