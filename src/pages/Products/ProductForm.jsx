import React, { useEffect, useState } from "react";
import api, { createProduct, updateProduct, getProductById } from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";

export default function ProductForm({ edit }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "", description: "", price: "", categoryId: ""
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (edit && id) {
      getProductById(id).then(res => setProduct(res)).catch(err => console.error(err));
    }
  }, [edit, id]);

  const handleChange = (e) => setProduct({...product, [e.target.name]: e.target.value});
  const handleFile = (e) => setImageFile(e.target.files[0]);

  const submit = async (e) => {
    e.preventDefault();

    // Use FormData so backend can accept image bytes (longblob)
    const fd = new FormData();
    fd.append("name", product.name);
    fd.append("description", product.description);
    fd.append("price", product.price);
    if (product.categoryId) fd.append("categoryId", product.categoryId);
    if (imageFile) fd.append("image", imageFile); // backend should accept file key "image"

    try {
      if (edit && id) {
        await updateProduct(id, product, imageFile);
      } else {
        await createProduct(product, imageFile);
      }
      navigate("/products");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  return (
    <form onSubmit={submit}>
      <h3>{edit ? "Edit" : "Create"} Product</h3>
      <input name="name" value={product.name} onChange={handleChange} placeholder="Name" required/>
      <textarea name="description" value={product.description} onChange={handleChange} placeholder="Description"/>
      <input name="price" value={product.price} onChange={handleChange} placeholder="Price" type="number"/>
      <input name="categoryId" value={product.categoryId || ""} onChange={handleChange} placeholder="Category ID"/>

      <div>
        <label>Image (optional)</label>
        <input type="file" accept="image/*" onChange={handleFile}/>
      </div>

      <button type="submit">Save</button>
    </form>
  );
}
