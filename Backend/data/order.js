const { Types } = require("mongoose");

module.exports = {
  user: Types.ObjectId("6417f69a50a04bff8c961832"),
  orderItems: [
    {
      title: "Sport Boots",
      image: "/img/featured/1.jpg",
      qty: 5,
      price: 89.99,
      product: Types.ObjectId("6417f918acc688a735890caf"),
    },
    {
      title: "Travel Backpack",
      image: "/img/featured/3.jpg",
      qty: 3,
      price: 929.99,
      product: Types.ObjectId("6417f918acc688a735890cb1"),
      discount: 15.99,
    },
  ],
  shippingAddress: {
    address: "Bungalow No: 249 Isra Village",
    city: "Hyderabad",
    postalCode: "71000",
    country: "Pakistan",
  },
  paymentMethod: 'paypal',
  paymentResult: {
    id: {
      type: String,
    },
    status: {
      type: String,
    },
    update_time: {
      type: String,
    },
    email_address: {
      type: String,
    },
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false,
  },
  deliveredAt: {
    type: Date,
  },
};
