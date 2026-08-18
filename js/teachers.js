/**
 * ระบบติดตามแก้ไขผลการเรียน (Academic Remediation System)
 * teachers.js - ทะเบียนและข้อมูลครูผู้สอน (Teachers Directory & Multiple Subjects)
 */

class TeachersService {
  constructor() {
    this.searchQuery = '';
    this.filterLearningArea = 'all';
    this.currentSubjectsList = [];
  }

  init() {
    this.renderTeachersGrid();

    db.subscribe('teachers', () => {
      this.renderTeachersGrid();
    });
  }

  getFilteredTeachers() {
    let teachers = db.get('teachers') || [];

    if (this.filterLearningArea !== 'all') {
      teachers = teachers.filter(t => t.learningArea === this.filterLearningArea);
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      teachers = teachers.filter(t => 
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.teacherId && t.teacherId.toLowerCase().includes(q)) ||
        (t.learningArea && t.learningArea.toLowerCase().includes(q)) ||
        (t.subjects && t.subjects.some(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)))
      );
    }

    return teachers;
  }

  renderTeachersGrid() {
    const container = document.getElementById('teachers-grid-container');
    const countBadge = document.getElementById('teachers-count-badge');
    if (!container) return;

    const filtered = this.getFilteredTeachers();
    if (countBadge) countBadge.innerText = `${filtered.length} ท่าน`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-gray-500">
          <div class="empty-state-card">
            <i class="fas fa-chalkboard-teacher text-5xl mb-3 text-gray-300"></i>
            <h4 class="font-bold">ไม่พบข้อมูลครูผู้สอน</h4>
            <p class="text-sm text-gray-400">ลองเปลี่ยนตัวกรองกลุ่มสาระฯ หรือกดปุ่ม "เพิ่มข้อมูลครู"</p>
          </div>
        </div>
      `;
      return;
    }

    const isAdmin = authService.isAdmin();

    container.innerHTML = filtered.map(t => `
      <div class="teacher-card">
        <div class="teacher-card-header">
          <div class="teacher-avatar">
            <i class="fas fa-user-tie"></i>
          </div>
          <div class="teacher-info">
            <h4 class="teacher-name font-bold text-gray-900">${t.name}</h4>
            <span class="teacher-dept text-xs text-indigo-700 font-medium">${t.learningArea || 'ไม่ระบุกลุ่มสาระฯ'}</span>
            <span class="teacher-id text-xs text-gray-400">รหัสครู: ${t.teacherId || '-'}</span>
          </div>
        </div>

        <div class="teacher-card-body">
          <div class="teacher-contact-row">
            <span><i class="fas fa-phone-alt text-gray-400"></i> ${t.phone || '-'}</span>
            <span><i class="far fa-envelope text-gray-400"></i> ${t.email || '-'}</span>
          </div>

          <div class="teacher-subjects-section">
            <span class="text-xs font-semibold text-gray-600 block mb-1">
              <i class="fas fa-book-open text-amber-500"></i> รายวิชาที่รับผิดชอบ (${(t.subjects || []).length} วิชา):
            </span>
            <div class="subject-chips-wrap">
              ${(t.subjects && t.subjects.length > 0) ? t.subjects.map(s => `
                <span class="subject-chip" title="${s.name} (${s.level || ''})">
                  <strong>${s.code}</strong> ${s.name}
                </span>
              `).join('') : '<span class="text-xs text-gray-400 italic">ยังไม่ได้ระบุวิชาที่สอน</span>'}
            </div>
          </div>
        </div>

        ${isAdmin ? `
        <div class="teacher-card-footer">
          <button type="button" class="btn-sm btn-outline text-indigo-600" onclick="teachersService.openEditTeacherModal('${t.id}')">
            <i class="fas fa-edit"></i> แก้ไข
          </button>
          <button type="button" class="btn-sm btn-outline text-red-600" onclick="teachersService.deleteTeacherPrompt('${t.id}', '${t.name}')">
            <i class="fas fa-trash-alt"></i> ลบ
          </button>
        </div>` : ''}
      </div>
    `).join('');
  }

  setLearningAreaFilter(area) {
    this.filterLearningArea = area;
    this.renderTeachersGrid();
  }

  setSearchQuery(q) {
    this.searchQuery = q;
    this.renderTeachersGrid();
  }

  openAddTeacherModal() {
    const modal = document.getElementById('teacher-form-modal');
    if (!modal) return;

    this.currentSubjectsList = [];

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="teachersService.closeModal()"></div>
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-blue"><i class="fas fa-user-plus"></i> ข้อมูลครู</span>
            <h3 id="teacher-modal-title">เพิ่มข้อมูลครูผู้สอน</h3>
          </div>
          <button class="btn-close-modal" onclick="teachersService.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="form-teacher-data" onsubmit="teachersService.handleTeacherFormSubmit(event)">
            <div class="form-row">
              <div class="form-group col-md-4">
                <label for="t-code">รหัสครูผู้สอน <span class="text-red-500">*</span></label>
                <input type="text" id="t-code" class="form-control" placeholder="เช่น T001" required>
              </div>
              <div class="form-group col-md-8">
                <label for="t-name">ชื่อ - นามสกุล ครูผู้สอน <span class="text-red-500">*</span></label>
                <input type="text" id="t-name" class="form-control" placeholder="เช่น ครูสมชาย ใจดี" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="t-area">กลุ่มสาระการเรียนรู้ <span class="text-red-500">*</span></label>
                <select id="t-area" class="form-control" required>
                  ${APP_CONFIG.LEARNING_AREAS.map(a => `<option value="${a}">${a}</option>`).join('')}
                </select>
              </div>
              <div class="form-group col-md-3">
                <label for="t-phone">เบอร์โทรศัพท์</label>
                <input type="tel" id="t-phone" class="form-control" placeholder="08x-xxx-xxxx">
              </div>
              <div class="form-group col-md-3">
                <label for="t-email">อีเมล</label>
                <input type="email" id="t-email" class="form-control" placeholder="teacher@dongrak.ac.th">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="t-sem">ภาคเรียน</label>
                <input type="text" id="t-sem" class="form-control" value="${APP_CONFIG.SEMESTER}">
              </div>
              <div class="form-group col-md-6">
                <label for="t-year">ปีการศึกษา</label>
                <input type="text" id="t-year" class="form-control" value="${APP_CONFIG.ACADEMIC_YEAR}">
              </div>
            </div>

            <!-- Multiple Subjects Section -->
            <div class="multi-subjects-box">
              <label class="font-bold text-gray-800 mb-2 block">
                <i class="fas fa-layer-group text-indigo-600"></i> รายวิชาที่รับผิดชอบสอน (เพิ่มได้หลายวิชา)
              </label>
              
              <div class="add-subject-input-row">
                <input type="text" id="sub-input-code" class="form-control" placeholder="รหัสวิชา (เช่น ค31101)" style="flex: 1;">
                <input type="text" id="sub-input-name" class="form-control" placeholder="ชื่อวิชา (เช่น คณิตศาสตร์ 1)" style="flex: 2;">
                <select id="sub-input-level" class="form-control" style="flex: 1;">
                  ${APP_CONFIG.GRADE_LEVELS.map(g => `<option value="${g}">${g}</option>`).join('')}
                </select>
                <button type="button" class="btn btn-primary" onclick="teachersService.addSubjectChip()">
                  <i class="fas fa-plus"></i> เพิ่มวิชา
                </button>
              </div>

              <div id="subject-chips-list" class="subject-chips-dynamic-wrap mt-3">
                <!-- Dynamic Chips -->
              </div>
            </div>

            <input type="hidden" id="t-edit-id" value="">

            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-outline" onclick="teachersService.closeModal()">ยกเลิก</button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save mr-1"></i> บันทึกข้อมูลครู
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    modal.classList.add('active');
  }

  addSubjectChip() {
    const code = document.getElementById('sub-input-code').value.trim();
    const name = document.getElementById('sub-input-name').value.trim();
    const level = document.getElementById('sub-input-level').value;

    if (!code || !name) {
      alert("กรุณากรอกรหัสวิชาและชื่อวิชาให้ครบถ้วน");
      return;
    }

    this.currentSubjectsList.push({ code, name, level });
    document.getElementById('sub-input-code').value = '';
    document.getElementById('sub-input-name').value = '';
    this.renderSubjectChips();
  }

  removeSubjectChip(index) {
    this.currentSubjectsList.splice(index, 1);
    this.renderSubjectChips();
  }

  renderSubjectChips() {
    const container = document.getElementById('subject-chips-list');
    if (!container) return;

    if (this.currentSubjectsList.length === 0) {
      container.innerHTML = `<span class="text-xs text-gray-400 italic">ยังไม่มีรายวิชาที่เพิ่ม กรุณากรอกรหัสและชื่อวิชาด้านบน</span>`;
      return;
    }

    container.innerHTML = this.currentSubjectsList.map((s, idx) => `
      <div class="subject-dynamic-chip">
        <span class="chip-code">${s.code}</span>
        <span class="chip-name">${s.name} (${s.level})</span>
        <button type="button" class="btn-remove-chip" onclick="teachersService.removeSubjectChip(${idx})">&times;</button>
      </div>
    `).join('');
  }

  openEditTeacherModal(id) {
    const teacher = db.getById('teachers', id);
    if (!teacher) return;

    this.openAddTeacherModal();

    setTimeout(() => {
      document.getElementById('teacher-modal-title').innerText = "แก้ไขข้อมูลครูผู้สอน";
      document.getElementById('t-edit-id').value = teacher.id;
      document.getElementById('t-code').value = teacher.teacherId || '';
      document.getElementById('t-name').value = teacher.name || '';
      document.getElementById('t-area').value = teacher.learningArea || APP_CONFIG.LEARNING_AREAS[0];
      document.getElementById('t-phone').value = teacher.phone || '';
      document.getElementById('t-email').value = teacher.email || '';
      document.getElementById('t-sem').value = teacher.semester || APP_CONFIG.SEMESTER;
      document.getElementById('t-year').value = teacher.academicYear || APP_CONFIG.ACADEMIC_YEAR;

      this.currentSubjectsList = Array.isArray(teacher.subjects) ? [...teacher.subjects] : [];
      this.renderSubjectChips();
    }, 50);
  }

  async handleTeacherFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('t-edit-id').value;
    const teacherId = document.getElementById('t-code').value.trim();
    const name = document.getElementById('t-name').value.trim();
    const learningArea = document.getElementById('t-area').value;
    const phone = document.getElementById('t-phone').value.trim();
    const email = document.getElementById('t-email').value.trim();
    const semester = document.getElementById('t-sem').value.trim();
    const academicYear = document.getElementById('t-year').value.trim();

    let teacher = editId ? db.getById('teachers', editId) : null;
    if (!teacher) {
      teacher = {
        id: `t_${Date.now()}`,
        username: `teacher_${Date.now().toString().slice(-4)}`
      };
    }

    teacher.teacherId = teacherId;
    teacher.name = name;
    teacher.learningArea = learningArea;
    teacher.phone = phone;
    teacher.email = email;
    teacher.semester = semester;
    teacher.academicYear = academicYear;
    teacher.subjects = [...this.currentSubjectsList];

    await db.saveItem('teachers', teacher);
    this.closeModal();

    app.showToast(editId ? "อัปเดตข้อมูลครูสำเร็จ" : "เพิ่มข้อมูลครูผู้สอนสำเร็จ", "success");
  }

  async deleteTeacherPrompt(id, name) {
    if (confirm(`คุณต้องการลบข้อมูล "${name}" หรือไม่?`)) {
      await db.deleteItem('teachers', id);
      app.showToast("ลบข้อมูลครูเรียบร้อยแล้ว", "info");
    }
  }

  async clearAllTeachersPrompt() {
    const confirmation = prompt('คำเตือน: คุณต้องการลบข้อมูลครูผู้สอนทั้งหมดหรือไม่?\nพิมพ์ "ยืนยันลบครูทั้งหมด" เพื่อดำเนินการ:');
    if (confirmation === 'ยืนยันลบครูทั้งหมด') {
      await db.clearCollection('teachers');
      app.showToast("ล้างข้อมูลทำเนียบครูทั้งหมดเรียบร้อยแล้ว", "warning");
    } else if (confirmation !== null) {
      alert("ข้อความยืนยันไม่ถูกต้อง ยกเลิกการลบ");
    }
  }

  /**
   * Bulk CSV Import สำหรับนำเข้ารายชื่อครู
   */
  openBulkImportModal() {
    const modal = document.getElementById('csv-import-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="teachersService.closeCsvModal()"></div>
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-emerald"><i class="fas fa-file-csv"></i> Teachers CSV</span>
            <h3>นำเข้าข้อมูลครูผู้สอนด้วยไฟล์ CSV</h3>
          </div>
          <button class="btn-close-modal" onclick="teachersService.closeCsvModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="csv-guide-box">
            <h4><i class="fas fa-info-circle text-blue-500"></i> โครงสร้างไฟล์ CSV ที่ระบบรองรับ:</h4>
            <code>teacher_id,name,learning_area,phone,email,subjects</code>
            <p class="text-xs text-gray-500 mt-1">คอลัมน์ subjects สามารถใส่รหัสวิชาคั่นด้วยเครื่องหมาย semicolon (;) เช่น <code>ค31101:คณิต 1;ค32101:คณิต 3</code></p>
            <div class="mt-2">
              <button type="button" class="btn-sm btn-outline text-indigo-600 font-semibold" onclick="exportEngine.downloadTemplate('teachers')">
                <i class="fas fa-download mr-1"></i> ดาวน์โหลดไฟล์ตัวอย่าง (Teachers CSV Template)
              </button>
            </div>
          </div>

          <form id="form-csv-teachers" onsubmit="teachersService.handleCsvUpload(event)">
            <div class="form-group mt-4">
              <label>เลือกไฟล์ CSV รายชื่อครู</label>
              <div class="custom-file-upload">
                <input type="file" id="csv-teachers-input" accept=".csv,text/csv" required onchange="teachersService.onCsvFileSelected(this)">
                <div class="upload-btn-ui">
                  <i class="fas fa-file-csv"></i> <span id="csv-teachers-filename">คลิกเพื่อเลือกไฟล์ CSV</span>
                </div>
              </div>
            </div>

            <div id="csv-teachers-preview-container" class="csv-preview-table-wrapper hidden">
              <h5>ตัวอย่างข้อมูลครู (<span id="csv-teachers-preview-count">0</span> ท่าน):</h5>
              <div class="table-responsive" style="max-height: 200px;">
                <table class="data-table text-xs">
                  <thead>
                    <tr>
                      <th>รหัสครู</th>
                      <th>ชื่อ-สกุล</th>
                      <th>กลุ่มสาระฯ</th>
                      <th>เบอร์โทร</th>
                      <th>อีเมล</th>
                    </tr>
                  </thead>
                  <tbody id="csv-teachers-preview-body"></tbody>
                </table>
              </div>
            </div>

            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-outline" onclick="teachersService.closeCsvModal()">ยกเลิก</button>
              <button type="submit" id="btn-submit-teachers-csv" class="btn btn-emerald" disabled>
                <i class="fas fa-upload mr-1"></i> ยืนยันนำเข้าข้อมูลครู
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
      document.getElementById('csv-teachers-filename').innerText = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        this.parsedTeachers = this.parseTeachersCsv(text);
        this.renderCsvPreview(this.parsedTeachers);
      };
      reader.readAsText(file, 'utf-8');
    }
  }

  parseTeachersCsv(csvText) {
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

      const name = row.name || row['ชื่อ-สกุล'] || row['ชื่อ'] || '';
      if (!name || name.trim() === '') continue;

      // parse subjects
      const subjectsStr = row.subjects || row['รายวิชา'] || '';
      const subjects = subjectsStr.split(';').filter(Boolean).map(s => {
        const parts = s.split(':');
        return { code: parts[0] || '', name: parts[1] || parts[0] || '', level: 'ม.4' };
      });

      result.push({
        id: `t_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 4)}`,
        teacherId: row.teacher_id || row['รหัสครู'] || `T${100 + i}`,
        name: name.trim(),
        learningArea: row.learning_area || row['กลุ่มสาระ'] || APP_CONFIG.LEARNING_AREAS[0],
        phone: row.phone || row['เบอร์โทร'] || '',
        email: row.email || row['อีเมล'] || '',
        semester: APP_CONFIG.SEMESTER,
        academicYear: APP_CONFIG.ACADEMIC_YEAR,
        subjects: subjects
      });
    }
    return result;
  }

  renderCsvPreview(data) {
    const container = document.getElementById('csv-teachers-preview-container');
    const tbody = document.getElementById('csv-teachers-preview-body');
    const countEl = document.getElementById('csv-teachers-preview-count');
    const submitBtn = document.getElementById('btn-submit-teachers-csv');

    if (!container || !tbody) return;

    if (data.length === 0) {
      container.classList.add('hidden');
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    countEl.innerText = data.length;
    tbody.innerHTML = data.slice(0, 8).map(t => `
      <tr>
        <td>${t.teacherId}</td>
        <td>${t.name}</td>
        <td>${t.learningArea}</td>
        <td>${t.phone || '-'}</td>
        <td>${t.email || '-'}</td>
      </tr>
    `).join('');

    container.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = false;
  }

  async handleCsvUpload(e) {
    e.preventDefault();
    if (!this.parsedTeachers || this.parsedTeachers.length === 0) return;

    const btn = document.getElementById('btn-submit-teachers-csv');
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> กำลังนำเข้า...`;

    try {
      await db.bulkInsert('teachers', this.parsedTeachers);
      this.closeCsvModal();
      app.showToast(`นำเข้าข้อมูลครูผู้สอนสำเร็จจำนวน ${this.parsedTeachers.length} ท่าน`, "success");
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-upload mr-1"></i> ยืนยันนำเข้าข้อมูลครู`;
    }
  }

  closeModal() {
    const modal = document.getElementById('teacher-form-modal');
    if (modal) modal.classList.remove('active');
  }

  closeCsvModal() {
    const modal = document.getElementById('csv-import-modal');
    if (modal) modal.classList.remove('active');
    this.parsedTeachers = [];
  }
}

// Global Singleton Instance
const teachersService = new TeachersService();
