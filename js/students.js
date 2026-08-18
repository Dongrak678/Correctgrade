/**
 * ระบบติดตามแก้ไขผลการเรียน (Academic Remediation System)
 * students.js - ทะเบียนนักเรียน (Student Master Directory)
 */

class StudentsService {
  constructor() {
    this.searchQuery = '';
    this.selectedClassFilter = 'all';
    this.currentPage = 1;
    this.pageSize = 15;
  }

  init() {
    this.populateClassDropdown();
    this.renderStudentsTable();

    db.subscribe('students', () => {
      this.populateClassDropdown();
      this.renderStudentsTable();
    });
  }

  /**
   * ดึงข้อมูลห้องเรียนทั้งหมดที่มีอยู่ในระบบ และสร้างตัวเลือกใน Dropdown อัตโนมัติ
   */
  populateClassDropdown() {
    const select = document.getElementById('students-class-filter');
    if (!select) return;

    const allStudents = db.get('students') || [];
    const currentVal = this.selectedClassFilter;

    // รวบรวมข้อมูลห้องเรียนและนับจำนวนนักเรียนในแต่ละห้อง
    const gradeGroups = {};

    allStudents.forEach(s => {
      let grade = s.gradeLevel || 'ไม่ระบุชั้น';
      let room = s.room ? String(s.room).trim() : '';

      // กรณี gradeLevel เก็บเป็น "ม.1/1"
      if (grade.includes('/')) {
        const parts = grade.split('/');
        grade = parts[0].trim();
        if (!room) room = parts[1].trim();
      }

      const fullClass = room ? `${grade}/${room}` : grade;

      if (!gradeGroups[grade]) {
        gradeGroups[grade] = { count: 0, rooms: {} };
      }
      gradeGroups[grade].count++;
      gradeGroups[grade].rooms[fullClass] = (gradeGroups[grade].rooms[fullClass] || 0) + 1;
    });

    const sortedGrades = Object.keys(gradeGroups).sort((a, b) => a.localeCompare(b, 'th', { numeric: true }));

    let html = `<option value="all">-- ทุกระดับชั้น / ทุกห้องเรียน (${allStudents.length} คน) --</option>`;

    sortedGrades.forEach(grade => {
      const gData = gradeGroups[grade];
      const roomKeys = Object.keys(gData.rooms).sort((a, b) => a.localeCompare(b, 'th', { numeric: true }));

      let gradeLabel = grade;
      if (grade === 'ม.1') gradeLabel = 'มัธยมศึกษาปีที่ 1 (ม.1)';
      else if (grade === 'ม.2') gradeLabel = 'มัธยมศึกษาปีที่ 2 (ม.2)';
      else if (grade === 'ม.3') gradeLabel = 'มัธยมศึกษาปีที่ 3 (ม.3)';
      else if (grade === 'ม.4') gradeLabel = 'มัธยมศึกษาปีที่ 4 (ม.4)';
      else if (grade === 'ม.5') gradeLabel = 'มัธยมศึกษาปีที่ 5 (ม.5)';
      else if (grade === 'ม.6') gradeLabel = 'มัธยมศึกษาปีที่ 6 (ม.6)';

      html += `<optgroup label="${gradeLabel} [รวม ${gData.count} คน]">`;
      html += `  <option value="grade:${grade}">ดูทุกห้องของ ${grade} (${gData.count} คน)</option>`;

      roomKeys.forEach(rKey => {
        html += `  <option value="room:${rKey}">ห้อง ${rKey} (${gData.rooms[rKey]} คน)</option>`;
      });

      html += `</optgroup>`;
    });

    select.innerHTML = html;

    const optionExists = Array.from(select.options).some(opt => opt.value === currentVal);
    if (optionExists) {
      select.value = currentVal;
    } else {
      select.value = 'all';
      this.selectedClassFilter = 'all';
    }
  }

  setClassFilter(val) {
    this.selectedClassFilter = val;
    this.currentPage = 1;
    this.renderStudentsTable();
  }

  setGradeLevelFilter(level) {
    this.setClassFilter(level === 'all' ? 'all' : `grade:${level}`);
  }

