/**
 * ระบบติดตามแก้ไขผลการเรียน (Academic Remediation System)
 * users.js - การจัดการบัญชีผู้ใช้งาน สิทธิ์ และรีเซ็ตรหัสผ่าน (User Management)
 */

class UsersService {
  constructor() {
    this.searchQuery = '';
    this.filterRole = 'all';
    this.currentPage = 1;
    this.pageSize = 10;
  }

  init() {
    this.renderUsersTable();

    db.subscribe('users', () => {
      this.renderUsersTable();
    });
  }

  getFilteredUsers() {
    let users = db.get('users') || [];

    if (this.filterRole !== 'all') {
      users = users.filter(u => u.role === this.filterRole);
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      users = users.filter(u => 
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.studentId && String(u.studentId).toLowerCase().includes(q)) ||
        (u.teacherId && String(u.teacherId).toLowerCase().includes(q))
      );
    }

    return users;
  }

  renderUsersTable() {
    const tableBody = document.getElementById('users-table-body');
    const countBadge = document.getElementById('users-count-badge');
    if (!tableBody) return;

    const filtered = this.getFilteredUsers();
    if (countBadge) countBadge.innerText = `${filtered.length} บัญชี`;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-gray-500">
            <div class="empty-state-card">
              <i class="fas fa-users-cog text-4xl mb-2 text-gray-300"></i>
              <p class="font-semibold">ไม่พบข้อมูลบัญชีผู้ใช้งาน</p>
              <span class="text-xs text-gray-400">ลองเปลี่ยนตัวกรอง หรือกดปุ่ม "เพิ่มผู้ใช้ใหม่"</span>
            </div>
          </td>
        </tr>
      `;
      this.renderPagination(0);
      return;
    }

    const totalPages = Math.ceil(filtered.length / this.pageSize);
    if (this.currentPage > totalPages) this.currentPage = 1;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const pageUsers = filtered.slice(startIndex, startIndex + this.pageSize);

    tableBody.innerHTML = pageUsers.map((u, idx) => {
      let roleBadgeClass = "badge-gray";
      let roleLabel = u.role;
      let roleIcon = "fa-user";

      if (u.role === 'admin') {
        roleBadgeClass = "badge-amber";
        roleLabel = "ผู้ดูแลระบบ (Admin)";
        roleIcon = "fa-crown";
      } else if (u.role === 'teacher') {
        roleBadgeClass = "badge-blue";
        roleLabel = "ครูผู้สอน (Teacher)";
        roleIcon = "fa-chalkboard-teacher";
      } else if (u.role === 'student') {
        roleBadgeClass = "badge-emerald";
        roleLabel = "นักเรียน (Student)";
        roleIcon = "fa-user-graduate";
      }

      return `
        <tr class="hover-row">
          <td class="text-center text-xs text-gray-500 font-mono">${startIndex + idx + 1}</td>
          <td>
            <div class="font-mono font-bold text-gray-900">${u.username}</div>
            <span class="text-xs text-gray-400">ID: ${u.studentId || u.teacherId || '-'}</span>
          </td>
          <td>
            <div class="font-medium text-gray-900">${u.name}</div>
            <span class="text-xs text-gray-500">${u.email || '-'}</span>
          </td>
          <td class="text-center">
            <span class="status-pill ${roleBadgeClass}">
              <i class="fas ${roleIcon} mr-1"></i> ${roleLabel}
            </span>
          </td>
          <td class="text-xs text-gray-600">
            ${u.phone ? `<i class="fas fa-phone text-gray-400 mr-1"></i> ${u.phone}` : '-'}
          </td>
          <td class="text-xs text-gray-500">
            ${u.createdAt ? u.createdAt.slice(0, 10) : '-'}
          </td>
          <td class="text-right">
            <div class="action-btn-group">
              <button type="button" class="btn-sm btn-outline text-amber-600" title="รีเซ็ตรหัสผ่าน" onclick="usersService.openResetPasswordModal('${u.id}', '${u.name}', '${u.username}')">
                <i class="fas fa-key"></i> รีเซ็ตรหัส
              </button>
              <button type="button" class="btn-icon text-indigo-600" title="แก้ไข" onclick="usersService.openEditUserModal('${u.id}')">
                <i class="fas fa-edit"></i>
              </button>
              <button type="button" class="btn-icon text-red-600" title="ลบ" onclick="usersService.deleteUserPrompt('${u.id}', '${u.name}')">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.renderPagination(filtered.length);
  }

  renderPagination(totalCount) {
    const paginationContainer = document.getElementById('users-pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(totalCount / this.pageSize);
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let html = `
      <div class="pagination-wrapper">
        <button class="btn-page" ${this.currentPage === 1 ? 'disabled' : ''} onclick="usersService.changePage(${this.currentPage - 1})">
          <i class="fas fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        html += `<button class="btn-page ${i === this.currentPage ? 'active' : ''}" onclick="usersService.changePage(${i})">${i}</button>`;
      }
    }

    html += `
        <button class="btn-page" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="usersService.changePage(${this.currentPage + 1})">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    `;

    paginationContainer.innerHTML = html;
  }

  changePage(page) {
    this.currentPage = page;
    this.renderUsersTable();
  }

  setRoleFilter(role) {
    this.filterRole = role;
    this.currentPage = 1;
    this.renderUsersTable();
  }

  setSearchQuery(q) {
    this.searchQuery = q;
    this.currentPage = 1;
    this.renderUsersTable();
  }

  openAddUserModal() {
    const modal = document.getElementById('user-form-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="usersService.closeModal()"></div>
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-blue"><i class="fas fa-user-plus"></i> ผู้ใช้งาน</span>
            <h3 id="user-modal-title">เพิ่มผู้ใช้งานใหม่</h3>
          </div>
          <button class="btn-close-modal" onclick="usersService.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="form-user-data" onsubmit="usersService.handleUserFormSubmit(event)">
            <div class="form-group">
              <label for="u-username">ชื่อผู้ใช้งาน (Username) <span class="text-red-500">*</span></label>
              <input type="text" id="u-username" class="form-control" placeholder="เช่น std005, teacher04, admin2" required>
            </div>

            <div class="form-group" id="u-password-group">
              <label for="u-password">รหัสผ่าน (Password) <span class="text-red-500">*</span></label>
              <input type="password" id="u-password" class="form-control" placeholder="อย่างน้อย 4 ตัวอักษร" required minlength="4">
            </div>

            <div class="form-group">
              <label for="u-name">ชื่อ - นามสกุล <span class="text-red-500">*</span></label>
              <input type="text" id="u-name" class="form-control" placeholder="เช่น นายประเสริฐ ชนะภัย" required>
            </div>

            <div class="form-group">
              <label for="u-role">สิทธิ์การใช้งาน (Role) <span class="text-red-500">*</span></label>
              <select id="u-role" class="form-control" required onchange="usersService.toggleRoleSpecificFields(this.value)">
                <option value="student" selected>🎓 นักเรียน (Student)</option>
                <option value="teacher">👨‍🏫 ครูผู้สอน (Teacher)</option>
                <option value="admin">👑 ผู้ดูแลระบบ (Admin)</option>
              </select>
            </div>

            <div class="form-row" id="u-student-fields">
              <div class="form-group col-md-6">
                <label for="u-std-id">รหัสประจำตัวนักเรียน</label>
                <input type="text" id="u-std-id" class="form-control" placeholder="เช่น 50105">
              </div>
              <div class="form-group col-md-6">
                <label for="u-std-grade">ระดับชั้น</label>
                <select id="u-std-grade" class="form-control">
                  ${APP_CONFIG.GRADE_LEVELS.map(g => `<option value="${g}">${g}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="u-email">อีเมล</label>
                <input type="email" id="u-email" class="form-control" placeholder="user@dongrak.ac.th">
              </div>
              <div class="form-group col-md-6">
                <label for="u-phone">เบอร์โทรศัพท์</label>
                <input type="tel" id="u-phone" class="form-control" placeholder="08x-xxx-xxxx">
              </div>
            </div>

            <input type="hidden" id="u-edit-id" value="">

            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-outline" onclick="usersService.closeModal()">ยกเลิก</button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save mr-1"></i> บันทึกข้อมูลผู้ใช้
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    modal.classList.add('active');
  }

  toggleRoleSpecificFields(role) {
    const stdFields = document.getElementById('u-student-fields');
    if (stdFields) {
      stdFields.style.display = role === 'student' ? 'flex' : 'none';
    }
  }

  openEditUserModal(id) {
    const user = db.getById('users', id);
    if (!user) return;

    this.openAddUserModal();

    setTimeout(() => {
      document.getElementById('user-modal-title').innerText = "แก้ไขข้อมูลผู้ใช้งาน";
      document.getElementById('u-edit-id').value = user.id;
      document.getElementById('u-username').value = user.username;
      document.getElementById('u-name').value = user.name || '';
      document.getElementById('u-role').value = user.role || 'student';
      document.getElementById('u-email').value = user.email || '';
      document.getElementById('u-phone').value = user.phone || '';
      if (document.getElementById('u-std-id')) document.getElementById('u-std-id').value = user.studentId || '';
      if (document.getElementById('u-std-grade')) document.getElementById('u-std-grade').value = user.gradeLevel || 'ม.4';

      // ซ่อนช่องกรอกรหัสผ่านในการแก้ไขทั่วไป (ใช้ปุ่มรีเซ็ตแยก)
      const passGroup = document.getElementById('u-password-group');
      if (passGroup) {
        passGroup.style.display = 'none';
        document.getElementById('u-password').required = false;
      }
      this.toggleRoleSpecificFields(user.role);
    }, 50);
  }

  async handleUserFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('u-edit-id').value;
    const username = document.getElementById('u-username').value.trim();
    const name = document.getElementById('u-name').value.trim();
    const role = document.getElementById('u-role').value;
    const email = document.getElementById('u-email').value.trim();
    const phone = document.getElementById('u-phone').value.trim();
    const studentId = document.getElementById('u-std-id') ? document.getElementById('u-std-id').value.trim() : null;
    const gradeLevel = document.getElementById('u-std-grade') ? document.getElementById('u-std-grade').value : null;

    let user = editId ? db.getById('users', editId) : null;
    if (!user) {
      const password = document.getElementById('u-password').value;
      user = {
        id: `u_${Date.now()}`,
        password: password || '123456',
        createdAt: new Date().toISOString()
      };
    }

    user.username = username;
    user.name = name;
    user.role = role;
    user.email = email;
    user.phone = phone;
    if (role === 'student') {
      user.studentId = studentId;
      user.gradeLevel = gradeLevel;
    }

    await db.saveItem('users', user);
    this.closeModal();

    app.showToast(editId ? "อัปเดตข้อมูลผู้ใช้สำเร็จ" : "เพิ่มผู้ใช้งานสำเร็จ", "success");
  }

  /**
   * แอดมินรีเซ็ตรหัสผ่านให้ผู้ใช้
   */
  openResetPasswordModal(id, name, username) {
    const modal = document.getElementById('user-form-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="usersService.closeModal()"></div>
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-amber"><i class="fas fa-key"></i> รีเซ็ตรหัสผ่าน</span>
            <h3>ตั้งรหัสผ่านใหม่</h3>
          </div>
          <button class="btn-close-modal" onclick="usersService.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="record-summary-card mb-3">
            <div class="info-row">
              <span class="info-label">ผู้ใช้งาน:</span>
              <span class="info-val font-semibold">${name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Username:</span>
              <span class="info-val font-mono">${username}</span>
            </div>
          </div>

          <form id="form-reset-pass" onsubmit="usersService.handleResetPasswordSubmit(event, '${id}')">
            <div class="form-group">
              <label for="new-reset-pass">รหัสผ่านใหม่ <span class="text-red-500">*</span></label>
              <div class="password-input-wrap">
                <input type="password" id="new-reset-pass" class="form-control" placeholder="กรอกรหัสผ่านใหม่อย่างน้อย 4 ตัวอักษร" required minlength="4">
                <button type="button" class="btn-toggle-pwd" onclick="authService.togglePasswordVisibility('new-reset-pass', 'reset-pwd-icon')">
                  <i id="reset-pwd-icon" class="fas fa-eye"></i>
                </button>
              </div>
            </div>

            <div class="quick-pass-suggest">
              <span class="text-xs text-gray-500 block mb-1">รหัสผ่านแนะนำด่วน:</span>
              <div class="flex gap-2" style="flex-wrap: wrap;">
                <button type="button" class="btn-xs btn-outline font-mono text-indigo-700" onclick="document.getElementById('new-reset-pass').value='${username}'">${username} (รหัสประจำตัว)</button>
                <button type="button" class="btn-xs btn-outline" onclick="document.getElementById('new-reset-pass').value='123456'">123456</button>
                <button type="button" class="btn-xs btn-outline" onclick="document.getElementById('new-reset-pass').value='${username}123'">${username}123</button>
              </div>
            </div>

            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-outline" onclick="usersService.closeModal()">ยกเลิก</button>
              <button type="submit" class="btn btn-amber">
                <i class="fas fa-check-circle mr-1"></i> ยืนยันเปลี่ยนรหัสผ่าน
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    modal.classList.add('active');
  }

  async handleResetPasswordSubmit(e, id) {
    e.preventDefault();
    const newPass = document.getElementById('new-reset-pass').value;
    const user = db.getById('users', id);
    if (!user) return;

    user.password = newPass;
    await db.saveItem('users', user);
    this.closeModal();

    await db.addActivityLog(
      'security',
      'รีเซ็ตรหัสผ่านผู้ใช้',
      `ผู้ดูแลระบบได้รีเซ็ตรหัสผ่านของ ${user.name} (${user.username})`,
      'badge-amber'
    );

    app.showToast(`รีเซ็ตรหัสผ่านสำหรับ ${user.name} เรียบร้อยแล้ว`, "success");
  }

  async deleteUserPrompt(id, name) {
    if (confirm(`คุณต้องการลบบัญชีผู้ใช้ "${name}" หรือไม่?`)) {
      await db.deleteItem('users', id);
      app.showToast("ลบบัญชีผู้ใช้งานเรียบร้อยแล้ว", "info");
    }
  }

  /**
   * Bulk CSV Import สำหรับนำเข้าผู้ใช้งาน
   */
  openBulkImportModal() {
    const modal = document.getElementById('csv-import-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="usersService.closeCsvModal()"></div>
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-emerald"><i class="fas fa-file-csv"></i> Users CSV</span>
            <h3>นำเข้าบัญชีผู้ใช้งานด้วยไฟล์ CSV</h3>
          </div>
          <button class="btn-close-modal" onclick="usersService.closeCsvModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="csv-guide-box">
            <h4><i class="fas fa-info-circle text-blue-500"></i> โครงสร้างไฟล์ CSV:</h4>
            <code>username,password,name,role,email,phone,student_id,teacher_id</code>
            <p class="text-xs text-gray-500 mt-1">คอลัมน์ role ต้องเป็น <code>student</code>, <code>teacher</code>, หรือ <code>admin</code></p>
            <div class="mt-2">
              <button type="button" class="btn-sm btn-outline text-indigo-600 font-semibold" onclick="exportEngine.downloadTemplate('users')">
                <i class="fas fa-download mr-1"></i> ดาวน์โหลดไฟล์ตัวอย่าง (Users CSV Template)
              </button>
            </div>
          </div>

          <form id="form-csv-users" onsubmit="usersService.handleCsvUpload(event)">
            <div class="form-group mt-4">
              <label>เลือกไฟล์ CSV บัญชีผู้ใช้งาน</label>
              <div class="custom-file-upload">
                <input type="file" id="csv-users-input" accept=".csv,text/csv" required onchange="usersService.onCsvFileSelected(this)">
                <div class="upload-btn-ui">
                  <i class="fas fa-file-csv"></i> <span id="csv-users-filename">คลิกเพื่อเลือกไฟล์ CSV</span>
                </div>
              </div>
            </div>

            <div id="csv-users-preview-container" class="csv-preview-table-wrapper hidden">
              <h5>ตัวอย่างข้อมูลผู้ใช้ (<span id="csv-users-preview-count">0</span> บัญชี):</h5>
              <div class="table-responsive" style="max-height: 200px;">
                <table class="data-table text-xs">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>ชื่อ-สกุล</th>
                      <th>สิทธิ์ (Role)</th>
                      <th>อีเมล</th>
                      <th>เบอร์โทร</th>
                    </tr>
                  </thead>
                  <tbody id="csv-users-preview-body"></tbody>
                </table>
              </div>
            </div>

            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-outline" onclick="usersService.closeCsvModal()">ยกเลิก</button>
              <button type="submit" id="btn-submit-users-csv" class="btn btn-emerald" disabled>
                <i class="fas fa-upload mr-1"></i> ยืนยันนำเข้าข้อมูลผู้ใช้
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    modal.classList.add('active');
  }

  onCsvFileSelected(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      document.getElementById('csv-users-filename').innerText = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        this.parsedUsers = this.parseUsersCsv(text);
        this.renderCsvPreview(this.parsedUsers);
      };
      reader.readAsText(file, 'utf-8');
    }
  }

  parseUsersCsv(csvText) {
    const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || line.split(',');
      if (values.length === 0) continue;

      const cleanValues = values.map(v => v ? v.trim().replace(/^["']|["']$/g, '') : '');
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = cleanValues[idx] || '';
      });

      result.push({
        id: `u_${Date.now()}_${i}`,
        username: row.username || `user_${i}`,
        password: row.password || '123456',
        name: row.name || row['ชื่อ-สกุล'] || row['ชื่อ'] || '',
        role: row.role || 'student',
        email: row.email || '',
        phone: row.phone || '',
        studentId: row.student_id || '',
        teacherId: row.teacher_id || '',
        createdAt: new Date().toISOString()
      });
    }
    return result;
  }

  renderCsvPreview(data) {
    const container = document.getElementById('csv-users-preview-container');
    const tbody = document.getElementById('csv-users-preview-body');
    const countEl = document.getElementById('csv-users-preview-count');
    const submitBtn = document.getElementById('btn-submit-users-csv');

    if (!container || !tbody) return;

    if (data.length === 0) {
      container.classList.add('hidden');
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    countEl.innerText = data.length;
    tbody.innerHTML = data.slice(0, 8).map(u => `
      <tr>
        <td class="font-mono font-bold">${u.username}</td>
        <td>${u.name}</td>
        <td>${u.role}</td>
        <td>${u.email || '-'}</td>
        <td>${u.phone || '-'}</td>
      </tr>
    `).join('');

    container.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = false;
  }

  async handleCsvUpload(e) {
    e.preventDefault();
    if (!this.parsedUsers || this.parsedUsers.length === 0) return;

    const btn = document.getElementById('btn-submit-users-csv');
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> กำลังนำเข้า...`;

    try {
      await db.bulkInsert('users', this.parsedUsers);
      this.closeCsvModal();
      app.showToast(`นำเข้าบัญชีผู้ใช้สำเร็จจำนวน ${this.parsedUsers.length} บัญชี`, "success");
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-upload mr-1"></i> ยืนยันนำเข้าข้อมูลผู้ใช้`;
    }
  }

  closeModal() {
    const modal = document.getElementById('user-form-modal');
    if (modal) modal.classList.remove('active');
  }

  closeCsvModal() {
    const modal = document.getElementById('csv-import-modal');
    if (modal) modal.classList.remove('active');
    this.parsedUsers = [];
  }
}

// Global Singleton Instance
const usersService = new UsersService();
