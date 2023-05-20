const { default: mongoose } = require("mongoose");
const reviewSchema = require("./reviewSchema");

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: [{ type: String, required: true }],
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
    },
    reviews: [reviewSchema],
    discount: {
      type: Number,
      required: true,
    },
    audience: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

// const { ObjectId } = require("mongodb");
// const { getDb } = require("../util/database");

// const Cart = require("./cart");

// module.exports = class Product {
//   constructor(id, title, imageUrl, price, description, userId) {
//     this._id = id;
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.price = price;
//     this.description = description;
//     this.userId = userId;
//   }

//   saveOrUpdate() {
//     const db = getDb();
//     if (this._id) {
//       return db.collection("products").updateOne(
//         { _id: this._id },
//         {
//           $set: this,
//         }
//       );
//     } else {
//       return db.collection("products").insertOne(this);
//     }
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db.collection("products").find().toArray();
//   }

//   static findById(id) {
//     const db = getDb();
//     return db.collection("products").findOne({ _id: new ObjectId(id) });
//   }

//   static deleteById(id) {
//     const db = getDb();
//     db.collection("products").deleteOne({ _id: new ObjectId(id) });
//   }
// };
