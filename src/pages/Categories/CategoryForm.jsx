// src/pages/Categories/CategoryForm.jsx
import React, { useEffect, useState, useCallback } from "react";
import { createCategory, updateCategory, getCategoryById } from "../../services/api";
import { useNavigate, useParams, Link } from "react-router-dom";
import CropperModal from "../../components/CropperModal";

export default function CategoryForm({ edit }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState({
    name: "",
    description: "",
    imageBase64: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [error, setError] = useState(null);

  // Load category if editing
  useEffect(() => {
    let cancelled = false;

    if (edit && id) {
      setLoadingCategory(true);
      getCategoryById(id)
        .then((res) => {
          if (!cancelled) {
            setCategory({
              name: res.name || "",
              description: res.description || "",
              imageBase64: res.imageBase64 || ""
            });
          }
        })
        .catch(() => !cancelled && setError("Failed to load category"))
        .finally(() => !cancelled && setLoadingCategory(false));
    }

    return () => (cancelled = true);
  }, [edit, id]);

  // Handle text inputs
  const handleChange = useCallback((e) => {
    setCategory((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  // Open cropper when file selected
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setTempImage(previewURL);
    setShowCropper(true);
  };

  // When cropping is done
  const handleCropDone = (croppedBlob) => {
    setImageFile(croppedBlob);
    setShowCropper(false);
  };

  // Submit form
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        name: category.name,
        description: category.description
      };

      if (edit) {
        await updateCategory(id, data, imageFile);
      } else {
        await createCategory(data, imageFile);
      }

      navigate("/categories");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Save failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategory) return <div className="loading-state">Loading category...</div>;

  return (
    <>
      <form onSubmit={submit} className="category-form">
        <h3>{edit ? "Edit Category" : "Create New Category"}</h3>
        {error && <div className="error-message">{error}</div>}

        {/* Category Info */}
        <div className="form-section">
          <h4>Category Information</h4>

          <div className="form-group">
            <label>Category Name *</label>
            <input
              name="name"
              value={category.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows="4"
              value={category.description}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* Image Section */}
        <div className="form-section">
          <h4>Category Image</h4>

          <div className="form-group">
            <label>
              Category Image {edit && <span className="optional">(Optional)</span>}
            </label>

            <input type="file" accept="image/*" onChange={handleFile} disabled={loading} />

            {/* New cropped image preview */}
            {imageFile && (
              <div className="image-preview">
                <p>Selected Image:</p>
                <img src={URL.createObjectURL(imageFile)} className="preview-image" alt="" />
              </div>
            )}

            {/* Existing image preview */}
            {edit && !imageFile && category.imageBase64 && (
              <div className="current-image">
                <p>Current Image:</p>
                <img
                  src={`data:image/jpeg;base64,${category.imageBase64}`}
                  className="preview-image"
                  alt=""
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
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

      {/* Cropper Modal */}
      {showCropper && tempImage && (
        <CropperModal
          imgSrc={tempImage}
          onClose={() => setShowCropper(false)}
          onCropDone={handleCropDone}
        />
      )}
    </>
  );
}
