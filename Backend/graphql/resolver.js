const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const fs = require("fs/promises");

const User = require("../models/user");
const Product = require("../models/product");
const { Message } = require("../models/message");
const path = require("path");

const FILTER_ITEMS = ["category", "audience"];

module.exports = {
  signup: async function ({ userInput }) {
    let createdUser;
    const { email, fullname, password } = userInput || {};
    const errors = {};
    if (validator.isEmpty(fullname)) {
      errors.fullname = "empty";
    }
    if (!validator.isEmail(email)) {
      errors.email = "invalid";
    }
    if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/.test(
        password
      )
    ) {
      errors.password = "invalid";
    }
    if (!errors.fullname || !errors.email || !errors.password) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        errors.email = "exist";
      }
      if (!errors.email) {
        const hashedPw = await bcrypt.hash(password, 12);
        const user = new User({
          email,
          fullname,
          password: hashedPw,
        });
        createdUser = await user.save();
      }
    }
    if (Object.keys(errors).length > 0) {
      const error = new Error("Invalid signup data entered!");
      error.status = 422;
      error.data = errors;
      throw error;
    }
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },

  login: async function ({ email, password }) {
    let token;
    let user;
    const errors = {};
    validator.isEmail(email) ? "" : (errors.email = "invalid");
    /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/.test(
      password
    )
      ? ""
      : (errors.password = "invalid");

    if (!errors.email && !errors.password) {
      user = await User.findOne({ email });
      if (!user) {
        errors.email = "notexist";
      }
      if (!errors.email) {
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
          errors.password = "notmatch";
        }
      }
    }
    if (!errors.email && !errors.password) {
      token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
          fullname: user.fullname,
        },
        process.env.TOKEN_SECRET,
        {
          expiresIn: "3h",
        }
      );
      if (!token) {
        errors.token = "invalid";
      }
    }
    if (Object.keys(errors).length > 0) {
      const error = new Error("Invalid auth data entered!");
      error.status = 422;
      error.data = errors;
      throw error;
    }
    return { token, fullname: user.fullname };
  },

  createProduct: async function ({ productInput }, req) {
    const {
      title,
      images,
      description,
      price,
      category,
      brand,
      audience,
      discount,
      countInStock,
    } = productInput || {};
    const errors = {};
    validator.isEmpty(title) ? (errors.title = "empty") : "";
    !price ? (errors.price = "empty") : "";
    validator.isLength(description, { min: 50 })
      ? ""
      : (errors.description = "short");
    validator.isEmpty(category) ? (errors.category = "empty") : "";
    !audience.length ? (errors.audience = "empty") : "";
    discount || discount === 0 ? "" : (errors.discount = "empty");
    countInStock || countInStock === 0 ? "" : (errors.countInStock = "empty");
    if (Object.keys(errors).length > 0) {
      images.forEach(async (i) => {
        await fs.unlink(path.join(path.dirname(require.main.filename), i));
      });
      const error = new Error("Invalid product data entered!");
      error.status = 422;
      error.data = errors;
      throw error;
    }
    const product = new Product({
      title,
      images,
      description,
      price,
      category,
      audience,
      brand: brand || "",
      discount,
      countInStock,
      creator: req.userId,
    });
    const createdProduct = await product.save();
    return createdProduct._id.toString();
  },

  getProducts: async function (
    { itemsPerPage, page, findCondition, sortCondition },
    req
  ) {
    if (!page) {
      page = 1;
    }
    let parsedFindCondition;
    let andQuery = [];
    if (findCondition) {
      parsedFindCondition = JSON.parse(findCondition);
      for (const f in parsedFindCondition) {
        andQuery.push({ [f]: parsedFindCondition[f] });
      }
    }
    let totalProducts;
    let products;
    let sortObj = { rating: -1, createdAt: -1 };
    if (sortCondition === "bestselling") {
      sortObj = { rating: -1, createdAt: -1 };
    }
    if (sortCondition === "new-arrivals" || sortCondition === "datenewtoold") {
      sortObj = { createdAt: -1, rating: -1 };
    }
    if (sortCondition === "pricelowtohigh") {
      sortObj = { price: 1, rating: -1 };
    }
    if (sortCondition === "pricehightolow") {
      sortObj = { price: -1, rating: -1 };
    }
    if (sortCondition === "dateoldtonew") {
      sortObj = { createdAt: 1, rating: -1 };
    }

    if (parsedFindCondition) {
      totalProducts = await Product.find({ $or: andQuery }).count();
      products = await Product.find({ $or: andQuery })
        .sort(sortObj)
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage);
    }
    if (!parsedFindCondition) {
      totalProducts = await Product.find().count();
      products = await Product.find()
        .sort(sortObj)
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage);
    }

    const count = {};
    for (let i = 0; i < FILTER_ITEMS.length; i++) {
      const item = FILTER_ITEMS[i];
      const distinct = await Product.distinct(item);
      count[item] = {};
      for (let j = 0; j < distinct.length; j++) {
        const d = distinct[j];
        count[item][d.toLowerCase()] = await Product.find({
          [item]: d,
        }).count();
      }
    }

    const maxPrice = (
      await Product.find({}, { _id: 0, price: 1 }).sort({ price: -1 }).limit(1)
    ).map((p) => p.price)[0];
    const minPrice = (
      await Product.find({}, { _id: 0, price: 1 }).sort({ price: 1 }).limit(1)
    ).map((p) => p.price)[0];

    return {
      products: products.map((p) => ({
        ...p._doc,
        _id: p._id.toString(),
        createdAt: p.createdAt.toString(),
        updatedAt: p.updatedAt.toString(),
      })),
      totalProducts,
      count: JSON.stringify(count),
      minPrice,
      maxPrice,
    };
  },

  getProduct: async function ({ id, items }, req) {
    const product = await Product.findById(id);
    if (!product) {
      const error = new Error("No product found.");
      error.status = 404;
      throw error;
    }
    let featuredProducts;
    if (items) {
      featuredProducts = await Product.find()
        .sort({ rating: -1, createdAt: -1 })
        .limit(items);
    }

    return {
      featuredProducts,
      product: {
        ...product._doc,
        _id: product._id.toString(),
        createdAt: product.createdAt.toString(),
        updatedAt: product.updatedAt.toString(),
      },
    };
  },

  editProduct: async ({ id, productInput }, req) => {
    console.log(id);
    const {
      title,
      images,
      description,
      price,
      category,
      brand,
      audience,
      discount,
      countInStock,
    } = productInput || {};
    const errors = {};
    validator.isEmpty(title) ? (errors.title = "empty") : "";
    !price ? (errors.price = "empty") : "";
    validator.isLength(description, { min: 50 })
      ? ""
      : (errors.description = "short");
    validator.isEmpty(category) ? (errors.category = "empty") : "";
    !audience.length ? (errors.audience = "empty") : "";
    discount || discount === 0 ? "" : (errors.discount = "empty");
    countInStock || countInStock === 0 ? "" : (errors.countInStock = "empty");
    if (Object.keys(errors).length > 0) {
      images.forEach(async (i) => {
        await fs.unlink(path.join(path.dirname(require.main.filename), i));
      });
      const error = new Error("Invalid product data entered!");
      error.status = 422;
      error.data = errors;
      throw error;
    }
    const product = await Product.findById(id);
    product.title = title;
    product.price = price;
    product.images = images;
    product.description = description;
    product.category = category;
    product.brand = brand;
    product.audience = audience;
    product.discount = discount;
    product.countInStock = countInStock;

    const editedProduct = await product.save();
    return editedProduct._id.toString();
  },

  deleteProduct: async ({ id }, req) => {
    if (!process.env.ADMIN_USER_EMAILS.includes(req.email)) {
      const error = new Error("Unauthorized!");
      error.status = 403;
      throw error;
    }
    const product = await Product.findById(id);
    if (!product) {
      const error = new Error("No product found.");
      error.status = 404;
      throw error;
    }
    product.images.forEach(async (i) => {
      await fs.unlink(path.join(path.dirname(require.main.filename), i));
    });
    await Product.findByIdAndRemove(id);
    return true;
  },

  createReview: async ({ productId, reviewInput }) => {
    const product = await Product.findById(productId);
    const { rating, title, comment, name } = reviewInput;
    const errors = {};
    rating == 0 ? (errors.rating = ["empty"]) : "";
    if (validator.isEmpty(name)) {
      return false;
    }
    validator.isEmpty(title) ? (errors.title = ["empty"]) : "";
    validator.isEmpty(comment) ? (errors.comment = ["empty"]) : "";
    !validator.isLength(comment, { min: 50 })
      ? (errors.comment = ["short"])
      : "";
    if (Object.keys(errors).length > 0) {
      const error = new Error("Invalid review data entered!");
      error.status = 422;
      error.data = errors;
      throw error;
    }
    product.reviews.push(reviewInput);
    await product.save();
    return true;
  },

  createMessage: async (messageData) => {
    const { name, email, message } = messageData || {};
    const errors = {};
    validator.isEmpty(name) ? (errors.name = "empty") : "";
    validator.isEmail(email) ? "" : (errors.email = "invalid");
    validator.isLength(message, { min: 50 }) ? "" : (errors.message = "short");
    if (Object.keys(errors).length > 0) {
      const error = new Error("Invalid message data entered!");
      error.status = 422;
      error.data = errors;
      throw error;
    }
    const user = await User.findOne({ email });
    let messageInstance;
    if (user) {
      user.messages.push({ ...messageData });
      await user.save();
      messageInstance = new Message({
        ...messageData,
        userId: user._id,
      });
    } else {
      messageInstance = new Message({
        ...messageData,
      });
    }
    await messageInstance.save();
    return true;
  },
};
