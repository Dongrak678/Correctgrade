/**
 * ระบบติดตามแก้ไขผลการเรียน (Academic Remediation System)
 * students.js - ทะเบียนนักเรียน (Student Master Directory)
 */

class StudentsService {
  constructor() {
    this.searchQuery = '';
    this.filterGradeLevel = 'all';
    this.currentPage = 1;
    this.pageSize = 10;
  }

  init() {
    this.renderStudentsTable();

    db.subscribe('students', () => {
      this.renderStudentsTable();
    });
  }

  getFilteredStudents() {
    let students = db.get('students') || [];

    if (this.filterGradeLevel !== 'all') {
      students = students.filter(s => (s.gradeLevel || '').startsWith(this.filterGradeLevel));
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      students = students.filter(s => 
        (s.studentId && s.studentId.toLowerCase().includes(q)) ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.advisor && s.advisor.toLowerCase().includes(q)) ||
        (s.gradeLevel && s.gradeLevel.toLowerCase().includes(q))
      );
    }

    return students;
  }

  renderStudentsTable() {
    const tableBody = document.getElementById('students-table-body');
    const countBadge = document.getElementById('students-count-badge');
    if (!tableBody) return;

    const filtered = this.getFilteredStudents();
    if (countBadge) countBadge.innerText = `${filtered.length} คน`;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-gray-500">
            <div class="empty-state-card">
              <i class="fas fa-user-graduate text-4xl mb-2 text-gray-300"></i>
              <p class="font-semibold">ไม่พบข้อมูลนักเรียน</p>
              <span class="text-xs text-gray-400">ลองเปลี่ยนตัวกรองระดับชั้น หรือกดเพิ่มข้อมูลนักเรียน</span>
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
    const pageStudents = filtered.slice(startIndex, startIndex + this.pageSize);

    const isAdmin = authService.isAdmin();

    tableBody.innerHTML = pageStudents.map((s, idx) => `
      <tr class="hover-row">
        <td class="text-center text-xs text-gray-500 font-mono">${startIndex + idx + 1}</td>
        <td class="font-mono font-bold text-indigo-700">${s.studentId}</td>
        <td>
          <div class="font-medium text-gray-900">${s.prefix || ''}${s.name}</div>
          <span class="text-xs text-gray-400">เลขที่ ${s.number || '-'}</span>
        </td>
        <td class="text-center">
          <span class="badge-level font-semibold">${s.gradeLevel}/${s.room || '1'}</span>
        </td>
        <td>
          <span class="text-xs text-gray-700"><i class="fas fa-user-shield text-gray-400 mr-1"></i> ${s.advisor || '-'}</span>
        </td>
        <td class="text-xs text-gray-600">
          ${s.phone ? `<i class="fas fa-phone text-gray-400 mr-1"></i> ${s.phone}` : '-'}
        </td>
        <td class="text-right">
          ${isAdmin ? `
            <div class="action-btn-group">
              <button type="button" class="btn-icon text-indigo-600" title="แก้ไข" onclick="studentsService.openEditStudentModal('${s.id}')">
                <i class="fas fa-edit"></i>
              </button>
              <button type="button" class="btn-icon text-red-600" title="ลบ" onclick="studentsService.deleteStudentPrompt('${s.id}', '${s.name}')">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          ` : '<span class="text-gray-300">-</span>'}
        </td>
      </tr>
    `).join('');

    this.renderPagination(filtered.length);
  }

  renderPagination(totalCount) {
    const paginationContainer = document.getElementById('students-pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(totalCount / this.pageSize);
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let html = `
      <div class="pagination-wrapper">
        <button class="btn-page" ${this.currentPage === 1 ? 'disabled' : ''} onclick="studentsService.changePage(${this.currentPage - 1})">
          <i class="fas fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        html += `<button class="btn-page ${i === this.currentPage ? 'active' : ''}" onclick="studentsService.changePage(${i})">${i}</button>`;
      }
    }

    html += `
        <button class="btn-page" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="studentsService.changePage(${this.currentPage + 1})">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    `;

    paginationContainer.innerHTML = html;
  }

  changePage(page) {
    this.currentPage = page;
    this.renderStudentsTable();
  }

  setGradeLevelFilter(level) {
    this.filterGradeLevel = level;
    this.currentPage = 1;
    this.renderStudentsTable();
  }

  setSearchQuery(q) {
    this.searchQuery = q;
    this.currentPage = 1;
    this.renderStudentsTable();
  }

  openAddStudentModal() {
    const modal = document.getElementById('student-form-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="studentsService.closeModal()"></div>
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-blue"><i class="fas fa-user-plus"></i> ข้อมูลนักเรียน</span>
            <h3 id="student-modal-title">เพิ่มข้อมูลนักเรียนใหม่</h3>
          </div>
          <button class="btn-close-modal" onclick="studentsService.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="form-student-data" onsubmit="studentsService.handleStudentFormSubmit(event)">
            <div class="form-row">
              <div class="form-group col-md-4">
                <label for="std-id">รหัสประจำตัวนักเรียน <span class="text-red-500">*</span></label>
                <input type="text" id="std-id" class="form-control" placeholder="เช่น 50101" required>
              </div>
              <div class="form-group col-md-2">
                <label for="std-prefix">คำนำหน้า</label>
                <select id="std-prefix" class="form-control">
                  <option value="เด็กชาย">ด.ช.</option>
                  <option value="เด็กหญิง">ด.ญ.</option>
                  <option value="นาย" selected>นาย</option>
                  <option value="นางสาว">น.ส.</option>
                </select>
              </div>
              <div class="form-group col-md-6">
                <label for="std-name">ชื่อ - นามสกุล <span class="text-red-500">*</span></label>
                <input type="text" id="std-name" class="form-control" placeholder="ชื่อ นามสกุล" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-4">
                <label for="std-level">ระดับชั้น <span class="text-red-500">*</span></label>
                <select id="std-level" class="form-control" required>
                  ${APP_CONFIG.GRADE_LEVELS.map(g => `<option value="${g}">${g}</option>`).join('')}
                </select>
              </div>
              <div class="form-group col-md-2">
                <label for="std-room">ห้อง</label>
                <input type="text" id="std-room" class="form-control" value="1">
              </div>
              <div class="form-group col-md-2">
                <label for="std-num">เลขที่</label>
                <input type="text" id="std-num" class="form-control" placeholder="1">
              </div>
              <div class="form-group col-md-4">
                <label for="std-phone">เบอร์โทรศัพท์</label>
                <input type="tel" id="std-phone" class="form-control" placeholder="09x-xxx-xxxx">
              </div>
            </div>

            <div class="form-group">
              <label for="std-advisor">ครูที่ปรึกษา</label>
              <input type="text" id="std-advisor" class="form-control" placeholder="ระบุชื่อครูที่ปรึกษา">
            </div>

            <input type="hidden" id="std-edit-id" value="">

            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-outline" onclick="studentsService.closeModal()">ยกเลิก</button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save mr-1"></i> บันทึกข้อมูลนักเรียน
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    modal.classList.add('active');
  }

  openEditStudentModal(id) {
    const student = db.getById('students', id);
    if (!student) return;

    this.openAddStudentModal();

    setTimeout(() => {
      document.getElementById('student-modal-title').innerText = "แก้ไขข้อมูลนักเรียน";
      document.getElementById('std-edit-id').value = student.id;
      document.getElementById('std-id').value = student.studentId || '';
      document.getElementById('std-prefix').value = student.prefix || 'นาย';
      document.getElementById('std-name').value = student.name || '';
      document.getElementById('std-level').value = student.gradeLevel || 'ม.4';
      document.getElementById('std-room').value = student.room || '1';
      document.getElementById('std-num').value = student.number || '';
      document.getElementById('std-phone').value = student.phone || '';
      document.getElementById('std-advisor').value = student.advisor || '';
    }, 50);
  }

  async handleStudentFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('std-edit-id').value;
    const studentId = document.getElementById('std-id').value.trim();
    const prefix = document.getElementById('std-prefix').value;
    const name = document.getElementById('std-name').value.trim();
    const gradeLevel = document.getElementById('std-level').value;
    const room = document.getElementById('std-room').value.trim();
    const number = document.getElementById('std-num').value.trim();
    const phone = document.getElementById('std-phone').value.trim();
    const advisor = document.getElementById('std-advisor').value.trim();

    let student = editId ? db.getById('students', editId) : null;
    if (!student) {
      student = {
        id: `s_${Date.now()}`,
        username: `std_${studentId}`
      };
    }

    student.studentId = studentId;
    student.prefix = prefix;
    student.name = name;
    student.gradeLevel = gradeLevel;
    student.room = room;
    student.number = number;
    student.phone = phone;
    student.advisor = advisor;

    await db.saveItem('students', student);
    this.closeModal();

    app.showToast(editId ? "อัปเดตข้อมูลนักเรียนสำเร็จ" : "เพิ่มนักเรียนในทะเบียนสำเร็จ", "success");
  }

  async deleteStudentPrompt(id, name) {
    if (confirm(`คุณต้องการลบข้อมูล "${name}" ออกจากทะเบียนหรือไม่?`)) {
      await db.deleteItem('students', id);
      app.showToast("ลบข้อมูลนักเรียนเรียบร้อยแล้ว", "info");
    }
  }

  /**
   * Bulk CSV Import สำหรับนำเข้านักเรียน
   */
  openBulkImportModal() {
    const modal = document.getElementById('csv-import-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="studentsService.closeCsvModal()"></div>
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-emerald"><i class="fas fa-file-csv"></i> Students CSV</span>
            <h3>นำเข้าทะเบียนนักเรียนด้วยไฟล์ CSV</h3>
          </div>
          <button class="btn-close-modal" onclick="studentsService.closeCsvModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="csv-guide-box">
            <h4><i class="fas fa-info-circle text-blue-500"></i> โครงสร้างไฟล์ CSV ที่ระบบรองรับ:</h4>
            <code>student_id,prefix,name,number,grade_level,room,advisor,phone</code>
            <div class="mt-2">
              <button type="button" class="btn-sm btn-outline text-indigo-600 font-semibold" onclick="exportEngine.downloadTemplate('students')">
                <i class="fas fa-download mr-1"></i> ดาวน์โหลดไฟล์ตัวอย่าง (Students CSV Template)
              </button>
            </div>
          </div>

          <form id="form-csv-students" onsubmit="studentsService.handleCsvUpload(event)">
            <div class="form-group mt-4">
              <label>เลือกไฟล์ CSV ทะเบียนนักเรียน</label>
              <div class="custom-file-upload">
                <input type="file" id="csv-students-input" accept=".csv,text/csv" required onchange="studentsService.onCsvFileSelected(this)">
                <div class="upload-btn-ui">
                  <i class="fas fa-file-csv"></i> <span id="csv-students-filename">คลิกเพื่อเลือกไฟล์ CSV</span>
                </div>
              </div>
            </div>

            <div id="csv-students-preview-container" class="csv-preview-table-wrapper hidden">
              <h5>ตัวอย่างข้อมูลนักเรียน (<span id="csv-students-preview-count">0</span> คน):</h5>
              <div class="table-responsive" style="max-height: 200px;">
                <table class="data-table text-xs">
                  <thead>
                    <tr>
                      <th>รหัส นร.</th>
                      <th>ชื่อ-สกุล</th>
                      <th>ชั้น/ห้อง</th>
                      <th>เลขที่</th>
                      <th>ครูที่ปรึกษา</th>
                    </tr>
                  </thead>
                  <tbody id="csv-students-preview-body"></tbody>
                </table>
              </div>
            </div>

            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-outline" onclick="studentsService.closeCsvModal()">ยกเลิก</button>
              <button type="submit" id="btn-submit-students-csv" class="btn btn-emerald" disabled>
                <i class="fas fa-upload mr-1"></i> ยืนยันนำเข้าข้อมูลนักเรียน
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
      document.getElementById('csv-students-filename').innerText = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        this.parsedStudents = this.parseStudentsCsv(text);
        this.renderCsvPreview(this.parsedStudents);
      };
      reader.readAsText(file, 'utf-8');
    }
  }

  parseStudentsCsv(csvText) {
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
        id: `s_${Date.now()}_${i}`,
        studentId: row.student_id || row['รหัสนักเรียน'] || `501${i.toString().padStart(2, '0')}`,
        prefix: row.prefix || row['คำนำหน้า'] || 'นาย',
        name: row.name || row['ชื่อ-สกุล'] || row['ชื่อ'] || '',
        number: row.number || row['เลขที่'] || `${i}`,
        gradeLevel: row.grade_level || row['ระดับชั้น'] || 'ม.4',
        room: row.room || row['ห้อง'] || '1',
        advisor: row.advisor || row['ครูที่ปรึกษา'] || '',
        phone: row.phone || row['เบอร์โทร'] || ''
      });
    }
    return result;
  }

  renderCsvPreview(data) {
    const container = document.getElementById('csv-students-preview-container');
    const tbody = document.getElementById('csv-students-preview-body');
    const countEl = document.getElementById('csv-students-preview-count');
    const submitBtn = document.getElementById('btn-submit-students-csv');

    if (!container || !tbody) return;

    if (data.length === 0) {
      container.classList.add('hidden');
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    countEl.innerText = data.length;
    tbody.innerHTML = data.slice(0, 8).map(s => `
      <tr>
        <td>${s.studentId}</td>
        <td>${s.prefix || ''}${s.name}</td>
        <td>${s.gradeLevel}/${s.room}</td>
        <td>${s.number}</td>
        <td>${s.advisor || '-'}</td>
      </tr>
    `).join('');

    container.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = false;
  }

  async handleCsvUpload(e) {
    e.preventDefault();
    if (!this.parsedStudents || this.parsedStudents.length === 0) return;

    const btn = document.getElementById('btn-submit-students-csv');
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> กำลังนำเข้า...`;

    try {
      await db.bulkInsert('students', this.parsedStudents);
      this.closeCsvModal();
      app.showToast(`นำเข้าข้อมูลนักเรียนสำเร็จจำนวน ${this.parsedStudents.length} คน`, "success");
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-upload mr-1"></i> ยืนยันนำเข้าข้อมูลนักเรียน`;
    }
  }

  closeModal() {
    const modal = document.getElementById('student-form-modal');
    if (modal) modal.classList.remove('active');
  }

  closeCsvModal() {
    const modal = document.getElementById('csv-import-modal');
    if (modal) modal.classList.remove('active');
    this.parsedStudents = [];
  }
}

// Global Singleton Instance
const studentsService = new StudentsService();
