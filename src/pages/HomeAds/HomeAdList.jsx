import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getHomeAds, deleteHomeAd } from "../../services/api";

export default function HomeAdList() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getHomeAds();
      console.log("HomeAds response:", list); // Debug log
      // Handle both array and object responses
      if (Array.isArray(list)) {
        setAds(list);
      } else if (list && Array.isArray(list.data)) {
        setAds(list.data);
      } else if (list && list.content && Array.isArray(list.content)) {
        setAds(list.content);
      } else {
        console.warn("Unexpected response format:", list);
        setAds([]);
      }
    } catch (err) {
      console.error("Failed to load home ads", err);
      setError("Failed to load home ads. Please try again.");
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(async (id) => {
    if (!confirm("Delete this home ad?")) return;
    try {
      setDeleting(id);
      await deleteHomeAd(id);
      await load();
    } catch (err) {
      console.error(err);
      alert("Delete failed: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setDeleting(null);
    }
  }, [load]);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h2>Home Ads</h2>
          <Link to="/home-ads/new"><button>Create Ad</button></Link>
        </div>
        <div className="loading-state">Loading home ads...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h2>Home Ads</h2>
          <Link to="/home-ads/new"><button>Create Ad</button></Link>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Home Ads</h2>
        <Link to="/home-ads/new"><button>Create Ad</button></Link>
      </div>
      {ads.length === 0 ? (
        <div className="empty-state">
          <p>No home ads found.</p>
          <Link to="/home-ads/new"><button>Create First Ad</button></Link>
        </div>
      ) : (
        <div className="ads-grid">
          {ads.map(ad => (
            <div key={ad.id} className="ad-card">
              <div className="ad-image">
                {ad.imageBase64 ? (
                  <img 
                    src={`data:image/jpeg;base64,${ad.imageBase64}`} 
                    alt={ad.title}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="no-image-placeholder">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <div className="ad-info">
                <h3>{ad.title || "Untitled"}</h3>
                <p><strong>Type:</strong> {ad.type || "-"}</p>
                <p><strong>Redirect URL:</strong> {ad.redirectUrl || "-"}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-badge ${ad.active ? 'status-active' : 'status-inactive'}`}>
                    {ad.active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className="ad-actions">
                <Link to={`/home-ads/${ad.id}/edit`}><button>Edit</button></Link>
                <button 
                  onClick={() => remove(ad.id)} 
                  disabled={deleting === ad.id}
                >
                  {deleting === ad.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

