const { Schema, model } = require("mongoose");
const { messageSchema } = require("./message");
const reviewSchema = require("./reviewSchema");

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: "String",
    },
    messages: [messageSchema],
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
