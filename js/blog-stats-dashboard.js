/**
 * Blog Statistics Dashboard
 * Provides analytics and statistics for the blog system
 */
(function() {
  'use strict';
  
  // Initialize when DOM is fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    initBlogStatsDashboard();
  });

  // Charts and data visualization elements
  let visitorChart = null;
  let engagementChart = null;
  let categoryChart = null;
  
  // Main initialization function
  function initBlogStatsDashboard() {
    console.log('Initializing Blog Stats Dashboard');
    
    // Load data
    loadBlogStatistics();
    
    // Initialize charts
    initVisitorChart();
    initEngagementChart();
    initCategoryChart();
    
    // Initialize filters and date pickers
    initDateRangeFilter();
    initCategoryFilter();
    
    // Setup refresh options
    setupAutoRefresh();
    setupRefreshButton();
  }
  
  // Load blog statistics from API or localStorage
  function loadBlogStatistics() {
    // For the demo, we'll use static data
    // In a real app, this would fetch from an API endpoint
    
    // Check if we have cached data
    const cachedStats = localStorage.getItem('blog_statistics');
    
    if (cachedStats) {
      try {
        const stats = JSON.parse(cachedStats);
        updateStatisticDisplays(stats);
        return;
      } catch (error) {
        console.warn('Error parsing cached statistics:', error);
      }
    }
    
    // Fallback to demo data
    const demoStats = {
      totalPosts: 145,
      totalViews: 238975,
      totalComments: 3241,
      totalShares: 1872,
      averageReadTime: 3.7,
      topCategories: [
        { name: 'Recipes', posts: 45, views: 89500 },
        { name: 'Restaurant Reviews', posts: 32, views: 65200 },
        { name: 'Health', posts: 28, views: 42100 },
        { name: 'Cooking Tips', posts: 25, views: 32175 },
        { name: 'Food News', posts: 15, views: 10000 }
      ],
      recentTrends: {
        viewsChange: 12.5,
        commentsChange: 8.3,
        sharesChange: 15.7
      }
    };
    
    // Cache the demo data
    localStorage.setItem('blog_statistics', JSON.stringify(demoStats));
    
    // Update displays
    updateStatisticDisplays(demoStats);
  }
  
  // Update statistics displays
  function updateStatisticDisplays(stats) {
    // Update headline numbers
    document.getElementById('total-posts').textContent = stats.totalPosts;
    document.getElementById('total-views').textContent = formatNumber(stats.totalViews);
    document.getElementById('total-comments').textContent = formatNumber(stats.totalComments);
    document.getElementById('total-shares').textContent = formatNumber(stats.totalShares);
    
    // Update average read time
    const readTimeEl = document.getElementById('average-read-time');
    if (readTimeEl) {
      readTimeEl.textContent = stats.averageReadTime + ' min';
    }
    
    // Update trend indicators
    updateTrendIndicator('views-trend', stats.recentTrends.viewsChange);
    updateTrendIndicator('comments-trend', stats.recentTrends.commentsChange);
    updateTrendIndicator('shares-trend', stats.recentTrends.sharesChange);
    
    // Update top categories
    updateTopCategories(stats.topCategories);
  }
  
  // Format numbers with commas for thousands
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  // Update trend indicator with appropriate class and arrow
  function updateTrendIndicator(elementId, changePercent) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = Math.abs(changePercent).toFixed(1) + '%';
    
    if (changePercent > 0) {
      element.classList.add('positive-trend');
      element.classList.remove('negative-trend');
      element.innerHTML = '<i class="fas fa-arrow-up"></i> ' + element.textContent;
    } else if (changePercent < 0) {
      element.classList.add('negative-trend');
      element.classList.remove('positive-trend');
      element.innerHTML = '<i class="fas fa-arrow-down"></i> ' + element.textContent;
    } else {
      element.classList.remove('positive-trend', 'negative-trend');
      element.innerHTML = '<i class="fas fa-minus"></i> ' + element.textContent;
    }
  }
  
  // Update top categories display
  function updateTopCategories(categories) {
    const container = document.getElementById('top-categories-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    categories.forEach(category => {
      const categoryItem = document.createElement('div');
      categoryItem.className = 'category-item';
      
      categoryItem.innerHTML = `
        <div class="category-name">${category.name}</div>
        <div class="category-stats">
          <span class="category-posts">${category.posts} posts</span>
          <span class="category-views">${formatNumber(category.views)} views</span>
        </div>
        <div class="category-bar-container">
          <div class="category-bar" style="width: ${Math.min(100, category.views / 1000)}%"></div>
        </div>
      `;
      
      container.appendChild(categoryItem);
    });
  }
  
  // Initialize visitor chart
  function initVisitorChart() {
    const ctx = document.getElementById('visitor-chart');
    if (!ctx) return;
    
    if (window.Chart) {
      visitorChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Visitors',
            data: [12500, 14200, 15800, 16900, 18200, 19500, 21000, 22800, 24100, 25700, 27300, 29000],
            borderColor: '#ffc107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    } else {
      console.warn('Chart.js not available for visitor chart');
    }
  }
  
  // Initialize engagement chart
  function initEngagementChart() {
    const ctx = document.getElementById('engagement-chart');
    if (!ctx) return;
    
    if (window.Chart) {
      engagementChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Comments', 'Shares', 'Likes', 'Saves', 'Email Opens'],
          datasets: [{
            label: 'Engagement',
            data: [3241, 1872, 5840, 1352, 2450],
            backgroundColor: [
              '#ffc107',
              '#4caf50',
              '#2196f3',
              '#9c27b0',
              '#f44336'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    } else {
      console.warn('Chart.js not available for engagement chart');
    }
  }
  
  // Initialize category chart
  function initCategoryChart() {
    const ctx = document.getElementById('category-chart');
    if (!ctx) return;
    
    if (window.Chart) {
      categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Recipes', 'Restaurant Reviews', 'Health', 'Cooking Tips', 'Food News'],
          datasets: [{
            data: [45, 32, 28, 25, 15],
            backgroundColor: [
              '#ffc107',
              '#4caf50',
              '#2196f3',
              '#9c27b0',
              '#f44336'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                boxWidth: 12
              }
            }
          }
        }
      });
    } else {
      console.warn('Chart.js not available for category chart');
    }
  }
  
  // Initialize date range filter
  function initDateRangeFilter() {
    const dateFilter = document.getElementById('date-range-filter');
    if (!dateFilter) return;
    
    dateFilter.addEventListener('change', function() {
      const value = this.value;
      console.log('Date range changed to:', value);
      
      // In a real application, this would fetch new data based on the date range
      // For this demo, we'll just show a notification
      
      const notification = document.createElement('div');
      notification.className = 'toast-notification';
      notification.innerHTML = `
        <div class="toast-content">
          <i class="fas fa-info-circle"></i>
          <span>Statistics updated for ${this.options[this.selectedIndex].text}</span>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Remove after 3 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    });
  }
  
  // Initialize category filter
  function initCategoryFilter() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;
    
    categoryFilter.addEventListener('change', function() {
      const value = this.value;
      console.log('Category filter changed to:', value);
      
      // In a real application, this would filter the data by category
      // For this demo, we'll just update the headline
      
      const headline = document.getElementById('stats-headline');
      if (headline) {
        if (value === 'all') {
          headline.textContent = 'Blog Performance Overview';
        } else {
          headline.textContent = `${this.options[this.selectedIndex].text} Performance`;
        }
      }
    });
  }
  
  // Setup auto refresh
  function setupAutoRefresh() {
    const autoRefresh = document.getElementById('auto-refresh');
    if (!autoRefresh) return;
    
    let refreshInterval = null;
    
    autoRefresh.addEventListener('change', function() {
      if (this.checked) {
        // Refresh every 5 minutes
        refreshInterval = setInterval(() => {
          loadBlogStatistics();
          console.log('Auto-refreshed statistics');
        }, 5 * 60 * 1000);
      } else {
        if (refreshInterval) {
          clearInterval(refreshInterval);
          refreshInterval = null;
        }
      }
    });
  }
  
  // Setup refresh button
  function setupRefreshButton() {
    const refreshButton = document.getElementById('refresh-stats');
    if (!refreshButton) return;
    
    refreshButton.addEventListener('click', function() {
      this.classList.add('spinning');
      
      // Reload statistics
      loadBlogStatistics();
      
      // Show a confirmation message
      console.log('Statistics refreshed manually');
      
      // Stop spinning after 1 second
      setTimeout(() => {
        this.classList.remove('spinning');
      }, 1000);
    });
  }
})();
