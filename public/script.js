// Frontend JavaScript for Tirukkural App
document.addEventListener('DOMContentLoaded', function() {
    const loadBtn = document.getElementById('loadBtn');
    const status = document.getElementById('status');
    const content = document.getElementById('content');
    
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
            
            // Display the data
            displayTirukkural(result.data, result.count);
            showStatus(`Successfully loaded ${result.count} couplets!`, 'success');
            
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
    
    function displayTirukkural(data, count) {
        let html = `<div class="data-header">
            <h2>திருக்குறள் - Tirukkural</h2>
            <p class="data-count">Total Kurals: ${count}</p>
        </div>`;
        
        // Your data is already an array of couplets
        const couplets = Array.isArray(data) ? data : [data];
        
        // Display first 10 couplets for MVP (easier to read)
        const displayCount = Math.min(couplets.length, 10);
        
        for (let i = 0; i < displayCount; i++) {
            const couplet = couplets[i];
            html += formatCouplet(couplet, i + 1);
        }
        
        if (couplets.length > 10) {
            html += `<div class="load-more">
                <p>Showing first 10 of ${couplets.length} kurals</p>
                <small>பின்னர் மேலும் குறள்கள் காட்டப்படும்!</small>
            </div>`;
        }
        
        content.innerHTML = html;
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
