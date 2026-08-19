/**
 * ระบบติดตามแก้ไขผลการเรียน (Academic Remediation System)
 * dashboard.js - แดชบอร์ดสรุปภาพรวม (Executive Analytical Center) และกราฟสถิติ
 */

class DashboardService {
  constructor() {
    this.barChartInstance = null;
    this.donutChartInstance = null;
    this.chartLevelGroup = 'all'; // 'all', 'lower', 'upper'
    this.activityFilter = 'all';   // 'all', 'approval', 'submission', 'request'
    this.clockInterval = null;
  }

  init(isManualRefresh = false) {
    this.startLiveClock();
    this.renderHero();
    this.renderKPIs();
    this.renderInsights();
    this.renderFunnel();
    this.renderCharts();
    this.renderTopSubjects();
    this.renderActivityLogs();

    // Subscribe ข้อมูลการเปลี่ยนแปลงจาก Realtime Database
    if (!this._subscribed) {
      db.subscribe('records', () => {
        this.renderKPIs();
        this.renderInsights();
        this.renderFunnel();
        this.renderCharts();
        this.renderTopSubjects();
      });

      db.subscribe('activityLogs', () => {
        this.renderActivityLogs();
      });
      this._subscribed = true;
    }

    if (isManualRefresh && typeof app !== 'undefined' && app.showToast) {
      app.showToast('อัปเดตสถิติแดชบอร์ดล่าสุดสำเร็จ', 'success');
    }
  }

  /**
   * นาฬิกาแสดงเวลาจริงแบบเรียลไทม์ (Live Clock)
   */
  startLiveClock() {
    if (this.clockInterval) clearInterval(this.clockInterval);

    const updateClock = () => {
      const clockEl = document.getElementById('dashboard-hero-clock');
      if (!clockEl) return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      clockEl.innerHTML = `<i class="far fa-clock"></i> ${hh}:${mm}:${ss} น.`;
    };

    updateClock();
    this.clockInterval = setInterval(updateClock, 1000);
  }

  /**
   * ปุ่มรีเฟรชพร้อมเอฟเฟกต์หมุนไอคอน
   */
  refreshWithAnimation() {
    const icon = document.getElementById('dashboard-refresh-icon');
    if (icon) {
      icon.classList.add('fa-spin');
      setTimeout(() => icon.classList.remove('fa-spin'), 700);
    }
    this.init(true);
  }

