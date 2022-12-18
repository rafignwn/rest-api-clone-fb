import mongoose, { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    author: {
      type: {
        id: {
          type: mongoose.Types.ObjectId,
        },
        username: {
          type: String,
        },
      },
    },
    desc: {
      type: String,
      max: 500,
    },
    image: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

export default model("Post", postSchema);
