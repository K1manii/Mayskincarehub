/**
 * MAY SKINCARE HUB - Skincare Routines Dataset
 * Reusable routine definitions dynamically linking to product catalogue attributes.
 */

const ROUTINES = [
    {
        id: "face-care-routine",
        name: "Essential Face Care Routine",
        category: "Face Care",
        steps: [
            { stepName: "Cleanse", productType: ["Soap", "Shower Gel", "Tool"] },
            { stepName: "Treat", productType: ["Serum", "Toner"] },
            { stepName: "Moisturize", productType: ["Cream", "Gel"] },
            { stepName: "Protect", productType: ["Sunscreen"] }
        ]
    },
    {
        id: "body-care-routine",
        name: "Nourishing Body Care Routine",
        category: "Body Care",
        steps: [
            { stepName: "Cleanse", productType: ["Scrub", "Shower Gel", "Soap"] },
            { stepName: "Moisturize", productType: ["Lotion", "Oil", "Cream", "Butter"] }
        ]
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ROUTINES;
}
