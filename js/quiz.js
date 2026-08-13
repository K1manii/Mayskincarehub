/**
 * MAY SKINCARE HUB - Skincare Quiz Engine
 * Multi-step interactive 7-question skincare quiz.
 * Captures user skin type, concerns, goals, routine type, product count, budget, and preferences.
 */

let currentQuizStep = 0;
let quizAnswers = {
    skinType: null,
    skinConcern: [],
    skincareGoal: null,
    routineType: null,
    productCount: null,
    budget: null,
    productTypePref: null
};

const QUIZ_QUESTIONS = [
    {
        id: "skinType",
        title: "What is your skin type?",
        type: "single",
        options: [
            { label: "Normal", value: "Normal" },
            { label: "Dry", value: "Dry" },
            { label: "Oily", value: "Oily" },
            { label: "Combination", value: "Combination" },
            { label: "Sensitive", value: "Sensitive" },
            { label: "I'm not sure", value: "Not Sure" }
        ]
    },
    {
        id: "skinConcern",
        title: "What is your main skin concern?",
        type: "multi",
        options: [
            { label: "Acne", value: "Acne" },
            { label: "Dark Spots", value: "Dark Spots" },
            { label: "Hyperpigmentation", value: "Hyperpigmentation" },
            { label: "Dryness", value: "Dryness" },
            { label: "Dullness / Dull Skin", value: "Dull Skin" },
            { label: "Uneven Skin Tone", value: "Uneven Skin Tone" },
            { label: "Signs of Aging", value: "Aging" },
            { label: "Sun Protection", value: "Sun Protection" }
        ]
    },
    {
        id: "skincareGoal",
        title: "What is your primary skincare goal?",
        type: "single",
        options: [
            { label: "Hydration & Moisture", value: "Hydration" },
            { label: "Radiant Glow", value: "Glow" },
            { label: "Even-Looking Skin Tone", value: "Even Tone" },
            { label: "Clearer-Looking Skin", value: "Clear Skin" },
            { label: "Oil Control", value: "Oil Control" },
            { label: "Smoother Texture", value: "Smoothing" }
        ]
    },
    {
        id: "routineType",
        title: "What type of routine are you looking for?",
        type: "single",
        options: [
            { label: "Simple Routine", value: "Simple" },
            { label: "Full Routine", value: "Full" },
            { label: "Body Care Routine", value: "Body Care" },
            { label: "Face Care Routine", value: "Face Care" },
            { label: "Face + Body Combo", value: "Face + Body" }
        ]
    },
    {
        id: "productCount",
        title: "How many products do you prefer in your routine?",
        type: "single",
        options: [
            { label: "1–2 Essential Products", value: "1-2" },
            { label: "3 Core Products", value: "3" },
            { label: "4–5 Complete Products", value: "4-5" },
            { label: "Complete Routine", value: "Complete" }
        ]
    },
    {
        id: "budget",
        title: "What is your approximate budget preference? (Optional)",
        type: "single",
        options: [
            { label: "Under KSH 1,000", value: "under-1000" },
            { label: "KSH 1,000 – 2,000", value: "1000-2000" },
            { label: "KSH 2,000 – 3,500", value: "2000-3500" },
            { label: "KSH 3,500+", value: "above-3500" },
            { label: "Any Budget", value: "any" }
        ]
    },
    {
        id: "productTypePref",
        title: "What product types do you prefer most?",
        type: "single",
        options: [
            { label: "Serums", value: "Serum" },
            { label: "Creams", value: "Cream" },
            { label: "Lotions", value: "Lotion" },
            { label: "Oils & Butters", value: "Oil" },
            { label: "Scrubs & Exfoliators", value: "Scrub" },
            { label: "Sunscreens", value: "Sunscreen" },
            { label: "Any / All Types", value: "Any" }
        ]
    }
];

const openQuizModal = () => {
    currentQuizStep = 0;
    quizAnswers = {
        skinType: null,
        skinConcern: [],
        skincareGoal: null,
        routineType: null,
        productCount: null,
        budget: null,
        productTypePref: null
    };

    const modalOverlay = document.getElementById('quiz-modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.add('show');
        renderQuizStep();
    }
};

