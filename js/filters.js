/**
 * MAY SKINCARE HUB - Filters & Sorting Engine
 * Filters products by Category, Skin Type, Skin Concern, Product Type, and Price Range.
 * Sorts derived arrays by Featured, Best Sellers, Newest, Price, Rating, and A-Z.
 */

let currentFilters = {
    category: "all",
    skinType: "all",
    skinConcern: "all",
    productType: "all",
    priceRange: "all",
    sortBy: "featured"
};

const applyFiltersAndSort = (productsList = PRODUCTS) => {
    let result = [...productsList];

    // 1. Category Filter
    if (currentFilters.category !== "all") {
        result = result.filter(p => p.category === currentFilters.category);
    }

    // 2. Skin Type Filter
    if (currentFilters.skinType !== "all") {
        result = result.filter(p => p.skinTypes && p.skinTypes.includes(currentFilters.skinType));
    }

    // 3. Skin Concern Filter
    if (currentFilters.skinConcern !== "all") {
        result = result.filter(p => p.skinConcerns && p.skinConcerns.includes(currentFilters.skinConcern));
    }

    // 4. Product Type Filter
    if (currentFilters.productType !== "all") {
        result = result.filter(p => p.productType === currentFilters.productType);
    }

    // 5. Price Range Filter
    if (currentFilters.priceRange !== "all") {
        if (currentFilters.priceRange === "under-500") {
            result = result.filter(p => p.price < 500);
        } else if (currentFilters.priceRange === "500-1000") {
            result = result.filter(p => p.price >= 500 && p.price <= 1000);
        } else if (currentFilters.priceRange === "1000-2000") {
            result = result.filter(p => p.price > 1000 && p.price <= 2000);
        } else if (currentFilters.priceRange === "above-2000") {
            result = result.filter(p => p.price > 2000);
        }
    }

    // 6. Sorting
    switch (currentFilters.sortBy) {
        case "price-low-high":
            result.sort((a, b) => a.price - b.price);
            break;
        case "price-high-low":
            result.sort((a, b) => b.price - a.price);
            break;
        case "best-sellers":
            result.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
            break;
        case "newest":
            result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
            break;
        case "highest-rated":
            result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case "a-z":
            result.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "featured":
        default:
            // Keep original sequence
            break;
    }

    return result;
};

const resetFilters = () => {
    currentFilters = {
        category: "all",
        skinType: "all",
        skinConcern: "all",
        productType: "all",
        priceRange: "all",
        sortBy: "featured"
    };

    // Reset dropdown UI elements
    const filterCategory = document.getElementById('filter-category');
    const filterSkinType = document.getElementById('filter-skin-type');
    const filterSkinConcern = document.getElementById('filter-skin-concern');
    const filterProductType = document.getElementById('filter-product-type');
    const filterPrice = document.getElementById('filter-price');
    const sortSelect = document.getElementById('sort-by');

    if (filterCategory) filterCategory.value = "all";
    if (filterSkinType) filterSkinType.value = "all";
    if (filterSkinConcern) filterSkinConcern.value = "all";
    if (filterProductType) filterProductType.value = "all";
    if (filterPrice) filterPrice.value = "all";
    if (sortSelect) sortSelect.value = "featured";
};
