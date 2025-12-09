import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats, getOrders } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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

  const fetchRecentOrders = useCallback(async () => {
    try {
      const orders = await getOrders();
      // Get 5 most recent orders
      const sorted = (orders || [])
        .sort((a, b) => {
          const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
          const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5);
      setRecentOrders(sorted);
    } catch (err) {
      console.error("Failed to load recent orders", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
  }, [fetchStats, fetchRecentOrders]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const statusUpper = (status || "PENDING").toUpperCase();
    switch (statusUpper) {
      case "DELIVERED":
        return { bg: "#d4edda", color: "#155724" };
      case "PENDING":
        return { bg: "#fff3cd", color: "#856404" };
      case "SHIPPED":
        return { bg: "#d1ecf1", color: "#0c5460" };
      case "CONFIRMED":
        return { bg: "#cce5ff", color: "#004085" };
      case "CANCELLED":
        return { bg: "#f8d7da", color: "#721c24" };
      default:
        return { bg: "#e9ecef", color: "#495057" };
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <h3 style={styles.errorTitle}>Unable to Load Dashboard</h3>
          <p style={styles.errorText}>{error}</p>
          <button onClick={fetchStats} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>
            {currentTime.toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div style={styles.headerActions}>
          <Link to="/orders" style={styles.headerLink}>
            <span style={styles.headerLinkIcon}>📊</span>
            View All Orders
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon} className="stat-icon-users">👥</div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Total Users</p>
            <h2 style={styles.statValue}>{stats.totalUsers.toLocaleString()}</h2>
          </div>
          <Link to="/users" style={styles.statLink}>
            View All →
          </Link>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon} className="stat-icon-products">📦</div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Total Products</p>
            <h2 style={styles.statValue}>{stats.totalProducts.toLocaleString()}</h2>
          </div>
          <Link to="/products" style={styles.statLink}>
            View All →
          </Link>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon} className="stat-icon-orders">🛒</div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Total Orders</p>
            <h2 style={styles.statValue}>{stats.totalOrders.toLocaleString()}</h2>
          </div>
          <Link to="/orders" style={styles.statLink}>
            View All →
          </Link>
        </div>

        <div style={{
          ...styles.statCard,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white"
        }}>
          <div style={styles.statIcon} className="stat-icon-revenue">💰</div>
          <div style={styles.statContent}>
            <p style={{...styles.statLabel, color: "rgba(255,255,255,0.9)"}}>Total Revenue</p>
            <h2 style={{...styles.statValue, color: "white"}}>{formatCurrency(stats.totalRevenue)}</h2>
          </div>
          <div style={styles.revenueBadge}>
            All Time
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={styles.contentGrid}>
        {/* Recent Orders */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Orders</h2>
            <Link to="/orders" style={styles.viewAllLink}>
              View All Orders →
            </Link>
          </div>
          <div style={styles.ordersList}>
            {recentOrders.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No recent orders</p>
              </div>
            ) : (
              recentOrders.map(order => {
                const statusStyle = getStatusColor(order.orderStatus || order.status);
                return (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    style={styles.orderItem}
                  >
                    <div style={styles.orderInfo}>
                      <div style={styles.orderId}>#{order.id}</div>
                      <div style={styles.orderDetails}>
                        <div style={styles.orderUser}>
                          {order.user?.email || order.address?.fullName || "Unknown User"}
                        </div>
                        <div style={styles.orderDate}>
                          {formatDate(order.orderDate)}
                        </div>
                      </div>
                    </div>
                    <div style={styles.orderRight}>
                      <div style={styles.orderAmount}>
                        ₹{order.totalAmount || order.totalPrice || "0"}
                      </div>
                      <span
                        style={{
                          ...styles.orderStatus,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color
                        }}
                      >
                        {order.orderStatus || order.status || "PENDING"}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Quick Actions</h2>
          </div>
          <div style={styles.quickActionsGrid}>
            <Link to="/products/new" style={styles.actionCard}>
              <div style={styles.actionIcon}>➕</div>
              <h3 style={styles.actionTitle}>Create Product</h3>
              <p style={styles.actionDesc}>Add a new product to the store</p>
            </Link>

            <Link to="/categories/new" style={styles.actionCard}>
              <div style={styles.actionIcon}>📁</div>
              <h3 style={styles.actionTitle}>Create Category</h3>
              <p style={styles.actionDesc}>Add a new product category</p>
            </Link>

            <Link to="/home-ads/new" style={styles.actionCard}>
              <div style={styles.actionIcon}>🎨</div>
              <h3 style={styles.actionTitle}>Create Ad</h3>
              <p style={styles.actionDesc}>Add a new home page ad</p>
            </Link>

            <Link to="/queries" style={styles.actionCard}>
              <div style={styles.actionIcon}>💬</div>
              <h3 style={styles.actionTitle}>View Queries</h3>
              <p style={styles.actionDesc}>Check customer inquiries</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Management Links */}
      <div style={styles.managementSection}>
        <h2 style={styles.managementTitle}>Management</h2>
        <div style={styles.managementGrid}>
          <Link to="/products" style={styles.managementCard}>
            <span style={styles.managementIcon}>📦</span>
            <span>Products</span>
          </Link>
          <Link to="/categories" style={styles.managementCard}>
            <span style={styles.managementIcon}>📂</span>
            <span>Categories</span>
          </Link>
          <Link to="/users" style={styles.managementCard}>
            <span style={styles.managementIcon}>👥</span>
            <span>Users</span>
          </Link>
          <Link to="/orders" style={styles.managementCard}>
            <span style={styles.managementIcon}>🛒</span>
            <span>Orders</span>
          </Link>
          <Link to="/home-ads" style={styles.managementCard}>
            <span style={styles.managementIcon}>🎨</span>
            <span>Home Ads</span>
          </Link>
          <Link to="/queries" style={styles.managementCard}>
            <span style={styles.managementIcon}>💬</span>
            <span>Queries</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: "16px"
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  loadingText: {
    color: "#666",
    fontSize: "16px"
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: "16px",
    textAlign: "center"
  },
  errorIcon: {
    fontSize: "64px"
  },
  errorTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#333",
    margin: 0
  },
  errorText: {
    color: "#666",
    fontSize: "16px",
    margin: 0
  },
  retryButton: {
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: "2px solid #e0e6ed"
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1a202c",
    margin: "0 0 8px 0"
  },
  subtitle: {
    fontSize: "16px",
    color: "#718096",
    margin: 0
  },
  headerActions: {
    display: "flex",
    gap: "12px"
  },
  headerLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s"
  },
  headerLinkIcon: {
    fontSize: "18px"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "32px"
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    border: "1px solid #e0e6ed"
  },
  statIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    display: "inline-block"
  },
  statContent: {
    marginBottom: "16px"
  },
  statLabel: {
    fontSize: "14px",
    color: "#718096",
    margin: "0 0 8px 0",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1a202c",
    margin: 0
  },
  statLink: {
    fontSize: "14px",
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "500",
    display: "inline-block",
    transition: "color 0.2s"
  },
  revenueBadge: {
    position: "absolute",
    top: "16px",
    right: "16px",
    padding: "4px 12px",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500"
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "32px"
  },
  section: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e0e6ed"
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e0e6ed"
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a202c",
    margin: 0
  },
  viewAllLink: {
    fontSize: "14px",
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "500"
  },
  ordersList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    textDecoration: "none",
    color: "inherit",
    transition: "background-color 0.2s, transform 0.2s",
    border: "1px solid #e0e6ed"
  },
  orderInfo: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  orderId: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#007bff"
  },
  orderDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  orderUser: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a202c"
  },
  orderDate: {
    fontSize: "12px",
    color: "#718096"
  },
  orderRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  orderAmount: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a202c"
  },
  orderStatus: {
    padding: "6px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "uppercase"
  },
  emptyState: {
    padding: "40px",
    textAlign: "center"
  },
  emptyText: {
    color: "#718096",
    fontSize: "14px"
  },
  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px"
  },
  actionCard: {
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    textDecoration: "none",
    color: "inherit",
    transition: "background-color 0.2s, transform 0.2s",
    border: "1px solid #e0e6ed"
  },
  actionIcon: {
    fontSize: "32px",
    marginBottom: "12px"
  },
  actionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a202c",
    margin: "0 0 8px 0"
  },
  actionDesc: {
    fontSize: "13px",
    color: "#718096",
    margin: 0
  },
  managementSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e0e6ed"
  },
  managementTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a202c",
    margin: "0 0 20px 0"
  },
  managementGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px"
  },
  managementCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    textDecoration: "none",
    color: "#1a202c",
    fontWeight: "500",
    transition: "background-color 0.2s, transform 0.2s",
    border: "1px solid #e0e6ed"
  },
  managementIcon: {
    fontSize: "32px"
  }
};

// Add CSS animation for spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }
    .order-item:hover {
      background-color: #e9ecef;
      transform: translateX(4px);
    }
    .action-card:hover {
      background-color: #e9ecef;
      transform: translateY(-2px);
    }
    .management-card:hover {
      background-color: #e9ecef;
      transform: translateY(-2px);
    }
  `;
  document.head.appendChild(style);
}
