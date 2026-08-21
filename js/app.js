/**
 * ระบบติดตามแก้ไขผลการเรียน (Academic Remediation System)
 * app.js - ตัวควบคุมหลัก การสลับหน้าจอ (Router), การแจ้งเตือน Toast และการจัดการสถานะ
 */

class AppController {
  constructor() {
    this.currentView = 'dashboard';
  }

  async init() {
    console.log(`🚀 กำลังเริ่มต้น ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION}`);

    // กำหนดชื่อโรงเรียนและปีการศึกษาบนหัวเว็บ
    try {
      document.querySelectorAll('.school-name-text').forEach(el => el.innerText = APP_CONFIG.SCHOOL_NAME);
      document.querySelectorAll('.app-version-text').forEach(el => el.innerText = `v${APP_CONFIG.APP_VERSION}`);
      document.querySelectorAll('.current-year-text').forEach(el => el.innerText = `ปีการศึกษา ${APP_CONFIG.ACADEMIC_YEAR} ภาคเรียนที่ ${APP_CONFIG.SEMESTER}`);
    } catch (e) {
      console.warn("UI header warning:", e);
    }

    // เริ่มต้นระบบเชื่อมต่อ Firebase Realtime DB
    try {
      await db.init();
    } catch (e) {
      console.warn("DB init warning:", e);
    }

    // ตรวจสอบสถานะการล็อกอิน
    try {
      this.checkAuthState();
    } catch (e) {
      console.error("Auth check error:", e);
    }

    // ผูก Event Listeners
    try {
      this.bindEvents();
    } catch (e) {
      console.error("Bind events error:", e);
    }

    // เริ่มต้นเซอร์วิสย่อยแบบปลอดภัย (Safe Service Init)
    try { if (typeof dashboardService !== 'undefined') dashboardService.init(); } catch (e) { console.error("dashboardService init error:", e); }
    try { if (typeof recordsService !== 'undefined') recordsService.init(); } catch (e) { console.error("recordsService init error:", e); }
    try { if (typeof auditService !== 'undefined') auditService.init(); } catch (e) { console.error("auditService init error:", e); }
    try { if (typeof teachersService !== 'undefined') teachersService.init(); } catch (e) { console.error("teachersService init error:", e); }
    try { if (typeof studentsService !== 'undefined') studentsService.init(); } catch (e) { console.error("studentsService init error:", e); }
    try { if (typeof usersService !== 'undefined') usersService.init(); } catch (e) { console.error("usersService init error:", e); }

    // ซ่อน Splash Screen / Preloader เสมอ (Guaranteed Dismiss)
    this.hidePreloader();
  }

