import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        sku: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        attributes: [
          {
            name: String,
            value: String,
          }
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);