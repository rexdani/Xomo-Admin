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
      console.log("HomeAds response:", list);
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

  const remove = useCallback(async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title || 'this ad'}"? This action cannot be undone.`)) return;
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

  const activeCount = ads.filter(ad => ad.active).length;
  const inactiveCount = ads.filter(ad => !ad.active).length;

  if (loading) {
    return (
      <div className="home-ads-container" style={{ display: 'block', visibility: 'visible' }}>
        <div className="home-ads-header">
          <div className="header-content">
            <h1 className="page-title">Home Ads</h1>
            <p className="page-subtitle">Manage your promotional advertisements</p>
          </div>
          <Link to="/home-ads/new" className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Create New Ad
          </Link>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading home ads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-ads-container" style={{ display: 'block', visibility: 'visible' }}>
        <div className="home-ads-header">
          <div className="header-content">
            <h1 className="page-title">Home Ads</h1>
            <p className="page-subtitle">Manage your promotional advertisements</p>
          </div>
          <Link to="/home-ads/new" className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Create New Ad
          </Link>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Ads</h3>
          <p>{error}</p>
          <button onClick={load} className="btn-secondary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-ads-container" style={{ display: 'block', visibility: 'visible' }}>
      <div className="home-ads-header">
        <div className="header-content">
          <h1 className="page-title">Home Ads</h1>
          <p className="page-subtitle">Manage your promotional advertisements</p>
        </div>
        <Link to="/home-ads/new" className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Create New Ad
        </Link>
      </div>

      {ads.length > 0 && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{ads.length}</span>
            <span className="stat-label">Total Ads</span>
          </div>
          <div className="stat-item stat-active">
            <span className="stat-value">{activeCount}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-item stat-inactive">
            <span className="stat-value">{inactiveCount}</span>
            <span className="stat-label">Inactive</span>
          </div>
        </div>
      )}

      {ads.length === 0 ? (
        <div className="empty-state-modern">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3>No Home Ads Yet</h3>
          <p>Get started by creating your first promotional advertisement to showcase on your homepage.</p>
          <Link to="/home-ads/new" className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Create Your First Ad
          </Link>
        </div>
      ) : (
        <div className="ads-grid-modern">
          {ads.map(ad => (
            <div key={ad.id} className="ad-card-modern">
              <div className="ad-image-wrapper">
                {ad.imageBase64 ? (
                  <img 
                    src={`data:image/jpeg;base64,${ad.imageBase64}`} 
                    alt={ad.title || "Ad image"}
                    className="ad-image-modern"
                    onError={(e) => { 
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="no-image-placeholder-modern" style={{ display: ad.imageBase64 ? 'none' : 'flex' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>No Image</span>
                </div>
                <div className={`ad-status-indicator ${ad.active ? 'active' : 'inactive'}`}>
                  {ad.active ? '●' : '○'}
                </div>
              </div>
              
              <div className="ad-content">
                <div className="ad-header">
                  <h3 className="ad-title">{ad.title || "Untitled Ad"}</h3>
                  <span className={`status-badge-modern ${ad.active ? 'active' : 'inactive'}`}>
                    {ad.active ? "Active" : "Inactive"}
                  </span>
                </div>
                
                <div className="ad-details">
                  {ad.type && (
                    <div className="detail-item">
                      <span className="detail-label">Type</span>
                      <span className="detail-value">{ad.type}</span>
                    </div>
                  )}
                  {ad.redirectUrl && (
                    <div className="detail-item">
                      <span className="detail-label">URL</span>
                      <a 
                        href={ad.redirectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="detail-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {ad.redirectUrl.length > 40 ? `${ad.redirectUrl.substring(0, 40)}...` : ad.redirectUrl}
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 2H9V6M9 2L2 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="ad-actions-modern">
                <Link 
                  to={`/home-ads/${ad.id}/edit`} 
                  className="btn-action btn-edit"
                  title="Edit ad"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.333 2.00001C11.5084 1.82474 11.7163 1.68589 11.9449 1.59216C12.1735 1.49843 12.4181 1.45166 12.6663 1.45468C12.9146 1.45771 13.1578 1.51047 13.3836 1.60982C13.6095 1.70918 13.8135 1.85309 13.984 2.03334C14.1545 2.2136 14.2879 2.42649 14.377 2.65939C14.4661 2.89229 14.5091 3.14057 14.5033 3.39001C14.4975 3.63946 14.443 3.88495 14.3431 4.11309C14.2432 4.34122 14.0998 4.54749 13.9213 4.72001L6.41733 12.2267L2.66666 13.3333L3.77333 9.58268L11.2773 2.07601L11.333 2.00001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Edit
                </Link>
                <button 
                  onClick={() => remove(ad.id, ad.title)} 
                  disabled={deleting === ad.id}
                  className="btn-action btn-delete"
                  title="Delete ad"
                >
                  {deleting === ad.id ? (
                    <>
                      <div className="spinner-small"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 4H14M6 4V2C6 1.73478 6.10536 1.48043 6.29289 1.29289C6.48043 1.10536 6.73478 1 7 1H9C9.26522 1 9.51957 1.10536 9.70711 1.29289C9.89464 1.48043 10 1.73478 10 2V4M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33333 13.687 3.33333 13.3333V4H12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

