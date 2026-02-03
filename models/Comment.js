// C:\Users\FairCom\Desktop\Project\my-next-fixed\models\Comment.js

import mongoose from "mongoose";


const CommentSchema = new mongoose.Schema(
  {
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue" },
    username: String,
    text: String,
  },
  { timestamps: true }
);

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema);