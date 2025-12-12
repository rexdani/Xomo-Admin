import React, { useEffect, useState, useCallback } from "react";
import { createProduct, updateProduct, getProductById, getCategories } from "../../services/api";
import { useNavigate, useParams, Link } from "react-router-dom";
import CropperModal from "../../components/CropperModal";
export default function ProductForm({ edit }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "", description: "", price: "", stock: "", categoryId: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [error, setError] = useState(null);
  
  const [tempImage, setTempImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  useEffect(() => {
    let cancelled = false;
    
    async function loadCategories() {
      try {
        const list = await getCategories();
        if (!cancelled) setCategories(list || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    
    loadCategories();

    if (edit && id) {
      setLoadingProduct(true);
      getProductById(id)
        .then(res => {
          if (!cancelled) {
            setProduct({
              name: res.name || "",
              description: res.description || "",
              price: res.price || "",
              stock: res.stock || "",
              categoryId: res.categoryId || res.category?.id || "",
              imageBase64: res.imageBase64 || null
            });
            setLoadingProduct(false);
          }
        })
        .catch(err => {
          console.error(err);
          if (!cancelled) {
            setError("Failed to load product");
            setLoadingProduct(false);
          }
        });
    }

    return () => { cancelled = true; };
  }, [edit, id]);

  const handleChange = useCallback((e) => {
    setProduct(prev => ({...prev, [e.target.name]: e.target.value}));
  }, []);

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

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (edit && id) {
        await updateProduct(id, product, imageFile);
      } else {
        await createProduct(product, imageFile);
      }
      navigate("/products");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Save failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return <div className="loading-state">Loading product...</div>;
  }

  return (
    <form onSubmit={submit} className="product-form">
      <h3>{edit ? "Edit Product" : "Create New Product"}</h3>
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-section">
        <h4>Basic Information</h4>
        
        <div className="form-group">
          <label htmlFor="name">
            Product Name <span className="required">*</span>
          </label>
          <input 
            id="name"
            name="name" 
            value={product.name} 
            onChange={handleChange} 
            placeholder="Enter product name (e.g., Cotton T-Shirt)" 
            required
            disabled={loading}
          />
          <small className="form-help">Enter a clear and descriptive name for your product</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Product Description
          </label>
          <textarea 
            id="description"
            name="description" 
            value={product.description} 
            onChange={handleChange} 
            placeholder="Describe your product in detail (features, materials, size, etc.)"
            rows="4"
            disabled={loading}
          />
          <small className="form-help">Provide detailed information about the product to help customers make informed decisions</small>
        </div>
      </div>

      <div className="form-section">
        <h4>Pricing & Inventory</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">
              Price (₹) <span className="required">*</span>
            </label>
            <input 
              id="price"
              name="price" 
              value={product.price} 
              onChange={handleChange} 
              placeholder="0.00" 
              type="number" 
              step="0.01"
              min="0"
              required
              disabled={loading}
            />
            <small className="form-help">Enter the selling price in Indian Rupees</small>
          </div>

          <div className="form-group">
            <label htmlFor="stock">
              Stock Quantity <span className="required">*</span>
            </label>
            <input 
              id="stock"
              name="stock" 
              value={product.stock} 
              onChange={handleChange} 
              placeholder="0" 
              type="number" 
              min="0"
              required
              disabled={loading}
            />
            <small className="form-help">Enter the number of items available in stock</small>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Category & Image</h4>
        
        <div className="form-group">
          <label htmlFor="categoryId">
            Product Category <span className="required">*</span>
          </label>
          <select 
            id="categoryId"
            name="categoryId" 
            value={product.categoryId || ""} 
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">-- Select a Category --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <small className="form-help">Choose the category that best fits your product</small>
        </div>

        <div className="form-group">
          <label htmlFor="image">
            Product Image {edit && <span className="optional">(Optional - leave empty to keep current image)</span>}
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
          {edit && product.imageBase64 && !imageFile && (
            <div className="current-image">
              <p className="current-image-label">Current Image:</p>
              <img 
                src={`data:image/jpeg;base64,${product.imageBase64}`} 
                alt="Current product" 
                className="preview-image"
              />
            </div>
          )}
          <small className="form-help">Upload a high-quality product image (JPG, PNG, or GIF). Recommended size: 800x800px</small>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving..." : edit ? "Update Product" : "Create Product"}
        </button>
        <Link to="/products">
          <button type="button" disabled={loading} className="btn-secondary">
            Cancel
          </button>
        </Link>
      </div>

      {/* Cropper Modal */}
      {showCropper && tempImage && (
        <CropperModal
          imgSrc={tempImage}
          onClose={() => setShowCropper(false)}
          onCropDone={handleCropDone}
        />
      )}
    </form>
  );
}
