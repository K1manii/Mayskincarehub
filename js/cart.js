/**
 * MAY SKINCARE HUB - Cart Engine
 * Manages shopping cart state, localStorage persistence, quantity controls,
 * custom product requests, total calculation, and formatted WhatsApp order checkout.
 */

let cart = {};

// Load Cart from LocalStorage
const loadCart = () => {
    try {
        const saved = localStorage.getItem(STORE_CONFIG.storageKeys.cart);
        if (saved) {
            cart = JSON.parse(saved);
        }
    } catch (e) {
        console.error("Error loading cart from localStorage", e);
        cart = {};
    }
};

// Save Cart to LocalStorage
const saveCart = () => {
    try {
        localStorage.setItem(STORE_CONFIG.storageKeys.cart, JSON.stringify(cart));
    } catch (e) {
        console.error("Error saving cart to localStorage", e);
    }
};

// Format Money Helper
const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-KE').format(amount);
};

// Add Product to Cart
const addToCart = (productOrId, quantityToAdd = 1) => {
    let id, name, price, image;
    
    if (typeof productOrId === 'string') {
        id = productOrId;
        const found = PRODUCTS.find(p => p.id === id);
        if (!found) return;
        name = found.name;
        price = found.price;
        image = found.images && found.images.length > 0 ? found.images[0] : 'Misc/Logo.jpeg';
    } else {
        id = productOrId.id;
        name = productOrId.name;
        price = productOrId.price;
        image = productOrId.images && productOrId.images.length > 0 ? productOrId.images[0] : (productOrId.image || 'Misc/Logo.jpeg');
    }

    if (cart[id]) {
        cart[id].quantity += quantityToAdd;
    } else {
        cart[id] = {
            id,
            name,
            price,
            quantity: quantityToAdd,
            image,
            isCustom: false
        };
    }

    saveCart();
    updateCartUI();
};

// Add Custom Product Request to Cart
const addCustomToCart = (name, quantity, details, imageDataUrl) => {
    const customId = `custom_req_${Date.now()}`;
    cart[customId] = {
        id: customId,
        name: name,
        price: 0,
        quantity: quantity,
        image: imageDataUrl || 'Misc/Logo.jpeg',
        isCustom: true,
        details: details,
        hasImage: !!imageDataUrl
    };
    saveCart();
    updateCartUI();
};

// Update Quantity
const updateCartQuantity = (id, change) => {
    if (cart[id]) {
        cart[id].quantity += change;
        if (cart[id].quantity <= 0) {
            delete cart[id];
        }
        saveCart();
        updateCartUI();
    }
};

// Remove Product from Cart
const removeFromCart = (id) => {
    if (cart[id]) {
        delete cart[id];
        saveCart();
        updateCartUI();
    }
};

// Clear All Cart Items
const clearCart = () => {
    cart = {};
    saveCart();
    updateCartUI();
};

// Update Cart UI in DOM
const updateCartUI = () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountBadge = document.getElementById('cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const floatingCartBtn = document.getElementById('floating-cart-btn');

    if (!cartItemsContainer) return;

    let totalItems = 0;
    let totalPrice = 0;
    cartItemsContainer.innerHTML = '';

    const cartKeys = Object.keys(cart);

    if (cartKeys.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        if (floatingCartBtn) floatingCartBtn.style.display = 'none';
    } else {
        if (floatingCartBtn) floatingCartBtn.style.display = 'flex';

        cartKeys.forEach(id => {
            const item = cart[id];
            totalItems += item.quantity;

            let priceText = "";
            if (item.isCustom) {
                priceText = `
                    <span class="custom-req-badge">Custom Request</span><br>
                    <span class="cart-item-price-req">Price on Request</span>
                `;
            } else {
                const subtotal = item.price * item.quantity;
                totalPrice += subtotal;
                priceText = `<div class="cart-item-price">${STORE_CONFIG.currencySymbol}${formatMoney(item.price)}</div>`;
            }

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='Misc/Logo.jpeg'">
                <div class="cart-item-details">
                    <h4 title="${item.name}">${item.name}</h4>
                    ${priceText}
                    <div class="cart-item-controls">
                        <button class="qty-btn minus" data-id="${id}">-</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn plus" data-id="${id}">+</button>
                    </div>
                </div>
                <div class="cart-item-remove">
                    <button class="remove-btn" data-id="${id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }

    let hasCustomItems = Object.values(cart).some(item => item.isCustom);
    if (cartCountBadge) cartCountBadge.textContent = totalItems;
    if (cartTotalPrice) {
        cartTotalPrice.textContent = hasCustomItems 
            ? `${STORE_CONFIG.currencySymbol}${formatMoney(totalPrice)} + TBD` 
            : `${STORE_CONFIG.currencySymbol}${formatMoney(totalPrice)}`;
    }

    // Sync "Add to Cart" button states on product cards
    document.querySelectorAll('.btn-select').forEach(btn => {
        const id = btn.getAttribute('data-id');
        if (cart[id]) {
            btn.innerHTML = `<i class="fas fa-check"></i> In Cart (${cart[id].quantity})`;
            btn.classList.add('selected');
        } else {
            btn.innerHTML = `<i class="fas fa-cart-plus"></i> Add to Cart`;
            btn.classList.remove('selected');
        }
    });
};

// WhatsApp Checkout Handler
const checkoutViaWhatsApp = () => {
    if (Object.keys(cart).length === 0) return;

    let orderLines = [];
    let grandTotal = 0;
    let hasCustomItems = false;

    Object.values(cart).forEach((item, index) => {
        if (item.isCustom) {
            hasCustomItems = true;
            let customLine = `${index + 1}. [CUSTOM REQUEST] ${item.name} x ${item.quantity} - (Price on Request)`;
            if (item.details) customLine += ` [Details: ${item.details}]`;
            if (item.hasImage) customLine += ` [Note: Image attached - sending picture in chat]`;
            orderLines.push(customLine);
        } else {
            const subtotal = item.price * item.quantity;
            grandTotal += subtotal;
            orderLines.push(`${index + 1}. ${item.name} x ${item.quantity} - ${STORE_CONFIG.currencySymbol}${formatMoney(subtotal)}.`);
        }
    });

    let totalText = `\n\nTotal: ${STORE_CONFIG.currencySymbol}${formatMoney(grandTotal)}`;
    if (hasCustomItems) {
        totalText += ` + Custom Items (Price TBD)`;
    }

    const message = encodeURIComponent(
        `Hi ${STORE_CONFIG.companyName}, I'd like to place an order:\n\n` +
        orderLines.join('\n') +
        totalText +
        `\n\nThank you!`
    );

    const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
};
