import React, { useEffect, useState } from "react";
import "../styles/admin.css";
import { getDashboardStats } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await getDashboardStats();
        setStats(response);
      } catch (err) {
        console.error("Failed to load dashboard stats");
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div>
          <strong>Welcome, Admin</strong>
        </div>
        <div>
          <a href="/products"><button>Manage Products</button></a>{" "}
          <a href="/categories"><button>Manage Categories</button></a>{" "}
          <a href="/users"><button>Manage Users</button></a>{" "}
          <a href="/orders"><button>Manage Orders</button></a>
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

      <section style={{marginTop:20}}>
        <h2>Quick Actions</h2>
        <div style={{display:'flex', gap:8}}>
          <a href="/products/new"><button>Create Product</button></a>
          <a href="/categories/new"><button>Create Category</button></a>
        </div>
      </section>
    </div>
  );
}
