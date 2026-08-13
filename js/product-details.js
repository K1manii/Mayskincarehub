/**
 * MAY SKINCARE HUB - Product Details Engine
 * Renders Product Details Modal with image gallery, discount tags, tabs/sections,
 * quantity selector, WhatsApp direct buy, Wishlist toggle, and Related Products.
 */

let selectedQuantity = 1;
let currentDetailProduct = null;

const openProductDetails = (productId) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    currentDetailProduct = product;
    selectedQuantity = 1;

    // Track recently viewed
    addToRecentlyViewed(productId);

    const modalOverlay = document.getElementById('details-modal-overlay');
    const container = document.getElementById('details-modal-content');
    if (!modalOverlay || !container) return;

    // Gallery images
    const galleryImages = product.images && product.images.length > 0 ? product.images : ['Misc/Logo.jpeg'];

    // Ratings markup
    const ratingMarkup = product.rating ? `
        <div class="details-rating">
            <i class="fas fa-star"></i> ${product.rating.toFixed(1)} ${product.reviewCount > 0 ? `(${product.reviewCount} reviews)` : ''}
        </div>
    ` : '';

    // Price and Discount markup
    let priceMarkup = `<div>${STORE_CONFIG.currencySymbol}${formatMoney(product.price)}</div>`;
    if (product.oldPrice && product.oldPrice > product.price) {
        const discountPercent = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
        priceMarkup = `
            <div>${STORE_CONFIG.currencySymbol}${formatMoney(product.price)}</div>
            <div class="old-price">${STORE_CONFIG.currencySymbol}${formatMoney(product.oldPrice)}</div>
            <div class="discount-tag">${discountPercent}% OFF</div>
        `;
    }

    // Related Products logic
    const relatedProducts = getRelatedProducts(product);

    container.innerHTML = `
        <div class="product-details-card">
            <button class="close-modal" id="close-details-modal" style="position: absolute; top: 1.5rem; right: 1.5rem; z-index: 10;"><i class="fas fa-times"></i></button>

            <div class="details-gallery">
                <div class="details-main-img-wrapper">
                    <img src="${galleryImages[0]}" alt="${product.name}" class="details-main-img" id="details-main-img" onerror="this.src='Misc/Logo.jpeg'">
                    <button class="wishlist-heart-btn ${isInWishlist(product.id) ? 'active' : ''}" data-id="${product.id}" title="Save to Wishlist" id="details-wishlist-btn">
                        <i class="${isInWishlist(product.id) ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
                ${galleryImages.length > 1 ? `
                    <div class="details-thumbnails">
                        ${galleryImages.map((img, idx) => `
                            <img src="${img}" alt="${product.name} thumbnail ${idx + 1}" class="thumbnail-img ${idx === 0 ? 'active' : ''}" data-src="${img}">
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <div class="details-info">
                <div class="details-category">${product.category} ${product.subcategory ? `• ${product.subcategory}` : ''}</div>
                <h2 class="details-title">${product.name}</h2>
                ${ratingMarkup}
                <div class="details-price-row">
                    ${priceMarkup}
                </div>

                ${product.description ? `
                    <div class="details-section-block">
                        <div class="details-section-title">Description</div>
                        <p class="details-description">${product.description}</p>
                    </div>
                ` : ''}

                ${product.size ? `
                    <div class="details-section-block">
                        <div class="details-section-title">Size</div>
                        <span class="details-tag-pill">${product.size}</span>
                    </div>
                ` : ''}

                ${product.benefits && product.benefits.length > 0 ? `
                    <div class="details-section-block">
                        <div class="details-section-title">Key Benefits</div>
                        <div class="details-tags-list">
                            ${product.benefits.map(b => `<span class="details-tag-pill"><i class="fas fa-check" style="color: var(--accent-color); margin-right: 5px;"></i> ${b}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}

                ${product.ingredients && product.ingredients.length > 0 ? `
                    <div class="details-section-block">
                        <div class="details-section-title">Ingredients</div>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">${product.ingredients.join(', ')}</p>
                    </div>
                ` : ''}

                ${product.howToUse ? `
                    <div class="details-section-block">
                        <div class="details-section-title">How to Use</div>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">${product.howToUse}</p>
                    </div>
                ` : ''}

                <div class="details-action-bar">
                    <div class="quantity-control">
                        <button id="details-qty-minus">-</button>
                        <input type="number" id="details-qty-val" value="1" readonly>
                        <button id="details-qty-plus">+</button>
                    </div>

                    <button class="btn-whatsapp btn-add-details" id="details-add-cart-btn" style="flex: 1;">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>

                    <button class="btn-whatsapp btn-whatsapp-direct" id="details-buy-whatsapp-btn" style="background: #25D366;">
                        <i class="fab fa-whatsapp"></i> Buy Now
                    </button>
                </div>
            </div>
        </div>

        ${relatedProducts.length > 0 ? `
            <div style="margin-top: 3rem; border-top: 1px solid var(--glass-border); padding-top: 2rem;">
                <h3 style="font-size: 1.4rem; color: var(--accent-color); margin-bottom: 1.5rem; text-align: center;">YOU MAY ALSO LIKE</h3>
                <div class="products-grid" id="related-products-grid"></div>
            </div>
        ` : ''}
    `;

    modalOverlay.classList.add('show');

    // Render Related Products grid
    if (relatedProducts.length > 0) {
        const relatedGrid = document.getElementById('related-products-grid');
        if (relatedGrid) renderProductGrid(relatedProducts, relatedGrid);
    }

    // Thumbnail switching logic
    container.querySelectorAll('.thumbnail-img').forEach(thumb => {
        thumb.addEventListener('click', (e) => {
            container.querySelectorAll('.thumbnail-img').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            const mainImg = document.getElementById('details-main-img');
            if (mainImg) mainImg.src = e.target.getAttribute('data-src');
        });
    });

    // Quantity buttons
    const qtyVal = document.getElementById('details-qty-val');
    const minusBtn = document.getElementById('details-qty-minus');
    const plusBtn = document.getElementById('details-qty-plus');

    if (minusBtn && qtyVal) {
        minusBtn.addEventListener('click', () => {
            if (selectedQuantity > 1) {
                selectedQuantity--;
                qtyVal.value = selectedQuantity;
            }
        });
    }

    if (plusBtn && qtyVal) {
        plusBtn.addEventListener('click', () => {
            selectedQuantity++;
            qtyVal.value = selectedQuantity;
        });
    }

    // Add to Cart
    const addCartBtn = document.getElementById('details-add-cart-btn');
    if (addCartBtn) {
        addCartBtn.addEventListener('click', () => {
            addToCart(product.id, selectedQuantity);
            closeProductDetails();
            // Open cart drawer
            const cartSidebar = document.getElementById('cart-sidebar');
            const cartOverlay = document.getElementById('cart-overlay');
            if (cartSidebar && cartOverlay) {
                cartSidebar.classList.add('open');
                cartOverlay.classList.add('show');
            }
        });
    }

    // Buy via WhatsApp Direct
    const buyWhatsappBtn = document.getElementById('details-buy-whatsapp-btn');
    if (buyWhatsappBtn) {
        buyWhatsappBtn.addEventListener('click', () => {
            const subtotal = product.price * selectedQuantity;
            const message = encodeURIComponent(
                `Hi ${STORE_CONFIG.companyName}, I'd like to order:\n` +
                `- ${product.name} x ${selectedQuantity} (${STORE_CONFIG.currencySymbol}${formatMoney(subtotal)})\n\n` +
                `Thank you!`
            );
            window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${message}`, '_blank');
        });
    }

    // Wishlist Toggle
    const wishlistBtn = document.getElementById('details-wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            toggleWishlist(product.id);
            const isNowSaved = isInWishlist(product.id);
            wishlistBtn.classList.toggle('active', isNowSaved);
            wishlistBtn.querySelector('i').className = isNowSaved ? 'fas fa-heart' : 'far fa-heart';
        });
    }

    // Close Button
    const closeBtn = document.getElementById('close-details-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeProductDetails);
};

const closeProductDetails = () => {
    const modalOverlay = document.getElementById('details-modal-overlay');
    if (modalOverlay) modalOverlay.classList.remove('show');
    currentDetailProduct = null;
};

// Intelligent Related Products Matcher
const getRelatedProducts = (currentProduct) => {
    const related = PRODUCTS.filter(p => p.id !== currentProduct.id).map(p => {
        let score = 0;
        if (p.subcategory && p.subcategory === currentProduct.subcategory) score += 5;
        if (p.category === currentProduct.category) score += 3;
        
        if (p.skinConcerns && currentProduct.skinConcerns) {
            const sharedConcerns = p.skinConcerns.filter(sc => currentProduct.skinConcerns.includes(sc));
            score += sharedConcerns.length * 2;
        }

        if (p.skinTypes && currentProduct.skinTypes) {
            const sharedTypes = p.skinTypes.filter(st => currentProduct.skinTypes.includes(st));
            score += sharedTypes.length * 1;
        }

        return { product: p, score };
    });

    related.sort((a, b) => b.score - a.score);
    return related.slice(0, 4).map(r => r.product);
};

// Recently Viewed Tracker (max 8 IDs, stored in localStorage)
const addToRecentlyViewed = (productId) => {
    try {
        let recent = JSON.parse(localStorage.getItem(STORE_CONFIG.storageKeys.recentlyViewed) || '[]');
        recent = recent.filter(id => id !== productId);
        recent.unshift(productId);
        if (recent.length > 8) recent = recent.slice(0, 8);
        localStorage.setItem(STORE_CONFIG.storageKeys.recentlyViewed, JSON.stringify(recent));
        updateRecentlyViewedUI();
    } catch (e) {
        console.error("Error saving recently viewed", e);
    }
};

const updateRecentlyViewedUI = () => {
    const container = document.getElementById('recently-viewed-grid');
    const section = document.getElementById('recently-viewed-section');
    if (!container || !section) return;

    try {
        const recent = JSON.parse(localStorage.getItem(STORE_CONFIG.storageKeys.recentlyViewed) || '[]');
        if (recent.length === 0) {
            section.style.display = 'none';
            return;
        }

        const recentProducts = recent.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
        if (recentProducts.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        renderProductGrid(recentProducts, container);
    } catch (e) {
        section.style.display = 'none';
    }
};
