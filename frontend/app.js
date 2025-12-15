// ============================================
// Ditto Insurance Analytics - Frontend Application
// ============================================
// This application provides an interactive dashboard for:
// - Viewing insurance plans and ratings
// - Filtering by company and rating ranges
// - Interactive charts and visualizations
// - Paginated data tables
// ============================================

// ============================================
// API Configuration
// ============================================
// Version: 1.0.0 - Cache busting version
// Always use relative path - nginx will proxy /api/* to the API service
// This works both in Kubernetes and with port-forwarding
const API_BASE_URL = '/api';

// ============================================
// Chart Instances
// ============================================
// Global chart objects for Chart.js visualizations
let ratingChart = null;              // Rating Distribution (pie chart)
let companyRatingChart = null;        // Top Companies by Average Rating (bar chart)
let companyDistributionChart = null;  // Plans per Company (bar chart)

// ============================================
// Chart.js Theme Configuration
// ============================================
// Dark theme colors for all charts
Chart.defaults.color = '#cbd5e1';           // Text color
Chart.defaults.borderColor = '#334155';     // Border color
Chart.defaults.backgroundColor = '#1e293b'; // Background color

// ============================================
// Application Initialization
// ============================================
// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    showLoading();
    
    // Load saved filters from sessionStorage FIRST (synchronous)
    // Filters persist only within the same browser tab/window
    loadFilters();
    
    // Log loaded filters immediately and verify they're in sessionStorage
    console.log('🔍 After loadFilters() - Rating:', currentRatingFilter, 'Company:', currentCompanyFilter);
    const verifyRating = sessionStorage.getItem(STORAGE_KEYS.RATING_FILTER);
    const verifyCompany = sessionStorage.getItem(STORAGE_KEYS.COMPANY_FILTER);
    console.log('🔍 sessionStorage verification - Rating:', verifyRating, 'Company:', verifyCompany);
    
    // Load data in sequence to ensure filters are preserved
    console.log('📊 Starting loadStatistics() with filters - Rating:', currentRatingFilter);
    await loadStatistics();
    console.log('📊 After loadStatistics() - Rating:', currentRatingFilter);
    
    console.log('📊 Starting loadTopPlans() with filters - Rating:', currentRatingFilter);
    await loadTopPlans();
    console.log('📊 After loadTopPlans() - Rating:', currentRatingFilter);
    
    console.log('📊 Starting loadAllData() with filters - Rating:', currentRatingFilter);
    await loadAllData();
    console.log('📊 After loadAllData() - Rating:', currentRatingFilter);
    
    // Set up filter handlers
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Set up pagination handlers for top plans
    document.getElementById('topPlansPrev').addEventListener('click', () => {
        if (currentTopPlansPage > 1) {
            goToTopPlansPage(currentTopPlansPage - 1);
        }
    });
    
    document.getElementById('topPlansNext').addEventListener('click', () => {
        const totalPages = Math.ceil(allTopPlans.length / topPlansPerPage);
        if (currentTopPlansPage < totalPages) {
            goToTopPlansPage(currentTopPlansPage + 1);
        }
    });
    
    // Set up records per page selector for top plans
    document.getElementById('topPlansPerPage').addEventListener('change', (e) => {
        topPlansPerPage = parseInt(e.target.value);
        currentTopPlansPage = 1; // Reset to first page
        renderTopPlansPage();
    });
    
    // Set up pagination handlers for data table
    document.getElementById('dataTablePrev').addEventListener('click', () => {
        if (currentDataTablePage > 1) {
            goToDataTablePage(currentDataTablePage - 1);
        }
    });
    
    document.getElementById('dataTableNext').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / dataTablePerPage);
        if (currentDataTablePage < totalPages) {
            goToDataTablePage(currentDataTablePage + 1);
        }
    });
    
    // Set up records per page selector for data table
    document.getElementById('dataTablePerPage').addEventListener('change', (e) => {
        dataTablePerPage = parseInt(e.target.value);
        currentDataTablePage = 1; // Reset to first page
        renderDataTablePage();
    });
});

// Show loading state
function showLoading() {
    const containers = document.querySelectorAll('.chart-card, .table-card');
    containers.forEach(container => {
        // Remove existing loading if any
        const existing = container.querySelector('.loading');
        if (existing) existing.remove();
        
        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.textContent = 'Loading...';
        container.appendChild(loading);
    });
}

// Remove loading state
function removeLoading() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => el.remove());
}

// Load statistics and update charts
async function loadStatistics() {
    try {
        const url = `${API_BASE_URL}/statistics`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch statistics');
        
        const stats = await response.json();
        
        // Update stat cards with animation
        updateStatCard('totalPlans', stats.total_plans);
        updateStatCard('totalCompanies', stats.total_companies);
        updateStatCard('avgRating', stats.average_rating || 'N/A');
        updateStatCard('ratedPlans', stats.plans_with_ratings);
        
        // Update header with formatted date - use multiple methods to ensure it works
        if (stats.last_updated) {
            const formattedDate = formatDate(stats.last_updated);
            const dateText = `Last Updated: ${formattedDate}`;
            
            // Try multiple ways to update the element
            const updateElement = () => {
                const el = document.getElementById('lastUpdatedHeader');
                if (el) {
                    el.textContent = dateText;
                    el.innerHTML = dateText;
                    el.innerText = dateText;
                    return true;
                }
                return false;
            };
            
            // Try immediately
            if (!updateElement()) {
                // Retry with delays
                setTimeout(() => updateElement(), 50);
                setTimeout(() => updateElement(), 200);
                setTimeout(() => updateElement(), 500);
                setTimeout(() => updateElement(), 1000);
            }
        } else {
            const el = document.getElementById('lastUpdatedHeader');
            if (el) {
                el.textContent = 'Last Updated: N/A';
            }
        }
        
        // Store original data for reset
        originalCompanyDistribution = {...stats.company_distribution};
        originalTopCompanies = {...stats.top_companies_by_rating};
        originalRatingDistribution = {...stats.rating_distribution};
        
        // Update charts with dark theme - use restored filters if available
        updateRatingChart(stats.rating_distribution, currentRatingFilter); // Use restored rating filters
        updateCompanyRatingChart(stats.top_companies_by_rating);
        updateCompanyDistributionChart(stats.company_distribution, currentCompanyFilter); // Use restored company filters
        
        // Remove loading indicators after charts are rendered
        removeLoading();
        
    } catch (error) {
        console.error('Error loading statistics:', error);
        showError('Failed to load statistics. Please check if the API is running.');
        removeLoading();
        
        // Update date to show error even if stats failed
        const lastUpdatedEl = document.getElementById('lastUpdatedHeader');
        if (lastUpdatedEl) {
            lastUpdatedEl.textContent = 'Last Updated: Error';
        }
    }
}

// Format date to DD-MMM-YYYY HH:MM format in user's local timezone (e.g., 15-Dec-2025 17:44)
// Automatically converts server time to user's local timezone
function formatDate(dateString) {
    if (!dateString || dateString === 'N/A') return 'N/A';
    
    try {
        // Parse the date string (format: "2025-12-14 17:44:52" or similar)
        // JavaScript Date automatically converts to user's local timezone
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        
        // All these methods return values in the user's local timezone
        const day = date.getDate().toString().padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        // Get hours and minutes in 24-hour format (local timezone)
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'N/A';
    }
}

