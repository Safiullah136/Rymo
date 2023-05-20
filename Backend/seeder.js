const { default: mongoose } = require("mongoose");
const Product = require("./models/product");
const User = require("./models/user");
const Order = require("./models/order");
const users = require("./data/users");
const products = require("./data/products");

mongoose
  .connect(
    "mongodb+srv://muhammad_safiullah:t0DpXlWGGicxRZuA@cluster0.duir4ci.mongodb.net/rymo?retryWrites=true&w=majority"
  )
  .then(() => {
    if (process.argv[2] === "-d") {
      destroyData();
    } else {
      importData();
    }
  })
  .catch((error) => {
    console.log(error);
  });

const importData = async () => {
  try {
    await Product.deleteMany();
    // await User.deleteMany();
    // await Order.deleteMany();

    // const sampleUsers = await User.insertMany(users);
    // const adminUser = users[0]._id;

    const sampleProducts = products.map((p) => ({
      ...p,
      creator: "64122ec6d7f7fedb193736fb",
    }));
    await Product.insertMany(sampleProducts);

    console.log("data imported");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    // await User.deleteMany();
    // await Order.deleteMany();

    console.log("data destroyed!");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