  hidePreloader() {
    const preloader = document.getElementById('app-preloader');
    if (preloader) {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 400);
    }
  }

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  checkAuthState() {
    const user = authService.getCurrentUser();
    const loginView = document.getElementById('view-login');
    const mainApp = document.getElementById('view-main-app');

    if (!user) {
      if (loginView) loginView.style.display = 'flex';
      if (mainApp) mainApp.style.display = 'none';
    } else {
      if (loginView) loginView.style.display = 'none';
      if (mainApp) mainApp.style.display = 'block';
      this.updateUserUI(user);
      this.updateNavigationForRole(user.role);
      
      // กำหนดหน้าเริ่มต้น: นักเรียนเปิดมาที่หน้าจัดการผลการเรียนทันที / ครูและแอดมินเปิดแดชบอร์ด
      if (user.role === APP_CONFIG.ROLES.STUDENT) {
        this.switchView('records');
      } else {
        this.switchView('dashboard');
      }
    }
  }

  updateUserUI(user) {
    const nameEl = document.getElementById('current-user-name');
    const roleEl = document.getElementById('current-user-role');
    const avatarEl = document.getElementById('current-user-avatar');

    if (nameEl) nameEl.innerText = user.name;
    if (roleEl) roleEl.innerText = authService.getRoleBadgeText(user.role);
    if (avatarEl) {
      avatarEl.innerHTML = `<i class="fas ${authService.getRoleIcon(user.role)}"></i>`;
    }
  }

  updateNavigationForRole(role) {
    const adminNavs = document.querySelectorAll('.nav-admin-only');
    const teacherNavs = document.querySelectorAll('.nav-teacher-only');
    const studentNavs = document.querySelectorAll('.nav-student-only');

    if (role === APP_CONFIG.ROLES.ADMIN) {
      adminNavs.forEach(el => el.style.display = '');
      teacherNavs.forEach(el => el.style.display = '');
      studentNavs.forEach(el => el.style.display = '');
    } else if (role === APP_CONFIG.ROLES.TEACHER) {
      adminNavs.forEach(el => el.style.display = 'none');
      teacherNavs.forEach(el => el.style.display = '');
      studentNavs.forEach(el => el.style.display = '');
    } else if (role === APP_CONFIG.ROLES.STUDENT) {
      adminNavs.forEach(el => el.style.display = 'none');
      teacherNavs.forEach(el => el.style.display = 'none');
      studentNavs.forEach(el => el.style.display = '');
    }
  }

  switchView(viewName) {
    const user = authService.getCurrentUser();
    // ป้องกันนักเรียนเข้าถึงหน้าที่ไม่มีสิทธิ์
    if (user && user.role === APP_CONFIG.ROLES.STUDENT) {
      if (viewName !== 'records' && viewName !== 'audit') {
        viewName = 'records';
      }
    }

    this.currentView = viewName;

    // อัปเดต Active Tab ใน Sidebar / Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    // แสดงเฉพาะ View Container ที่เลือก
    document.querySelectorAll('.app-view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `view-${viewName}`);
    });

    // ปิด Sidebar บนมือถือเมื่อกดเลือกเมนู
    this.closeMobileSidebar();

    // Trigger การรีเฟรชข้อมูลตามหน้าจอ
    if (viewName === 'dashboard') {
      dashboardService.init();
    } else if (viewName === 'records') {
      recordsService.renderRecordsTable();
    } else if (viewName === 'audit') {
      auditService.renderAuditTable();
    } else if (viewName === 'teachers') {
      teachersService.renderTeachersGrid();
    } else if (viewName === 'students') {
      studentsService.renderStudentsTable();
    } else if (viewName === 'users') {
      usersService.renderUsersTable();
    }

    // เลื่อนหน้าจอกลับไปด้านบนสุด
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.toggle('open');
    if (backdrop) backdrop.classList.toggle('active');
  }

  closeMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  }

  // --- Quick Demo Role Switcher ---
  quickLoginAs(role) {
    const users = db.get('users');
    let target = null;

    if (role === 'admin') target = users.find(u => u.role === 'admin');
    else if (role === 'teacher') target = users.find(u => u.role === 'teacher');
    else if (role === 'student') target = users.find(u => u.role === 'student');

    if (target) {
      authService.login(target.username, target.password).then(res => {
        if (res.success) {
          this.checkAuthState();
          this.showToast(`สลับบทบาทเป็น: ${target.name} (${authService.getRoleBadgeText(target.role)})`, "info");
        }
      });
    }
  }

  // --- Toast Notifications ---
  showToast(message, type = "info", duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let icon = "fa-info-circle";
    if (type === "success") icon = "fa-check-circle";
    else if (type === "warning") icon = "fa-exclamation-triangle";
    else if (type === "error") icon = "fa-times-circle";

    toast.innerHTML = `
      <div class="toast-icon"><i class="fas ${icon}"></i></div>
      <div class="toast-content">${message}</div>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  // --- Profile & Password Change Modal ---
  openProfileModal() {
    const user = authService.getCurrentUser();
    if (!user) return;

    const modal = document.getElementById('profile-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="app.closeProfileModal()"></div>
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-blue"><i class="fas fa-user-cog"></i> บัญชีผู้ใช้</span>
            <h3>ข้อมูลโปรไฟล์และเปลี่ยนรหัสผ่าน</h3>
          </div>
          <button class="btn-close-modal" onclick="app.closeProfileModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="profile-header-card">
            <div class="profile-avatar-large">
              <i class="fas ${authService.getRoleIcon(user.role)}"></i>
            </div>
            <div class="profile-meta">
              <h4>${user.name}</h4>
              <span class="profile-role-tag">${authService.getRoleBadgeText(user.role)}</span>
              <span class="profile-user-tag font-mono text-xs text-gray-500">Username: ${user.username}</span>
            </div>
          </div>

          <form id="form-change-password" onsubmit="app.handleChangePasswordSubmit(event)">
            <h5 class="section-sub-title mt-4 mb-3"><i class="fas fa-lock text-amber-500 mr-1"></i> เปลี่ยนรหัสผ่านเข้าสู่ระบบ</h5>
            
            <div class="form-group">
              <label for="old-pwd">รหัสผ่านปัจจุบัน <span class="text-red-500">*</span></label>
              <div class="password-input-wrap">
                <input type="password" id="old-pwd" class="form-control" required placeholder="กรอกรหัสผ่านเดิม">
                <button type="button" class="btn-toggle-pwd" onclick="authService.togglePasswordVisibility('old-pwd', 'old-pwd-icon')">
                  <i id="old-pwd-icon" class="fas fa-eye"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="new-pwd">รหัสผ่านใหม่ <span class="text-red-500">*</span></label>
              <div class="password-input-wrap">
                <input type="password" id="new-pwd" class="form-control" required minlength="4" placeholder="รหัสผ่านใหม่อย่างน้อย 4 ตัวอักษร">
                <button type="button" class="btn-toggle-pwd" onclick="authService.togglePasswordVisibility('new-pwd', 'new-pwd-icon')">
                  <i id="new-pwd-icon" class="fas fa-eye"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="confirm-pwd">ยืนยันรหัสผ่านใหม่อีกครั้ง <span class="text-red-500">*</span></label>
              <div class="password-input-wrap">
                <input type="password" id="confirm-pwd" class="form-control" required minlength="4" placeholder="กรอกรหัสผ่านใหม่ซ้ำอีกครั้ง">
                <button type="button" class="btn-toggle-pwd" onclick="authService.togglePasswordVisibility('confirm-pwd', 'confirm-pwd-icon')">
                  <i id="confirm-pwd-icon" class="fas fa-eye"></i>
                </button>
              </div>
            </div>

            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-outline" onclick="app.closeProfileModal()">ปิด</button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-check-circle mr-1"></i> บันทึกรหัสผ่านใหม่
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    modal.classList.add('active');
  }

  async handleChangePasswordSubmit(e) {
    e.preventDefault();
    const oldP = document.getElementById('old-pwd').value;
    const newP = document.getElementById('new-pwd').value;
    const confP = document.getElementById('confirm-pwd').value;

    try {
      await authService.changePassword(oldP, newP, confP);
      this.closeProfileModal();
      this.showToast("เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว", "success");
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  }

  closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.remove('active');
  }

  // --- Helper Status Badges ---
  getStatusTitle(statusCode) {
    const item = Object.values(APP_CONFIG.WORKFLOW_STEPS).find(s => s.code === statusCode);
    return item ? item.title : statusCode;
  }

  getStatusBadgeClass(statusCode) {
    const item = Object.values(APP_CONFIG.WORKFLOW_STEPS).find(s => s.code === statusCode);
    return item ? item.badgeClass : 'badge-gray';
  }

  getStatusIcon(statusCode) {
    switch (statusCode) {
      case 'pending_request': return 'far fa-circle text-gray-400';
      case 'requested': return 'fas fa-paper-plane text-blue-500';
      case 'assigned': return 'fas fa-clipboard-list text-amber-500';
      case 'submitted': return 'fas fa-upload text-purple-500';
      case 'approved': return 'fas fa-check-circle text-emerald-500';
      case 'rejected': return 'fas fa-times-circle text-rose-500';
      default: return 'fas fa-info-circle';
    }
  }

  // --- Academic Year & Semester Switcher ---
  updateAcademicTermDisplay() {
    const text = `ปีการศึกษา ${APP_CONFIG.ACADEMIC_YEAR} ภาคเรียนที่ ${APP_CONFIG.SEMESTER}`;
    document.querySelectorAll('.current-year-text').forEach(el => el.innerText = text);
    
    const topbarText = document.getElementById('topbar-academic-term-text');
    if (topbarText) topbarText.innerText = text;

    const heroTerm = document.getElementById('dashboard-hero-term');
    if (heroTerm) heroTerm.innerText = text;
  }

  setAcademicTerm(year, semester) {
    if (!year) year = "2569";
    if (!semester) semester = "1";

    APP_CONFIG.ACADEMIC_YEAR = String(year);
    APP_CONFIG.SEMESTER = String(semester);

    localStorage.setItem('dongrak_academic_year', String(year));
    localStorage.setItem('dongrak_semester', String(semester));

    this.updateAcademicTermDisplay();

    // รีเฟรชหน้า Dashboard และตารางผลการเรียน
    try {
      if (typeof dashboardService !== 'undefined') dashboardService.init(true);
      if (typeof recordsService !== 'undefined') recordsService.renderRecordsTable();
    } catch (e) {
      console.warn("Term refresh error:", e);
    }

    this.showToast(`📅 เปลี่ยนเป็น ปีการศึกษา ${year} ภาคเรียนที่ ${semester} เรียบร้อยแล้ว`, "success");
    this.closeTermSelectorModal();
  }

  openTermSelectorModal() {
    const modal = document.getElementById('modal-term-selector');
    if (!modal) return;

    // เลือกปีและเทอมปัจจุบัน
    const yearSelect = document.getElementById('term-selector-year');
    if (yearSelect) yearSelect.value = APP_CONFIG.ACADEMIC_YEAR;

    this.selectedModalSemester = APP_CONFIG.SEMESTER || "1";
    this.highlightModalSemester(this.selectedModalSemester);

    modal.classList.add('active');
  }

  closeTermSelectorModal() {
    const modal = document.getElementById('modal-term-selector');
    if (modal) modal.classList.remove('active');
  }

  selectModalSemester(sem) {
    this.selectedModalSemester = String(sem);
    this.highlightModalSemester(sem);
  }

  highlightModalSemester(sem) {
    document.querySelectorAll('.term-choice-btn').forEach(btn => {
      if (btn.getAttribute('data-semester') === String(sem)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  saveTermSelector() {
    const yearSelect = document.getElementById('term-selector-year');
    const year = yearSelect ? yearSelect.value : APP_CONFIG.ACADEMIC_YEAR;
    const semester = this.selectedModalSemester || "1";
    this.setAcademicTerm(year, semester);
  }

  /**
   * แสดงหน้าต่าง Pop-up ยืนยันการกระทำ (Universal Confirm Modal)
   * @param {Object} options
   * @param {string} options.title - หัวข้อ เช่น "ยืนยันการลบข้อมูล"
   * @param {string} options.message - ข้อความอธิบาย
   * @param {string} options.type - 'danger' | 'warning' | 'info' | 'logout'
   * @param {string} options.confirmText - ข้อความบนปุ่มยืนยัน
   * @param {string} options.confirmIcon - ไอคอน เช่น "fas fa-trash-alt"
   * @param {string} options.btnClass - คลาสของปุ่มยืนยัน เช่น "btn-rose", "btn-amber", "btn-primary"
   * @returns {Promise<boolean>}
   */
  confirmAction(options = {}) {
    return new Promise((resolve) => {
      const modal = document.getElementById('modal-confirm-dialog');
      if (!modal) {
        // Fallback ถ้าไม่มี modal ใน DOM
        resolve(window.confirm(options.message || "คุณต้องการดำเนินการต่อไปหรือไม่?"));
        return;
      }

      const titleEl = document.getElementById('confirm-title');
      const msgEl = document.getElementById('confirm-message');
      const iconBox = document.getElementById('confirm-icon-box');
      const iconEl = document.getElementById('confirm-icon');
      const okBtn = document.getElementById('confirm-ok-btn');
      const cancelBtn = document.getElementById('confirm-cancel-btn');

      if (titleEl) titleEl.innerText = options.title || "ยืนยันการทำรายการ";
      if (msgEl) msgEl.innerText = options.message || "คุณแน่ใจหรือไม่ว่าต้องการดำเนินการนี้?";

      const type = options.type || "danger";
      if (iconBox) {
        iconBox.className = `confirm-modal-icon confirm-type-${type}`;
      }

      if (iconEl) {
        if (options.confirmIcon) {
          iconEl.className = options.confirmIcon;
        } else if (type === 'logout') {
          iconEl.className = 'fas fa-sign-out-alt';
        } else if (type === 'danger') {
          iconEl.className = 'fas fa-trash-alt';
        } else if (type === 'warning') {
          iconEl.className = 'fas fa-exclamation-triangle';
        } else {
          iconEl.className = 'fas fa-question-circle';
        }
      }

      if (okBtn) {
        okBtn.className = `btn ${options.btnClass || (type === 'danger' || type === 'logout' ? 'btn-rose' : 'btn-primary')} px-4 font-bold`;
        okBtn.innerHTML = `<i class="${options.confirmIcon || (type === 'danger' ? 'fas fa-trash-alt' : type === 'logout' ? 'fas fa-sign-out-alt' : 'fas fa-check')} mr-1"></i> ${options.confirmText || 'ยืนยัน'}`;
      }

      if (cancelBtn) {
        cancelBtn.innerText = options.cancelText || 'ยกเลิก';
      }

      this._confirmResolve = resolve;
      modal.classList.add('active');
    });
  }

  closeConfirmDialog(result = false) {
    const modal = document.getElementById('modal-confirm-dialog');
    if (modal) modal.classList.remove('active');
    if (this._confirmResolve) {
      this._confirmResolve(Boolean(result));
      this._confirmResolve = null;
    }
  }

  bindEvents() {
    // Login Form Submit
    const loginForm = document.getElementById('main-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('login-username').value;
        const p = document.getElementById('login-password').value;
        const res = await authService.login(u, p);
        if (res.success) {
          this.checkAuthState();
          this.showToast(`ยินดีต้อนรับคุณ ${res.user.name}`, "success");
        }
      });
    }
  }
}

// Global App Instance
const app = new AppController();

// เมื่อ DOM โหลดเสร็จ เริ่มต้นระบบทันที
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
