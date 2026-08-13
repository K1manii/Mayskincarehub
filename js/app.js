/**
 * MAY SKINCARE HUB - Master Application Orchestrator
 * Connects all modular JS engines (Cart, Wishlist, Search, Filters, Product Details, Quiz, Recommendations, Routines).
 * Guarantees zero regression on existing WhatsApp ordering, Custom Requests, and Product Catalogue rendering.
 */

// Helper to render product grid into a target container
const renderProductGrid = (productsList, gridElement) => {
    if (!gridElement) return;

    gridElement.innerHTML = '';

    if (!productsList || productsList.length === 0) {
        gridElement.innerHTML = `
            <div class="empty-state-card" style="grid-column: 1 / -1;">
                <i class="fas fa-box-open"></i>
                <p>No products found matching your current filter.</p>
            </div>
        `;
        return;
    }

    productsList.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.opacity = '0';
        card.style.animation = `fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards ${Math.min((index + 1) * 0.04, 0.5)}s`;

        const isSaved = isInWishlist(product.id);
        const inCartItem = cart[product.id];

        let priceHtml = `<div>${STORE_CONFIG.currencySymbol}${formatMoney(product.price)}</div>`;
        if (product.oldPrice && product.oldPrice > product.price) {
            const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
            priceHtml = `
                <div>${STORE_CONFIG.currencySymbol}${formatMoney(product.price)}</div>
                <div class="old-price">${STORE_CONFIG.currencySymbol}${formatMoney(product.oldPrice)}</div>
                <div class="discount-tag">${discount}% OFF</div>
            `;
        }

        card.innerHTML = `
            <div class="card-img-wrapper" onclick="openProductDetails('${product.id}')">
                <img src="${product.images[0]}" alt="${product.name}" loading="lazy" onerror="this.src='Misc/Logo.jpeg'">
                <div class="card-overlay"></div>
                <button class="wishlist-heart-btn ${isSaved ? 'active' : ''}" data-id="${product.id}" title="${isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                    <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="card-content">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title" onclick="openProductDetails('${product.id}')">${product.name}</h3>
                <div class="product-price">${priceHtml}</div>
                <div class="card-actions">
                    <button class="btn-details" onclick="openProductDetails('${product.id}')"><i class="fas fa-eye"></i> Details</button>
                    <button class="btn-whatsapp btn-select ${inCartItem ? 'selected' : ''}" data-id="${product.id}">
                        ${inCartItem ? `<i class="fas fa-check"></i> In Cart (${inCartItem.quantity})` : `<i class="fas fa-cart-plus"></i> Add to Cart`}
                    </button>
                </div>
            </div>
        `;

        gridElement.appendChild(card);
    });

    // Bind Wishlist heart clicks inside grid
    gridElement.querySelectorAll('.wishlist-heart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            toggleWishlist(id);
        });
    });

    // Bind Add to Cart buttons inside grid
    gridElement.querySelectorAll('.btn-select').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            addToCart(id);
        });
    });
};

// Render Section Grids according to current filters
const renderAllCategoryGrids = () => {
    const filteredProducts = applyFiltersAndSort(PRODUCTS);

    // Section Grids
    const bodyCareGrid = document.getElementById('body-care-grid');
    const fragrancesGrid = document.getElementById('fragrances-grid');
    const faceCareGrid = document.getElementById('face-care-grid');
    const buttersOilsGrid = document.getElementById('butters-oils-grid');
    const sunCareGrid = document.getElementById('sun-care-grid');
    const healthWellnessGrid = document.getElementById('health-wellness-grid');

    const bestSellersGrid = document.getElementById('best-sellers-grid');
    const newArrivalsGrid = document.getElementById('new-arrivals-grid');
    const saleGrid = document.getElementById('sale-grid');

    // Section Visibility checks
    const bestSellersSection = document.getElementById('best-sellers-section');
    const newArrivalsSection = document.getElementById('new-arrivals-section');
    const saleSection = document.getElementById('sale-section');

    const bestSellers = filteredProducts.filter(p => p.bestSeller);
    if (bestSellersGrid && bestSellersSection) {
        if (bestSellers.length > 0) {
            bestSellersSection.style.display = 'block';
            renderProductGrid(bestSellers, bestSellersGrid);
        } else {
            bestSellersSection.style.display = 'none';
        }
    }

    const newArrivals = filteredProducts.filter(p => p.newArrival);
    if (newArrivalsGrid && newArrivalsSection) {
        if (newArrivals.length > 0) {
            newArrivalsSection.style.display = 'block';
            renderProductGrid(newArrivals, newArrivalsGrid);
        } else {
            newArrivalsSection.style.display = 'none';
        }
    }

    const saleProducts = filteredProducts.filter(p => p.sale || (p.oldPrice && p.oldPrice > p.price));
    if (saleGrid && saleSection) {
        if (saleProducts.length > 0) {
            saleSection.style.display = 'block';
            renderProductGrid(saleProducts, saleGrid);
        } else {
            saleSection.style.display = 'none';
        }
    }

    // Render 6 Standard Categories
    if (bodyCareGrid) renderProductGrid(filteredProducts.filter(p => p.category === "Body Care"), bodyCareGrid);
    if (fragrancesGrid) renderProductGrid(filteredProducts.filter(p => p.category === "Fragrances"), fragrancesGrid);
    if (faceCareGrid) renderProductGrid(filteredProducts.filter(p => p.category === "Face Care"), faceCareGrid);
    if (buttersOilsGrid) renderProductGrid(filteredProducts.filter(p => p.category === "Butters & Oils"), buttersOilsGrid);
    if (sunCareGrid) renderProductGrid(filteredProducts.filter(p => p.category === "Sun Care"), sunCareGrid);
    if (healthWellnessGrid) renderProductGrid(filteredProducts.filter(p => p.category === "Health & Wellness"), healthWellnessGrid);
};

