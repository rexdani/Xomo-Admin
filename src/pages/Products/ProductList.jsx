import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct, getCategories } from "../../services/api";

export default function ProductList(){
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsList, categoriesList] = await Promise.all([
        getProducts(),
        getCategories().catch(() => []) // Don't fail if categories fail
      ]);
      setProducts(productsList || []);
      setCategories(categoriesList || []);
    } catch (err) {
      console.error("Failed to load products", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategoryName = useCallback((categoryId) => {
    if (!categoryId) return "-";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || `ID: ${categoryId}`;
  }, [categories]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(async (id) => {
    if(!confirm("Delete this product?")) return;
    try {
      setDeleting(id);
      await deleteProduct(id);
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
          <h2>Products</h2>
          <Link to="/products/new"><button>Create</button></Link>
        </div>
        <div className="loading-state">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h2>Products</h2>
          <Link to="/products/new"><button>Create</button></Link>
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
        <h2>Products</h2>
        <Link to="/products/new"><button>Create</button></Link>
      </div>
      {products.length === 0 ? (
        <div className="empty-state">
          <p>No products found.</p>
          <Link to="/products/new"><button>Create First Product</button></Link>
        </div>
      ) : (
        <table className="table">
          <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Category</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>₹{p.price || 0}</td>
                <td>
                  <span className={p.stock <= 0 ? "stock-out" : p.stock < 10 ? "stock-low" : "stock-ok"}>
                    {p.stock ?? 0}
                  </span>
                </td>
                <td>{getCategoryName(p.categoryId || p.category?.id)}</td>
                <td>
                  <Link to={`/products/${p.id}`}>View</Link>{" | "}
                  <Link to={`/products/${p.id}/edit`}>Edit</Link>{" | "}
                  <button 
                    onClick={() => remove(p.id)} 
                    disabled={deleting === p.id}
                  >
                    {deleting === p.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
