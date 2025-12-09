import React, { useEffect, useState, useCallback } from "react";
import { getQueries } from "../../services/api";

export default function QueryList() {
  const [queries, setQueries] = useState([]);
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getQueries();
      const queriesData = list || [];
      setQueries(queriesData);
      setFilteredQueries(queriesData);
    } catch (err) {
      console.error(err);
      setError("Failed to load queries. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let filtered = queries;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = queries.filter(q => {
        const id = String(q.id || "");
        const name = (q.name || q.fullName || "").toLowerCase();
        const email = (q.email || "").toLowerCase();
        const phone = (q.phone || q.phoneNumber || "").toLowerCase();
        const subject = (q.subject || "").toLowerCase();
        const message = (q.message || q.query || "").toLowerCase();
        
        return id.includes(searchLower) ||
               name.includes(searchLower) ||
               email.includes(searchLower) ||
               phone.includes(searchLower) ||
               subject.includes(searchLower) ||
               message.includes(searchLower);
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
          case "name":
            aVal = ((a.name || a.fullName || "")).toLowerCase();
            bVal = ((b.name || b.fullName || "")).toLowerCase();
            break;
          case "email":
            aVal = (a.email || "").toLowerCase();
            bVal = (b.email || "").toLowerCase();
            break;
          case "phone":
            aVal = (a.phone || a.phoneNumber || "").toLowerCase();
            bVal = (b.phone || b.phoneNumber || "").toLowerCase();
            break;
          case "subject":
            aVal = (a.subject || "").toLowerCase();
            bVal = (b.subject || "").toLowerCase();
            break;
          case "date":
            aVal = (a.createdAt || a.date || a.submittedAt) ? new Date(a.createdAt || a.date || a.submittedAt).getTime() : 0;
            bVal = (b.createdAt || b.date || b.submittedAt) ? new Date(b.createdAt || b.date || b.submittedAt).getTime() : 0;
            break;
          default:
            return 0;
        }
        
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    
    setFilteredQueries(filtered);
  }, [searchTerm, queries, sortField, sortDirection]);

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

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h2>Queries</h2>
        </div>
        <div className="loading-state">Loading queries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h2>Queries</h2>
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
        <h2>Queries</h2>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search queries by name, email, phone, subject, or message..."
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
      {filteredQueries.length === 0 ? (
        <div className="empty-state">
          <p>{searchTerm ? `No queries found matching "${searchTerm}".` : "No queries found."}</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <SortableHeader field="id">ID</SortableHeader>
              <SortableHeader field="name">Name</SortableHeader>
              <SortableHeader field="email">Email</SortableHeader>
              <SortableHeader field="phone">Phone</SortableHeader>
              <SortableHeader field="subject">Subject</SortableHeader>
              <th>Message</th>
              <SortableHeader field="date">Date</SortableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredQueries.map(q => (
              <tr key={q.id}>
                <td>#{q.id}</td>
                <td>{q.name || q.fullName || "-"}</td>
                <td>{q.email || "-"}</td>
                <td>{q.phone || q.phoneNumber || "-"}</td>
                <td>{q.subject || "-"}</td>
                <td style={{ maxWidth: "300px", wordWrap: "break-word" }}>
                  {q.message || q.query || "-"}
                </td>
                <td>
                  {q.createdAt || q.date || q.submittedAt
                    ? new Date(q.createdAt || q.date || q.submittedAt).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