  getFilteredStudents() {
    let students = [...(db.get('students') || [])];

    // ตัวกรองตามระดับชั้น หรือ รายห้อง (ม.1/1, ม.1/2)
    if (this.selectedClassFilter && this.selectedClassFilter !== 'all') {
      if (this.selectedClassFilter.startsWith('grade:')) {
        const targetGrade = this.selectedClassFilter.replace('grade:', '');
        students = students.filter(s => {
          const gl = s.gradeLevel || '';
          return gl === targetGrade || gl.startsWith(targetGrade);
        });
      } else if (this.selectedClassFilter.startsWith('room:')) {
        const targetRoom = this.selectedClassFilter.replace('room:', '');
        students = students.filter(s => {
          let grade = s.gradeLevel || '';
          let room = s.room ? String(s.room).trim() : '';
          if (grade.includes('/')) {
            const parts = grade.split('/');
            grade = parts[0].trim();
            if (!room) room = parts[1].trim();
          }
          const fullClass = room ? `${grade}/${room}` : grade;
          return fullClass === targetRoom || grade === targetRoom;
        });
      } else {
        students = students.filter(s => {
          const fullClass = s.room ? `${s.gradeLevel}/${s.room}` : (s.gradeLevel || '');
          return fullClass === this.selectedClassFilter || (s.gradeLevel || '').startsWith(this.selectedClassFilter);
        });
      }
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      students = students.filter(s => 
        (s.studentId && s.studentId.toLowerCase().includes(q)) ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.advisor && s.advisor.toLowerCase().includes(q)) ||
        (s.gradeLevel && s.gradeLevel.toLowerCase().includes(q)) ||
        (s.room && String(s.room).toLowerCase().includes(q))
      );
    }

