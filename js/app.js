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
    document.querySelectorAll('.school-name-text').forEach(el => el.innerText = APP_CONFIG.SCHOOL_NAME);
    document.querySelectorAll('.app-version-text').forEach(el => el.innerText = `v${APP_CONFIG.APP_VERSION}`);
    document.querySelectorAll('.current-year-text').forEach(el => el.innerText = `ปีการศึกษา ${APP_CONFIG.ACADEMIC_YEAR} ภาคเรียนที่ ${APP_CONFIG.SEMESTER}`);

    // เริ่มต้นระบบเชื่อมต่อ Firebase Realtime DB
    await db.init();

    // ตรวจสอบสถานะการล็อกอิน
    this.checkAuthState();

    // ผูก Event Listeners
    this.bindEvents();

    // เริ่มต้นเซอร์วิสย่อย
    dashboardService.init();
    recordsService.init();
    auditService.init();
    teachersService.init();
    studentsService.init();
    usersService.init();

    // ซ่อน Splash Screen / Preloader
    const preloader = document.getElementById('app-preloader');
    if (preloader) {
      preloader.classList.add('fade-out');
      setTimeout(() => preloader.style.display = 'none', 400);
    }
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
      this.switchView('dashboard');
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
      dashboardService.renderKPIs();
      dashboardService.renderCharts();
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