const closeQuizModal = () => {
    const modalOverlay = document.getElementById('quiz-modal-overlay');
    if (modalOverlay) modalOverlay.classList.remove('show');
};

const renderQuizStep = () => {
    const container = document.getElementById('quiz-modal-content');
    if (!container) return;

    const question = QUIZ_QUESTIONS[currentQuizStep];
    const totalSteps = QUIZ_QUESTIONS.length;
    const progressPercent = Math.round(((currentQuizStep + 1) / totalSteps) * 100);

    container.innerHTML = `
        <div class="quiz-card">
            <button class="close-modal" id="close-quiz-modal" style="position: absolute; top: 1.5rem; right: 1.5rem;"><i class="fas fa-times"></i></button>

            <div class="quiz-progress-wrapper">
                <div class="quiz-progress-text">
                    <span>QUESTION ${currentQuizStep + 1} OF ${totalSteps}</span>
                    <span>${progressPercent}% COMPLETE</span>
                </div>
                <div class="quiz-progress-bar">
                    <div class="quiz-progress-fill" style="width: ${progressPercent}%;"></div>
                </div>
            </div>

            <h3 class="quiz-question-title">${question.title}</h3>

            <div class="quiz-options-grid" id="quiz-options-container">
                ${question.options.map(opt => {
                    let isSelected = false;
                    if (question.type === 'single') {
                        isSelected = quizAnswers[question.id] === opt.value;
                    } else if (question.type === 'multi') {
                        isSelected = quizAnswers[question.id] && quizAnswers[question.id].includes(opt.value);
                    }

                    return `
                        <div class="quiz-option-card ${isSelected ? 'selected' : ''}" data-value="${opt.value}">
                            ${opt.label}
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="quiz-nav-btns">
                <button class="quiz-nav-btn btn-quiz-back" id="quiz-back-btn" ${currentQuizStep === 0 ? 'style="visibility: hidden;"' : ''}>
                    <i class="fas fa-arrow-left"></i> Back
                </button>

                <button class="quiz-nav-btn btn-quiz-next" id="quiz-next-btn">
                    ${currentQuizStep === totalSteps - 1 ? 'See Recommendations <i class="fas fa-sparkles"></i>' : 'Next <i class="fas fa-arrow-right"></i>'}
                </button>
            </div>
        </div>
    `;

    // Bind option click handlers
    const optionsContainer = document.getElementById('quiz-options-container');
    if (optionsContainer) {
        optionsContainer.querySelectorAll('.quiz-option-card').forEach(card => {
            card.addEventListener('click', () => {
                const val = card.getAttribute('data-value');
                if (question.type === 'single') {
                    quizAnswers[question.id] = val;
                    optionsContainer.querySelectorAll('.quiz-option-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                } else if (question.type === 'multi') {
                    if (!quizAnswers[question.id]) quizAnswers[question.id] = [];
                    const idx = quizAnswers[question.id].indexOf(val);
                    if (idx > -1) {
                        quizAnswers[question.id].splice(idx, 1);
                        card.classList.remove('selected');
                    } else {
                        quizAnswers[question.id].push(val);
                        card.classList.add('selected');
                    }
                }
            });
        });
    }

    // Navigation buttons
    const backBtn = document.getElementById('quiz-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (currentQuizStep > 0) {
                currentQuizStep--;
                renderQuizStep();
            }
        });
    }

    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentQuizStep < totalSteps - 1) {
                currentQuizStep++;
                renderQuizStep();
            } else {
                finishQuizAndShowResults();
            }
        });
    }

    const closeBtn = document.getElementById('close-quiz-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeQuizModal);
};

const finishQuizAndShowResults = () => {
    // Save quiz answers to localStorage
    try {
        localStorage.setItem(STORE_CONFIG.storageKeys.skinProfile, JSON.stringify(quizAnswers));
    } catch (e) {
        console.error("Error saving quiz profile", e);
    }

    closeQuizModal();
    generateAndDisplayRecommendations(quizAnswers);
};
