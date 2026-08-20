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
   * นักเรียนสามารถเข้าสู่ระบบด้วย "รหัสประจำตัว" เป็นทั้ง Username และ Password
   */
  async login(username, password, explicitRole = null) {
    if (!username || !username.trim()) {
      this.showLoginError("กรุณากรอกชื่อผู้ใช้งาน หรือรหัสประจำตัวนักเรียน", "username");
      return { success: false, error: "กรุณากรอกชื่อผู้ใช้งาน" };
    }

    if (!password) {
      this.showLoginError("กรุณากรอกรหัสผ่าน (สำหรับนักเรียนใช้รหัสประจำตัว)", "password");
      return { success: false, error: "กรุณากรอกรหัสผ่าน" };
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();
    const users = db.get('users') || [];
    const students = db.get('students') || [];

    // 1. ค้นหาในบัญชีผู้ใช้งาน (users)
    let user = users.find(u => 
      (u.username && u.username.toLowerCase() === cleanUsername) ||
      (u.studentId && String(u.studentId).toLowerCase() === cleanUsername) ||
      (u.teacherId && String(u.teacherId).toLowerCase() === cleanUsername) ||
      (u.email && u.email.toLowerCase() === cleanUsername)
    );

    // 2. หากยังไม่มีใน users ให้ค้นหาจากทะเบียนนักเรียน (students) หรือ ทำเนียบครู (teachers) โดยตรง
    if (!user) {
      const student = students.find(s => 
        s.studentId && String(s.studentId).trim().toLowerCase() === cleanUsername
      );

      const teachers = db.get('teachers') || [];
      const teacher = teachers.find(t => 
        (t.teacherId && String(t.teacherId).trim().toLowerCase() === cleanUsername) ||
        (t.username && String(t.username).trim().toLowerCase() === cleanUsername) ||
        (t.email && String(t.email).trim().toLowerCase() === cleanUsername)
      );

      if (student) {
        // ถ้ารหัสผ่านตรงกับรหัสประจำตัวนักเรียน
        if (cleanPassword === String(student.studentId).trim()) {
          user = {
            id: `u_std_${student.studentId}`,
            username: String(student.studentId).trim(),
            password: String(student.studentId).trim(),
            name: `${student.prefix || ''}${student.name}`.trim(),
            role: 'student',
            studentId: String(student.studentId).trim(),
            gradeLevel: student.gradeLevel || '',
            room: student.room || '1',
            advisor: student.advisor || '',
            phone: student.phone || '',
            createdAt: new Date().toISOString()
          };
          await db.saveItem('users', user);
        } else {
          this.showLoginError(
            `รหัสผ่านไม่ถูกต้อง!\n💡 สำหรับนักเรียน: กรุณาใช้ "รหัสประจำตัวนักเรียน (${student.studentId})" เป็นรหัสผ่าน`,
            "password"
          );
          return { success: false, error: "รหัสผ่านไม่ถูกต้อง" };
        }
      } else if (teacher) {
        const teacherCode = String(teacher.teacherId || teacher.username || '').trim();
        // ถ้ารหัสผ่านตรงกับรหัสครูผู้สอน
        if (cleanPassword === teacherCode || cleanPassword === '123456') {
          user = {
            id: `u_tea_${teacher.teacherId || teacher.id}`,
            username: teacherCode,
            password: teacherCode,
            name: teacher.name,
            role: 'teacher',
            teacherId: teacherCode,
            learningArea: teacher.learningArea || '',
            email: teacher.email || '',
            phone: teacher.phone || '',
            createdAt: new Date().toISOString()
          };
          await db.saveItem('users', user);
        } else {
          this.showLoginError(
            `รหัสผ่านไม่ถูกต้อง!\n💡 สำหรับครูผู้สอน: กรุณาใช้ "รหัสครูผู้สอน (${teacherCode})" เป็นรหัสผ่าน`,
            "password"
          );
          return { success: false, error: "รหัสผ่านไม่ถูกต้อง" };
        }
      } else {
        this.showLoginError(
          `ไม่พบบัญชีหรือรหัส "${username}" ในระบบ\nกรุณาตรวจสอบชื่อผู้ใช้, รหัสประจำตัว หรือรหัสครูอีกครั้ง`,
          "username"
        );
        return { success: false, error: "ไม่พบชื่อผู้ใช้งานนี้ในระบบ" };
      }
    } else {
      // 3. ถ้าพบบัญชีใน users อยู่แล้ว
      let isCorrect = false;

      if (user.role === 'student') {
        // สำหรับนักเรียน: รหัสผ่านตรงกับ password หรือตรงกับ studentId ถือว่าถูกต้อง
        isCorrect = (String(user.password).trim() === cleanPassword) || 
                    (user.studentId && String(user.studentId).trim() === cleanPassword);
        
        if (!isCorrect) {
          this.showLoginError(
            `รหัสผ่านไม่ถูกต้อง!\n💡 สำหรับนักเรียน: กรุณาใช้ "รหัสประจำตัวนักเรียน" เป็นรหัสผ่าน`,
            "password"
          );
          return { success: false, error: "รหัสผ่านไม่ถูกต้อง" };
        }
      } else if (user.role === 'teacher') {
        // สำหรับครู: รหัสผ่านตรงกับ user.password หรือตรงกับ teacherId หรือตรงกับ username
        isCorrect = (String(user.password).trim() === cleanPassword) ||
                    (user.teacherId && String(user.teacherId).trim() === cleanPassword) ||
                    (user.username && String(user.username).trim() === cleanPassword);
        
        if (!isCorrect) {
          this.showLoginError(
            `รหัสผ่านไม่ถูกต้อง!\n💡 สำหรับครูผู้สอน: กรุณาใช้ "รหัสครูผู้สอน" เป็นรหัสผ่าน`,
            "password"
          );
          return { success: false, error: "รหัสผ่านไม่ถูกต้อง" };
        }
      } else {
        // สำหรับแอดมิน: ตรวจสอบรหัสผ่านตรงกับ user.password
        isCorrect = (String(user.password) === cleanPassword);
        if (!isCorrect) {
          this.showLoginError(
            "รหัสผ่านไม่ถูกต้อง! กรุณาตรวจสอบและลองใหม่อีกครั้ง",
            "password"
          );
          return { success: false, error: "รหัสผ่านไม่ถูกต้อง" };
        }
      }
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

  showForgotPwdModal() {
    alert("💡 ข้อมูลการกู้คืนรหัสผ่าน:\n\n• สำหรับนักเรียน: รหัสผ่านเริ่มต้นคือ 'รหัสประจำตัวนักเรียน' (เช่น 09513, 08750)\n• สำหรับครูผู้สอน / ผู้ดูแลระบบ: หากลืมรหัสผ่าน กรุณาติดต่อฝ่ายบริหารงานทะเบียนและวิชาการ โรงเรียนดงรักวิทยา");
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
