import React, { useEffect, useState, useCallback } from "react";
import { createHomeAd, updateHomeAd, getHomeAdById } from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";

export default function HomeAdForm({ edit }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState({
    title: "",
    type: "",
    redirectUrl: "",
    active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAd, setLoadingAd] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    
    if (edit && id) {
      setLoadingAd(true);
      getHomeAdById(id)
        .then(res => {
          if (!cancelled) {
            setAd({
              title: res.title || "",
              type: res.type || "",
              redirectUrl: res.redirectUrl || "",
              active: res.active !== undefined ? res.active : true,
              imageBase64: res.imageBase64 || null
            });
            setLoadingAd(false);
          }
        })
        .catch(err => {
          console.error(err);
          if (!cancelled) {
            setError("Failed to load home ad");
            setLoadingAd(false);
          }
        });
    }

    return () => { cancelled = true; };
  }, [edit, id]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setAd(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }, []);

  const handleFile = useCallback((e) => {
    setImageFile(e.target.files[0]);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (edit && id) {
        await updateHomeAd(id, ad, imageFile);
      } else {
        await createHomeAd(ad, imageFile);
      }
      navigate("/home-ads");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Save failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingAd) {
    return <div className="loading-state">Loading home ad...</div>;
  }

  return (
    <form onSubmit={submit}>
      <h3>{edit ? "Edit" : "Create"} Home Ad</h3>
      {error && <div className="error-message">{error}</div>}
      
      <input 
        name="title" 
        value={ad.title} 
        onChange={handleChange} 
        placeholder="Title" 
        required
        disabled={loading}
      />
      
      <input 
        name="type" 
        value={ad.type} 
        onChange={handleChange} 
        placeholder="Type (e.g., banner, slider, promo)"
        disabled={loading}
      />
      
      <input 
        name="redirectUrl" 
        value={ad.redirectUrl} 
        onChange={handleChange} 
        placeholder="Redirect URL (optional)"
        type="url"
        disabled={loading}
      />

      <div className="checkbox-group">
        <label>
          <input 
            type="checkbox" 
            name="active" 
            checked={ad.active} 
            onChange={handleChange}
            disabled={loading}
          />
          Active
        </label>
      </div>

      <div>
        <label>Image {edit ? "(leave empty to keep current)" : ""}</label>
        <input 
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
        {edit && ad.imageBase64 && !imageFile && (
          <div className="current-image">
            <p className="current-image-label">Current Image:</p>
            <img 
              src={`data:image/jpeg;base64,${ad.imageBase64}`} 
              alt="Current ad" 
              className="preview-image"
            />
          </div>
        )}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}

