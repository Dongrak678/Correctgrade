/**
 * ระบบติดตามแก้ไขผลการเรียน (Academic Remediation System)
 * auth.js - ระบบยืนยันตัวตน Smart Universal Login, สิทธิ์ผู้ใช้งาน และความปลอดภัย
 */

class AuthService {
  constructor() {
    this.currentUser = null;
    this.selectedLoginRole = 'student'; // 'student', 'teacher', 'admin', 'universal'
    this.initSession();
  }

  initSession() {
    try {
      const saved = sessionStorage.getItem('dongrak_auth_user');
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Session restore error:", e);
      this.currentUser = null;
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === APP_CONFIG.ROLES.ADMIN;
  }

  isTeacher() {
    return this.currentUser && this.currentUser.role === APP_CONFIG.ROLES.TEACHER;
  }

  isStudent() {
    return this.currentUser && this.currentUser.role === APP_CONFIG.ROLES.STUDENT;
  }

  /**
   * Smart Universal Login Method
   * ตรวจสอบรหัสผ่านอย่างเข้มงวด พร้อมค้นหาบทบาทบัญชีอัตโนมัติ
   */
  async login(username, password, explicitRole = null) {
    if (!username || !username.trim()) {
      this.showLoginError("กรุณากรอกชื่อผู้ใช้งาน หรือรหัสประจำตัว", "username");
      return { success: false, error: "กรุณากรอกชื่อผู้ใช้งาน" };
    }

    if (!password) {
      this.showLoginError("กรุณากรอกรหัสผ่าน", "password");
      return { success: false, error: "กรุณากรอกรหัสผ่าน" };
    }

    const cleanUsername = username.trim().toLowerCase();
    const users = db.get('users');

    // ค้นหาผู้ใช้จาก username, studentId, teacherId, หรือ email (Smart Account Detection)
    let user = users.find(u => 
      (u.username && u.username.toLowerCase() === cleanUsername) ||
      (u.studentId && String(u.studentId).toLowerCase() === cleanUsername) ||
      (u.teacherId && String(u.teacherId).toLowerCase() === cleanUsername) ||
      (u.email && u.email.toLowerCase() === cleanUsername)
    );

    // หากไม่พบผู้ใช้
    if (!user) {
      this.showLoginError(
        `ไม่พบบัญชีผู้ใช้งาน "${username}" ในระบบ\nกรุณาตรวจสอบชื่อผู้ใช้หรือรหัสประจำตัวอีกครั้ง`,
        "username"
      );
      return { success: false, error: "ไม่พบชื่อผู้ใช้งานนี้ในระบบ" };
    }

    // ตรวจสอบรหัสผ่านอย่างเข้มงวด (Strict Authentication)
    if (String(user.password) !== String(password)) {
      this.showLoginError(
        "รหัสผ่านไม่ถูกต้อง! กรุณาตรวจสอบและลองใหม่อีกครั้ง",
        "password"
      );
      return { success: false, error: "รหัสผ่านไม่ถูกต้อง" };
    }

    // บันทึก Session
    this.currentUser = { ...user };
    delete this.currentUser.password; // ไม่เก็บรหัสผ่านใน memory ของ session
    sessionStorage.setItem('dongrak_auth_user', JSON.stringify(this.currentUser));

    // บันทึกกิจกรรม
    await db.addActivityLog(
      'login',
      'เข้าสู่ระบบสำเร็จ',
      `${user.name} (${this.getRoleBadgeText(user.role)}) เข้าสู่ระบบ`,
      'badge-blue'
    );

    console.log(`✅ ล็อกอินสำเร็จ: ${user.name} [สิทธิ์: ${user.role}]`);
    return { success: true, user: this.currentUser };
  }

  logout() {
    if (this.currentUser) {
      db.addActivityLog(
        'logout',
        'ออกจากระบบ',
        `${this.currentUser.name} ออกจากระบบ`,
        'badge-gray'
      );
    }
    this.currentUser = null;
    sessionStorage.removeItem('dongrak_auth_user');
    window.location.reload();
  }

  /**
   * เปลี่ยนรหัสผ่านของตนเอง
   */
  async changePassword(oldPassword, newPassword, confirmPassword) {
    if (!this.currentUser) throw new Error("กรุณาเข้าสู่ระบบก่อน");

    if (!newPassword || newPassword.length < 4) {
      throw new Error("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
    }

    // ตรวจสอบรหัสผ่านเดิมจากฐานข้อมูล
    const users = db.get('users');
    const user = users.find(u => String(u.id) === String(this.currentUser.id));
    if (!user) throw new Error("ไม่พบข้อมูลผู้ใช้ในระบบ");

    if (String(user.password) !== String(oldPassword)) {
      throw new Error("รหัสผ่านเดิมไม่ถูกต้อง");
    }

    // อัปเดตรหัสผ่านใหม่
    user.password = newPassword;
    await db.saveItem('users', user);

    await db.addActivityLog(
      'security',
      'เปลี่ยนรหัสผ่านสำเร็จ',
      `${user.name} เปลี่ยนรหัสผ่านเข้าสู่ระบบเรียบร้อยแล้ว`,
      'badge-emerald'
    );

    return true;
  }

  /**
   * แสดง Pop-up แจ้งเตือนข้อผิดพลาด พร้อมโฟกัสช่องกรอกข้อมูลทันที
   */
  showLoginError(message, targetField = "password") {
    const errorModal = document.getElementById('auth-error-modal');
    const errorText = document.getElementById('auth-error-msg');
    
    if (errorModal && errorText) {
      errorText.innerText = message;
      errorModal.classList.add('active');
    } else {
      alert(message);
    }

    // สั่นกล่องข้อความและโฟกัส
    const inputEl = document.getElementById(`login-${targetField}`) || document.getElementById('login-password');
    if (inputEl) {
      inputEl.classList.add('input-error-shake');
      setTimeout(() => {
        inputEl.classList.remove('input-error-shake');
        inputEl.focus();
        inputEl.select();
      }, 500);
    }
  }

  closeLoginErrorModal() {
    const errorModal = document.getElementById('auth-error-modal');
    if (errorModal) {
      errorModal.classList.remove('active');
    }
    const passInput = document.getElementById('login-password');
    if (passInput) {
      passInput.focus();
    }
  }

  /**
   * ปุ่มเปิด/ซ่อนรหัสผ่าน (Show/Hide Password 👁️)
   */
  togglePasswordVisibility(inputId = 'login-password', iconId = 'password-toggle-icon') {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      if (icon) {
        icon.className = 'fas fa-eye-slash';
        icon.title = 'ซ่อนรหัสผ่าน';
      }
    } else {
      input.type = 'password';
      if (icon) {
        icon.className = 'fas fa-eye';
        icon.title = 'แสดงรหัสผ่าน';
      }
    }
  }

  getRoleBadgeText(role) {
    switch (role) {
      case APP_CONFIG.ROLES.ADMIN: return "ผู้ดูแลระบบ (Admin)";
      case APP_CONFIG.ROLES.TEACHER: return "ครูผู้สอน (Teacher)";
      case APP_CONFIG.ROLES.STUDENT: return "นักเรียน (Student)";
      default: return role;
    }
  }

  getRoleIcon(role) {
    switch (role) {
      case APP_CONFIG.ROLES.ADMIN: return "fa-crown text-amber-500";
      case APP_CONFIG.ROLES.TEACHER: return "fa-chalkboard-teacher text-blue-500";
      case APP_CONFIG.ROLES.STUDENT: return "fa-user-graduate text-emerald-500";
      default: return "fa-user";
    }
  }
}

// Global Singleton Instance
const authService = new AuthService();
