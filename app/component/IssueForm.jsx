// C:\Users\FairCom\Desktop\Project\my-next-fixed\app\component\IssueForm.jsx


"use client";
import { useState } from "react";

export default function IssueForm({ onSubmit }) {
  const [formData, setFormData] = useState({ title: "", description: "", category: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input name="title" onChange={handleChange} placeholder="Issue Title" className="border p-2 w-full" />
      <textarea name="description" onChange={handleChange} placeholder="Description" className="border p-2 w-full" />
      <input name="category" onChange={handleChange} placeholder="Category" className="border p-2 w-full" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  );
}