  /**
   * อัปเดต Hero Header: ข้อความทักทาย, วันที่ไทย, ภาคเรียน
   */
  renderHero() {
    const currentUser = authService.getCurrentUser();
    const headingEl = document.getElementById('dashboard-welcome-heading');
    const subEl = document.getElementById('dashboard-welcome-sub');
    const termEl = document.getElementById('dashboard-hero-term');
    const dateEl = document.getElementById('dashboard-hero-date');

    if (termEl) {
      termEl.innerText = `ปีการศึกษา ${APP_CONFIG.ACADEMIC_YEAR} ภาคเรียนที่ ${APP_CONFIG.SEMESTER}`;
    }

    if (dateEl) {
      const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      const now = new Date();
      const day = now.getDate();
      const month = thaiMonths[now.getMonth()];
      const year = now.getFullYear() + 543;
      dateEl.innerHTML = `<i class="far fa-calendar-alt"></i> วันที่ ${day} ${month} ${year}`;
    }

    if (currentUser && headingEl) {
      const hour = new Date().getHours();
      let timeGreeting = 'สวัสดี';
      if (hour < 12) timeGreeting = 'อรุณสวัสดิ์';
      else if (hour < 17) timeGreeting = 'สวัสดีตอนบ่าย';
      else timeGreeting = 'สวัสดีตอนเย็น';

      if (currentUser.role === APP_CONFIG.ROLES.STUDENT) {
        headingEl.innerHTML = `${timeGreeting}, ${this.escapeHtml(currentUser.name)} 🎓`;
        if (subEl) subEl.innerText = `ติดตามผลการเรียน 0, ร, มส และยื่นคำร้องขอแก้ไขผลการเรียนของตนเอง`;
      } else if (currentUser.role === APP_CONFIG.ROLES.TEACHER) {
        headingEl.innerHTML = `${timeGreeting}, ${this.escapeHtml(currentUser.name)} 👨‍🏫`;
        if (subEl) subEl.innerText = `ภาพรวมนักเรียนที่ติดเงื่อนไขในรายวิชาที่สอน และความคืบหน้าการส่งงาน`;
      } else {
        headingEl.innerHTML = `${timeGreeting}, ศูนย์บัญชาการและวิเคราะห์ผลการเรียน 👑`;
        if (subEl) subEl.innerText = `สรุปภาพรวมสถิตินักเรียนติด 0, ร, มส และติดตามกระบวนการแก้ผลการเรียนทั้งระบบ`;
      }
    }
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
   * ประมวลผลและแสดง Smart Executive Insights Card
   */
  renderInsights() {
    const textEl = document.getElementById('dashboard-insights-text');
    const rateEl = document.getElementById('dashboard-insights-rate');
    if (!textEl) return;

    const records = this.getDashboardRecords();
    const total = records.length;

    if (total === 0) {
      textEl.innerHTML = `🌟 <strong>ยอดเยี่ยมมาก!</strong> ขณะนี้ไม่มีรายการผลการเรียนที่ติดเงื่อนไข 0, ร, มส ในระบบ`;
      if (rateEl) rateEl.innerText = '100%';
      return;
    }

    let countApproved = 0;
    let countPending = 0;
    let countInReview = 0;
    const gradeLevelMap = {};
    const subjectMap = {};

    records.forEach(r => {
      if (r.status === 'approved') countApproved++;
      else if (r.status === 'pending_request' || !r.status) countPending++;
      else countInReview++;

      const lvl = (r.gradeLevel || 'ไม่ระบุ').trim();
      gradeLevelMap[lvl] = (gradeLevelMap[lvl] || 0) + 1;

      const sub = (r.subjectCode || '').trim();
      if (sub) subjectMap[sub] = (subjectMap[sub] || 0) + 1;
    });

    const passRate = Math.round((countApproved / total) * 100);
    if (rateEl) rateEl.innerText = `${passRate}%`;

    // หาชั้นที่มีจำนวนติดสูงสุด
    let topLevel = '-';
    let topLevelCount = 0;
    Object.entries(gradeLevelMap).forEach(([lvl, count]) => {
      if (count > topLevelCount) {
        topLevelCount = count;
        topLevel = lvl;
      }
    });

    // หาวิชาที่ติดสูงสุด
    let topSubject = '-';
    let topSubCount = 0;
    Object.entries(subjectMap).forEach(([sub, count]) => {
      if (count > topSubCount) {
        topSubCount = count;
        topSubject = sub;
      }
    });

    let insightHTML = `📌 <strong>สถานะปัจจุบัน:</strong> แก้ไขผ่านแล้ว <b>${countApproved}/${total} รายการ (${passRate}%)</b>`;
    if (countPending > 0) {
      insightHTML += ` · มีรายการ <span class="text-red-600 font-bold">รอยื่นคำร้อง ${countPending} รายการ</span> (ระดับชั้น ${topLevel})`;
    }
    if (countInReview > 0) {
      insightHTML += ` · อยู่ระหว่างส่งตรวจ/มอบหมาย <b>${countInReview} รายการ</b>`;
    }
    if (topSubject !== '-') {
      insightHTML += ` · รายวิชาที่ติดเงื่อนไขสูงสุดคือ <b>${topSubject}</b> (${topSubCount} คน)`;
    }

    textEl.innerHTML = insightHTML;
  }

  /**
   * คำนวณและแสดงผลการ์ดสถิติรวม (6 KPI Metric Cards)
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
      } else if (r.status === 'pending_request' || !r.status) {
        countPending++;
      } else {
        countInProgress++;
      }
    });

    const total = records.length;
    const passRate = total > 0 ? Math.round((countApproved / total) * 100) : 0;
    const pct0 = total > 0 ? Math.round((count0 / total) * 100) : 0;
    const pctR = total > 0 ? Math.round((countR / total) * 100) : 0;
    const pctMS = total > 0 ? Math.round((countMS / total) * 100) : 0;
    const pctInProgress = total > 0 ? Math.round((countInProgress / total) * 100) : 0;

    // อัปเดตตัวเลขใน DOM พร้อม animation การนับเลข
    this.animateCounter('kpi-count-0', count0);
    this.animateCounter('kpi-count-r', countR);
    this.animateCounter('kpi-count-ms', countMS);
    this.animateCounter('kpi-count-total', total);
    this.animateCounter('kpi-count-approved', countApproved);
    this.animateCounter('kpi-count-inprogress', countInProgress);

    // อัปเดต % badges
    this.updateElText('kpi-pct-0', `${pct0}%`);
    this.updateElText('kpi-pct-r', `${pctR}%`);
    this.updateElText('kpi-pct-ms', `${pctMS}%`);
    this.updateElText('kpi-pct-inprogress', `${pctInProgress}%`);
    this.updateElText('kpi-pass-rate', `${passRate}%`);

    // อัปเดต Progress Bars
    this.updateProgressBar('kpi-bar-0', pct0);
    this.updateProgressBar('kpi-bar-r', pctR);
    this.updateProgressBar('kpi-bar-ms', pctMS);
    this.updateProgressBar('kpi-bar-inprogress', pctInProgress);
    this.updateProgressBar('kpi-bar-approved', passRate);
  }

  updateElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  }

  updateProgressBar(id, pct) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }

  /**
   * คำนวณและแสดงผล Remediation Workflow Progression Funnel
   */
  renderFunnel() {
    const records = this.getDashboardRecords();
    const total = records.length;

    let countPending = 0;   // 1. pending_request
    let countRequested = 0; // 2. requested
    let countInReview = 0;  // 3. assigned + submitted
    let countApproved = 0;  // 4. approved

    records.forEach(r => {
      if (r.status === 'approved') {
        countApproved++;
      } else if (r.status === 'assigned' || r.status === 'submitted') {
        countInReview++;
      } else if (r.status === 'requested') {
        countRequested++;
      } else {
        countPending++;
      }
    });

    const pct1 = total > 0 ? Math.round((countPending / total) * 100) : 0;
    const pct2 = total > 0 ? Math.round((countRequested / total) * 100) : 0;
    const pct3 = total > 0 ? Math.round((countInReview / total) * 100) : 0;
    const pct4 = total > 0 ? Math.round((countApproved / total) * 100) : 0;

    this.updateElText('funnel-count-1', `${countPending} รายการ`);
    this.updateElText('funnel-count-2', `${countRequested} รายการ`);
    this.updateElText('funnel-count-3', `${countInReview} รายการ`);
    this.updateElText('funnel-count-4', `${countApproved} รายการ`);

    this.updateElText('funnel-pct-1', `${pct1}%`);
    this.updateElText('funnel-pct-2', `${pct2}%`);
    this.updateElText('funnel-pct-3', `${pct3}%`);
    this.updateElText('funnel-pct-4', `${pct4}%`);

    this.updateElText('funnel-success-rate', `${pct4}%`);
  }

  animateCounter(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const startValue = parseInt(el.innerText) || 0;
    if (startValue === targetValue) {
      el.innerText = targetValue;
      return;
    }

    const duration = 500;
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
   * สลับแท็บระดับชั้นสำหรับ Bar Chart
   */
  setChartLevelFilter(group) {
    this.chartLevelGroup = group;
    document.querySelectorAll('.btn-chart-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === group);
    });
    this.renderCharts();
  }

  /**
   * วาดแผนภูมิแท่งและโดนัท (Bar Chart & Donut Chart)
   */
  renderCharts() {
    const records = this.getDashboardRecords();

    // 1. จัดกลุ่มข้อมูลตามระดับชั้นที่เลือก
    let levels = APP_CONFIG.GRADE_LEVELS || ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6', 'ปวช.1', 'ปวช.2', 'ปวช.3'];
    if (this.chartLevelGroup === 'lower') {
      levels = ['ม.1', 'ม.2', 'ม.3'];
    } else if (this.chartLevelGroup === 'upper') {
      levels = ['ม.4', 'ม.5', 'ม.6', 'ปวช.1', 'ปวช.2', 'ปวช.3'];
    }

    const levelData0 = levels.map(lvl => records.filter(r => (r.gradeLevel || '').startsWith(lvl) && r.conditionType === '0').length);
    const levelDataR = levels.map(lvl => records.filter(r => (r.gradeLevel || '').startsWith(lvl) && r.conditionType === 'ร').length);
    const levelDataMS = levels.map(lvl => records.filter(r => (r.gradeLevel || '').startsWith(lvl) && r.conditionType === 'มส').length);

    // วาด Bar Chart
    const barCanvas = document.getElementById('dashboard-bar-chart');
    if (barCanvas) {
      if (this.barChartInstance) this.barChartInstance.destroy();

      this.barChartInstance = new Chart(barCanvas, {
        type: 'bar',
        data: {
          labels: levels,
          datasets: [
            {
              label: 'ติด 0',
              data: levelData0,
              backgroundColor: '#ef4444',
              borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
              borderSkipped: false,
              barPercentage: 0.65,
              categoryPercentage: 0.75
            },
            {
              label: 'ติด ร',
              data: levelDataR,
              backgroundColor: '#f59e0b',
              borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
              borderSkipped: false,
              barPercentage: 0.65,
              categoryPercentage: 0.75
            },
            {
              label: 'ติด มส',
              data: levelDataMS,
              backgroundColor: '#8b5cf6',
              borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
              borderSkipped: false,
              barPercentage: 0.65,
              categoryPercentage: 0.75
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 600, easing: 'easeOutQuart' },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                font: { family: "'Sarabun', sans-serif", size: 12, weight: '600' },
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 7,
                padding: 12
              }
            },
            tooltip: {
              backgroundColor: '#0f172a',
              padding: 10,
              cornerRadius: 8,
              titleFont: { family: "'Sarabun', sans-serif", size: 13, weight: '700' },
              bodyFont: { family: "'Sarabun', sans-serif", size: 12 },
              usePointStyle: true
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: "'Sarabun', sans-serif", size: 12, weight: '600' }, color: '#64748b' }
            },
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: { stepSize: 1, font: { family: "'Sarabun', sans-serif", size: 11 }, color: '#94a3b8' }
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
      else if (r.status === 'pending_request' || !r.status) pendingCount++;
      else inProgressCount++;
    });

    const total = records.length;
    const passRate = total > 0 ? Math.round((approvedCount / total) * 100) : 0;
    const pctPending = total > 0 ? Math.round((pendingCount / total) * 100) : 0;
    const pctInProgress = total > 0 ? Math.round((inProgressCount / total) * 100) : 0;

    // อัปเดต Center Metric
    const centerPctEl = document.getElementById('donut-center-pct');
    if (centerPctEl) centerPctEl.innerText = `${passRate}%`;

    // อัปเดต Custom Donut Legend
    const legendContainer = document.getElementById('dashboard-donut-legend');
    if (legendContainer) {
      legendContainer.innerHTML = `
        <div class="donut-legend-item" onclick="dashboardService.filterToRecordsByStatus('pending_request')" style="cursor:pointer;" title="คลิกเพื่อดูกลุ่มนี้">
          <div class="legend-left">
            <span class="legend-dot" style="background:#94a3b8;"></span>
            <span>ยังไม่ยื่นคำร้อง</span>
          </div>
          <div class="legend-right">
            <span>${pendingCount} รายการ</span>
            <span class="legend-pct-pill">${pctPending}%</span>
          </div>
        </div>
        <div class="donut-legend-item" onclick="dashboardService.filterToRecordsByStatus('in_progress')" style="cursor:pointer;" title="คลิกเพื่อดูกลุ่มนี้">
          <div class="legend-left">
            <span class="legend-dot" style="background:#2563eb;"></span>
            <span>อยู่ระหว่างดำเนินการ / รอตรวจ</span>
          </div>
          <div class="legend-right">
            <span>${inProgressCount} รายการ</span>
            <span class="legend-pct-pill">${pctInProgress}%</span>
          </div>
        </div>
        <div class="donut-legend-item" onclick="dashboardService.filterToRecordsByStatus('approved')" style="cursor:pointer;" title="คลิกเพื่อดูกลุ่มนี้">
          <div class="legend-left">
            <span class="legend-dot" style="background:#10b981;"></span>
            <span>ผ่านการแก้ไขแล้ว</span>
          </div>
          <div class="legend-right">
            <span class="text-emerald-600 font-bold">${approvedCount} รายการ</span>
            <span class="legend-pct-pill" style="background:#d1fae5; color:#065f46;">${passRate}%</span>
          </div>
        </div>
      `;
    }

    const donutCanvas = document.getElementById('dashboard-donut-chart');
    if (donutCanvas) {
      if (this.donutChartInstance) this.donutChartInstance.destroy();

      this.donutChartInstance = new Chart(donutCanvas, {
        type: 'doughnut',
        data: {
          labels: ['ยังไม่ยื่นคำร้อง', 'อยู่ระหว่างดำเนินการ / รอตรวจ', 'ผ่านการแก้ไขแล้ว'],
          datasets: [{
            data: [pendingCount, inProgressCount, approvedCount],
            backgroundColor: ['#94a3b8', '#2563eb', '#10b981'],
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          animation: { duration: 600, easing: 'easeOutQuart' },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0f172a',
              padding: 10,
              cornerRadius: 8,
              titleFont: { family: "'Sarabun', sans-serif", size: 13, weight: '700' },
              bodyFont: { family: "'Sarabun', sans-serif", size: 12 }
            }
          }
        }
      });
    }
  }