// Animate stat card updates
function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    
    const currentValue = element.textContent;
    if (currentValue === value.toString()) return;
    
    // Animate number change
    element.style.transform = 'scale(1.2)';
    element.style.color = '#3b82f6';
    setTimeout(() => {
        element.textContent = value;
        element.style.transform = 'scale(1)';
        element.style.color = '';
    }, 200);
}

// Helper function to draw text along a curved arc (centered and compact)
function drawTextAlongArc(ctx, text, centerX, centerY, radius, startAngle, endAngle) {
    const midAngle = (startAngle + endAngle) / 2;
    const angleRange = endAngle - startAngle;
    
    // Set font to measure text
    ctx.font = 'bold 15px Inter, sans-serif';
    const charCount = text.length;
    
    // Measure each character width to calculate total text width in pixels
    let totalTextWidth = 0;
    const charWidths = [];
    for (let i = 0; i < charCount; i++) {
        const width = ctx.measureText(text[i]).width;
        charWidths.push(width);
        totalTextWidth += width;
    }
    
    // Convert text width to angle (approximate: radius * angle = arc length)
    // Use a tighter spacing factor to make text more compact
    const textAngleSpan = (totalTextWidth / radius) * 0.8; // 0.8 factor for tighter spacing
    
    // Center the text on the arc
    const startCharAngle = midAngle - (textAngleSpan / 2);
    
    // Draw each character along the curve with proper spacing
    let currentAngle = startCharAngle;
    for (let i = 0; i < charCount; i++) {
        const char = text[i];
        const charWidth = charWidths[i];
        
        // Move to the center of this character
        const charAngle = currentAngle + (charWidth / radius / 2);
        
        // Calculate position for this character along the arc
        const charX = centerX + Math.cos(charAngle) * radius;
        const charY = centerY + Math.sin(charAngle) * radius;
        
        // Save context
        ctx.save();
        
        // Move to character position and rotate to follow the curve
        ctx.translate(charX, charY);
        ctx.rotate(charAngle + Math.PI / 2); // Perpendicular to radius
        
        // Set text properties
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw the character
        ctx.fillText(char, 0, 0);
        
        // Restore context
        ctx.restore();
        
        // Move to next character position
        currentAngle += charWidth / radius;
    }
}

// Custom plugin to display labels along the arc of pie chart segments
const arcLabelPlugin = {
    id: 'arcLabel',
    // Use afterDatasetsDraw to ensure it runs after the chart is drawn, including during animations
    afterDatasetsDraw: (chart) => {
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        
        // Check if chart has data
        if (!meta || !meta.data || meta.data.length === 0) {
            return;
        }
        
        const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        
        meta.data.forEach((arcElement, index) => {
            const value = chart.data.datasets[0].data[index];
            const label = chart.data.labels[index];
            const percentage = ((value / total) * 100).toFixed(0);
            
            // Only show label if segment is large enough (more than 2% of chart)
            if (percentage < 2) return;
            
            // Get arc properties - these are updated by Chart.js during animation
            // Access the current animated state directly from the arc element
            if (!arcElement || typeof arcElement.startAngle === 'undefined' || typeof arcElement.endAngle === 'undefined') {
                return;
            }
            
            const x = arcElement.x || chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2;
            const y = arcElement.y || chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2;
            const startAngle = arcElement.startAngle;
            const endAngle = arcElement.endAngle;
            const innerRadius = arcElement.innerRadius || 0;
            const outerRadius = arcElement.outerRadius || 0;
            
            // Skip if radius is invalid
            if (outerRadius <= 0 || innerRadius < 0) {
                return;
            }
            
            // Calculate position at the center of the segment (middle of the arc radius)
            const radius = (innerRadius + outerRadius) / 2;
            
            // Format text with singular/plural handling
            const planText = value === 1 ? 'plan' : 'plans';
            const displayText = `${value} ${planText}`;
            
            // Draw text along the curved arc using current animated positions
            drawTextAlongArc(ctx, displayText, x, y, radius, startAngle, endAngle);
        });
    }
};

