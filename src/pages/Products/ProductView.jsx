import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById, getProductImageUrl } from "../../services/api";

export default function ProductView() {
	const { id } = useParams();
	const [product, setProduct] = useState(null);

	useEffect(() => {
		if (!id) return;
		getProductById(id).then(res => setProduct(res)).catch(err => {
			console.error(err);
			alert("Failed to load product");
		});
	}, [id]);

	if (!product) return <div>Loading...</div>;

	return (
		<div>
			<h2>{product.name}</h2>
			<p>{product.description}</p>
			<p>Price: {product.price}</p>
			<p>Category: {product.category?.name || "-"}</p>
			{product.id && <img src={getProductImageUrl(product.id)} alt={product.name} style={{maxWidth:300}} />}
			<div style={{marginTop:12}}>
				<Link to={`/products/${product.id}/edit`}><button>Edit</button></Link>
				<Link to="/products"><button>Back</button></Link>
			</div>
		</div>
	);
}

