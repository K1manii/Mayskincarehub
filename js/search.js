/**
 * MAY SKINCARE HUB - Enhanced Search Engine
 * Multi-attribute search supporting matching across Name, Category, Subcategory,
 * Product Type, Description, Ingredients, Benefits, Skin Types, Skin Concerns, and Tags.
 */

const executeSearch = (queryRaw) => {
    const query = queryRaw ? queryRaw.toLowerCase().trim() : '';

    const searchResultsSection = document.getElementById('search-results-section');
    const searchResultsGrid = document.getElementById('search-results-grid');
    const searchNoResults = document.getElementById('search-no-results');
    const searchResultsTitle = document.getElementById('search-results-title');

    const clearBtnDesktop = document.getElementById('clear-search');
    const clearBtnMobile = document.getElementById('clear-search-mobile');

    const categorySections = [
        document.getElementById('best-sellers-section'),
        document.getElementById('new-arrivals-section'),
        document.getElementById('sale-section'),
        document.getElementById('body-care-section'),
        document.getElementById('fragrances-section'),
        document.getElementById('face-care-section'),
        document.getElementById('butters-oils-section'),
        document.getElementById('sun-care-section'),
        document.getElementById('health-wellness-section')
    ];

    if (!query) {
        if (searchResultsSection) searchResultsSection.style.display = 'none';
        categorySections.forEach(sec => {
            if (sec) sec.style.display = 'block';
        });
        if (clearBtnDesktop) clearBtnDesktop.style.display = 'none';
        if (clearBtnMobile) clearBtnMobile.style.display = 'none';
        return [];
    }

    if (clearBtnDesktop) clearBtnDesktop.style.display = 'flex';
    if (clearBtnMobile) clearBtnMobile.style.display = 'flex';

    // Hide standard category sections when search query is active
    categorySections.forEach(sec => {
        if (sec) sec.style.display = 'none';
    });

    if (searchResultsSection) searchResultsSection.style.display = 'block';

    const matchingProducts = PRODUCTS.filter(product => {
        const nameMatch = product.name && product.name.toLowerCase().includes(query);
        const categoryMatch = product.category && product.category.toLowerCase().includes(query);
        const subcategoryMatch = product.subcategory && product.subcategory.toLowerCase().includes(query);
        const productTypeMatch = product.productType && product.productType.toLowerCase().includes(query);
        const descriptionMatch = product.description && product.description.toLowerCase().includes(query);
        
        const ingredientsMatch = product.ingredients && product.ingredients.some(ing => ing.toLowerCase().includes(query));
        const benefitsMatch = product.benefits && product.benefits.some(b => b.toLowerCase().includes(query));
        const skinTypesMatch = product.skinTypes && product.skinTypes.some(st => st.toLowerCase().includes(query));
        const skinConcernsMatch = product.skinConcerns && product.skinConcerns.some(sc => sc.toLowerCase().includes(query));
        const tagsMatch = product.tags && product.tags.some(t => t.toLowerCase().includes(query));

        return nameMatch || categoryMatch || subcategoryMatch || productTypeMatch ||
               descriptionMatch || ingredientsMatch || benefitsMatch ||
               skinTypesMatch || skinConcernsMatch || tagsMatch;
    });

    if (searchResultsGrid) {
        if (matchingProducts.length === 0) {
            searchResultsGrid.innerHTML = '';
            if (searchResultsTitle) searchResultsTitle.style.display = 'none';
            if (searchNoResults) searchNoResults.style.display = 'block';
        } else {
            if (searchNoResults) searchNoResults.style.display = 'none';
            if (searchResultsTitle) {
                searchResultsTitle.style.display = 'block';
                searchResultsTitle.textContent = `Search Results (${matchingProducts.length})`;
            }
            renderProductGrid(matchingProducts, searchResultsGrid);
        }
    }

    return matchingProducts;
};
