import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById, getProductImageUrl, getCategories } from "../../services/api";

export default function ProductView() {
	const { id } = useParams();
	const [product, setProduct] = useState(null);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const loadProduct = useCallback(async () => {
		if (!id) return;
		try {
			setLoading(true);
			setError(null);
			const [productData, categoriesList] = await Promise.all([
				getProductById(id),
				getCategories().catch(() => []) // Don't fail if categories fail
			]);
			setProduct(productData);
			setCategories(categoriesList || []);
		} catch (err) {
			console.error(err);
			setError("Failed to load product. Please try again.");
		} finally {
			setLoading(false);
		}
	}, [id]);

	const getCategoryName = useCallback((categoryId) => {
		if (!categoryId) return "-";
		const category = categories.find(c => c.id === categoryId);
		return category?.name || `ID: ${categoryId}`;
	}, [categories]);

	useEffect(() => {
		let cancelled = false;
		loadProduct();
		return () => { cancelled = true; };
	}, [loadProduct]);

	if (loading) {
		return <div className="loading-state">Loading product...</div>;
	}

	if (error || !product) {
		return (
			<div>
				<div className="error-state">
					<p>{error || "Product not found"}</p>
					<button onClick={loadProduct}>Retry</button>
					<Link to="/products"><button>Back to Products</button></Link>
				</div>
			</div>
		);
	}

	// Get image source - prefer base64 from DTO, fallback to image endpoint
	const getImageSrc = () => {
		if (product.imageBase64) {
			return `data:image/jpeg;base64,${product.imageBase64}`;
		}
		if (product.id) {
			return getProductImageUrl(product.id);
		}
		return null;
	};

	const imageSrc = getImageSrc();

	return (
		<div className="product-view">
			<div className="product-view-header">
				<h2>{product.name}</h2>
				<div className="product-actions">
					<Link to={`/products/${product.id}/edit`}><button>Edit Product</button></Link>
					<Link to="/products"><button>Back to Products</button></Link>
				</div>
			</div>
			
			<div className="product-details">
				{imageSrc && (
					<div className="product-image-container">
						<div className="product-image">
							<img 
								src={imageSrc} 
								alt={product.name}
								onError={(e) => { 
									e.target.style.display = 'none';
									e.target.nextSibling.style.display = 'block';
								}}
							/>
							<div className="no-image-placeholder" style={{display: 'none'}}>
								<span>No Image Available</span>
							</div>
						</div>
					</div>
				)}
				
				<div className="product-info">
					<div className="info-section">
						<h3>Product Information</h3>
						<div className="info-item">
							<label>Product Name:</label>
							<span>{product.name}</span>
						</div>
						<div className="info-item">
							<label>Description:</label>
							<span>{product.description || "No description provided"}</span>
						</div>
						<div className="info-item">
							<label>Category:</label>
							<span>{getCategoryName(product.categoryId || product.category?.id)}</span>
						</div>
					</div>

					<div className="info-section">
						<h3>Pricing & Inventory</h3>
						<div className="info-item">
							<label>Price:</label>
							<span className="price-value">₹{product.price || 0}</span>
						</div>
						<div className="info-item">
							<label>Stock Quantity:</label>
							<span className={product.stock <= 0 ? "stock-out" : product.stock < 10 ? "stock-low" : "stock-ok"}>
								{product.stock ?? 0} {product.stock === 1 ? 'item' : 'items'}
							</span>
						</div>
						{product.stock <= 0 && (
							<div className="stock-warning">
								⚠️ This product is out of stock
							</div>
						)}
						{product.stock > 0 && product.stock < 10 && (
							<div className="stock-warning stock-warning-low">
								⚠️ Low stock - only {product.stock} {product.stock === 1 ? 'item' : 'items'} remaining
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

