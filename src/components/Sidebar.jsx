import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

export default function Sidebar() {
	const navigate = useNavigate();

	function handleLogout() {
		logout();
		localStorage.removeItem("xomo_login");
		navigate("/");
	}

	return (
		<aside className="admin-sidebar" style={{width:220, borderRight:'1px solid #eee', minHeight:'100vh'}}>
			<div style={{padding:16, borderBottom:'1px solid #eee'}}>
				<strong>Admin</strong>
			</div>
			<nav style={{padding:12}}>
				<ul style={{listStyle:'none', padding:0, margin:0}}>
					<li><Link to="/Dashboard">Dashboard</Link></li>
					<li><Link to="/products">Products</Link></li>
					<li><Link to="/products/new">New Product</Link></li>
					<li><Link to="/categories">Categories</Link></li>
					<li><Link to="/categories/new">New Category</Link></li>
					<li><Link to="/users">Users</Link></li>
					<li><Link to="/orders">Orders</Link></li>
				</ul>
			</nav>
			<div style={{padding:12, marginTop:'auto'}}>
				<button onClick={handleLogout} style={{width:'100%'}}>Logout</button>
			</div>
		</aside>
	);
}
