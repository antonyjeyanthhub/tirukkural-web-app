// Frontend JavaScript for Tirukkural App
document.addEventListener('DOMContentLoaded', function() {
    const loadBtn = document.getElementById('loadBtn');
    const status = document.getElementById('status');
    const content = document.getElementById('content');
    
    // Pagination variables
    let allKurals = [];
    let currentPage = 1;
    const kuralsPerPage = 10;
    
    // Load button click handler
    loadBtn.addEventListener('click', loadTirukkural);
    
    async function loadTirukkural() {
        try {
            // Update UI for loading state
            loadBtn.disabled = true;
            loadBtn.textContent = 'Loading...';
            showStatus('Loading Tirukkural data...', 'loading');
            
            // Fetch data from our API endpoint
            const response = await fetch('/api/tirukkural');
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to load data');
            }
            
            // Store all kurals for pagination
            allKurals = result.data;
            currentPage = 1;
            
            // Display the first page
            displayCurrentPage();
            showStatus(`Successfully loaded ${result.count} kurals!`, 'success');
            
        } catch (error) {
            console.error('Error loading Tirukkural:', error);
            showStatus(`Error: ${error.message}`, 'error');
            content.innerHTML = `
                <div class="error-message">
                    <h3>Oops! Something went wrong</h3>
                    <p>${error.message}</p>
                    <p>Please check the console for more details.</p>
                </div>
            `;
        } finally {
            // Reset button
            loadBtn.disabled = false;
            loadBtn.textContent = 'Reload Tirukkural';
        }
    }
    
    function displayCurrentPage() {
        const totalPages = Math.ceil(allKurals.length / kuralsPerPage);
        const startIndex = (currentPage - 1) * kuralsPerPage;
        const endIndex = startIndex + kuralsPerPage;
        const currentKurals = allKurals.slice(startIndex, endIndex);
        
        let html = `
            <div class="data-header">
                <h2>திருக்குறள் - Tirukkural</h2>
                <p class="data-count">Total Kurals: ${allKurals.length}</p>
                <p class="page-info">Page ${currentPage} of ${totalPages} (Showing kurals ${startIndex + 1}-${Math.min(endIndex, allKurals.length)})</p>
            </div>
        `;
        
        // Display kurals for current page
        for (let i = 0; i < currentKurals.length; i++) {
            const kural = currentKurals[i];
            html += formatCouplet(kural, startIndex + i + 1);
        }
        
        // Add pagination controls
        html += createPaginationControls(totalPages);
        
        content.innerHTML = html;
        
        // Add event listeners for pagination buttons
        addPaginationEventListeners(totalPages);
        
        // Scroll to top when changing pages
        content.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    function createPaginationControls(totalPages) {
        if (totalPages <= 1) return '';
        
        let html = `<div class="pagination-container">`;
        
        // Previous button
        html += `<button class="pagination-btn" id="prevBtn" ${currentPage <= 1 ? 'disabled' : ''}>
            ← Previous
        </button>`;
        
        // Page numbers (show current page and nearby pages)
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        if (startPage > 1) {
            html += `<button class="pagination-btn page-num" data-page="1">1</button>`;
            if (startPage > 2) {
                html += `<span class="pagination-dots">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="pagination-btn page-num ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="pagination-dots">...</span>`;
            }
            html += `<button class="pagination-btn page-num" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        // Next button
        html += `<button class="pagination-btn" id="nextBtn" ${currentPage >= totalPages ? 'disabled' : ''}>
            Next →
        </button>`;
        
        html += `</div>`;
        return html;
    }
    
    function addPaginationEventListeners(totalPages) {
        // Previous button
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayCurrentPage();
                }
            });
        }
        
        // Next button
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    displayCurrentPage();
                }
            });
        }
        
        // Page number buttons
        const pageNumBtns = document.querySelectorAll('.page-num');
        pageNumBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (page !== currentPage) {
                    currentPage = page;
                    displayCurrentPage();
                }
            });
        });
    }
    
    function formatCouplet(couplet, index) {
        // Extract data from your specific JSON structure
        const number = couplet.kural?.number || index;
        const part = couplet.part?.name_ta || '';
        const partEn = couplet.part?.name_en || '';
        
        // Join the two Tamil lines with a line break
        const tamilLines = couplet.kural?.lines_ta || [];
        const tamilText = tamilLines.join('<br>');
        
        // Get prose and explanation in Tamil
        const proseTa = couplet.kural?.prose_ta || '';
        const vilakkamTa = couplet.kural?.vilakkam_ta || '';
        
        return `
            <div class="couplet">
                <div class="couplet-header">
                    <div class="couplet-number">குறள் ${number}</div>
                    ${part ? `<div class="couplet-part">${part} (${partEn})</div>` : ''}
                </div>
                <div class="couplet-tamil">${tamilText}</div>
                ${proseTa ? `<div class="couplet-prose">
                    <strong>உரை:</strong> ${proseTa}
                </div>` : ''}
                ${vilakkamTa ? `<div class="couplet-explanation">
                    <strong>விளக்கம்:</strong> ${vilakkamTa}
                </div>` : ''}
            </div>
        `;
    }
    
    function showStatus(message, type = '') {
        status.textContent = message;
        status.className = `status ${type}`;
        
        // Auto-clear success/error messages after 5 seconds
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                status.textContent = '';
                status.className = 'status';
            }, 5000);
        }
    }
});
