import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../utils/auth";

export default function Sidebar({ isMobileOpen, onMobileClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && collapsed) {
        setCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile && isMobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname, isMobile, isMobileOpen, onMobileClose]);

  function handleLogout() {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      localStorage.removeItem("xomo_login");
      navigate("/");
    }
  }

  const isActive = (path) => {
    if (path === "/Dashboard") {
      return location.pathname === "/Dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      title: "Main",
      items: [
        { path: "/Dashboard", label: "Dashboard", icon: "📊" },
      ]
    },
    {
      title: "Products",
      items: [
        { path: "/products", label: "All Products", icon: "📦" },
        { path: "/products/new", label: "New Product", icon: "➕" },
      ]
    },
    {
      title: "Categories",
      items: [
        { path: "/categories", label: "All Categories", icon: "📂" },
        { path: "/categories/new", label: "New Category", icon: "➕" },
      ]
    },
    {
      title: "Management",
      items: [
        { path: "/users", label: "Users", icon: "👥" },
        { path: "/orders", label: "Orders", icon: "🛒" },
        { path: "/queries", label: "Queries", icon: "💬" },
        { path: "/home-ads", label: "Home Ads", icon: "🎨" },
      ]
    }
  ];

  // Get user info from localStorage
  const getUserInfo = () => {
    try {
      const loginData = localStorage.getItem("xomo_login");
      if (loginData) {
        const data = JSON.parse(loginData);
        return {
          email: data.email || "Admin",
          name: data.name || "Admin User"
        };
      }
    } catch (e) {
      console.error("Error parsing user data", e);
    }
    return { email: "Admin", name: "Admin User" };
  };

  const userInfo = getUserInfo();

  const handleLinkClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const sidebarStyle = {
    ...styles.sidebar,
    ...(isMobile ? {
      position: 'fixed',
      left: isMobileOpen ? 0 : '-100%',
      zIndex: 1000,
      width: '280px',
      boxShadow: isMobileOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none'
    } : {})
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          style={styles.overlay}
          onClick={onMobileClose}
          className="sidebar-overlay"
        />
      )}
      <aside style={sidebarStyle} className={isMobileOpen ? 'sidebar-open' : ''}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>⚡</div>
          {(!collapsed || isMobile) && (
            <div style={styles.logoText}>
              <div style={styles.logoTitle}>Xomo</div>
              <div style={styles.logoSubtitle}>Admin Panel</div>
            </div>
          )}
        </div>
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={styles.collapseButton}
            className="sidebar-collapse-button"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? "→" : "←"}
          </button>
        )}
        {isMobile && (
          <button
            onClick={onMobileClose}
            style={styles.closeButton}
            className="sidebar-close-button"
            title="Close Menu"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* User Info */}
      {(!collapsed || isMobile) && (
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            {userInfo.name.charAt(0).toUpperCase()}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{userInfo.name}</div>
            <div style={styles.userEmail}>{userInfo.email}</div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={styles.nav} className="sidebar-nav">
        {menuItems.map((group, groupIndex) => (
          <div key={groupIndex} style={styles.menuGroup}>
            {(!collapsed || isMobile) && (
              <div style={styles.groupTitle}>{group.title}</div>
            )}
            {group.items.map((item, itemIndex) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={itemIndex}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`sidebar-menu-item ${active ? 'sidebar-menu-item-active' : ''}`}
                  style={{
                    ...styles.menuItem,
                    ...(active ? styles.menuItemActive : {}),
                    ...(collapsed && !isMobile ? styles.menuItemCollapsed : {}),
                    ...(isMobile ? styles.menuItemMobile : {})
                  }}
                  title={collapsed && !isMobile ? item.label : undefined}
                >
                  <span style={styles.menuIcon}>{item.icon}</span>
                  {(!collapsed || isMobile) && (
                    <span style={styles.menuLabel}>{item.label}</span>
                  )}
                  {active && (!collapsed || isMobile) && (
                    <span style={styles.activeIndicator}></span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <button
          onClick={handleLogout}
          style={styles.logoutButton}
          className="sidebar-logout-button"
          title={collapsed ? "Logout" : undefined}
        >
          <span style={styles.logoutIcon}>🚪</span>
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </aside>
    </>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
    transition: "opacity 0.3s ease"
  },
  sidebar: {
    width: "280px",
    minHeight: "100vh",
    backgroundColor: "#1a202c",
    color: "#e2e8f0",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #2d3748",
    position: "sticky",
    top: 0,
    transition: "all 0.3s ease",
    overflow: "hidden",
    height: "100vh"
  },
  header: {
    padding: "24px 20px",
    borderBottom: "1px solid #2d3748",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f1419"
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  logoIcon: {
    fontSize: "28px",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#667eea",
    borderRadius: "10px",
    flexShrink: 0
  },
  logoText: {
    display: "flex",
    flexDirection: "column"
  },
  logoTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: "1.2"
  },
  logoSubtitle: {
    fontSize: "12px",
    color: "#a0aec0",
    fontWeight: "500"
  },
  collapseButton: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "1px solid #2d3748",
    backgroundColor: "transparent",
    color: "#e2e8f0",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    transition: "all 0.2s",
    flexShrink: 0
  },
  closeButton: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    border: "1px solid #2d3748",
    backgroundColor: "transparent",
    color: "#e2e8f0",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    transition: "all 0.2s",
    flexShrink: 0,
    fontWeight: "bold"
  },
  userSection: {
    padding: "20px",
    borderBottom: "1px solid #2d3748",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#0f1419"
  },
  userAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#667eea",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "600",
    color: "#ffffff",
    flexShrink: 0
  },
  userInfo: {
    flex: 1,
    minWidth: 0
  },
  userName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  userEmail: {
    fontSize: "12px",
    color: "#a0aec0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  nav: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  menuGroup: {
    marginBottom: "16px"
  },
  groupTitle: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "8px 16px",
    marginBottom: "8px"
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    color: "#a0aec0",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
    position: "relative",
    marginBottom: "4px",
    minHeight: "44px", // Touch-friendly minimum height
    WebkitTapHighlightColor: "transparent"
  },
  menuItemCollapsed: {
    justifyContent: "center",
    padding: "12px"
  },
  menuItemMobile: {
    padding: "14px 16px",
    minHeight: "48px"
  },
  menuItemActive: {
    backgroundColor: "#667eea",
    color: "#ffffff",
    fontWeight: "600"
  },
  menuIcon: {
    fontSize: "20px",
    width: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  menuLabel: {
    flex: 1
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: "4px",
    height: "60%",
    backgroundColor: "#ffffff",
    borderRadius: "0 4px 4px 0"
  },
  footer: {
    padding: "16px 12px",
    borderTop: "1px solid #2d3748",
    backgroundColor: "#0f1419"
  },
  logoutButton: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#e53e3e",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s",
    minHeight: "48px", // Touch-friendly
    WebkitTapHighlightColor: "transparent"
  },
  logoutIcon: {
    fontSize: "18px"
  }
};

// Add hover effects via CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .sidebar-menu-item:hover {
      background-color: #2d3748 !important;
      color: #ffffff !important;
    }
    .sidebar-menu-item-active:hover {
      background-color: #5568d3 !important;
    }
    .sidebar-collapse-button:hover {
      background-color: #2d3748 !important;
      border-color: #4a5568 !important;
    }
    .sidebar-logout-button:hover {
      background-color: #c53030 !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
    }
    .sidebar-nav::-webkit-scrollbar {
      width: 6px;
    }
    .sidebar-nav::-webkit-scrollbar-track {
      background: #1a202c;
    }
    .sidebar-nav::-webkit-scrollbar-thumb {
      background: #4a5568;
      border-radius: 3px;
    }
    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background: #718096;
    }
    .sidebar-close-button:hover {
      background-color: #2d3748 !important;
      border-color: #4a5568 !important;
    }
    .sidebar-overlay {
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .sidebar-open {
      animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
    @media (max-width: 767px) {
      .sidebar-menu-item {
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      .sidebar-logout-button {
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
    }
  `;
  document.head.appendChild(style);
}
