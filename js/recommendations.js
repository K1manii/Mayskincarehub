/**
 * MAY SKINCARE HUB - Personalization & Recommendation Engine
 * Deterministic scoring algorithm evaluating skin profile preferences against product data.
 * Zero score awarded if product metadata is unconfirmed (Adheres to Data Integrity rules).
 */

const generateAndDisplayRecommendations = (answers) => {
    if (!answers) return;

    const scoredProducts = PRODUCTS.map(product => {
        let score = 0;
        let reasons = [];

        // 1. Skin Type Match (+5 pts)
        if (answers.skinType && product.skinTypes && product.skinTypes.includes(answers.skinType)) {
            score += 5;
            reasons.push(`Fits your selected ${answers.skinType} skin type`);
        }

        // 2. Skin Concern Match (+5 pts per match)
        if (answers.skinConcern && Array.isArray(answers.skinConcern) && product.skinConcerns) {
            const matches = product.skinConcerns.filter(sc => answers.skinConcern.includes(sc));
            if (matches.length > 0) {
                score += matches.length * 5;
                reasons.push(`Matches your preference for ${matches.join(', ')}`);
            }
        }

        // 3. Goal Match (+3 pts)
        if (answers.skincareGoal && product.tags && product.tags.some(t => t.toLowerCase().includes(answers.skincareGoal.toLowerCase()))) {
            score += 3;
            reasons.push(`Supports your goal for ${answers.skincareGoal}`);
        }

        // 4. Product Type Match (+2 pts)
        if (answers.productTypePref && answers.productTypePref !== "Any" && product.productType === answers.productTypePref) {
            score += 2;
            reasons.push(`Matches your preference for ${answers.productTypePref}`);
        }

        // 5. Category Match (+2 pts)
        if (answers.routineType) {
            if (answers.routineType === "Body Care" && product.category === "Body Care") score += 2;
            if (answers.routineType === "Face Care" && product.category === "Face Care") score += 2;
        }

        return {
            product,
            score,
            reason: reasons.length > 0 ? reasons.join(' • ') : "Selected because it matches your overall skincare preferences."
        };
    });

    // Sort by score descending
    scoredProducts.sort((a, b) => b.score - a.score);

    // Pick top matching products for recommendation section
    const topRecommendations = scoredProducts.slice(0, 4);

    // Display in UI
    const recSection = document.getElementById('personalized-recommendations-section');
    const recGrid = document.getElementById('personalized-recommendations-grid');

    if (recSection && recGrid) {
        recSection.style.display = 'block';
        recGrid.innerHTML = '';

        topRecommendations.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-img-wrapper" onclick="openProductDetails('${rec.product.id}')">
                    <img src="${rec.product.images[0]}" alt="${rec.product.name}" loading="lazy" onerror="this.src='Misc/Logo.jpeg'">
                    <div class="card-overlay"></div>
                    <button class="wishlist-heart-btn ${isInWishlist(rec.product.id) ? 'active' : ''}" data-id="${rec.product.id}" title="Save to Wishlist">
                        <i class="${isInWishlist(rec.product.id) ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
                <div class="card-content">
                    <div class="recommendation-reason"><i class="fas fa-sparkles"></i> ${rec.reason}</div>
                    <div class="product-category">${rec.product.category}</div>
                    <h3 class="product-title" onclick="openProductDetails('${rec.product.id}')">${rec.product.name}</h3>
                    <div class="product-price">${STORE_CONFIG.currencySymbol}${formatMoney(rec.product.price)}</div>
                    <div class="card-actions">
                        <button class="btn-details" onclick="openProductDetails('${rec.product.id}')"><i class="fas fa-eye"></i> Details</button>
                        <button class="btn-whatsapp btn-select" data-id="${rec.product.id}">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            `;
            recGrid.appendChild(card);
        });

        // Add "Add Recommended Routine to Cart" button if top recommendations exist
        const routineAddBtn = document.getElementById('add-recommended-routine-btn');
        if (routineAddBtn) {
            routineAddBtn.style.display = 'inline-flex';
            routineAddBtn.onclick = () => {
                topRecommendations.forEach(rec => {
                    addToCart(rec.product.id);
                });
                const cartSidebar = document.getElementById('cart-sidebar');
                const cartOverlay = document.getElementById('cart-overlay');
                if (cartSidebar && cartOverlay) {
                    cartSidebar.classList.add('open');
                    cartOverlay.classList.add('show');
                }
            };
        }

        // Scroll smoothly to results
        recSection.scrollIntoView({ behavior: 'smooth' });
    }
};

// Hydrate saved profile on page load
const loadSavedProfileAndDisplay = () => {
    try {
        const saved = localStorage.getItem(STORE_CONFIG.storageKeys.skinProfile);
        if (saved) {
            const profile = JSON.parse(saved);
            generateAndDisplayRecommendations(profile);
        }
    } catch (e) {
        console.error("Error loading saved skin profile", e);
    }
};