// Render FAQ Accordion
const renderFAQAccordion = () => {
    const container = document.getElementById('faq-accordion-container');
    if (!container) return;

    container.innerHTML = '';
    FAQ_DATA.forEach(item => {
        const faqEl = document.createElement('div');
        faqEl.className = 'faq-item';
        faqEl.innerHTML = `
            <div class="faq-question">
                <span>${item.question}</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
                <p>${item.answer}</p>
            </div>
        `;
        faqEl.querySelector('.faq-question').addEventListener('click', () => {
            faqEl.classList.toggle('active');
        });
        container.appendChild(faqEl);
    });
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize State
    loadCart();
    loadWishlist();

    // Set Footer Year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 2. Render Initial UI Grids
    renderAllCategoryGrids();
    renderFAQAccordion();
    renderRoutineBuilder();
    updateCartUI();
    updateWishlistUI();
    updateRecentlyViewedUI();
    loadSavedProfileAndDisplay();

    // 3. Mobile Hamburger Navigation
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenuEl = document.getElementById('nav-menu');
    const contactInfoEl = document.getElementById('contact-info');

    const closeMobileMenu = () => {
        if (navMenuEl) navMenuEl.classList.remove('show');
        if (contactInfoEl) contactInfoEl.classList.remove('show');
        if (mobileMenuBtn) mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = navMenuEl.classList.toggle('show');
            if (contactInfoEl) contactInfoEl.classList.toggle('show');
            mobileMenuBtn.querySelector('i').className = isOpen ? 'fas fa-times' : 'fas fa-bars';
        });
    }

    // 4. Cart Sidebar Toggles
    const floatingCartBtn = document.getElementById('floating-cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');

    const toggleCart = () => {
        if (cartSidebar) cartSidebar.classList.toggle('open');
        if (cartOverlay) cartOverlay.classList.toggle('show');
    };

    if (floatingCartBtn) floatingCartBtn.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);
    if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkoutViaWhatsApp);

    // Event Delegation for Cart Quantity & Remove
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.getAttribute('data-id');
            if (btn.classList.contains('minus')) updateCartQuantity(id, -1);
            if (btn.classList.contains('plus')) updateCartQuantity(id, 1);
            if (btn.classList.contains('remove-btn')) removeFromCart(id);
        });
    }

    // 5. Wishlist Drawer / Modal Toggles
    const openWishlistBtn = document.getElementById('open-wishlist-btn');
    const wishlistModalOverlay = document.getElementById('wishlist-modal-overlay');
    const closeWishlistModalBtn = document.getElementById('close-wishlist-modal');

    const openWishlistModal = () => {
        renderWishlistItems();
        if (wishlistModalOverlay) wishlistModalOverlay.classList.add('show');
    };

    const closeWishlistModal = () => {
        if (wishlistModalOverlay) wishlistModalOverlay.classList.remove('show');
    };

    if (openWishlistBtn) openWishlistBtn.addEventListener('click', (e) => { e.preventDefault(); openWishlistModal(); });
    if (closeWishlistModalBtn) closeWishlistModalBtn.addEventListener('click', closeWishlistModal);
    if (wishlistModalOverlay) {
        wishlistModalOverlay.addEventListener('click', (e) => {
            if (e.target === wishlistModalOverlay) closeWishlistModal();
        });
    }

    // 6. Skincare Quiz Triggers
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const navQuizLink = document.getElementById('nav-quiz-link');

    if (startQuizBtn) startQuizBtn.addEventListener('click', openQuizModal);
    if (navQuizLink) navQuizLink.addEventListener('click', (e) => { e.preventDefault(); openQuizModal(); });

    // 7. Search Input Handlers
    const searchInputDesktop = document.getElementById('product-search');
    const searchInputMobile = document.getElementById('product-search-mobile');
    const clearSearchBtnDesktop = document.getElementById('clear-search');
    const clearSearchBtnMobile = document.getElementById('clear-search-mobile');
    const mobileSearchToggle = document.getElementById('mobile-search-toggle');
    const navbarSearchMobile = document.getElementById('navbar-search-mobile');

    const onSearchInput = (e) => {
        const val = e.target.value;
        if (e.target === searchInputDesktop && searchInputMobile) searchInputMobile.value = val;
        if (e.target === searchInputMobile && searchInputDesktop) searchInputDesktop.value = val;
        executeSearch(val);
    };

    if (searchInputDesktop) searchInputDesktop.addEventListener('input', onSearchInput);
    if (searchInputMobile) searchInputMobile.addEventListener('input', onSearchInput);

    if (clearSearchBtnDesktop) {
        clearSearchBtnDesktop.addEventListener('click', () => {
            if (searchInputDesktop) searchInputDesktop.value = '';
            if (searchInputMobile) searchInputMobile.value = '';
            executeSearch('');
        });
    }

    if (clearSearchBtnMobile) {
        clearSearchBtnMobile.addEventListener('click', () => {
            if (searchInputDesktop) searchInputDesktop.value = '';
            if (searchInputMobile) searchInputMobile.value = '';
            executeSearch('');
        });
    }

    if (mobileSearchToggle && navbarSearchMobile) {
        mobileSearchToggle.addEventListener('click', () => {
            closeMobileMenu();
            const isOpen = navbarSearchMobile.classList.toggle('show');
            mobileSearchToggle.classList.toggle('active', isOpen);
            if (isOpen && searchInputMobile) searchInputMobile.focus();
        });
    }

    // 8. Filters & Sorting Event Handlers
    const filterCategory = document.getElementById('filter-category');
    const filterSkinType = document.getElementById('filter-skin-type');
    const filterSkinConcern = document.getElementById('filter-skin-concern');
    const filterProductType = document.getElementById('filter-product-type');
    const filterPrice = document.getElementById('filter-price');
    const sortSelect = document.getElementById('sort-by');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    const onFilterChange = () => {
        if (filterCategory) currentFilters.category = filterCategory.value;
        if (filterSkinType) currentFilters.skinType = filterSkinType.value;
        if (filterSkinConcern) currentFilters.skinConcern = filterSkinConcern.value;
        if (filterProductType) currentFilters.productType = filterProductType.value;
        if (filterPrice) currentFilters.priceRange = filterPrice.value;
        if (sortSelect) currentFilters.sortBy = sortSelect.value;
        renderAllCategoryGrids();
    };

    if (filterCategory) filterCategory.addEventListener('change', onFilterChange);
    if (filterSkinType) filterSkinType.addEventListener('change', onFilterChange);
    if (filterSkinConcern) filterSkinConcern.addEventListener('change', onFilterChange);
    if (filterProductType) filterProductType.addEventListener('change', onFilterChange);
    if (filterPrice) filterPrice.addEventListener('change', onFilterChange);
    if (sortSelect) sortSelect.addEventListener('change', onFilterChange);

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            resetFilters();
            renderAllCategoryGrids();
        });
    }

    // Quick Filters: Shop by Skin Type & Shop by Concern
    document.querySelectorAll('.skin-type-quick-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-type');
            if (filterSkinType) {
                filterSkinType.value = val;
                onFilterChange();
                document.getElementById('all-products-heading').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    document.querySelectorAll('.concern-quick-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-concern');
            if (filterSkinConcern) {
                filterSkinConcern.value = val;
                onFilterChange();
                document.getElementById('all-products-heading').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 9. Custom Product Request Form & Image Upload Handlers
    const openRequestBtn = document.getElementById('open-request-btn');
    const navRequestLink = document.getElementById('nav-request-link');
    const requestModalOverlay = document.getElementById('request-modal-overlay');
    const closeRequestModalBtn = document.getElementById('close-request-modal');
    const requestProductForm = document.getElementById('request-product-form');
    const reqProductNameInput = document.getElementById('req-product-name');
    const reqProductQtyInput = document.getElementById('req-product-qty');
    const reqProductDetailsInput = document.getElementById('req-product-details');
    const reqQtyMinusBtn = document.getElementById('req-qty-minus');
    const reqQtyPlusBtn = document.getElementById('req-qty-plus');
    const reqProductImageInput = document.getElementById('req-product-image');
    const fileUploadZone = document.getElementById('file-upload-zone');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const uploadPreview = document.getElementById('upload-preview');
    const previewImg = document.getElementById('preview-img');
    const removePreviewBtn = document.getElementById('remove-preview-btn');

    let selectedImageDataUrl = "";

    const openRequestModal = () => {
        if (requestModalOverlay) requestModalOverlay.classList.add('show');
    };

    const closeRequestModal = () => {
        if (requestModalOverlay) {
            requestModalOverlay.classList.remove('show');
            if (requestProductForm) requestProductForm.reset();
            if (reqProductQtyInput) reqProductQtyInput.value = "1";
            selectedImageDataUrl = "";
            if (previewImg) previewImg.src = "";
            if (uploadPreview) uploadPreview.style.display = "none";
            if (uploadPlaceholder) uploadPlaceholder.style.display = "flex";
        }
    };

    if (openRequestBtn) openRequestBtn.addEventListener('click', openRequestModal);
    if (navRequestLink) navRequestLink.addEventListener('click', (e) => { e.preventDefault(); openRequestModal(); });
    if (closeRequestModalBtn) closeRequestModalBtn.addEventListener('click', closeRequestModal);
    if (requestModalOverlay) {
        requestModalOverlay.addEventListener('click', (e) => {
            if (e.target === requestModalOverlay) closeRequestModal();
        });
    }

    if (reqQtyMinusBtn && reqProductQtyInput) {
        reqQtyMinusBtn.addEventListener('click', () => {
            let val = parseInt(reqProductQtyInput.value);
            if (val > 1) reqProductQtyInput.value = val - 1;
        });
    }

    if (reqQtyPlusBtn && reqProductQtyInput) {
        reqQtyPlusBtn.addEventListener('click', () => {
            let val = parseInt(reqProductQtyInput.value);
            reqProductQtyInput.value = val + 1;
        });
    }

    if (fileUploadZone && reqProductImageInput) {
        fileUploadZone.addEventListener('click', (e) => {
            if (e.target.closest('#remove-preview-btn')) return;
            reqProductImageInput.click();
        });

        reqProductImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    selectedImageDataUrl = event.target.result;
                    if (previewImg) previewImg.src = selectedImageDataUrl;
                    if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
                    if (uploadPreview) uploadPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removePreviewBtn) {
        removePreviewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedImageDataUrl = "";
            if (previewImg) previewImg.src = "";
            if (uploadPreview) uploadPreview.style.display = 'none';
            if (uploadPlaceholder) uploadPlaceholder.style.display = 'flex';
            if (reqProductImageInput) reqProductImageInput.value = "";
        });
    }

    if (requestProductForm) {
        requestProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = reqProductNameInput.value.trim();
            const qty = parseInt(reqProductQtyInput.value);
            const details = reqProductDetailsInput.value.trim();
            if (!name) return;

            addCustomToCart(name, qty, details, selectedImageDataUrl);
            closeRequestModal();

            if (cartSidebar && cartOverlay) {
                cartSidebar.classList.add('open');
                cartOverlay.classList.add('show');
            }
        });
    }

    const reqWhatsappNowBtn = document.getElementById('req-whatsapp-now');
    if (reqWhatsappNowBtn) {
        reqWhatsappNowBtn.addEventListener('click', () => {
            const name = reqProductNameInput.value.trim();
            const qty = parseInt(reqProductQtyInput.value);
            const details = reqProductDetailsInput.value.trim();
            if (!name) {
                if (reqProductNameInput) reqProductNameInput.reportValidity();
                return;
            }

            const message = encodeURIComponent(
                `Hi ${STORE_CONFIG.companyName}, I'd like to request a product that is not listed:\n` +
                `- Product: ${name}\n` +
                `- Quantity: ${qty}` +
                `${details ? `\n- Details: ${details}` : ''}` +
                `${selectedImageDataUrl ? `\n- [Note: Image attached - sending picture in chat next!]` : ''}\n\n` +
                `Please let me know if it is available and the price. Thank you!`
            );

            window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${message}`, '_blank');
            closeRequestModal();
        });
    }

    // 10. Global Escape Key handler for Modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProductDetails();
            closeQuizModal();
            closeWishlistModal();
            closeRequestModal();
            if (cartSidebar) cartSidebar.classList.remove('open');
            if (cartOverlay) cartOverlay.classList.remove('show');
        }
    });
});
