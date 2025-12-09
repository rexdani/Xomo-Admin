import React, { useEffect, useState, useCallback } from "react";
import { getUserById, updateUserRoles, getOrdersByUserId } from "../../services/api";
import { useParams, Link } from "react-router-dom";

const AVAILABLE_ROLES = [
  { value: "ROLE_ADMIN", label: "Admin" },
  { value: "ROLE_USER", label: "User" }
];

const ORDER_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" }
];

export default function UserView() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ordersError, setOrdersError] = useState(null);
  const [editingRoles, setEditingRoles] = useState(false);
  const [tempRoles, setTempRoles] = useState([]);
  const [updatingRoles, setUpdatingRoles] = useState(false);

  const loadUser = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getUserById(id);
      setUser(res);
      // Initialize temp roles for editing
      const rolesList = res.roles ? (Array.isArray(res.roles) ? res.roles : Array.from(res.roles)) : [];
      const normalizedRoles = rolesList.map(r => {
        if (typeof r === "string") return r;
        if (typeof r === "number") {
          const roleMap = { 1: "ROLE_USER", 2: "ROLE_ADMIN" };
          return roleMap[r] || `ROLE_${r}`;
        }
        if (r && typeof r === "object") {
          return r.name || r.authority || r.role || String(r);
        }
        return String(r);
      });
      setTempRoles(normalizedRoles);
    } catch (err) {
      console.error(err);
      setError("Failed to load user. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadOrders = useCallback(async () => {
    if (!id) return;
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      const userOrders = await getOrdersByUserId(id);
      setOrders(userOrders || []);
    } catch (err) {
      console.error(err);
      setOrdersError("Failed to load orders.");
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    loadUser();
    loadOrders();
    return () => { cancelled = true; };
  }, [loadUser, loadOrders]);

  const toggleTempRole = useCallback((roleName) => {
    setTempRoles(prev => {
      if (prev.includes(roleName)) {
        return prev.filter(r => r !== roleName);
      } else {
        return [...prev, roleName];
      }
    });
  }, []);

  const saveRoles = useCallback(async () => {
    setUpdatingRoles(true);
    try {
      await updateUserRoles(id, tempRoles);
      await loadUser(); // Reload to get updated data
      setEditingRoles(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update roles: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setUpdatingRoles(false);
    }
  }, [id, tempRoles, loadUser]);

  const cancelEditingRoles = useCallback(() => {
    if (!user) return;
    const rolesList = user.roles ? (Array.isArray(user.roles) ? user.roles : Array.from(user.roles)) : [];
    const normalizedRoles = rolesList.map(r => {
      if (typeof r === "string") return r;
      if (typeof r === "number") {
        const roleMap = { 1: "ROLE_USER", 2: "ROLE_ADMIN" };
        return roleMap[r] || `ROLE_${r}`;
      }
      if (r && typeof r === "object") {
        return r.name || r.authority || r.role || String(r);
      }
      return String(r);
    });
    setTempRoles(normalizedRoles);
    setEditingRoles(false);
  }, [user]);

  if (loading) {
    return <div className="loading-state">Loading user...</div>;
  }

  if (error || !user) {
    return (
      <div>
        <div className="error-state">
          <p>{error || "User not found"}</p>
          <button onClick={loadUser}>Retry</button>
          <Link to="/users"><button>Back to Users</button></Link>
        </div>
      </div>
    );
  }

  const userName = user.Name || user.name || user.fullName || "-";
  const rolesList = user.roles ? (Array.isArray(user.roles) ? user.roles : Array.from(user.roles)) : [];
  
  // Calculate order statistics
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount || order.totalPrice || 0)), 0);
  const pendingOrders = orders.filter(o => (o.orderStatus || o.status) === "PENDING").length;
  const deliveredOrders = orders.filter(o => (o.orderStatus || o.status) === "DELIVERED").length;
  
  // Get unique payment methods
  const paymentMethods = [...new Set(orders.map(o => o.payment).filter(Boolean))];
  
  // Get all addresses from orders
  const orderAddresses = orders
    .map(o => o.address)
    .filter(Boolean)
    .filter((addr, index, self) => 
      index === self.findIndex(a => 
        JSON.stringify(a) === JSON.stringify(addr)
      )
    );

  return (
    <div className="user-view">
      <div className="user-view-header">
        <div>
          <h2>User Details</h2>
          <p className="user-id">User ID: #{user.id}</p>
        </div>
        <div className="user-actions">
          <Link to="/users"><button>Back to Users</button></Link>
        </div>
      </div>

      {/* Personal Information */}
      <div className="user-details-grid">
        <div className="user-info-section">
          <h3>Personal Information</h3>
          <div className="info-item">
            <label>Full Name:</label>
            <span>{userName}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{user.email || "-"}</span>
          </div>
          <div className="info-item">
            <label>Phone:</label>
            <span>{user.phone || "-"}</span>
          </div>
          {user.createdAt && (
            <div className="info-item">
              <label>Member Since:</label>
              <span>{new Date(user.createdAt).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          )}
        </div>

        <div className="user-info-section">
          <h3>Roles & Permissions</h3>
          {editingRoles ? (
            <div className="role-editor-full">
              <div className="role-checkboxes">
                {AVAILABLE_ROLES.map(role => {
                  const hasRole = tempRoles.includes(role.value);
                  return (
                    <label key={role.value} className="role-checkbox-label">
                      <input
                        type="checkbox"
                        checked={hasRole}
                        onChange={() => toggleTempRole(role.value)}
                        disabled={updatingRoles}
                      />
                      <span>{role.label}</span>
                    </label>
                  );
                })}
              </div>
              <div className="role-editor-actions">
                <button
                  onClick={saveRoles}
                  className="btn-save-small"
                  disabled={updatingRoles}
                >
                  {updatingRoles ? "Saving..." : "Save Roles"}
                </button>
                <button
                  onClick={cancelEditingRoles}
                  className="btn-cancel-small"
                  disabled={updatingRoles}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {rolesList.length > 0 ? (
                <div className="roles-badges">
                  {rolesList.map((r, idx) => {
                    let roleDisplay = "";
                    if (typeof r === "string") {
                      roleDisplay = r;
                    } else if (typeof r === "number") {
                      const roleMap = { 1: "ROLE_USER", 2: "ROLE_ADMIN" };
                      roleDisplay = roleMap[r] || `ROLE_${r}`;
                    } else if (r && typeof r === "object") {
                      roleDisplay = r.name || r.authority || r.role || JSON.stringify(r);
                    } else {
                      roleDisplay = String(r);
                    }
                    return (
                      <span key={idx} className="role-badge">
                        {roleDisplay}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className="no-roles">No roles assigned</span>
              )}
              <button
                onClick={() => setEditingRoles(true)}
                className="btn-edit-roles"
                style={{ marginTop: '12px' }}
              >
                ✏️ Edit Roles
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Order Statistics */}
      <div className="user-info-section" style={{ marginTop: "20px" }}>
        <h3>Order Statistics</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "15px" }}>
          <div style={{ padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff" }}>{totalOrders}</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Total Orders</div>
          </div>
          <div style={{ padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>₹{totalSpent.toFixed(2)}</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Total Spent</div>
          </div>
          <div style={{ padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ffc107" }}>{pendingOrders}</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Pending Orders</div>
          </div>
          <div style={{ padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#17a2b8" }}>{deliveredOrders}</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Delivered Orders</div>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="user-info-section" style={{ marginTop: "20px" }}>
        <h3>Address Information</h3>
        {user.address ? (
          <div className="address-details" style={{ marginTop: "15px" }}>
            {user.address.street && (
              <div className="info-item">
                <label>Street:</label>
                <span>{user.address.street}</span>
              </div>
            )}
            {user.address.city && (
              <div className="info-item">
                <label>City:</label>
                <span>{user.address.city}</span>
              </div>
            )}
            {user.address.state && (
              <div className="info-item">
                <label>State:</label>
                <span>{user.address.state}</span>
              </div>
            )}
            {user.address.pincode && (
              <div className="info-item">
                <label>PIN Code:</label>
                <span>{user.address.pincode}</span>
              </div>
            )}
            {user.address.country && (
              <div className="info-item">
                <label>Country:</label>
                <span>{user.address.country}</span>
              </div>
            )}
            {user.address.fullName && (
              <div className="info-item">
                <label>Full Name:</label>
                <span>{user.address.fullName}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="no-data" style={{ marginTop: "15px" }}>No address information available</p>
        )}
        
        {/* Show addresses from orders if different from user address */}
        {orderAddresses.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h4 style={{ marginBottom: "10px", fontSize: "16px" }}>Shipping Addresses from Orders:</h4>
            {orderAddresses.map((addr, idx) => (
              <div key={idx} style={{ 
                padding: "12px", 
                backgroundColor: "#f8f9fa", 
                borderRadius: "6px", 
                marginBottom: "10px" 
              }}>
                {addr.fullName && <div><strong>{addr.fullName}</strong></div>}
                <div>
                  {[addr.street, addr.city, addr.state, addr.pincode, addr.country]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Information */}
      {paymentMethods.length > 0 && (
        <div className="user-info-section" style={{ marginTop: "20px" }}>
          <h3>Payment Methods Used</h3>
          <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {paymentMethods.map((method, idx) => (
              <span key={idx} style={{
                padding: "8px 16px",
                backgroundColor: "#e7f3ff",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "500"
              }}>
                {method}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="user-info-section" style={{ marginTop: "20px" }}>
        <h3>Orders ({totalOrders})</h3>
        {ordersLoading ? (
          <div style={{ marginTop: "15px" }}>Loading orders...</div>
        ) : ordersError ? (
          <div style={{ marginTop: "15px", color: "#dc3545" }}>{ordersError}</div>
        ) : orders.length === 0 ? (
          <p className="no-data" style={{ marginTop: "15px" }}>No orders found for this user</p>
        ) : (
          <div style={{ marginTop: "15px", overflowX: "auto" }}>
            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      {order.orderDate 
                        ? new Date(order.orderDate).toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "-"}
                    </td>
                    <td>₹{order.totalAmount || order.totalPrice || "0"}</td>
                    <td>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "500",
                        backgroundColor: 
                          (order.orderStatus || order.status) === "DELIVERED" ? "#d4edda" :
                          (order.orderStatus || order.status) === "PENDING" ? "#fff3cd" :
                          (order.orderStatus || order.status) === "CANCELLED" ? "#f8d7da" :
                          "#d1ecf1",
                        color:
                          (order.orderStatus || order.status) === "DELIVERED" ? "#155724" :
                          (order.orderStatus || order.status) === "PENDING" ? "#856404" :
                          (order.orderStatus || order.status) === "CANCELLED" ? "#721c24" :
                          "#0c5460"
                      }}>
                        {order.orderStatus || order.status || "PENDING"}
                      </span>
                    </td>
                    <td>{order.payment || "-"}</td>
                    <td>
                      <Link to={`/orders/${order.id}`} style={{ color: "#007bff", textDecoration: "none" }}>
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

