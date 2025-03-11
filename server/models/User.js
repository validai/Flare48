// Defines the User collection schema and exports it as a model in MongoDB
// The schema defines the structure of the User collection
// The model is used to perform CRUD operations on the User collection
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: [true, "Username already exists"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
      match: [/.+\@.+\..+/, "Invalid email format"],
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId; // Password is required only if not using Google auth
      },
      minlength: [6, "Password must be at least 6 characters long"],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    profilePicture: {
      type: String,
    },
    savedArticles: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true},
        image: { type: String },
        publishedAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
// Extra error handling added for debugging and validation purposes
// The timestamps option adds createdAt and updatedAt fields to the schema
// The model is exported to be used in other parts of the application