// Update rating distribution pie chart with dark theme
// Always shows original distribution, highlights selected ranges in purple
function updateRatingChart(ratingData, selectedRanges = []) {
    const ctx = document.getElementById('ratingChart');
    if (!ctx) return;
    
    const canvas = ctx.getContext('2d');
    
    // Normalize selectedRanges to array
    const selectedRangesArray = Array.isArray(selectedRanges) ? selectedRanges : (selectedRanges ? [selectedRanges] : []);
    
    // Debug logging - always log to track what's being passed
    console.log('updateRatingChart: Called with selectedRanges:', selectedRanges, '-> normalized:', selectedRangesArray);
    if (selectedRangesArray.length > 0) {
        console.log('updateRatingChart: Updating chart with selected ranges:', selectedRangesArray);
    } else {
        console.log('updateRatingChart: No selected ranges - chart will show no highlights');
    }
    
    // Original colors for each rating range
    const originalColors = {
        '4.0-5.0': 'rgba(16, 185, 129, 0.8)',   // Green
        '3.0-3.9': 'rgba(59, 130, 246, 0.8)',   // Blue
        '2.0-2.9': 'rgba(245, 158, 11, 0.8)',   // Yellow
        '0.0-1.9': 'rgba(239, 68, 68, 0.8)',    // Red
        'N/A': 'rgba(100, 116, 139, 0.8)'        // Gray
    };
    const originalBorderColors = {
        '4.0-5.0': '#10b981',  // Green
        '3.0-3.9': '#3b82f6',  // Blue
        '2.0-2.9': '#f59e0b',  // Yellow
        '0.0-1.9': '#ef4444',  // Red
        'N/A': '#64748b'        // Gray
    };
    
    // Selected colors (brighter/more vibrant version of original)
    const selectedColors = {
        '4.0-5.0': 'rgba(16, 185, 129, 1.0)',   // Brighter Green
        '3.0-3.9': 'rgba(59, 130, 246, 1.0)',   // Brighter Blue
        '2.0-2.9': 'rgba(245, 158, 11, 1.0)',   // Brighter Yellow
        '0.0-1.9': 'rgba(239, 68, 68, 1.0)',    // Brighter Red
        'N/A': 'rgba(100, 116, 139, 1.0)'        // Brighter Gray
    };
    const selectedBorderColors = {
        '4.0-5.0': '#10b981',  // Green
        '3.0-3.9': '#3b82f6',  // Blue
        '2.0-2.9': '#f59e0b',  // Yellow
        '0.0-1.9': '#ef4444',  // Red
        'N/A': '#64748b'        // Gray
    };
    
    // If chart exists, update colors and data
    if (ratingChart) {
        // Prepare labels and data, ensuring N/A is last
        const labels = Object.keys(ratingData);
        const data = Object.values(ratingData);
        
        // Reorder to put N/A at the end if it exists
        const naIndex = labels.indexOf('N/A');
        let sortedLabels = [...labels];
        let sortedData = [...data];
        
        if (naIndex !== -1) {
            // Move N/A to the end
            const naLabel = sortedLabels.splice(naIndex, 1)[0];
            const naValue = sortedData.splice(naIndex, 1)[0];
            sortedLabels.push(naLabel);
            sortedData.push(naValue);
        }
        
        // Create colors array - original colors, brighter when selected
        const backgroundColors = sortedLabels.map(label => {
            const isSelected = selectedRangesArray.includes(label);
            if (selectedRangesArray.length > 0 && isSelected) {
                console.log(`updateRatingChart: Label "${label}" is selected, using brighter color`);
            }
            return isSelected ? selectedColors[label] : originalColors[label];
        });
        const borderColors = sortedLabels.map(label => {
            return selectedRangesArray.includes(label) ? selectedBorderColors[label] : originalBorderColors[label];
        });
        // Use thicker border when selected for animation effect
        const borderWidths = sortedLabels.map(label => {
            return selectedRangesArray.includes(label) ? 5 : 3;
        });
        
        console.log('updateRatingChart: Updating chart with', sortedLabels.length, 'labels,', selectedRangesArray.length, 'selected ranges');
        console.log('updateRatingChart: Selected ranges array:', selectedRangesArray);
        console.log('updateRatingChart: Background colors for labels:', sortedLabels.map((label, idx) => `${label}: ${backgroundColors[idx]}`));
        
        // Update chart data and colors
        ratingChart.data.labels = sortedLabels;
        ratingChart.data.datasets[0].data = sortedData;
        ratingChart.data.datasets[0].backgroundColor = backgroundColors;
        ratingChart.data.datasets[0].borderColor = borderColors;
        ratingChart.data.datasets[0].borderWidth = borderWidths;
        
        // ALWAYS set/re-set onClick handler to ensure it's active
        ratingChart.options.onClick = (event, elements) => {
            if (elements.length > 0) {
                const elementIndex = elements[0].index;
                const selectedRange = sortedLabels[elementIndex];
                // Toggle rating range filter
                filterByRatingRange(selectedRange);
            }
        };
        
        // Ensure plugin is registered
        if (!ratingChart.config.plugins || !ratingChart.config.plugins.includes(arcLabelPlugin)) {
            ratingChart.config.plugins = ratingChart.config.plugins || [];
            ratingChart.config.plugins.push(arcLabelPlugin);
        }
        
        // Use animation for smooth transition
        ratingChart.update({
            duration: 400,
            easing: 'easeOutQuart',
            lazy: false
        });
        return;
    }
    
    // If chart doesn't exist, create it
    // Prepare labels and data, ensuring N/A is last
    const labels = Object.keys(ratingData);
    const data = Object.values(ratingData);
    
    // Reorder to put N/A at the end if it exists
    const naIndex = labels.indexOf('N/A');
    let sortedLabels = [...labels];
    let sortedData = [...data];
    
    if (naIndex !== -1) {
        // Move N/A to the end
        const naLabel = sortedLabels.splice(naIndex, 1)[0];
        const naValue = sortedData.splice(naIndex, 1)[0];
        sortedLabels.push(naLabel);
        sortedData.push(naValue);
    }
    
    // Create colors array - original colors, brighter when selected
    console.log('updateRatingChart: Creating new chart with selected ranges:', selectedRangesArray);
    const backgroundColors = sortedLabels.map(label => {
        const isSelected = selectedRangesArray.includes(label);
        if (isSelected) {
            console.log(`updateRatingChart: Label "${label}" is selected in new chart`);
        }
        return isSelected ? selectedColors[label] : originalColors[label];
    });
    const borderColors = sortedLabels.map(label => {
        return selectedRangesArray.includes(label) ? selectedBorderColors[label] : originalBorderColors[label];
    });
    const borderWidths = sortedLabels.map(label => {
        return selectedRangesArray.includes(label) ? 5 : 3; // Thicker border when selected
    });
    
    ratingChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: sortedLabels,
            datasets: [{
                data: sortedData,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: borderWidths,
                hoverBorderWidth: 6,
                hoverOffset: 15
            }]
        },
        plugins: [arcLabelPlugin],
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        color: '#cbd5e1',
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    enabled: false // Disable tooltips since labels are now visible on chart
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 500,
                easing: 'easeOutQuart',
                onProgress: function(animation) {
                    // Force redraw during animation to update labels
                    if (ratingChart) {
                        ratingChart.draw();
                    }
                },
                onComplete: function(animation) {
                    // Ensure labels are drawn after animation completes
                    if (ratingChart) {
                        ratingChart.draw();
                    }
                }
            },
            transitions: {
                active: {
                    animation: {
                        duration: 300,
                        easing: 'easeOutQuart'
                    }
                },
                resize: {
                    animation: {
                        duration: 0
                    }
                },
                show: {
                    animation: {
                        duration: 500,
                        easing: 'easeOutQuart'
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const elementIndex = elements[0].index;
                    const selectedRange = sortedLabels[elementIndex];
                    // Toggle rating range filter
                    filterByRatingRange(selectedRange);
                }
            }
        }
    });
}

// Filter data by rating range (toggle functionality) - Optimized for performance
function filterByRatingRange(ratingRange) {
    // Toggle rating range selection
    const index = currentRatingFilter.indexOf(ratingRange);
    if (index > -1) {
        currentRatingFilter.splice(index, 1);
    } else {
        currentRatingFilter.push(ratingRange);
    }
    
    // Save filters to localStorage immediately after change
    saveFilters();
    
    // Use requestAnimationFrame to batch updates and improve performance
    requestAnimationFrame(() => {
        applyFilters();
    });
}

// Optimized filter application function - called by both rating and company filters
function applyFilters() {
    // Start with all data
    let baseData = allData;
    
    // Apply company filter first (if any) - use Set for O(1) lookup
    if (currentCompanyFilter.length > 0) {
        const companySet = new Set(currentCompanyFilter);
        baseData = baseData.filter(plan => companySet.has(plan.Company));
    }
    
    // Apply rating filter(s) - if any rating ranges selected, filter by them
    if (currentRatingFilter.length > 0) {
        // Pre-compile rating range checks for better performance
        const rangeChecks = currentRatingFilter.map(range => {
            if (range === 'N/A') {
                return (rating) => rating === null || rating === undefined || isNaN(rating);
            } else {
                const [minStr, maxStr] = range.split('-');
                const minRating = parseFloat(minStr);
                const maxRating = parseFloat(maxStr);
                const isExclusive = maxStr.includes('.9');
                const maxBound = isExclusive ? (Math.floor(maxRating) + 1) : maxRating;
                
                return (rating) => {
                    if (rating === null || rating === undefined || isNaN(rating)) {
                        return false;
                    }
                    if (isExclusive) {
                        return rating >= minRating && rating < maxBound;
                    } else {
                        return rating >= minRating && rating <= maxBound;
                    }
                };
            }
        });
        
        filteredData = baseData.filter(plan => {
            const rating = plan['Rating By Ditto'];
            return rangeChecks.some(check => check(rating));
        });
    } else {
        filteredData = [...baseData];
    }
    
    // Batch DOM updates using requestAnimationFrame
    requestAnimationFrame(() => {
        // Update tables
        currentDataTablePage = 1;
        updateDataTable();
        updateCounts();
        
        // Sort top plans (only once)
        const topFilteredPlans = [...filteredData].sort((a, b) => {
            const ratingA = a['Rating By Ditto'];
            const ratingB = b['Rating By Ditto'];
            if (ratingA === null || ratingA === undefined || isNaN(ratingA)) return 1;
            if (ratingB === null || ratingB === undefined || isNaN(ratingB)) return -1;
            return ratingB - ratingA;
        });
        
        updateTopPlansTable(topFilteredPlans);
        
        // Update charts (only the ones that need updating)
        console.log('applyFilters: Updating charts - Rating filter:', currentRatingFilter, 'Company filter:', currentCompanyFilter);
        console.log('applyFilters: originalRatingDistribution keys:', Object.keys(originalRatingDistribution));
        updateRatingChart(originalRatingDistribution, currentRatingFilter);
        updateCompanyDistributionChart(originalCompanyDistribution, currentCompanyFilter);
        
        // Calculate filtered top companies (only if needed)
        const companyRatings = {};
        filteredData.forEach(plan => {
            const company = plan.Company;
            const rating = plan['Rating By Ditto'];
            if (rating !== null && rating !== undefined) {
                if (!companyRatings[company]) {
                    companyRatings[company] = [];
                }
                companyRatings[company].push(rating);
            }
        });
        
        const filteredTopCompanies = {};
        Object.entries(companyRatings).forEach(([company, ratings]) => {
            if (ratings.length >= 2) {
                const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
                filteredTopCompanies[company] = Math.round(avgRating * 100) / 100;
            }
        });
        
        const sortedTopCompanies = Object.entries(filteredTopCompanies)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .reduce((acc, [company, rating]) => {
                acc[company] = rating;
                return acc;
            }, {});
        
        updateCompanyRatingChart(sortedTopCompanies);
        
        // Update filter indicator
        if (currentRatingFilter.length > 0 || currentCompanyFilter.length > 0) {
            showFilterIndicator(
                currentRatingFilter.length > 0 ? currentRatingFilter.join(', ') : null,
                currentCompanyFilter.length > 0 ? currentCompanyFilter.join(', ') : null
            );
        } else {
            const indicator = document.getElementById('filterIndicator');
            if (indicator) indicator.remove();
        }
    });
}

