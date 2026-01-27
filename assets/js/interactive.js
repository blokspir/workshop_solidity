/**
 * Blocksphere Training - Interactive Functions
 * Provides demos, timers, and interactive elements for reveal.js slides
 */

// ============================================
// HASH DEMO FUNCTIONS
// ============================================

/**
 * Computes Keccak-256 hash using ethers.js
 * Requires ethers.js to be loaded
 */
async function computeKeccakHash(input) {
    if (typeof ethers === 'undefined') {
        console.error('ethers.js not loaded');
        return 'Error: ethers.js not loaded';
    }
    
    try {
        const hash = ethers.keccak256(ethers.toUtf8Bytes(input));
        return hash;
    } catch (error) {
        console.error('Hash computation error:', error);
        return 'Error computing hash';
    }
}

/**
 * Live hash demo - updates output as user types
 */
function initHashDemo(inputId, outputId) {
    const input = document.getElementById(inputId);
    const output = document.getElementById(outputId);
    
    if (!input || !output) return;
    
    async function updateHash() {
        const value = input.value || '';
        if (value.length === 0) {
            output.textContent = 'Enter text above to see its hash...';
            output.style.opacity = '0.5';
            return;
        }
        
        const hash = await computeKeccakHash(value);
        output.textContent = hash;
        output.style.opacity = '1';
    }
    
    input.addEventListener('input', updateHash);
    updateHash(); // Initial call
}

/**
 * Hash comparison demo - shows avalanche effect
 */
function initHashComparison(input1Id, input2Id, output1Id, output2Id) {
    const input1 = document.getElementById(input1Id);
    const input2 = document.getElementById(input2Id);
    const output1 = document.getElementById(output1Id);
    const output2 = document.getElementById(output2Id);
    
    if (!input1 || !input2 || !output1 || !output2) return;
    
    async function updateHashes() {
        const hash1 = await computeKeccakHash(input1.value || '');
        const hash2 = await computeKeccakHash(input2.value || '');
        
        output1.textContent = hash1;
        output2.textContent = hash2;
        
        // Highlight differences
        highlightHashDifferences(output1, output2, hash1, hash2);
    }
    
    input1.addEventListener('input', updateHashes);
    input2.addEventListener('input', updateHashes);
    updateHashes();
}

function highlightHashDifferences(el1, el2, hash1, hash2) {
    // Simple visual indicator that hashes are different
    if (hash1 !== hash2) {
        el1.style.color = '#ef4444';
        el2.style.color = '#10b981';
    } else {
        el1.style.color = '#4a9ea4';
        el2.style.color = '#4a9ea4';
    }
}

// ============================================
// WALLET GENERATION DEMO
// ============================================

/**
 * Generate a random Ethereum wallet
 */
async function generateWallet(privateKeyId, publicKeyId, addressId) {
    if (typeof ethers === 'undefined') {
        console.error('ethers.js not loaded');
        return;
    }
    
    try {
        const wallet = ethers.Wallet.createRandom();
        
        const privateKeyEl = document.getElementById(privateKeyId);
        const publicKeyEl = document.getElementById(publicKeyId);
        const addressEl = document.getElementById(addressId);
        
        if (privateKeyEl) {
            privateKeyEl.textContent = wallet.privateKey;
            animateReveal(privateKeyEl);
        }
        if (publicKeyEl) {
            publicKeyEl.textContent = wallet.publicKey;
            animateReveal(publicKeyEl);
        }
        if (addressEl) {
            addressEl.textContent = wallet.address;
            animateReveal(addressEl);
        }
        
    } catch (error) {
        console.error('Wallet generation error:', error);
    }
}

