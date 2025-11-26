import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../../services/api";

export default function ProductList(){
  const [products, setProducts] = useState([]);
  async function load(){
    const list = await getProducts();
    setProducts(list || []);
  }
  useEffect(()=>{ load(); }, []);
  async function remove(id){
    if(!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      load();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Products</h2>
        <Link to="/products/new"><button>Create</button></Link>
      </div>
      <table className="table">
        <thead><tr><th>Name</th><th>Price</th><th>Category</th><th>Actions</th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.category?.name}</td>
              <td>
                <Link to={`/products/${p.id}`}>View</Link>{" | "}
                <Link to={`/products/${p.id}/edit`}>Edit</Link>{" | "}
                <button onClick={()=>remove(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
