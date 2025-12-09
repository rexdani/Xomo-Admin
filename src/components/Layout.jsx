import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

	useEffect(() => {
		const handleResize = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);
			if (!mobile) {
				setIsMobileMenuOpen(false);
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<div style={{display:'flex', minHeight:'100vh', position: 'relative'}}>
			{/* Mobile Menu Toggle Button */}
			{isMobile && (
				<button
					onClick={toggleMobileMenu}
					style={{
						position: 'fixed',
						top: '16px',
						left: '16px',
						zIndex: 1001,
						width: '48px',
						height: '48px',
						borderRadius: '12px',
						border: 'none',
						backgroundColor: '#667eea',
						color: '#ffffff',
						fontSize: '24px',
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
						transition: 'all 0.2s'
					}}
					aria-label="Toggle menu"
					className="mobile-menu-toggle"
					onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
					onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
				>
					☰
				</button>
			)}

			<Sidebar 
				isMobileOpen={isMobileMenuOpen} 
				onMobileClose={closeMobileMenu}
			/>
			
			<main style={{
				flex: 1, 
				padding: isMobile ? '16px' : '20px',
				paddingTop: isMobile ? '72px' : '20px',
				width: '100%',
				maxWidth: '100%',
				overflowX: 'hidden'
			}}>
				{children}
			</main>
		</div>
	);
}