// Filter data by company (toggle functionality) - Optimized for performance
function filterByCompany(companyName) {
    // Toggle company selection
    const index = currentCompanyFilter.indexOf(companyName);
    if (index > -1) {
        currentCompanyFilter.splice(index, 1);
    } else {
        currentCompanyFilter.push(companyName);
    }
    
    // Save filters to localStorage
    saveFilters();
    
    // Use requestAnimationFrame to batch updates and improve performance
    requestAnimationFrame(() => {
        applyFilters();
    });
}

// Update top plans table with custom data
function updateTopPlansTable(plans) {
    // Store all plans for pagination
    allTopPlans = [...plans];
    currentTopPlansPage = 1; // Reset to first page
    
    // Render first page
    renderTopPlansPage();
}

// Render top plans for current page
function renderTopPlansPage() {
    const tbody = document.getElementById('topPlansBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (allTopPlans.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">No plans found</td></tr>';
        document.getElementById('topPlansPagination').style.display = 'none';
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(allTopPlans.length / topPlansPerPage);
    const startIndex = (currentTopPlansPage - 1) * topPlansPerPage;
    const endIndex = Math.min(startIndex + topPlansPerPage, allTopPlans.length);
    const currentPagePlans = allTopPlans.slice(startIndex, endIndex);
    
    // Render current page plans
    currentPagePlans.forEach((plan, localIndex) => {
        const globalIndex = startIndex + localIndex;
        const row = document.createElement('tr');
        const rating = plan['Rating By Ditto'];
        
        // Match color coding with Rating Distribution chart
        let ratingClass = '';
        if (rating !== null && rating !== undefined) {
            if (rating >= 4.0) {
                ratingClass = 'rating-high';
            } else if (rating >= 3.0) {
                ratingClass = 'rating-medium';
            } else if (rating >= 2.0) {
                ratingClass = 'rating-low-yellow';
            } else {
                ratingClass = 'rating-low-red';
            }
        }
        
        const planUrl = plan['Plan URL'] || plan['PlanURL'] || '#';
        
        // Create cells
        const rankCell = document.createElement('td');
        rankCell.innerHTML = `<strong>#${globalIndex + 1}</strong>`;
        
        const companyCell = document.createElement('td');
        companyCell.textContent = plan.Company;
        
        const policyCell = document.createElement('td');
        policyCell.textContent = plan['Policy Name'];
        
        // Make rating clickable
        const ratingCell = document.createElement('td');
        const ratingLink = document.createElement('a');
        
        if (planUrl && planUrl !== '#' && planUrl.startsWith('http')) {
            ratingLink.href = planUrl;
            ratingLink.target = '_blank';
            ratingLink.rel = 'noopener noreferrer';
        } else {
            ratingLink.href = '#';
        }
        
        ratingLink.className = `rating-badge ${ratingClass} rating-clickable`;
        ratingLink.textContent = rating !== null && rating !== undefined ? rating : 'N/A';
        ratingLink.title = 'Click to view plan details';
        
        if (rating === null || rating === undefined) {
            ratingLink.style.background = '#64748b';
            ratingLink.style.color = 'white';
        }
        
        ratingLink.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        ratingCell.appendChild(ratingLink);
        
        // Append all cells to row
        row.appendChild(rankCell);
        row.appendChild(companyCell);
        row.appendChild(policyCell);
        row.appendChild(ratingCell);
        
        row.style.animation = `fadeInUp 0.3s ease-out ${localIndex * 0.05}s both`;
        tbody.appendChild(row);
    });
    
    // Update pagination controls
    updateTopPlansPagination(totalPages);
    
    // Remove loading from top plans table
    const tableCard = tbody.closest('.table-card');
    if (tableCard) {
        const loading = tableCard.querySelector('.loading');
        if (loading) loading.remove();
    }
}

// Update pagination controls for top plans
function updateTopPlansPagination(totalPages) {
    const paginationContainer = document.getElementById('topPlansPagination');
    const prevBtn = document.getElementById('topPlansPrev');
    const nextBtn = document.getElementById('topPlansNext');
    const pageInfo = document.getElementById('topPlansPageInfo');
    const pageNumbers = document.getElementById('topPlansPageNumbers');
    
    if (!paginationContainer || totalPages <= 1) {
        if (paginationContainer) paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'block';
    
    // Update page info
    pageInfo.textContent = `Page ${currentTopPlansPage} of ${totalPages}`;
    
    // Update prev/next buttons
    prevBtn.disabled = currentTopPlansPage === 1;
    nextBtn.disabled = currentTopPlansPage === totalPages;
    
    // Generate page numbers
    pageNumbers.innerHTML = '';
    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentTopPlansPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'pagination-page-btn';
        firstBtn.textContent = '1';
        firstBtn.addEventListener('click', () => goToTopPlansPage(1));
        pageNumbers.appendChild(firstBtn);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
    }
    
    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-page-btn';
        if (i === currentTopPlansPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => goToTopPlansPage(i));
        pageNumbers.appendChild(pageBtn);
    }
    
    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
        
        const lastBtn = document.createElement('button');
        lastBtn.className = 'pagination-page-btn';
        lastBtn.textContent = totalPages;
        lastBtn.addEventListener('click', () => goToTopPlansPage(totalPages));
        pageNumbers.appendChild(lastBtn);
    }
}

