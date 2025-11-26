// src/pages/Categories/CategoryForm.jsx
import React, { useEffect, useState } from "react";
import { createCategory, updateCategory, getCategoryById } from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";

export default function CategoryForm({ edit }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState({ name: "", slug: "" });

  useEffect(() => {
    if (edit && id) {
      getCategoryById(id).then(res => setCategory(res)).catch(err => console.error(err));
    }
  }, [edit, id]);

  const handleChange = (e) => setCategory({ ...category, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (edit && id) {
        await updateCategory(id, category);
      } else {
        await createCategory(category);
      }
      navigate("/categories");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  return (
    <form onSubmit={submit}>
      <h3>{edit ? "Edit" : "New"} Category</h3>
      <input name="name" placeholder="Name" value={category.name} onChange={handleChange} required />
      <input name="slug" placeholder="Slug (optional)" value={category.slug} onChange={handleChange} />
      <button type="submit">Save</button>
    </form>
  );
}
