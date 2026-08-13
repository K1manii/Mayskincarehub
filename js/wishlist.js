/**
 * MAY SKINCARE HUB - Wishlist Engine
 * Manages saved products, heart button toggles, localStorage sync (msh_wishlist),
 * navigation counter, and Wishlist Drawer/Modal rendering.
 */

let wishlist = [];

// Load Wishlist from LocalStorage
const loadWishlist = () => {
    try {
        const saved = localStorage.getItem(STORE_CONFIG.storageKeys.wishlist);
        if (saved) {
            wishlist = JSON.parse(saved);
        }
    } catch (e) {
        console.error("Error loading wishlist from localStorage", e);
        wishlist = [];
    }
};

// Save Wishlist to LocalStorage
const saveWishlist = () => {
    try {
        localStorage.setItem(STORE_CONFIG.storageKeys.wishlist, JSON.stringify(wishlist));
    } catch (e) {
        console.error("Error saving wishlist to localStorage", e);
    }
};

// Toggle Product in Wishlist
const toggleWishlist = (productId) => {
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push(productId);
    }
    saveWishlist();
    updateWishlistUI();
};

// Is Product in Wishlist
const isInWishlist = (productId) => {
    return wishlist.includes(productId);
};

// Update Wishlist UI
const updateWishlistUI = () => {
    // Update counter in navigation
    const countBadges = document.querySelectorAll('.wishlist-count-badge');
    countBadges.forEach(badge => {
        badge.textContent = wishlist.length;
    });

    // Sync heart icons across product cards
    document.querySelectorAll('.wishlist-heart-btn').forEach(btn => {
        const id = btn.getAttribute('data-id');
        if (isInWishlist(id)) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fas fa-heart"></i>';
            btn.title = "Remove from Wishlist";
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="far fa-heart"></i>';
            btn.title = "Add to Wishlist";
        }
    });

    // Render items if Wishlist Modal is visible
    renderWishlistItems();
};

// Render Wishlist Modal Items
const renderWishlistItems = () => {
    const container = document.getElementById('wishlist-items-container');
    if (!container) return;

    if (wishlist.length === 0) {
        container.innerHTML = `
            <div class="empty-state-card">
                <i class="far fa-heart"></i>
                <p>Your wishlist is currently empty.</p>
                <p style="font-size: 0.85rem; margin-top: 0.5rem; color: var(--text-secondary);">Click the heart icon on any product to save it for later.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    wishlist.forEach(id => {
        const product = PRODUCTS.find(p => p.id === id);
        if (!product) return;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}" class="cart-item-image" onerror="this.src='Misc/Logo.jpeg'">
            <div class="cart-item-details">
                <h4 title="${product.name}">${product.name}</h4>
                <div class="cart-item-price">${STORE_CONFIG.currencySymbol}${formatMoney(product.price)}</div>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
                    <button class="btn-whatsapp btn-select-wishlist" data-id="${product.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
            <div class="cart-item-remove">
                <button class="remove-btn remove-wishlist-item" data-id="${product.id}" title="Remove from Wishlist">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        container.appendChild(itemEl);
    });

    // Bind Wishlist modal actions
    container.querySelectorAll('.btn-select-wishlist').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            addToCart(id);
        });
    });

    container.querySelectorAll('.remove-wishlist-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            toggleWishlist(id);
        });
    });
};
