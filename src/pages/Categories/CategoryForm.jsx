// src/pages/Categories/CategoryForm.jsx
import React, { useEffect, useState, useCallback } from "react";
import { createCategory, updateCategory, getCategoryById } from "../../services/api";
import { useNavigate, useParams, Link } from "react-router-dom";

// Helper to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]); // Remove data:image/...;base64, prefix
    reader.onerror = error => reject(error);
  });
}

export default function CategoryForm({ edit }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState({ name: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    
    if (edit && id) {
      setLoadingCategory(true);
      getCategoryById(id)
        .then(res => {
          if (!cancelled) {
            setCategory({
              name: res.name || "",
              description: res.description || "",
              imageBase64: res.imageBase64 || null
            });
            setLoadingCategory(false);
          }
        })
        .catch(err => {
          console.error(err);
          if (!cancelled) {
            setError("Failed to load category");
            setLoadingCategory(false);
          }
        });
    }

    return () => { cancelled = true; };
  }, [edit, id]);

  const handleChange = useCallback((e) => {
    setCategory(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleFile = useCallback((e) => {
    setImageFile(e.target.files[0]);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const categoryData = {
        name: category.name,
        description: category.description || ""
      };

      // Convert image file to base64 if provided
      if (imageFile) {
        try {
          categoryData.image = await fileToBase64(imageFile);
        } catch (err) {
          setError("Failed to process image. Please try again.");
          setLoading(false);
          return;
        }
      } else if (edit && category.imageBase64) {
        // Keep existing image if no new image is provided
        categoryData.image = category.imageBase64;
      }

      if (edit && id) {
        await updateCategory(id, categoryData);
      } else {
        await createCategory(categoryData);
      }
      navigate("/categories");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Save failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategory) {
    return <div className="loading-state">Loading category...</div>;
  }

  return (
    <form onSubmit={submit} className="category-form">
      <h3>{edit ? "Edit Category" : "Create New Category"}</h3>
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-section">
        <h4>Category Information</h4>
        
        <div className="form-group">
          <label htmlFor="name">
            Category Name <span className="required">*</span>
          </label>
          <input 
            id="name"
            name="name" 
            placeholder="Enter category name (e.g., Electronics, Clothing)" 
            value={category.name} 
            onChange={handleChange} 
            required
            disabled={loading}
          />
          <small className="form-help">Enter a clear and descriptive name for the category</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description
          </label>
          <textarea 
            id="description"
            name="description" 
            placeholder="Describe what products belong to this category"
            value={category.description} 
            onChange={handleChange}
            rows="4"
            disabled={loading}
          />
          <small className="form-help">Provide a brief description of this category</small>
        </div>
      </div>

      <div className="form-section">
        <h4>Category Image</h4>
        
        <div className="form-group">
          <label htmlFor="image">
            Category Image {edit && <span className="optional">(Optional - leave empty to keep current image)</span>}
          </label>
          <input 
            id="image"
            type="file" 
            accept="image/*" 
            onChange={handleFile}
            disabled={loading}
          />
          {imageFile && (
            <div className="image-preview">
              <p className="file-name">Selected: {imageFile.name}</p>
              <img 
                src={URL.createObjectURL(imageFile)} 
                alt="Preview" 
                className="preview-image"
              />
            </div>
          )}
          {edit && category.imageBase64 && !imageFile && (
            <div className="current-image">
              <p className="current-image-label">Current Image:</p>
              <img 
                src={`data:image/jpeg;base64,${category.imageBase64}`} 
                alt="Current category" 
                className="preview-image"
              />
            </div>
          )}
          <small className="form-help">Upload a category image (JPG, PNG, or GIF). Recommended size: 400x400px</small>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving..." : edit ? "Update Category" : "Create Category"}
        </button>
        <Link to="/categories">
          <button type="button" disabled={loading} className="btn-secondary">
            Cancel
          </button>
        </Link>
      </div>
    </form>
  );
}
