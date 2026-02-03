// C:\Users\FairCom\Desktop\Project\my-next-fixed\models\Issue.js
import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    upvotes: { type: Number, default: 0 },
    upvoters: [{ type: String }], // Array of user IDs who upvoted
    author: {
      uid: { type: String, required: true },
      email: String,
      name: String,
    },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Issue || mongoose.model("Issue", IssueSchema);
