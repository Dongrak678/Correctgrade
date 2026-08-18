/**
 * ระบบติดตามแก้ไขผลการเรียน (Academic Remediation System)
 * dashboard.js - แดชบอร์ดสรุปภาพรวม (Executive Dashboard) และกราฟสถิติ
 */

class DashboardService {
  constructor() {
    this.barChartInstance = null;
    this.donutChartInstance = null;
  }

  init() {
    this.renderKPIs();
    this.renderCharts();
    this.renderActivityLogs();

    // Subscribe ข้อมูลการเปลี่ยนแปลงจาก Realtime Database
    db.subscribe('records', () => {
      this.renderKPIs();
      this.renderCharts();
    });

    db.subscribe('activityLogs', () => {
      this.renderActivityLogs();
    });
  }

  /**
   * ดึงข้อมูลผลการเรียนที่สัมพันธ์กับสิทธิ์ผู้ใช้ (ครูเห็นเฉพาะวิชาของตนเอง, นักเรียนเห็นเฉพาะของตนเอง)
   */
  getDashboardRecords() {
    let records = db.get('records') || [];
    const currentUser = authService.getCurrentUser();

    if (currentUser) {
      if (currentUser.role === APP_CONFIG.ROLES.STUDENT) {
        records = records.filter(r => 
          String(r.studentId) === String(currentUser.studentId) ||
          String(r.studentName).includes(currentUser.name)
        );
      } else if (currentUser.role === APP_CONFIG.ROLES.TEACHER) {
        records = records.filter(r => recordsService.isTeacherRecordOwner(r, currentUser));
      }
    }
    return records;
  }

  /**
   * คำนวณและแสดงผลการ์ดสถิติรวม (KPI Cards)
   */
  renderKPIs() {
    const records = this.getDashboardRecords();
    
    let count0 = 0;
    let countR = 0;
    let countMS = 0;
    let countApproved = 0;
    let countInProgress = 0;
    let countPending = 0;

    records.forEach(r => {
      if (r.conditionType === '0') count0++;
      else if (r.conditionType === 'ร') countR++;
      else if (r.conditionType === 'มส') countMS++;

      if (r.status === 'approved') {
        countApproved++;
      } else if (r.status === 'pending_request') {
        countPending++;
      } else {
        countInProgress++;
      }
    });

    const total = records.length;
    const passRate = total > 0 ? Math.round((countApproved / total) * 100) : 0;

    // อัปเดตตัวเลขใน DOM พร้อม animation การนับเลข
    this.animateCounter('kpi-count-0', count0);
    this.animateCounter('kpi-count-r', countR);
    this.animateCounter('kpi-count-ms', countMS);
    this.animateCounter('kpi-count-total', total);
    this.animateCounter('kpi-count-approved', countApproved);
    this.animateCounter('kpi-count-inprogress', countInProgress);

    const passRateEl = document.getElementById('kpi-pass-rate');
    if (passRateEl) passRateEl.innerText = `${passRate}%`;
  }

