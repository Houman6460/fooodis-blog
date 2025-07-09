/**
 * Analytics Charts for Fooodis Blog Dashboard
 * Uses Chart.js to create interactive analytics visualizations
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing Analytics Charts');
  
  // Check if Chart.js is available
  if (typeof Chart === 'undefined') {
    console.error('Chart.js is required for analytics charts');
    return;
  }
  
  // Set Chart.js defaults
  Chart.defaults.color = '#555555';
  Chart.defaults.font.family = "'Poppins', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
  
  // Initialize charts
  initVisitorsChart();
  initSubscribersChart();
  initCategoryEngagementChart();
  initDeviceChart();
  initEmailMetricsChart();
  
  /**
   * Initialize visitors chart
   */
  function initVisitorsChart() {
    const ctx = document.getElementById('visitors-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Visitors',
          data: [1500, 1800, 2200, 2400, 2800, 3100, 3400, 3800, 4100, 4500, 4800, 5200],
          borderColor: '#ffc107',
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
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
          },
          tooltip: {
            mode: 'index',
            intersect: false
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
  }
  
  /**
   * Initialize subscribers chart
   */
  function initSubscribersChart() {
    const ctx = document.getElementById('subscribers-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Subscribers',
          data: [200, 350, 450, 620, 750, 830, 950, 1100, 1250, 1400, 1650, 1800],
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
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
          },
          tooltip: {
            mode: 'index',
            intersect: false
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
  }
  
  /**
   * Initialize category engagement chart
   */
  function initCategoryEngagementChart() {
    const ctx = document.getElementById('category-engagement-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Recipes', 'Restaurants', 'Health', 'Cooking Tips', 'Food News', 'Interviews'],
        datasets: [{
          label: 'Engagement',
          data: [85, 72, 78, 65, 60, 55],
          backgroundColor: 'rgba(255, 193, 7, 0.2)',
          borderColor: '#ffc107',
          pointBackgroundColor: '#ffc107',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#ffc107'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
            borderWidth: 2
          }
        },
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          r: {
            angleLines: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              backdropColor: 'transparent',
              color: '#555555'
            }
          }
        }
      }
    });
  }
  
  /**
   * Initialize device chart
   */
  function initDeviceChart() {
    const ctx = document.getElementById('device-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Mobile', 'Desktop', 'Tablet'],
        datasets: [{
          data: [65, 25, 10],
          backgroundColor: [
            '#ffc107',
            '#4caf50',
            '#2196f3'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
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
  }
  
  /**
   * Initialize email metrics chart
   */
  function initEmailMetricsChart() {
    const ctx = document.getElementById('email-metrics-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Open Rate',
            data: [65, 68, 72, 75, 82, 85],
            backgroundColor: 'rgba(255, 193, 7, 0.8)'
          },
          {
            label: 'Click Rate',
            data: [32, 35, 38, 42, 45, 48],
            backgroundColor: 'rgba(76, 175, 80, 0.8)'
          }
        ]
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
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }
  
  // Handle resize events for responsive charts
  window.addEventListener('resize', function() {
    const charts = Chart.instances;
    for (let i = 0; i < charts.length; i++) {
      charts[i].resize();
    }
  });
});
