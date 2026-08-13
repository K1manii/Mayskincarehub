/**
 * MAY SKINCARE HUB - Store Configuration
 * Centralized settings for company branding, contact details, currency, and WhatsApp checkout.
 */

const STORE_CONFIG = {
    companyName: "MAY SKINCARE HUB",
    whatsappNumber: "254716314057",
    email: "mayskincarehub@gmail.com",
    currency: "KSH",
    currencySymbol: "KSH ",
    storageKeys: {
        cart: "msh_cart",
        wishlist: "msh_wishlist",
        recentlyViewed: "msh_recently_viewed",
        skinProfile: "msh_skin_profile",
        quizResults: "msh_quiz_results"
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = STORE_CONFIG;
}