// Navigate to specific page
function goToTopPlansPage(page) {
    const totalPages = Math.ceil(allTopPlans.length / topPlansPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentTopPlansPage = page;
    renderTopPlansPage();
    
    // Scroll to top of table
    const tableCard = document.querySelector('#topPlansTable').closest('.table-card');
    if (tableCard) {
        tableCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Show filter indicator
function showFilterIndicator(ratingRange, companyName) {
    // Remove existing indicator
    const existingIndicator = document.getElementById('filterIndicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Build filter text
    const filterParts = [];
    if (ratingRange) {
        // ratingRange can be a string or array
        const ratingText = Array.isArray(ratingRange) ? ratingRange.join(', ') : ratingRange;
        filterParts.push(`Rating: <strong>${ratingText}</strong>`);
    }
    if (companyName) {
        // companyName can be a string or array
        const companyText = Array.isArray(companyName) ? companyName.join(', ') : companyName;
        filterParts.push(`Company: <strong>${companyText}</strong>`);
    }
    
    if (filterParts.length === 0) {
        return; // No filters to show
    }
    
    const filterText = filterParts.join(' | ');
    
    // Create filter indicator (no reset button - companies and ratings can be toggled)
    const indicator = document.createElement('div');
    indicator.id = 'filterIndicator';
    indicator.className = 'filter-indicator';
    indicator.innerHTML = `
        <span>Filtered by: ${filterText}</span>
    `;
    
    // Insert after charts section
    const chartsSection = document.querySelector('.charts-section');
    if (chartsSection) {
        chartsSection.after(indicator);
    } else {
        // Fallback: insert before tables
        const tablesSection = document.querySelector('.table-section');
        if (tablesSection) {
            tablesSection.before(indicator);
        }
    }
}

// Reset all filters
function resetAllFilters() {
    currentRatingFilter = []; // Reset to empty array
    currentCompanyFilter = []; // Reset to empty array
    
    // Clear saved filters from localStorage
    clearSavedFilters();
    
    // Restore original data
    filteredData = [...allData];
    
    // Reset pagination
    currentDataTablePage = 1;
    
    // Update tables
    updateDataTable();
    updateCounts();
    
    // Restore original top plans
    loadTopPlans();
    
    // Restore original charts
    if (originalRatingDistribution && Object.keys(originalRatingDistribution).length > 0) {
        updateRatingChart(originalRatingDistribution);
    }
    if (originalCompanyDistribution && Object.keys(originalCompanyDistribution).length > 0) {
        updateCompanyDistributionChart(originalCompanyDistribution, []); // No companies selected on reset
    }
    if (originalTopCompanies && Object.keys(originalTopCompanies).length > 0) {
        updateCompanyRatingChart(originalTopCompanies);
    }
    
    // Remove filter indicator
    const indicator = document.getElementById('filterIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Update top companies bar chart with dark theme
function updateCompanyRatingChart(companyData) {
    const ctx = document.getElementById('companyRatingChart');
    if (!ctx) {
        console.error('companyRatingChart element not found');
        return;
    }
    
    // Remove loading from this chart card
    const chartCard = ctx.closest('.chart-card');
    if (chartCard) {
        const loading = chartCard.querySelector('.loading');
        if (loading) loading.remove();
    }
    
    const canvas = ctx.getContext('2d');
    
    if (companyRatingChart) {
        companyRatingChart.destroy();
    }
    
    const companies = Object.keys(companyData);
    const ratings = Object.values(companyData);
    
    // Create gradient
    const gradient = canvas.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.8)');
    
    companyRatingChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: companies,
            datasets: [{
                label: 'Average Rating',
                data: ratings,
                backgroundColor: gradient,
                borderColor: '#3b82f6',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `Rating: ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 0.5,
                        color: '#cbd5e1',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: '#334155',
                        lineWidth: 1
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        color: '#cbd5e1',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Update company distribution chart with dark theme
function updateCompanyDistributionChart(companyData, selectedCompanies = []) {
    const ctx = document.getElementById('companyDistributionChart');
    if (!ctx) {
        console.error('companyDistributionChart element not found');
        return;
    }
    
    // Remove loading from this chart card
    const chartCard = ctx.closest('.chart-card');
    if (chartCard) {
        const loading = chartCard.querySelector('.loading');
        if (loading) loading.remove();
    }
    
    // Normalize selectedCompanies to array
    const selectedCompaniesArray = Array.isArray(selectedCompanies) ? selectedCompanies : (selectedCompanies ? [selectedCompanies] : []);
    
    // If chart exists, update both data (counts) and colors
    if (companyDistributionChart) {
        // Ensure we have ALL companies from original distribution in the correct order
        // Use originalCompanyDistribution if available, otherwise fall back to companyData
        const sourceData = Object.keys(originalCompanyDistribution).length > 0 
            ? originalCompanyDistribution 
            : companyData;
        
        // Sort by original count to maintain consistent order
        const allCompaniesSorted = Object.entries(sourceData)
            .sort((a, b) => b[1] - a[1])
            .map(([name]) => name);
        
        // Get counts for ALL companies in the sorted order
        // Always show actual counts (from original distribution)
        const updatedCounts = allCompaniesSorted.map(company => {
            // Use the count from companyData (which should be original distribution)
            return companyData.hasOwnProperty(company) ? companyData[company] : 0;
        });
        
        // Update chart labels to ensure ALL companies are present (critical for multi-select)
        if (companyDistributionChart.data.labels.length !== allCompaniesSorted.length ||
            !companyDistributionChart.data.labels.every((label, idx) => label === allCompaniesSorted[idx])) {
            companyDistributionChart.data.labels = allCompaniesSorted;
        }
        
        // Update chart data with filtered counts for ALL companies
        companyDistributionChart.data.datasets[0].data = updatedCounts;
        
        // Update colors
        const defaultColor = 'rgba(59, 130, 246, 0.6)'; // Blue (default uniform color)
        const defaultBorderColor = 'rgba(59, 130, 246, 0.8)';
        const selectedColor = 'rgba(139, 92, 246, 0.8)'; // Purple for selected
        const selectedBorderColor = 'rgba(139, 92, 246, 1.0)';
        
        const backgroundColors = allCompaniesSorted.map(company => {
            if (selectedCompaniesArray.includes(company)) {
                return selectedColor; // Purple when selected
            } else {
                return defaultColor; // Blue when not selected (always visible)
            }
        });
        const borderColors = allCompaniesSorted.map(company => {
            if (selectedCompaniesArray.includes(company)) {
                return selectedBorderColor; // Purple border when selected
            } else {
                return defaultBorderColor; // Blue border when not selected (always visible)
            }
        });
        
        companyDistributionChart.data.datasets[0].backgroundColor = backgroundColors;
        companyDistributionChart.data.datasets[0].borderColor = borderColors;
        
        // ALWAYS set/re-set onClick handler to ensure it's active and uses current chart data
        // This is critical for multi-select to work - handler must be refreshed after each update
        companyDistributionChart.options.onClick = (event, elements) => {
            if (elements.length > 0) {
                const elementIndex = elements[0].index;
                const selectedCompanyName = allCompaniesSorted[elementIndex];
                // Toggle company filter
                filterByCompany(selectedCompanyName);
            }
        };
        
        // The plugin will automatically read from chart.data.datasets[0].data
        companyDistributionChart.update('none'); // Update without animation to keep positions
        return;
    }
    
    // If no selection or chart doesn't exist, create/update normally
    if (companyDistributionChart) {
        companyDistributionChart.destroy();
    }
    
    // Always use the provided data (should be original distribution)
    const allCompaniesData = {...companyData};
    
    // Sort by count - show ALL companies in their original order
    const sorted = Object.entries(allCompaniesData)
        .sort((a, b) => b[1] - a[1]);
    
    const companies = sorted.map(([name]) => name);
    const counts = sorted.map(([, count]) => count);
    
    // Default color for all bars (blue - uniform)
    const defaultColor = 'rgba(59, 130, 246, 0.6)'; // Blue with transparency
    const defaultBorderColor = 'rgba(59, 130, 246, 0.8)';
    
    // Highlight color for selected companies (purple)
    const selectedColor = 'rgba(139, 92, 246, 0.8)'; // Purple for selected
    const selectedBorderColor = 'rgba(139, 92, 246, 1.0)';
    
    // Create colors array - blue by default, purple when selected
    const backgroundColors = companies.map(company => {
        if (selectedCompaniesArray.includes(company)) {
            return selectedColor; // Purple when selected
        } else {
            return defaultColor; // Blue when not selected (always visible)
        }
    });
    const borderColors = companies.map(company => {
        if (selectedCompaniesArray.includes(company)) {
            return selectedBorderColor; // Purple border when selected
        } else {
            return defaultBorderColor; // Blue border when not selected (always visible)
        }
    });
    
    // Custom plugin to display count vertically inside each bar
    // Reads counts directly from chart data (which gets updated when filtering)
    const verticalLabelPlugin = {
        id: 'verticalLabel',
        afterDatasetsDraw: (chart) => {
            const chartCtx = chart.ctx;
            const meta = chart.getDatasetMeta(0);
            
            // Get current counts from chart data (which may be updated)
            const currentCounts = chart.data.datasets[0].data;
            
            chartCtx.save();
            chartCtx.textAlign = 'center';
            chartCtx.textBaseline = 'middle';
            chartCtx.fillStyle = '#ffffff';
            chartCtx.font = 'bold 11px Arial';
            
            meta.data.forEach((bar, index) => {
                // Use current counts from chart data
                const value = currentCounts[index];
                if (value > 0) {
                    // Position text in the middle of the bar, vertically
                    const x = bar.x;
                    const y = bar.y + (bar.height / 2);
                    
                    // Rotate text 90 degrees (vertical)
                    chartCtx.save();
                    chartCtx.translate(x, y);
                    chartCtx.rotate(-Math.PI / 2); // -90 degrees
                    // Use singular "plan" for 1, plural "plans" for others
                    const planText = value === 1 ? 'plan' : 'plans';
                    chartCtx.fillText(`${value} ${planText}`, 0, 0);
                    chartCtx.restore();
                }
            });
            
            chartCtx.restore();
        }
    };
    
    companyDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: companies,
            datasets: [{
                label: 'Number of Plans',
                data: counts,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        plugins: [verticalLabelPlugin],
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false // Disable tooltips completely
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#cbd5e1',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: '#334155',
                        lineWidth: 1
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 60,
                        minRotation: 45,
                        color: '#cbd5e1',
                        font: {
                            size: 9
                        },
                        autoSkip: false
                    },
                    grid: {
                        display: false
                    },
                    // Make x-axis labels clickable
                    onClick: (event, elements) => {
                        if (elements.length > 0) {
                            const elementIndex = elements[0].index;
                            const selectedCompanyName = companyDistributionChart.data.labels[elementIndex];
                            filterByCompany(selectedCompanyName);
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const elementIndex = elements[0].index;
                    // Always use current chart labels to ensure multi-select works
                    const selectedCompanyName = companyDistributionChart.data.labels[elementIndex];
                    
                    // Toggle company filter
                    filterByCompany(selectedCompanyName);
                }
            }
        }
    });
}

// Load companies for filter dropdown
async function loadCompanies() {
    try {
        const url = `${API_BASE_URL}/companies`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch companies');
        
        const data = await response.json();
        
        const select = document.getElementById('companyFilter');
        if (!select) return;
        
        select.innerHTML = '<option value="">All Companies</option>';
        data.companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company;
            option.textContent = company;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading companies:', error);
    }
}

// Load top rated plans
async function loadTopPlans() {
    try {
        const url = `${API_BASE_URL}/statistics`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch top plans');
        
        const stats = await response.json();
        
        // Store original top plans for reset functionality
        originalTopPlans = [...stats.top_rated_plans];
        
        // Only update if no filters are active
        if (currentRatingFilter.length === 0 && currentCompanyFilter.length === 0) {
            updateTopPlansTable(stats.top_rated_plans);
        }
    } catch (error) {
        console.error('Error loading top plans:', error);
        const tbody = document.getElementById('topPlansBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" class="loading">Error loading data</td></tr>';
        }
    }
}

// Load all data for main table
let allData = [];
let filteredData = [];
let originalTopPlans = []; // Store original top plans for reset
let currentRatingFilter = []; // Track current rating range filters (array for multi-select)
let currentCompanyFilter = []; // Track current company filters (array for multi-select)
let originalCompanyDistribution = {}; // Store original company distribution
let originalTopCompanies = {}; // Store original top companies data
let originalRatingDistribution = {}; // Store original rating distribution

// LocalStorage keys for filter persistence
const STORAGE_KEYS = {
    RATING_FILTER: 'ditto_rating_filter',
    COMPANY_FILTER: 'ditto_company_filter'
};

// Save filters to sessionStorage (persists only within same tab/window)
function saveFilters() {
    try {
        sessionStorage.setItem(STORAGE_KEYS.RATING_FILTER, JSON.stringify(currentRatingFilter));
        sessionStorage.setItem(STORAGE_KEYS.COMPANY_FILTER, JSON.stringify(currentCompanyFilter));
        console.log('💾 Saved filters to sessionStorage - Rating:', currentRatingFilter, 'Company:', currentCompanyFilter);
    } catch (e) {
        console.warn('Failed to save filters to sessionStorage:', e);
    }
}

// Load filters from sessionStorage (persists only within same tab/window)
function loadFilters() {
    try {
        const savedRatingFilter = sessionStorage.getItem(STORAGE_KEYS.RATING_FILTER);
        const savedCompanyFilter = sessionStorage.getItem(STORAGE_KEYS.COMPANY_FILTER);
        
        if (savedRatingFilter) {
            currentRatingFilter = JSON.parse(savedRatingFilter);
            console.log('✅ Loaded rating filters from sessionStorage:', currentRatingFilter);
        } else {
            currentRatingFilter = [];
            console.log('No saved rating filters found');
        }
        
        if (savedCompanyFilter) {
            currentCompanyFilter = JSON.parse(savedCompanyFilter);
            console.log('✅ Loaded company filters from sessionStorage:', currentCompanyFilter);
        } else {
            currentCompanyFilter = [];
            console.log('No saved company filters found');
        }
    } catch (e) {
        console.warn('Failed to load filters from sessionStorage:', e);
        currentRatingFilter = [];
        currentCompanyFilter = [];
    }
}

// Clear saved filters
function clearSavedFilters() {
    try {
        sessionStorage.removeItem(STORAGE_KEYS.RATING_FILTER);
        sessionStorage.removeItem(STORAGE_KEYS.COMPANY_FILTER);
    } catch (e) {
        console.warn('Failed to clear filters from sessionStorage:', e);
    }
}

// Pagination for Top Plans
let allTopPlans = []; // Store all top plans
let currentTopPlansPage = 1; // Current page for top plans
let topPlansPerPage = 10; // Records per page (user selectable)

// Pagination for Data Table (All Insurance Plans)
let currentDataTablePage = 1; // Current page for data table
let dataTablePerPage = 10; // Records per page (user selectable, default 10)

async function loadAllData() {
    try {
        const url = `${API_BASE_URL}/data`;
        console.log('loadAllData: Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('loadAllData: Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('loadAllData: Response error:', errorText);
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('loadAllData: API response received:', result);
        console.log('loadAllData: result.data type:', typeof result.data, 'isArray:', Array.isArray(result.data));
        console.log('loadAllData: result.data length:', result.data ? result.data.length : 'N/A');
        
        // Handle both response formats: {data: [...]} or direct array
        allData = result.data || result || [];
        if (!Array.isArray(allData)) {
            console.error('loadAllData: Invalid data format, expected array:', allData);
            allData = [];
        }
        
        filteredData = [...allData]; // Create a copy for filtering
        
        console.log(`loadAllData: Loaded ${allData.length} plans, filteredData.length = ${filteredData.length}`);
        if (allData.length > 0) {
            console.log('loadAllData: First plan sample:', allData[0]);
        }
        
        if (allData.length === 0) {
            console.warn('loadAllData: No data loaded from API');
        } else {
            console.log('loadAllData: Successfully loaded data, calling updateDataTable()');
        }
        
        // Force update
        updateDataTable();
        updateCounts();
        
        // Apply saved filters if any exist (this will update charts and tables with filtered data)
        // IMPORTANT: Re-check filters here in case they were modified during async operations
        const savedRatingFilter = sessionStorage.getItem(STORAGE_KEYS.RATING_FILTER);
        const savedCompanyFilter = sessionStorage.getItem(STORAGE_KEYS.COMPANY_FILTER);
        
        // Re-load filters to ensure they're current (in case they were reset during async operations)
        if (savedRatingFilter) {
            try {
                currentRatingFilter = JSON.parse(savedRatingFilter);
                console.log('🔄 Re-loaded rating filters from sessionStorage in loadAllData:', currentRatingFilter);
            } catch (e) {
                console.warn('Failed to re-parse rating filter:', e);
            }
        }
        if (savedCompanyFilter) {
            try {
                currentCompanyFilter = JSON.parse(savedCompanyFilter);
                console.log('🔄 Re-loaded company filters from sessionStorage in loadAllData:', currentCompanyFilter);
            } catch (e) {
                console.warn('Failed to re-parse company filter:', e);
            }
        }
        
        if (currentRatingFilter.length > 0 || currentCompanyFilter.length > 0) {
            console.log('🔄 Restoring filters after data load:');
            console.log('   Rating filters:', currentRatingFilter, '(length:', currentRatingFilter.length, ')');
            console.log('   Company filters:', currentCompanyFilter, '(length:', currentCompanyFilter.length, ')');
            console.log('   All data loaded:', allData.length, 'plans');
            console.log('   Original rating distribution keys:', Object.keys(originalRatingDistribution));
            
            // Use setTimeout to ensure all data is ready before applying filters
            setTimeout(() => {
                console.log('📊 Applying restored filters...');
                console.log('   Before applyFilters - currentRatingFilter:', currentRatingFilter);
                console.log('   Before applyFilters - currentCompanyFilter:', currentCompanyFilter);
                applyFilters();
                console.log('   After applyFilters - currentRatingFilter:', currentRatingFilter);
                console.log('   After applyFilters - currentCompanyFilter:', currentCompanyFilter);
            }, 200);
        } else {
            console.log('No saved filters to restore');
            // Even if no filters, ensure charts show correct state
            if (Object.keys(originalRatingDistribution).length > 0) {
                updateRatingChart(originalRatingDistribution, currentRatingFilter);
            }
            if (Object.keys(originalCompanyDistribution).length > 0) {
                updateCompanyDistributionChart(originalCompanyDistribution, currentCompanyFilter);
            }
        }
        
        // Remove loading from data table
        const tbody = document.getElementById('dataTableBody');
        if (tbody) {
            const tableCard = tbody.closest('.table-card');
            if (tableCard) {
                const loading = tableCard.querySelector('.loading');
                if (loading) loading.remove();
            }
        }
    } catch (error) {
        console.error('Error loading data:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        const tbody = document.getElementById('dataTableBody');
        if (tbody) {
            const errorMsg = error.message || 'Unknown error';
            tbody.innerHTML = `<tr><td colspan="5" class="loading" style="color: #ef4444;">Error loading data: ${errorMsg}. Check browser console for details.</td></tr>`;
        }
    }
}

// Update data table (now uses pagination)
function updateDataTable() {
    console.log('updateDataTable: Called, filteredData.length =', filteredData.length);
    // Reset to first page when data changes
    currentDataTablePage = 1;
    
    // Render first page
    renderDataTablePage();
}

// Render data table for current page
function renderDataTablePage() {
    const tbody = document.getElementById('dataTableBody');
    if (!tbody) {
        console.error('dataTableBody element not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    console.log(`renderDataTablePage: filteredData.length = ${filteredData.length}, currentDataTablePage = ${currentDataTablePage}, dataTablePerPage = ${dataTablePerPage}`);
    console.log(`renderDataTablePage: filteredData sample:`, filteredData.slice(0, 2));
    
    if (!Array.isArray(filteredData) || filteredData.length === 0) {
        console.warn('renderDataTablePage: No data to display');
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No data found</td></tr>';
        const paginationContainer = document.getElementById('dataTablePagination');
        if (paginationContainer) paginationContainer.style.display = 'none';
        updateCounts();
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredData.length / dataTablePerPage);
    const startIndex = (currentDataTablePage - 1) * dataTablePerPage;
    const endIndex = Math.min(startIndex + dataTablePerPage, filteredData.length);
    const currentPageData = filteredData.slice(startIndex, endIndex);
    
    console.log(`Pagination: totalPages=${totalPages}, startIndex=${startIndex}, endIndex=${endIndex}, currentPageData.length=${currentPageData.length}`);
    
    if (currentPageData.length === 0) {
        console.warn('renderDataTablePage: No data for current page');
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No data for this page</td></tr>';
        return;
    }
    
    console.log(`Pagination: totalPages=${totalPages}, startIndex=${startIndex}, endIndex=${endIndex}, currentPageData.length=${currentPageData.length}`);
    
    if (currentPageData.length === 0) {
        console.warn('renderDataTablePage: No data for current page');
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No data for this page</td></tr>';
        return;
    }
    
    // Track company numbers and plan numbers within each company (for full filtered data)
    const companyMap = new Map(); // company -> company number
    const companyPlanCount = new Map(); // company -> current plan number
    
    // First pass: assign company numbers based on full filtered data
    filteredData.forEach((plan) => {
        if (!companyMap.has(plan.Company)) {
            companyMap.set(plan.Company, companyMap.size + 1);
            companyPlanCount.set(plan.Company, 0);
        }
    });
    
    // Second pass: count plans per company up to startIndex
    for (let i = 0; i < startIndex; i++) {
        const plan = filteredData[i];
        const currentCount = companyPlanCount.get(plan.Company);
        companyPlanCount.set(plan.Company, currentCount + 1);
    }
    
    // Render current page data
    currentPageData.forEach((plan, localIndex) => {
        const globalIndex = startIndex + localIndex;
        const row = document.createElement('tr');
        const rating = plan['Rating By Ditto'];
        
        // Match color coding with Rating Distribution chart
        // Chart colors: 4.0-5.0 (green), 3.0-3.9 (blue), 2.0-2.9 (yellow), 0.0-1.9 (red)
        let ratingClass = '';
        if (rating !== null && rating !== undefined) {
            if (rating >= 4.0) {
                ratingClass = 'rating-high'; // Green (4.0-5.0)
            } else if (rating >= 3.0) {
                ratingClass = 'rating-medium'; // Blue (3.0-3.9)
            } else if (rating >= 2.0) {
                ratingClass = 'rating-low-yellow'; // Yellow (2.0-2.9)
            } else {
                ratingClass = 'rating-low-red'; // Red (0.0-1.9)
            }
        }
        
        const planUrl = plan['Plan URL'] || '#';
        
        // Get company number
        const companyNum = companyMap.get(plan.Company);
        
        // Increment plan number for this company
        const currentCount = companyPlanCount.get(plan.Company);
        const planNum = currentCount + 1;
        companyPlanCount.set(plan.Company, planNum);
        
        // Row number (sequential, global index)
        const rowNum = globalIndex + 1;
        
        // Plan number format: companyNum-planNum (e.g., 1-1, 1-2, 2-1)
        const planNo = `${companyNum}-${planNum}`;
        
        // Create rating cell with clickable link
        // Make it clickable if there's a valid plan URL, regardless of rating value
        const hasValidUrl = planUrl && planUrl !== '#' && planUrl.startsWith('http');
        const ratingDisplay = rating !== null && rating !== undefined ? rating : 'N/A';
        const ratingBadgeClass = rating !== null && rating !== undefined ? ratingClass : '';
        const ratingBadgeStyle = rating === null || rating === undefined 
            ? 'style="background: #64748b; color: white;"' 
            : '';
        
        let ratingCellContent;
        if (hasValidUrl) {
            // Make it clickable if there's a valid URL
            ratingCellContent = `<a href="${planUrl}" target="_blank" rel="noopener noreferrer" class="rating-badge ${ratingBadgeClass} rating-clickable" ${ratingBadgeStyle} title="Click to view plan details">${ratingDisplay}</a>`;
        } else {
            // Non-clickable if no valid URL
            ratingCellContent = `<span class="rating-badge ${ratingBadgeClass}" ${ratingBadgeStyle}>${ratingDisplay}</span>`;
        }
        
        row.innerHTML = `
            <td>${rowNum}</td>
            <td>${planNo}</td>
            <td>${plan.Company}</td>
            <td>${plan['Policy Name']}</td>
            <td>${ratingCellContent}</td>
        `;
        
        // Add click handler for rating link if it exists
        const ratingLink = row.querySelector('.rating-clickable');
        if (ratingLink) {
            ratingLink.addEventListener('click', (e) => {
                e.stopPropagation();
                // Don't prevent default - let the browser handle the link naturally
            });
        }
        row.style.animation = `fadeInUp 0.2s ease-out ${localIndex * 0.01}s both`;
        tbody.appendChild(row);
    });
    
    // Update pagination controls
    updateDataTablePagination(totalPages);
    
    updateCounts();
}

// Update pagination controls for data table
function updateDataTablePagination(totalPages) {
    const paginationContainer = document.getElementById('dataTablePagination');
    const prevBtn = document.getElementById('dataTablePrev');
    const nextBtn = document.getElementById('dataTableNext');
    const pageInfo = document.getElementById('dataTablePageInfo');
    const pageNumbers = document.getElementById('dataTablePageNumbers');
    
    if (!paginationContainer || totalPages <= 1) {
        if (paginationContainer) paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'block';
    
    // Update page info
    if (pageInfo) pageInfo.textContent = `Page ${currentDataTablePage} of ${totalPages}`;
    
    // Update prev/next buttons
    if (prevBtn) prevBtn.disabled = currentDataTablePage === 1;
    if (nextBtn) nextBtn.disabled = currentDataTablePage === totalPages;
    
    // Set current value for records per page selector
    const perPageSelect = document.getElementById('dataTablePerPage');
    if (perPageSelect) {
        perPageSelect.value = dataTablePerPage;
    }
    
    // Generate page numbers
    pageNumbers.innerHTML = '';
    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentDataTablePage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'pagination-page-btn';
        firstBtn.textContent = '1';
        firstBtn.addEventListener('click', () => goToDataTablePage(1));
        pageNumbers.appendChild(firstBtn);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
    }
    
    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-page-btn';
        if (i === currentDataTablePage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => goToDataTablePage(i));
        pageNumbers.appendChild(pageBtn);
    }
    
    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
        
        const lastBtn = document.createElement('button');
        lastBtn.className = 'pagination-page-btn';
        lastBtn.textContent = totalPages;
        lastBtn.addEventListener('click', () => goToDataTablePage(totalPages));
        pageNumbers.appendChild(lastBtn);
    }
}

// Navigate to specific page for data table
function goToDataTablePage(page) {
    const totalPages = Math.ceil(filteredData.length / dataTablePerPage);
    if (page < 1 || page > totalPages) return;
    
    currentDataTablePage = page;
    renderDataTablePage();
    
    // Scroll to top of table
    const tableCard = document.querySelector('#dataTable').closest('.table-card');
    if (tableCard) {
        tableCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Update counts
function updateCounts() {
    const showingEl = document.getElementById('showingCount');
    const totalEl = document.getElementById('totalCount');
    
    // Calculate what's actually showing on current page
    const totalPages = Math.ceil(filteredData.length / dataTablePerPage);
    const startIndex = (currentDataTablePage - 1) * dataTablePerPage;
    const endIndex = Math.min(startIndex + dataTablePerPage, filteredData.length);
    const showingCount = filteredData.length > 0 ? (endIndex - startIndex) : 0;
    
    if (showingEl) showingEl.textContent = showingCount;
    if (totalEl) totalEl.textContent = filteredData.length;
}

// Apply filters (removed - filter section removed from UI)

// Reset filters
function resetFilters() {
    const companyFilter = document.getElementById('companyFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (companyFilter) companyFilter.value = '';
    if (ratingFilter) ratingFilter.value = '';
    if (searchInput) searchInput.value = '';
    
    filteredData = allData;
    updateDataTable();
    
    // Show feedback
    const btn = document.getElementById('resetFilters');
    const originalText = btn.textContent;
    btn.textContent = '✓ Reset!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 1500);
}

// Handle search
function handleSearch() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    if (!searchTerm) {
        filteredData = allData;
    } else {
        filteredData = allData.filter(plan => 
            plan.Company.toLowerCase().includes(searchTerm) ||
            plan['Policy Name'].toLowerCase().includes(searchTerm)
        );
    }
    
    updateDataTable();
}

// Show error message
function showError(message) {
    console.error(message);
    // Create a toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
