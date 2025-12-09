import React, { useEffect, useState, useCallback } from "react";
import { getQueries } from "../../services/api";

export default function QueryList() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getQueries();
      setQueries(list || []);
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
      {queries.length === 0 ? (
        <div className="empty-state">
          <p>No queries found.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {queries.map(q => (
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

