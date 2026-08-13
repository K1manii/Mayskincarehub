/**
 * MAY SKINCARE HUB - Routine Builder Engine
 * Interactive routine construction across step categories (Cleanse, Treat, Moisturize, Protect).
 */

let selectedRoutineSteps = {
    Cleanse: null,
    Treat: null,
    Moisturize: null,
    Protect: null
};

const renderRoutineBuilder = () => {
    const container = document.getElementById('routine-builder-container');
    if (!container) return;

    const steps = [
        { name: "Cleanse", icon: "fa-soap", types: ["Soap", "Shower Gel", "Scrub", "Tool"] },
        { name: "Treat", icon: "fa-magic", types: ["Serum", "Toner"] },
        { name: "Moisturize", icon: "fa-pump-soap", types: ["Lotion", "Cream", "Butter", "Oil"] },
        { name: "Protect", icon: "fa-sun", types: ["Sunscreen"] }
    ];

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            ${steps.map(step => {
                const available = PRODUCTS.filter(p => p.routineSteps && p.routineSteps.includes(step.name));
                const currentSelectedId = selectedRoutineSteps[step.name];
                const selectedProd = PRODUCTS.find(p => p.id === currentSelectedId);

                return `
                    <div style="background: var(--surface-color); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--accent-color); font-weight: 600; margin-bottom: 1rem;">
                            <i class="fas ${step.icon}"></i> STEP: ${step.name.toUpperCase()}
                        </div>

                        ${selectedProd ? `
                            <div style="text-align: center;">
                                <img src="${selectedProd.images[0]}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 12px; margin-bottom: 0.5rem;">
                                <div style="font-weight: 500; font-size: 0.95rem; margin-bottom: 0.2rem;">${selectedProd.name}</div>
                                <div style="color: var(--accent-color); font-weight: 700; margin-bottom: 0.5rem;">${STORE_CONFIG.currencySymbol}${formatMoney(selectedProd.price)}</div>
                                <button class="btn-quiz-back change-step-btn" data-step="${step.name}" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">Change</button>
                            </div>
                        ` : `
                            <select class="filter-select step-select" data-step="${step.name}" style="width: 100%;">
                                <option value="">Select ${step.name} product...</option>
                                ${available.map(p => `<option value="${p.id}">${p.name} - ${STORE_CONFIG.currencySymbol}${formatMoney(p.price)}</option>`).join('')}
                            </select>
                        `}
                    </div>
                `;
            }).join('')}
        </div>

        <div style="text-align: center;">
            <button id="add-entire-routine-btn" class="btn-start-quiz" style="display: inline-flex;">
                <i class="fas fa-shopping-bag"></i> Add Selected Routine to Cart
            </button>
        </div>
    `;

    // Bind dropdown change handlers
    container.querySelectorAll('.step-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
            const stepName = sel.getAttribute('data-step');
            selectedRoutineSteps[stepName] = e.target.value || null;
            renderRoutineBuilder();
        });
    });

    container.querySelectorAll('.change-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const stepName = btn.getAttribute('data-step');
            selectedRoutineSteps[stepName] = null;
            renderRoutineBuilder();
        });
    });

    const addEntireBtn = document.getElementById('add-entire-routine-btn');
    if (addEntireBtn) {
        addEntireBtn.addEventListener('click', () => {
            let addedCount = 0;
            Object.values(selectedRoutineSteps).forEach(id => {
                if (id) {
                    addToCart(id);
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                const cartSidebar = document.getElementById('cart-sidebar');
                const cartOverlay = document.getElementById('cart-overlay');
                if (cartSidebar && cartOverlay) {
                    cartSidebar.classList.add('open');
                    cartOverlay.classList.add('show');
                }
            }
        });
    }
};