    // เรียงลำดับตัวเลข 1, 2, 3, ... (Natural Numeric Sorting)
    students.sort((a, b) => {
      // 1. ระดับชั้น (เช่น ม.1, ม.2, ...)
      const glA = a.gradeLevel || '';
      const glB = b.gradeLevel || '';
      if (glA !== glB) {
        return glA.localeCompare(glB, 'th', { numeric: true });
      }

      // 2. ห้อง (เช่น 1, 2, 3)
      const roomA = parseInt(a.room, 10) || 0;
      const roomB = parseInt(b.room, 10) || 0;
      if (roomA !== roomB) {
        return roomA - roomB;
      }

      // 3. เรียงตามเลขที่แบบตัวเลข (1 มาก่อน 2, 2 มาก่อน 10)
      const numA = parseInt(String(a.number).replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(String(b.number).replace(/\D/g, ''), 10) || 0;
      if (numA !== numB) {
        return numA - numB;
      }

      // 4. รหัสประจำตัว
      return (a.studentId || '').localeCompare(b.studentId || '', undefined, { numeric: true });
    });

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
          <td colspan="6" class="text-center py-8 text-gray-500">
            <div class="empty-state-card">
              <i class="fas fa-user-graduate text-4xl mb-2 text-gray-300"></i>
              <p class="font-semibold">ไม่พบข้อมูลนักเรียน</p>
              <span class="text-xs text-gray-400">ลองเปลี่ยนตัวกรองระดับชั้น/ห้องเรียน หรือกดเพิ่มข้อมูลนักเรียน</span>
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

    tableBody.innerHTML = pageStudents.map((s, idx) => {
      const roomDisplay = s.room ? `/${s.room}` : '';
      const gradeDisplay = `${s.gradeLevel || ''}${roomDisplay}`;

      return `
        <tr class="hover-row">
          <td class="text-center font-bold text-gray-800">${s.number || (startIndex + idx + 1)}</td>
          <td class="font-mono font-bold text-indigo-700">${s.studentId}</td>
          <td>
            <div class="font-medium text-gray-900">${s.prefix || ''}${s.name}</div>
          </td>
          <td class="text-center">
            <span class="badge-level font-semibold">${gradeDisplay || '-'}</span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px; color: #334155; font-size: 13.5px; line-height: 1.4;">
              <i class="fas fa-user-shield text-gray-400" style="font-size: 12px; flex-shrink: 0;"></i>
              <span>${s.advisor || '-'}</span>
            </div>
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
      `;
    }).join('');

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
              <div class="form-group col-md-3">
                <label for="std-num">เลขที่</label>
                <input type="text" id="std-num" class="form-control" placeholder="เช่น 1">
              </div>
              <div class="form-group col-md-4">
                <label for="std-id">รหัสประจำตัว <span class="text-red-500">*</span></label>
                <input type="text" id="std-id" class="form-control" placeholder="เช่น 50101" required>
              </div>
              <div class="form-group col-md-5">
                <label for="std-name">ชื่อ - สกุล <span class="text-red-500">*</span></label>
                <input type="text" id="std-name" class="form-control" placeholder="เช่น นายสมชาย ใจดี" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="std-level">ระดับชั้น / ห้อง <span class="text-red-500">*</span></label>
                <input type="text" id="std-level" class="form-control" placeholder="เช่น ม.4/1 หรือ ม.4" required value="ม.4/1">
              </div>
              <div class="form-group col-md-6">
                <label for="std-advisor">ครูที่ปรึกษา</label>
                <input type="text" id="std-advisor" class="form-control" placeholder="เช่น ครูสมชาย ใจดี">
              </div>
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
      document.getElementById('std-num').value = student.number || '';
      document.getElementById('std-id').value = student.studentId || '';
      document.getElementById('std-name').value = `${student.prefix ? student.prefix : ''}${student.name || ''}`;
      const lvl = student.room ? `${student.gradeLevel}/${student.room}` : (student.gradeLevel || 'ม.4/1');
      document.getElementById('std-level').value = lvl;
      document.getElementById('std-advisor').value = student.advisor || '';
    }, 50);
  }

  async handleStudentFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('std-edit-id').value;
    const number = document.getElementById('std-num').value.trim();
    const studentId = document.getElementById('std-id').value.trim();
    const fullName = document.getElementById('std-name').value.trim();
    const levelInput = document.getElementById('std-level').value.trim();
    const advisor = document.getElementById('std-advisor').value.trim();

    // Parse level and room e.g. "ม.4/1" -> gradeLevel: "ม.4", room: "1"
    let gradeLevel = levelInput;
    let room = "1";
    if (levelInput.includes('/')) {
      const parts = levelInput.split('/');
      gradeLevel = parts[0].trim();
      room = parts[1].trim() || "1";
    }

    let student = editId ? db.getById('students', editId) : null;
    if (!student) {
      student = {
        id: `s_${Date.now()}`,
        username: `std_${studentId}`
      };
    }

    student.number = number;
    student.studentId = studentId;
    student.name = fullName;
    student.prefix = "";
    student.gradeLevel = gradeLevel;
    student.room = room;
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

  async clearAllStudentsPrompt() {
    const confirmation = prompt('คำเตือน: คุณต้องการลบข้อมูลนักเรียนทั้งหมดในทะเบียนหรือไม่?\nพิมพ์ "ยืนยันลบนักเรียนทั้งหมด" เพื่อดำเนินการ:');
    if (confirmation === 'ยืนยันลบนักเรียนทั้งหมด') {
      await db.clearCollection('students');
      app.showToast("ล้างข้อมูลทะเบียนนักเรียนทั้งหมดเรียบร้อยแล้ว", "warning");
    } else if (confirmation !== null) {
      alert("ข้อความยืนยันไม่ถูกต้อง ยกเลิกการลบ");
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
            <div style="background: #ffffff; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; margin: 8px 0; font-family: monospace; font-weight: bold; color: #1e293b;">
              เลขที่,รหัสประจำตัว,ชื่อ-สกุล,ระดับชั้น,ครูที่ปรึกษา
            </div>
            <p class="text-xs text-gray-500 mt-1">คอลัมน์ <strong>ระดับชั้น</strong> สามารถใส่เป็น "ม.4/1" หรือ "ม.4" ได้</p>
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
                      <th class="text-center">เลขที่</th>
                      <th>รหัสประจำตัว</th>
                      <th>ชื่อ-สกุล</th>
                      <th class="text-center">ระดับชั้น</th>
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

      // Match flexibly by exact Thai names or common aliases
      const number = row['เลขที่'] || row['number'] || row['no'] || `${i}`;
      const studentId = row['รหัสประจำตัว'] || row['รหัสประจำ'] || row['รหัสนักเรียน'] || row['student_id'] || row['id'] || `501${i.toString().padStart(2, '0')}`;
      const name = row['ชื่อ-สกุล'] || row['ชื่อ - สกุล'] || row['ชื่อ_สกุล'] || row['ชื่อ'] || row['name'] || '';
      const levelRaw = row['ระดับชั้น'] || row['ระดับชั้น/ห้อง'] || row['ชั้น'] || row['grade_level'] || 'ม.4/1';
      const advisor = row['ครูที่ปรึกษา'] || row['ที่ปรึกษา'] || row['advisor'] || '';

      // Parse gradeLevel and room
      let gradeLevel = levelRaw;
      let room = "1";
      if (levelRaw.includes('/')) {
        const parts = levelRaw.split('/');
        gradeLevel = parts[0].trim();
        room = parts[1].trim() || "1";
      }

      result.push({
        id: `s_${Date.now()}_${i}`,
        studentId: studentId,
        number: number,
        prefix: "",
        name: name,
        gradeLevel: gradeLevel,
        room: room,
        advisor: advisor,
        phone: ""
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
        <td class="text-center font-bold">${s.number}</td>
        <td class="font-mono font-bold">${s.studentId}</td>
        <td>${s.name}</td>
        <td class="text-center">${s.gradeLevel}${s.room ? '/' + s.room : ''}</td>
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