  /**
   * คำนวณและแสดง 5 อันดับวิชาที่มีนักเรียนติดเงื่อนไขสูงสุด (Top 5 Condition Subjects)
   */
  renderTopSubjects() {
    const container = document.getElementById('dashboard-top-subjects');
    if (!container) return;

    const records = this.getDashboardRecords();
    if (records.length === 0) {
      container.innerHTML = `
        <div class="empty-state-small">
          <i class="fas fa-check-circle text-emerald-500"></i>
          <p>ไม่มีรายวิชาที่ติดเงื่อนไขในขณะนี้</p>
        </div>
      `;
      return;
    }

    // จัดกลุ่มตามรายวิชา
    const subjectMap = {};
    records.forEach(r => {
      const code = (r.subjectCode || 'ไม่ระบุ').trim();
      const name = (r.subjectName || '-').trim();
      const teacher = (r.teacherName || '-').trim();
      const key = `${code}___${name}`;

      if (!subjectMap[key]) {
        subjectMap[key] = {
          code,
          name,
          teacher,
          count0: 0,
          countR: 0,
          countMS: 0,
          total: 0
        };
      }

      if (r.conditionType === '0') subjectMap[key].count0++;
      else if (r.conditionType === 'ร') subjectMap[key].countR++;
      else if (r.conditionType === 'มส') subjectMap[key].countMS++;
      subjectMap[key].total++;
    });

    const sortedSubjects = Object.values(subjectMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const maxCount = sortedSubjects[0]?.total || 1;

    container.innerHTML = sortedSubjects.map((sub, idx) => {
      const barPct = Math.round((sub.total / maxCount) * 100);
      return `
        <div class="top-subject-item" onclick="dashboardService.filterToRecordsBySubject('${this.escapeHtml(sub.code)}')" title="คลิกเพื่อดูรายการวิชา ${this.escapeHtml(sub.code)}">
          <div class="subject-rank-badge">#${idx + 1}</div>
          <div class="subject-main-info">
            <div class="subject-name-text">${this.escapeHtml(sub.code)} ${this.escapeHtml(sub.name)}</div>
            <div class="subject-sub-text">
              <span><i class="fas fa-chalkboard-teacher"></i> ${this.escapeHtml(sub.teacher)}</span>
            </div>
            <div class="kpi-progress-track" style="margin-top:4px; height:3.5px;">
              <div class="kpi-progress-bar bg-red" style="width: ${barPct}%;"></div>
            </div>
          </div>
          <div class="subject-stats-wrap">
            <div class="subject-total-badge">${sub.total} คน</div>
            <div class="condition-pills-row">
              ${sub.count0 > 0 ? `<span class="cond-pill c0">0: ${sub.count0}</span>` : ''}
              ${sub.countR > 0 ? `<span class="cond-pill cr">ร: ${sub.countR}</span>` : ''}
              ${sub.countMS > 0 ? `<span class="cond-pill cms">มส: ${sub.countMS}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * สลับประเภท Activity Logs Filter
   */
  setActivityFilter(type) {
    this.activityFilter = type;
    document.querySelectorAll('.btn-activity-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });
    this.renderActivityLogs();
  }

  /**
   * แสดงฟีดกิจกรรมแบบเรียลไทม์ (Live Feed Activity Logs)
   */
  renderActivityLogs() {
    const container = document.getElementById('dashboard-activity-feed');
    if (!container) return;

    let logs = db.get('activityLogs') || [];

    if (this.activityFilter !== 'all') {
      logs = logs.filter(l => l.type === this.activityFilter);
    }

    if (logs.length === 0) {
      container.innerHTML = `
        <div class="empty-state-small">
          <i class="far fa-bell text-gray-400"></i>
          <p>ยังไม่มีบันทึกกิจกรรม${this.activityFilter !== 'all' ? 'ในหมวดนี้' : ''}ในขณะนี้</p>
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

  /**
   * นำทางไปยังตารางผลการเรียน พร้อมตั้งค่า Filter ประเภทเกรด (0, ร, มส)
   */
  filterToRecords(conditionType) {
    if (typeof recordsService !== 'undefined') {
      recordsService.setGradeFilter(conditionType);
    }
    if (typeof app !== 'undefined') {
      app.switchView('records');
    }
  }

  /**
   * นำทางไปยังตารางผลการเรียน พร้อมตั้งค่า Filter สถานะ Workflow
   */
  filterToRecordsByStatus(status) {
    if (typeof recordsService !== 'undefined') {
      if (status === 'in_progress') {
        recordsService.setStatusFilter('all');
      } else if (status === 'in_review') {
        recordsService.setStatusFilter('assigned');
      } else {
        recordsService.setStatusFilter(status);
      }

      const statusSelect = document.getElementById('filter-records-status');
      if (statusSelect) {
        statusSelect.value = (status === 'in_progress') ? 'all' : (status === 'in_review' ? 'assigned' : status);
      }
    }
    if (typeof app !== 'undefined') {
      app.switchView('records');
    }
  }

  /**
   * นำทางไปยังตารางผลการเรียน พร้อมตั้งค่าค้นหารหัสวิชา
   */
  filterToRecordsBySubject(subjectCode) {
    if (typeof recordsService !== 'undefined') {
      recordsService.setSearchQuery(subjectCode);
      const searchInput = document.getElementById('search-records-input');
      if (searchInput) searchInput.value = subjectCode;
    }
    if (typeof app !== 'undefined') {
      app.switchView('records');
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
