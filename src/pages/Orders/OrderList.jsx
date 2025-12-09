// src/pages/Orders/OrderList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus } from "../../services/api";
import { Link } from "react-router-dom";

const ORDER_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" }
];

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getOrders();
      const ordersData = list || [];
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let filtered = orders;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = orders.filter(o => {
        const orderId = String(o.id || "");
        const userEmail = (o.user?.email || "").toLowerCase();
        const userName = (o.address?.fullName || "").toLowerCase();
        const status = (o.orderStatus || o.status || "").toLowerCase();
        const totalAmount = String(o.totalAmount || o.totalPrice || "0");
        const payment = (o.payment || "").toLowerCase();
        
        return orderId.includes(searchLower) ||
               userEmail.includes(searchLower) ||
               userName.includes(searchLower) ||
               status.includes(searchLower) ||
               totalAmount.includes(searchLower) ||
               payment.includes(searchLower);
      });
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aVal, bVal;
        
        switch (sortField) {
          case "id":
            aVal = parseInt(a.id || 0);
            bVal = parseInt(b.id || 0);
            break;
          case "user":
            aVal = (a.user?.email || a.address?.fullName || "").toLowerCase();
            bVal = (b.user?.email || b.address?.fullName || "").toLowerCase();
            break;
          case "amount":
            aVal = parseFloat(a.totalAmount || a.totalPrice || 0);
            bVal = parseFloat(b.totalAmount || b.totalPrice || 0);
            break;
          case "status":
            aVal = (a.orderStatus || a.status || "").toLowerCase();
            bVal = (b.orderStatus || b.status || "").toLowerCase();
            break;
          case "date":
            aVal = a.orderDate ? new Date(a.orderDate).getTime() : 0;
            bVal = b.orderDate ? new Date(b.orderDate).getTime() : 0;
            break;
          case "payment":
            aVal = (a.payment || "").toLowerCase();
            bVal = (b.payment || "").toLowerCase();
            break;
          default:
            return 0;
        }
        
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    
    setFilteredOrders(filtered);
  }, [searchTerm, orders, sortField, sortDirection]);

  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField, sortDirection]);

  const SortableHeader = ({ field, children }) => {
    const isActive = sortField === field;
    return (
      <th 
        onClick={(e) => {
          e.preventDefault();
          handleSort(field);
        }}
        style={{ 
          cursor: "pointer", 
          userSelect: "none",
          position: "relative",
          paddingRight: "30px",
          whiteSpace: "nowrap"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f0f0f0";
          e.currentTarget.style.transition = "background-color 0.2s";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "";
        }}
        title={`Click to sort by ${children} ${isActive ? (sortDirection === "asc" ? "(ascending)" : "(descending)") : ""}`}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          {children}
          <span style={{ 
            fontSize: "16px",
            fontWeight: "bold",
            color: isActive ? "#007bff" : "#999",
            display: "inline-block",
            minWidth: "20px"
          }}>
            {isActive ? (sortDirection === "asc" ? "▲" : "▼") : "⇅"}
          </span>
        </span>
      </th>
    );
  };

  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    const currentStatus = order?.orderStatus || order?.status;
    
    if (newStatus === currentStatus) return;
    
    if (!confirm(`Change order #${orderId} status from "${currentStatus}" to "${newStatus}"?`)) {
      return;
    }

    setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders(prev => prev.map(o => 
        o.id === orderId 
          ? { ...o, orderStatus: newStatus, status: newStatus }
          : o
      ));
    } catch (err) {
      console.error(err);
      alert("Failed to update order status: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  }, [orders]);

  if (loading) {
    return (
      <div>
        <h2>Orders</h2>
        <div className="loading-state">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Orders</h2>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Orders</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search orders by ID, user email, name, status, amount, or payment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "500px",
            padding: "10px",
            fontSize: "14px",
            border: "1px solid #ddd",
            borderRadius: "4px"
          }}
        />
      </div>
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>{searchTerm ? `No orders found matching "${searchTerm}".` : "No orders found."}</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <SortableHeader field="id">Order ID</SortableHeader>
              <SortableHeader field="user">User</SortableHeader>
              <SortableHeader field="amount">Total Amount</SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="date">Order Date</SortableHeader>
              <SortableHeader field="payment">Payment</SortableHeader>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.user?.email || o.address?.fullName || "-"}</td>
                <td>₹{o.totalAmount || o.totalPrice || "0"}</td>
                <td>
                  <select
                    value={o.orderStatus || o.status || "PENDING"}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    disabled={updatingStatus[o.id]}
                    className="status-select-inline"
                  >
                    {ORDER_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  {updatingStatus[o.id] && <span className="updating-text-small">Updating...</span>}
                </td>
                <td>
                  {o.orderDate 
                    ? new Date(o.orderDate).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "-"}
                </td>
                <td>{o.payment || "-"}</td>
                <td><Link to={`/orders/${o.id}`}>View Details</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