  animateCounter(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const startValue = parseInt(el.innerText) || 0;
    if (startValue === targetValue) {
      el.innerText = targetValue;
      return;
    }

    const duration = 600;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(startValue + (targetValue - startValue) * progress);
      el.innerText = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.innerText = targetValue;
      }
    };

    requestAnimationFrame(update);
  }

  /**
   * วาดแผนภูมิแท่งและโดนัท (Bar Chart & Donut Chart)
   */
  renderCharts() {
    const records = this.getDashboardRecords();

    // 1. จัดกลุ่มข้อมูลตามระดับชั้น (ม.1 – ม.6, ปวช.1 – ปวช.3)
    const levels = APP_CONFIG.GRADE_LEVELS;
    const levelData0 = levels.map(lvl => records.filter(r => (r.gradeLevel || '').startsWith(lvl) && r.conditionType === '0').length);
    const levelDataR = levels.map(lvl => records.filter(r => (r.gradeLevel || '').startsWith(lvl) && r.conditionType === 'ร').length);
    const levelDataMS = levels.map(lvl => records.filter(r => (r.gradeLevel || '').startsWith(lvl) && r.conditionType === 'มส').length);

    // วาด Bar Chart
    const barCtx = document.getElementById('dashboard-bar-chart');
    if (barCtx) {
      if (this.barChartInstance) this.barChartInstance.destroy();

      this.barChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: levels,
          datasets: [
            {
              label: 'ติด 0',
              data: levelData0,
              backgroundColor: '#ef4444',
              borderRadius: 6
            },
            {
              label: 'ติด ร',
              data: levelDataR,
              backgroundColor: '#f59e0b',
              borderRadius: 6
            },
            {
              label: 'ติด มส',
              data: levelDataMS,
              backgroundColor: '#8b5cf6',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: { family: "'Sarabun', sans-serif", size: 12 },
                usePointStyle: true,
                boxWidth: 8
              }
            },
            tooltip: {
              titleFont: { family: "'Sarabun', sans-serif" },
              bodyFont: { family: "'Sarabun', sans-serif" }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: "'Sarabun', sans-serif" } }
            },
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1, font: { family: "'Sarabun', sans-serif" } }
            }
          }
        }
      });
    }

    // 2. จัดกลุ่มสถานะการแก้ไขสำหรับ Donut Chart
    let pendingCount = 0;
    let inProgressCount = 0;
    let approvedCount = 0;

    records.forEach(r => {
      if (r.status === 'approved') approvedCount++;
      else if (r.status === 'pending_request') pendingCount++;
      else inProgressCount++;
    });

    const donutCtx = document.getElementById('dashboard-donut-chart');
    if (donutCtx) {
      if (this.donutChartInstance) this.donutChartInstance.destroy();

      this.donutChartInstance = new Chart(donutCtx, {
        type: 'doughnut',
        data: {
          labels: ['ยังไม่ยื่นคำร้อง', 'อยู่ระหว่างดำเนินการ / รอตรวจ', 'ผ่านการแก้ไขแล้ว'],
          datasets: [{
            data: [pendingCount, inProgressCount, approvedCount],
            backgroundColor: ['#94a3b8', '#3b82f6', '#10b981'],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 6
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
                font: { family: "'Sarabun', sans-serif", size: 12 },
                usePointStyle: true,
                padding: 15
              }
            },
            tooltip: {
              titleFont: { family: "'Sarabun', sans-serif" },
              bodyFont: { family: "'Sarabun', sans-serif" }
            }
          }
        }
      });
    }
  }

  /**
   * แสดงฟีดกิจกรรมแบบเรียลไทม์ (Live Feed Activity Logs)
   */
  renderActivityLogs() {
    const container = document.getElementById('dashboard-activity-feed');
    if (!container) return;

    const logs = db.get('activityLogs') || [];
    if (logs.length === 0) {
      container.innerHTML = `
        <div class="empty-state-small">
          <i class="far fa-bell text-gray-400"></i>
          <p>ยังไม่มีบันทึกกิจกรรมในขณะนี้</p>
        </div>
      `;
      return;
    }

    // แสดง 8 รายการล่าสุด
    const recentLogs = logs.slice(0, 8);
    container.innerHTML = recentLogs.map(log => `
      <div class="activity-feed-item">
        <div class="activity-icon ${log.badgeClass || 'badge-blue'}">
          <i class="${this.getActivityIcon(log.type)}"></i>
        </div>
        <div class="activity-body">
          <div class="activity-header">
            <span class="activity-title">${this.escapeHtml(log.title)}</span>
            <span class="activity-time">${log.timestamp}</span>
          </div>
          <p class="activity-msg">${this.escapeHtml(log.message)}</p>
        </div>
      </div>
    `).join('');
  }

  getActivityIcon(type) {
    switch (type) {
      case 'approval': return 'fas fa-check-circle';
      case 'submission': return 'fas fa-file-upload';
      case 'assignment': return 'fas fa-tasks';
      case 'request': return 'fas fa-paper-plane';
      case 'login': return 'fas fa-sign-in-alt';
      case 'security': return 'fas fa-shield-alt';
      default: return 'fas fa-info-circle';
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }
}

// Global Singleton Instance
const dashboardService = new DashboardService();