function animateReveal(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(10px)';
    
    requestAnimationFrame(() => {
        element.style.transition = 'all 0.3s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    });
}

// ============================================
// CHALLENGE TIMER
// ============================================

let timerInterval = null;
let timerSeconds = 0;

/**
 * Start a countdown timer
 */
function startTimer(displayId, seconds, onComplete) {
    const display = document.getElementById(displayId);
    if (!display) return;
    
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerSeconds = seconds;
    updateTimerDisplay(display);
    
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay(display);
        
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            display.textContent = "TIME'S UP!";
            display.style.animation = 'pulse 0.5s infinite';
            
            if (typeof onComplete === 'function') {
                onComplete();
            }
        }
        
        // Warning at 30 seconds
        if (timerSeconds === 30) {
            display.style.color = '#f59e0b';
        }
        
        // Danger at 10 seconds
        if (timerSeconds <= 10) {
            display.style.color = '#ef4444';
        }
    }, 1000);
}

function updateTimerDisplay(display) {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Stop the current timer
 */
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

/**
 * Reset timer to initial state
 */
function resetTimer(displayId, seconds) {
    stopTimer();
    const display = document.getElementById(displayId);
    if (display) {
        timerSeconds = seconds;
        updateTimerDisplay(display);
        display.style.color = '';
        display.style.animation = '';
    }
}

// ============================================
// REVEAL ANSWER FUNCTIONALITY
// ============================================

/**
 * Initialize all reveal-answer elements
 */
function initRevealAnswers() {
    const revealElements = document.querySelectorAll('.reveal-answer');
    
    revealElements.forEach(el => {
        el.addEventListener('click', function() {
            this.classList.toggle('revealed');
        });
    });
}

/**
 * Reveal a specific answer by ID
 */
function revealAnswer(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('revealed');
    }
}

/**
 * Hide a specific answer by ID
 */
function hideAnswer(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('revealed');
    }
}

/**
 * Reveal all answers on the current slide
 */
function revealAllAnswers() {
    const currentSlide = Reveal.getCurrentSlide();
    if (currentSlide) {
        currentSlide.querySelectorAll('.reveal-answer').forEach(el => {
            el.classList.add('revealed');
        });
    }
}

// ============================================
// COPY TO CLIPBOARD
// ============================================

/**
 * Copy code block content to clipboard
 */
function copyCode(buttonElement) {
    const codeBlock = buttonElement.closest('.code-block');
    const code = codeBlock ? codeBlock.querySelector('code') : null;
    
    if (!code) return;
    
    navigator.clipboard.writeText(code.textContent).then(() => {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Copied!';
        buttonElement.style.background = '#10b981';
        
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        buttonElement.textContent = 'Failed';
    });
}

/**
 * Initialize all copy buttons
 */
function initCopyButtons() {
    document.querySelectorAll('.code-copy-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            copyCode(this);
        });
    });
}

// ============================================
// SCOREBOARD
// ============================================

let scores = {
    hacker: 0,
    security: 0
};

/**
 * Update team score
 */
function updateScore(team, points) {
    if (scores.hasOwnProperty(team)) {
        scores[team] += points;
        updateScoreDisplay();
    }
}

/**
 * Set team score to specific value
 */
function setScore(team, points) {
    if (scores.hasOwnProperty(team)) {
        scores[team] = points;
        updateScoreDisplay();
    }
}

/**
 * Reset all scores
 */
function resetScores() {
    scores.hacker = 0;
    scores.security = 0;
    updateScoreDisplay();
}

function updateScoreDisplay() {
    const hackerDisplay = document.getElementById('score-hacker');
    const securityDisplay = document.getElementById('score-security');
    
    if (hackerDisplay) {
        animateNumber(hackerDisplay, scores.hacker);
    }
    if (securityDisplay) {
        animateNumber(securityDisplay, scores.security);
    }
}

function animateNumber(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const diff = targetValue - currentValue;
    const duration = 500;
    const steps = 20;
    const stepValue = diff / steps;
    let step = 0;
    
    const interval = setInterval(() => {
        step++;
        const newValue = Math.round(currentValue + (stepValue * step));
        element.textContent = newValue;
        
        if (step >= steps) {
            clearInterval(interval);
            element.textContent = targetValue;
        }
    }, duration / steps);
}

// ============================================
// PROGRESS TRACKER
// ============================================

/**
 * Mark a progress item as complete
 */
function markComplete(itemId) {
    const item = document.getElementById(itemId);
    if (item) {
        item.classList.remove('current');
        item.classList.add('completed');
    }
}

