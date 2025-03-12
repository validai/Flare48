// Defines the User collection schema and exports it as a model in MongoDB
// The schema defines the structure of the User collection
// The model is used to perform CRUD operations on the User collection
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
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
        url: { type: String, required: true, unique: true, sparse: true },
        image: { type: String, default: null },
        publishedAt: { type: Date, default: Date.now },
        savedAt: { type: Date, default: Date.now }
      }
    ],
  },
  { 
    timestamps: true,
    // Add index for savedArticles.url to prevent duplicates per user
    indexes: [
      { 
        fields: { 'savedArticles.url': 1, '_id': 1 },
        unique: true,
        sparse: true,
        name: 'unique_article_per_user'
      }
    ]
  }
);

// Create compound index for unique articles per user
UserSchema.index({ 'savedArticles.url': 1, '_id': 1 }, { unique: true, sparse: true });

// Create the model
const User = mongoose.model("User", UserSchema);

// Export the model
export default User;
// Extra error handling added for debugging and validation purposes
// The timestamps option adds createdAt and updatedAt fields to the schema
// The model is exported to be used in other parts of the application