import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import "../styles/admin.css";
import { getDashboardStats } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardStats();
      setStats(response);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
      setError("Failed to load dashboard statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchStats}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      <div className="dashboard-header">
        <div>
          <strong>Welcome, Admin</strong>
        </div>
        <div className="dashboard-actions">
          <Link to="/products"><button>Manage Products</button></Link>
          <Link to="/categories"><button>Manage Categories</button></Link>
          <Link to="/users"><button>Manage Users</button></Link>
          <Link to="/orders"><button>Manage Orders</button></Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>

        <div className="stat-card">
          <h3>Total Products</h3>
          <p>{stats.totalProducts}</p>
        </div>

        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{stats.totalOrders}</p>
        </div>

        <div className="stat-card revenue">
          <h3>Total Revenue</h3>
          <p>₹{stats.totalRevenue}</p>
        </div>
      </div>

      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="quick-actions-buttons">
          <Link to="/products/new"><button>Create Product</button></Link>
          <Link to="/categories/new"><button>Create Category</button></Link>
        </div>
      </section>
    </div>
  );
}