/**
 * Set the current progress item
 */
function setCurrent(itemId) {
    // Remove current from all items
    document.querySelectorAll('.progress-item.current').forEach(el => {
        el.classList.remove('current');
    });
    
    const item = document.getElementById(itemId);
    if (item && !item.classList.contains('completed')) {
        item.classList.add('current');
    }
}

// ============================================
// MERMAID DIAGRAM INITIALIZATION
// ============================================

/**
 * Initialize Mermaid diagrams
 */
function initMermaid() {
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'base',
            themeVariables: {
                primaryColor: '#4a9ea4',
                primaryTextColor: '#043854',
                primaryBorderColor: '#043854',
                lineColor: '#4a9ea4',
                secondaryColor: '#ffffff',
                tertiaryColor: '#f8fafc'
            },
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }
        });
    }
}

// ============================================
// MERKLE TREE ANIMATION
// ============================================

let merkleAnimationStep = 0;

/**
 * Animate Merkle tree building step by step
 */
function animateMerkleTree(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const steps = container.querySelectorAll('.merkle-step');
    
    if (merkleAnimationStep < steps.length) {
        steps[merkleAnimationStep].classList.add('visible');
        merkleAnimationStep++;
    }
}

/**
 * Reset Merkle tree animation
 */
function resetMerkleAnimation(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    merkleAnimationStep = 0;
    container.querySelectorAll('.merkle-step').forEach(step => {
        step.classList.remove('visible');
    });
}

// ============================================
// BUG HIGHLIGHTING
// ============================================

/**
 * Highlight a bug in code
 */
function highlightBug(codeBlockId, lineNumber) {
    const codeBlock = document.getElementById(codeBlockId);
    if (!codeBlock) return;
    
    const lines = codeBlock.querySelectorAll('.code-line');
    if (lines[lineNumber - 1]) {
        lines[lineNumber - 1].classList.add('bug-highlight');
    }
}

/**
 * Clear all bug highlights
 */
function clearBugHighlights(codeBlockId) {
    const codeBlock = document.getElementById(codeBlockId);
    if (!codeBlock) return;
    
    codeBlock.querySelectorAll('.bug-highlight').forEach(line => {
        line.classList.remove('bug-highlight');
    });
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize all interactive elements when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    initRevealAnswers();
    initCopyButtons();
    initMermaid();
    
    // Initialize any hash demos on the page
    if (document.getElementById('hash-input')) {
        initHashDemo('hash-input', 'hash-output');
    }
});

/**
 * Re-initialize when Reveal.js changes slides
 */
if (typeof Reveal !== 'undefined') {
    Reveal.on('slidechanged', function(event) {
        // Reset timers when changing slides
        stopTimer();
        
        // Re-init any interactive elements on new slide
        const currentSlide = event.currentSlide;
        if (currentSlide) {
            // Initialize hash demos on this slide
            const hashInput = currentSlide.querySelector('[data-hash-input]');
            const hashOutput = currentSlide.querySelector('[data-hash-output]');
            if (hashInput && hashOutput) {
                initHashDemo(hashInput.id, hashOutput.id);
            }
        }
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format large numbers with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return '$' + formatNumber(amount);
}

/**
 * Truncate hash for display
 */
function truncateHash(hash, startChars = 6, endChars = 4) {
    if (hash.length <= startChars + endChars + 3) {
        return hash;
    }
    return hash.substring(0, startChars) + '...' + hash.substring(hash.length - endChars);
}

// Export functions for use in HTML onclick handlers
window.BlocksphereDemos = {
    computeKeccakHash,
    initHashDemo,
    initHashComparison,
    generateWallet,
    startTimer,
    stopTimer,
    resetTimer,
    revealAnswer,
    hideAnswer,
    revealAllAnswers,
    copyCode,
    updateScore,
    setScore,
    resetScores,
    markComplete,
    setCurrent,
    animateMerkleTree,
    resetMerkleAnimation,
    highlightBug,
    clearBugHighlights,
    formatNumber,
    formatCurrency,
    truncateHash
};
