/**
 * ระบบติดตามแก้ไขผลการเรียน (Academic Remediation System)
 * records.js - จัดการข้อมูลผลการเรียน 0/ร/มส, ค้นหา, กรอง, นำเข้า CSV และการลบข้อมูล
 */

class RecordsService {
  constructor() {
    this.filterGradeType = 'all';
    this.filterStatus = 'all';
    this.filterGradeLevel = 'all';
    this.searchQuery = '';
    this.currentPage = 1;
    this.pageSize = 10;
  }

  init() {
    this.renderRecordsTable();

    db.subscribe('records', () => {
      this.renderRecordsTable();
    });
  }

  getFilteredRecords() {
    let records = db.get('records') || [];
    const currentUser = authService.getCurrentUser();

    // กรองตามสิทธิ์ผู้ใช้งาน
    if (currentUser) {
      if (currentUser.role === APP_CONFIG.ROLES.STUDENT) {
        // นักเรียนเห็นเฉพาะของตัวเอง
        records = records.filter(r => 
          String(r.studentId) === String(currentUser.studentId) ||
          String(r.studentName).includes(currentUser.name)
        );
      } else if (currentUser.role === APP_CONFIG.ROLES.TEACHER) {
        // ครูเห็นวิชาที่ตนสอน หรือนักเรียนที่ตนดูแล (หรือเลือกดูทั้งหมดได้ถ้าเป็นแอดมิน)
        const isTeacherOwner = (r) => 
          (r.teacherId && String(r.teacherId) === String(currentUser.teacherId)) ||
          (r.teacherName && r.teacherName.includes(currentUser.name));
        
        // ถ้าเป็นครู แสดงทั้งที่ตนเองสอน และอนุญาตให้ดูทั้งระดับชั้น
        // เราสามารถให้ครูเห็นงานที่ตนเองรับผิดชอบเป็นหลัก
        // records = records.filter(isTeacherOwner);
      }
    }

    // กรองตามประเภทเกรด (0, ร, มส)
    if (this.filterGradeType !== 'all') {
      records = records.filter(r => r.conditionType === this.filterGradeType);
    }

    // กรองตามสถานะ (Workflow Status)
    if (this.filterStatus !== 'all') {
      records = records.filter(r => r.status === this.filterStatus);
    }

    // กรองตามระดับชั้น
    if (this.filterGradeLevel !== 'all') {
      records = records.filter(r => (r.gradeLevel || '').startsWith(this.filterGradeLevel));
    }

    // ค้นหา
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      records = records.filter(r => 
        (r.studentId && r.studentId.toLowerCase().includes(q)) ||
        (r.studentName && r.studentName.toLowerCase().includes(q)) ||
        (r.subjectCode && r.subjectCode.toLowerCase().includes(q)) ||
        (r.subjectName && r.subjectName.toLowerCase().includes(q)) ||
        (r.teacherName && r.teacherName.toLowerCase().includes(q))
      );
    }

    return records;
  }

  renderRecordsTable() {
    const tableBody = document.getElementById('records-table-body');
    const countBadge = document.getElementById('records-count-badge');
    if (!tableBody) return;

    const filtered = this.getFilteredRecords();
    if (countBadge) countBadge.innerText = `${filtered.length} รายการ`;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-8 text-gray-500">
            <div class="empty-state-card">
              <i class="fas fa-folder-open text-4xl mb-2 text-gray-300"></i>
              <p class="font-semibold">ไม่พบข้อมูลผลการเรียนตามเงื่อนไขที่เลือก</p>
              <span class="text-xs text-gray-400">ลองเปลี่ยนตัวกรอง หรือกดเพิ่มข้อมูลใหม่</span>
            </div>
          </td>
        </tr>
      `;
      this.renderPagination(0);
      return;
    }

    // Pagination
    const totalPages = Math.ceil(filtered.length / this.pageSize);
    if (this.currentPage > totalPages) this.currentPage = 1;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const pageRecords = filtered.slice(startIndex, startIndex + this.pageSize);

    const currentUser = authService.getCurrentUser();
    const isAdmin = authService.isAdmin();
    const isTeacher = authService.isTeacher();
    const isStudent = authService.isStudent();

    tableBody.innerHTML = pageRecords.map((r, idx) => {
      const condition = APP_CONFIG.CONDITION_TYPES[r.conditionType] || { label: r.conditionType, color: '#64748b' };
      const statusTitle = app.getStatusTitle(r.status);
      const statusClass = app.getStatusBadgeClass(r.status);

      return `
        <tr class="hover-row">
          <td class="text-center text-xs text-gray-500 font-mono">${startIndex + idx + 1}</td>
          <td>
            <div class="student-cell">
              <span class="student-name font-medium text-gray-900">${r.studentName}</span>
              <span class="student-sub text-xs text-gray-500">รหัส ${r.studentId} • ชั้น ${r.gradeLevel}/${r.room || '1'}</span>
            </div>
          </td>
          <td>
            <div class="subject-cell">
              <span class="subject-code font-bold text-indigo-700">${r.subjectCode}</span>
              <span class="subject-name text-xs text-gray-600">${r.subjectName}</span>
            </div>
          </td>
          <td class="text-center">
            <span class="grade-badge grade-${r.conditionType}">${r.conditionType}</span>
          </td>
          <td>
            <span class="text-sm text-gray-700">${r.teacherName || '-'}</span>
          </td>
          <td class="text-center">
            <span class="status-pill ${statusClass}">
              <i class="${app.getStatusIcon(r.status)}"></i> ${statusTitle}
            </span>
          </td>
          <td class="text-center">
            ${r.newGrade ? `<span class="new-grade-pill font-bold">${r.newGrade}</span>` : '<span class="text-gray-300">-</span>'}
          </td>
          <td class="text-right">
            <div class="action-btn-group">
              ${this.renderActionButtons(r, currentUser)}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.renderPagination(filtered.length);
  }

  renderActionButtons(r, currentUser) {
    const role = currentUser ? currentUser.role : null;
    let buttons = '';

    // ปุ่มดูประวัติ Timeline ทุกคนดูได้
    buttons += `
      <button type="button" class="btn-icon text-blue-600" title="ดูลำดับขั้นตอนและประวัติ (Timeline)" onclick="workflowService.openStepModal('${r.id}', 'timeline')">
        <i class="fas fa-history"></i>
      </button>
    `;

    // 1. สิทธิ์นักเรียน
    if (role === APP_CONFIG.ROLES.STUDENT) {
      if (r.status === 'pending_request' || !r.status) {
        buttons += `
          <button type="button" class="btn-sm btn-primary" onclick="workflowService.openStepModal('${r.id}', 'request')">
            <i class="fas fa-paper-plane"></i> ยื่นคำร้อง
          </button>
        `;
      } else if (r.status === 'assigned' || r.status === 'rejected') {
        buttons += `
          <button type="button" class="btn-sm btn-purple" onclick="workflowService.openStepModal('${r.id}', 'submit')">
            <i class="fas fa-upload"></i> ส่งงาน
          </button>
        `;
      }
    }

    // 2. สิทธิ์ครูผู้สอน & Admin
    if (role === APP_CONFIG.ROLES.TEACHER || role === APP_CONFIG.ROLES.ADMIN) {
      if (r.status === 'requested' || r.status === 'pending_request') {
        buttons += `
          <button type="button" class="btn-sm btn-amber" onclick="workflowService.openStepModal('${r.id}', 'assign')">
            <i class="fas fa-tasks"></i> มอบหมายงาน
          </button>
        `;
      } else if (r.status === 'submitted') {
        buttons += `
          <button type="button" class="btn-sm btn-emerald" onclick="workflowService.openStepModal('${r.id}', 'review')">
            <i class="fas fa-gavel"></i> ตรวจชิ้นงาน
          </button>
        `;
      } else if (r.status === 'assigned') {
        buttons += `
          <button type="button" class="btn-sm btn-outline text-amber-600" title="แก้ไขงานที่มอบหมาย" onclick="workflowService.openStepModal('${r.id}', 'assign')">
            <i class="fas fa-edit"></i> แก้งาน
          </button>
        `;
      } else if (r.status === 'approved') {
        buttons += `
          <button type="button" class="btn-sm btn-outline text-emerald-600" title="ดูผลการอนุมัติ" onclick="workflowService.openStepModal('${r.id}', 'timeline')">
            <i class="fas fa-check-circle"></i> ผ่านแล้ว
          </button>
        `;
      }
    }

    // 3. ปุ่มแก้ไข/ลบ สำหรับ Admin
    if (role === APP_CONFIG.ROLES.ADMIN) {
      buttons += `
        <button type="button" class="btn-icon text-gray-500 hover:text-indigo-600" title="แก้ไขข้อมูล" onclick="recordsService.openEditRecordModal('${r.id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button type="button" class="btn-icon text-gray-500 hover:text-red-600" title="ลบรายการ" onclick="recordsService.deleteRecordPrompt('${r.id}', '${r.studentName}', '${r.subjectCode}')">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;
    }

    return buttons;
  }

  renderPagination(totalCount) {
    const paginationContainer = document.getElementById('records-pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(totalCount / this.pageSize);
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let html = `
      <div class="pagination-wrapper">
        <button class="btn-page" ${this.currentPage === 1 ? 'disabled' : ''} onclick="recordsService.changePage(${this.currentPage - 1})">
          <i class="fas fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        html += `
          <button class="btn-page ${i === this.currentPage ? 'active' : ''}" onclick="recordsService.changePage(${i})">${i}</button>
        `;
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        html += `<span class="page-ellipsis">...</span>`;
      }
    }

    html += `
        <button class="btn-page" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="recordsService.changePage(${this.currentPage + 1})">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    `;

    paginationContainer.innerHTML = html;
  }

  changePage(page) {
    this.currentPage = page;
    this.renderRecordsTable();
  }

  setGradeFilter(type) {
    this.filterGradeType = type;
    this.currentPage = 1;
    
    // อัปเดต UI filter pills
    document.querySelectorAll('.filter-pill-grade').forEach(el => {
      el.classList.toggle('active', el.dataset.grade === type);
    });
    this.renderRecordsTable();
  }

  setStatusFilter(status) {
    this.filterStatus = status;
    this.currentPage = 1;
    this.renderRecordsTable();
  }

  setGradeLevelFilter(level) {
    this.filterGradeLevel = level;
    this.currentPage = 1;
    this.renderRecordsTable();
  }

  setSearchQuery(q) {
    this.searchQuery = q;
    this.currentPage = 1;
    this.renderRecordsTable();
  }

  /**
   * เปิด Modal บันทึกข้อมูลผลการเรียน 0/ร/มส รายบุคคล
   */
  openAddRecordModal() {
    const modal = document.getElementById('record-form-modal');
    if (!modal) return;

    const students = db.get('students');
    const teachers = db.get('teachers');

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="recordsService.closeModal()"></div>
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-blue"><i class="fas fa-plus-circle"></i> บันทึกข้อมูล</span>
            <h3>เพิ่มข้อมูลนักเรียนติด 0 / ร / มส</h3>
          </div>
          <button class="btn-close-modal" onclick="recordsService.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="form-record-data" onsubmit="recordsService.handleRecordFormSubmit(event)">
            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="rec-student-select">เลือกนักเรียน <span class="text-red-500">*</span></label>
                <select id="rec-student-select" class="form-control" required onchange="recordsService.onStudentSelected(this.value)">
                  <option value="">-- เลือกนักเรียนในทะเบียน --</option>
                  ${students.map(s => `
                    <option value="${s.studentId}">${s.studentId} - ${s.name} (${s.gradeLevel}/${s.room || '1'})</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group col-md-6">
                <label for="rec-teacher-select">ครูผู้สอนประจำวิชา <span class="text-red-500">*</span></label>
                <select id="rec-teacher-select" class="form-control" required onchange="recordsService.onTeacherSelected(this.value)">
                  <option value="">-- เลือกครูผู้สอน --</option>
                  ${teachers.map(t => `
                    <option value="${t.teacherId || t.id}">${t.name} (${t.learningArea || '-'})</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-4">
                <label for="rec-student-id">รหัสประจำตัวนักเรียน</label>
                <input type="text" id="rec-student-id" class="form-control" required placeholder="เช่น 50101">
              </div>
              <div class="form-group col-md-5">
                <label for="rec-student-name">ชื่อ - นามสกุล นักเรียน</label>
                <input type="text" id="rec-student-name" class="form-control" required placeholder="เช่น นายสมชาย สมบูรณ์">
              </div>
              <div class="form-group col-md-3">
                <label for="rec-grade-level">ระดับชั้น</label>
                <select id="rec-grade-level" class="form-control">
                  ${APP_CONFIG.GRADE_LEVELS.map(g => `<option value="${g}">${g}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-3">
                <label for="rec-subject-code">รหัสวิชา <span class="text-red-500">*</span></label>
                <input type="text" id="rec-subject-code" class="form-control" required placeholder="เช่น ค31101">
              </div>
              <div class="form-group col-md-6">
                <label for="rec-subject-name">ชื่อรายวิชา <span class="text-red-500">*</span></label>
                <input type="text" id="rec-subject-name" class="form-control" required placeholder="เช่น คณิตศาสตร์พื้นฐาน 1">
              </div>
              <div class="form-group col-md-3">
                <label for="rec-condition-type">ผลการเรียนที่ติด <span class="text-red-500">*</span></label>
                <select id="rec-condition-type" class="form-control font-bold text-red-600" required>
                  <option value="0" selected>0 (เกรดศูนย์)</option>
                  <option value="ร">ร (รอการตัดสิน)</option>
                  <option value="มส">มส (หมดสิทธิ์สอบ)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="rec-learning-area">กลุ่มสาระการเรียนรู้</label>
                <select id="rec-learning-area" class="form-control">
                  ${APP_CONFIG.LEARNING_AREAS.map(la => `<option value="${la}">${la}</option>`).join('')}
                </select>
              </div>
              <div class="form-group col-md-3">
                <label for="rec-semester">ภาคเรียน</label>
                <input type="text" id="rec-semester" class="form-control" value="${APP_CONFIG.SEMESTER}">
              </div>
              <div class="form-group col-md-3">
                <label for="rec-academic-year">ปีการศึกษา</label>
                <input type="text" id="rec-academic-year" class="form-control" value="${APP_CONFIG.ACADEMIC_YEAR}">
              </div>
            </div>

            <input type="hidden" id="rec-edit-id" value="">
            <input type="hidden" id="rec-teacher-name" value="">

            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-outline" onclick="recordsService.closeModal()">ยกเลิก</button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save mr-1"></i> บันทึกข้อมูลผลการเรียน
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    modal.classList.add('active');
  }

  openEditRecordModal(id) {
    const record = db.getById('records', id);
    if (!record) return;

    this.openAddRecordModal();

    // Populate data
    setTimeout(() => {
      document.getElementById('rec-edit-id').value = record.id;
      document.getElementById('rec-student-id').value = record.studentId || '';
      document.getElementById('rec-student-name').value = record.studentName || '';
      document.getElementById('rec-grade-level').value = record.gradeLevel || 'ม.4';
      document.getElementById('rec-subject-code').value = record.subjectCode || '';
      document.getElementById('rec-subject-name').value = record.subjectName || '';
      document.getElementById('rec-condition-type').value = record.conditionType || '0';
      document.getElementById('rec-learning-area').value = record.learningArea || APP_CONFIG.LEARNING_AREAS[0];
      document.getElementById('rec-semester').value = record.semester || '1';
      document.getElementById('rec-academic-year').value = record.academicYear || '2569';
      document.getElementById('rec-teacher-name').value = record.teacherName || '';
    }, 50);
  }

  onStudentSelected(studentId) {
    if (!studentId) return;
    const student = db.get('students').find(s => s.studentId === studentId);
    if (student) {
      document.getElementById('rec-student-id').value = student.studentId;
      document.getElementById('rec-student-name').value = `${student.prefix || ''}${student.name}`;
      document.getElementById('rec-grade-level').value = student.gradeLevel || 'ม.4';
    }
  }

  onTeacherSelected(teacherId) {
    if (!teacherId) return;
    const teacher = db.get('teachers').find(t => (t.teacherId === teacherId || t.id === teacherId));
    if (teacher) {
      document.getElementById('rec-teacher-name').value = teacher.name;
      if (teacher.learningArea) {
        document.getElementById('rec-learning-area').value = teacher.learningArea;
      }
      // ถ้าครูมีวิชาสอน ให้ใส่เป็นค่าแนะนำ
      if (teacher.subjects && teacher.subjects.length > 0) {
        document.getElementById('rec-subject-code').value = teacher.subjects[0].code || '';
        document.getElementById('rec-subject-name').value = teacher.subjects[0].name || '';
      }
    }
  }

  async handleRecordFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('rec-edit-id').value;
    const studentId = document.getElementById('rec-student-id').value.trim();
    const studentName = document.getElementById('rec-student-name').value.trim();
    const gradeLevel = document.getElementById('rec-grade-level').value;
    const subjectCode = document.getElementById('rec-subject-code').value.trim();
    const subjectName = document.getElementById('rec-subject-name').value.trim();
    const conditionType = document.getElementById('rec-condition-type').value;
    const learningArea = document.getElementById('rec-learning-area').value;
    const semester = document.getElementById('rec-semester').value.trim();
    const academicYear = document.getElementById('rec-academic-year').value.trim();
    const teacherName = document.getElementById('rec-teacher-name').value || "ครูผู้สอน";

    let record = editId ? db.getById('records', editId) : null;
    if (!record) {
      record = {
        id: `rec_${Date.now()}`,
        status: 'pending_request',
        timeline: []
      };
    }

    record.studentId = studentId;
    record.studentName = studentName;
    record.gradeLevel = gradeLevel;
    record.subjectCode = subjectCode;
    record.subjectName = subjectName;
    record.conditionType = conditionType;
    record.learningArea = learningArea;
    record.semester = semester;
    record.academicYear = academicYear;
    record.teacherName = teacherName;

    await db.saveItem('records', record);
    this.closeModal();

    app.showToast(editId ? "อัปเดตข้อมูลสำเร็จ" : "บันทึกข้อมูลผลการเรียนสำเร็จ", "success");
  }

  /**
   * ลบรายการเดี่ยวพร้อม Pop-up ยืนยัน
   */
  async deleteRecordPrompt(id, studentName, subjectCode) {
    if (confirm(`คุณต้องการลบข้อมูลผลการเรียนของ "${studentName}" วิชา ${subjectCode} หรือไม่?`)) {
      await db.deleteItem('records', id);
      app.showToast("ลบข้อมูลผลการเรียนเรียบร้อยแล้ว", "info");
    }
  }

  /**
   * ล้างประวัติคำร้องทั้งหมด (Clear All Records)
   */
  async clearAllRecordsPrompt() {
    const confirmation = prompt('คำเตือน: การล้างข้อมูลจะลบรายการผลการเรียน 0/ร/มส ทั้งหมดในระบบ\nพิมพ์ "ยืนยันลบทั้งหมด" เพื่อดำเนินการ:');
    if (confirmation === 'ยืนยันลบทั้งหมด') {
      await db.clearCollection('records');
      app.showToast("ล้างประวัติคำร้องทั้งหมดเรียบร้อยแล้ว", "warning");
    } else if (confirmation !== null) {
      alert("ข้อความยืนยันไม่ถูกต้อง ยกเลิกการลบข้อมูล");
    }
  }

  /**
   * Bulk CSV Import สำหรับนำเข้ารายการติด 0/ร/มส
   */
  openBulkImportModal() {
    const modal = document.getElementById('csv-import-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="recordsService.closeCsvModal()"></div>
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-emerald"><i class="fas fa-file-csv"></i> Bulk Import</span>
            <h3>นำเข้าข้อมูลผลการเรียน 0 / ร / มส ด้วยไฟล์ CSV</h3>
          </div>
          <button class="btn-close-modal" onclick="recordsService.closeCsvModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="csv-guide-box">
            <h4><i class="fas fa-info-circle text-blue-500"></i> โครงสร้างไฟล์ CSV ที่ระบบรองรับ:</h4>
            <p>ไฟล์ CSV ต้องมีหัวตาราง (Header) ดังต่อไปนี้ และเข้ารหัสแบบ <strong>UTF-8</strong>:</p>
            <code>student_id,student_name,grade_level,room,subject_code,subject_name,condition_type,teacher_name,learning_area,term,year</code>
            <div class="mt-2">
              <button type="button" class="btn-sm btn-outline text-indigo-600 font-semibold" onclick="exportEngine.downloadTemplate('records')">
                <i class="fas fa-download mr-1"></i> ดาวน์โหลดไฟล์ตัวอย่าง (Sample CSV Template)
              </button>
            </div>
          </div>

          <form id="form-csv-import" onsubmit="recordsService.handleCsvUpload(event)">
            <div class="form-group mt-4">
              <label>เลือกไฟล์ CSV จากเครื่องคอมพิวเตอร์</label>
              <div class="custom-file-upload">
                <input type="file" id="csv-file-input" accept=".csv,text/csv" required onchange="recordsService.onCsvFileSelected(this)">
                <div class="upload-btn-ui">
                  <i class="fas fa-file-excel"></i> <span id="csv-file-name-display">คลิกเพื่อเลือกไฟล์ .CSV</span>
                </div>
              </div>
            </div>

            <div id="csv-preview-container" class="csv-preview-table-wrapper hidden">
              <h5>ตัวอย่างข้อมูลที่จะนำเข้า (<span id="csv-preview-count">0</span> รายการ):</h5>
              <div class="table-responsive" style="max-height: 200px;">
                <table class="data-table text-xs" id="csv-preview-table">
                  <thead>
                    <tr>
                      <th>รหัส นร.</th>
                      <th>ชื่อ-สกุล</th>
                      <th>ชั้น</th>
                      <th>รหัสวิชา</th>
                      <th>ชื่อวิชา</th>
                      <th>เกรด</th>
                      <th>ครูผู้สอน</th>
                    </tr>
                  </thead>
                  <tbody id="csv-preview-body"></tbody>
                </table>
              </div>
            </div>

            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-outline" onclick="recordsService.closeCsvModal()">ยกเลิก</button>
              <button type="submit" id="btn-submit-csv" class="btn btn-emerald" disabled>
                <i class="fas fa-upload mr-1"></i> ยืนยันนำเข้าข้อมูล
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
      document.getElementById('csv-file-name-display').innerText = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        this.parsedCsvData = this.parseCsv(text);
        this.renderCsvPreview(this.parsedCsvData);
      };
      reader.readAsText(file, 'utf-8');
    }
  }

  parseCsv(csvText) {
    const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex parse CSV handling commas inside quotes
      const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || line.split(',');
      if (values.length === 0) continue;

      const cleanValues = values.map(v => v ? v.trim().replace(/^["']|["']$/g, '') : '');
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = cleanValues[idx] || '';
      });

      const studentName = row.student_name || row['ชื่อ-สกุล'] || row['ชื่อ'] || '';
      const subjectCode = row.subject_code || row['รหัสวิชา'] || '';
      if (!studentName && !subjectCode) continue;

      result.push({
        id: `rec_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 4)}`,
        studentId: row.student_id || row['รหัสนักเรียน'] || '',
        studentName: studentName.trim(),
        gradeLevel: row.grade_level || row['ระดับชั้น'] || 'ม.4',
        room: row.room || row['ห้อง'] || '1',
        subjectCode: subjectCode.trim(),
        subjectName: (row.subject_name || row['ชื่อวิชา'] || '').trim(),
        conditionType: (row.condition_type || row['เกรด'] || '0').toUpperCase().replace('O', '0'),
        teacherName: row.teacher_name || row['ครูผู้สอน'] || 'ครูผู้สอน',
        learningArea: row.learning_area || row['กลุ่มสาระ'] || APP_CONFIG.LEARNING_AREAS[0],
        semester: row.term || row.semester || APP_CONFIG.SEMESTER,
        academicYear: row.year || row.academic_year || APP_CONFIG.ACADEMIC_YEAR,
        status: 'pending_request',
        timeline: []
      });
    }
    return result;
  }

  renderCsvPreview(data) {
    const container = document.getElementById('csv-preview-container');
    const tbody = document.getElementById('csv-preview-body');
    const countEl = document.getElementById('csv-preview-count');
    const submitBtn = document.getElementById('btn-submit-csv');

    if (!container || !tbody) return;

    if (data.length === 0) {
      container.classList.add('hidden');
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    countEl.innerText = data.length;
    tbody.innerHTML = data.slice(0, 8).map(r => `
      <tr>
        <td>${r.studentId}</td>
        <td>${r.studentName}</td>
        <td>${r.gradeLevel}/${r.room}</td>
        <td>${r.subjectCode}</td>
        <td>${r.subjectName}</td>
        <td class="font-bold text-red-600">${r.conditionType}</td>
        <td>${r.teacherName}</td>
      </tr>
    `).join('');

    container.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = false;
  }

  async handleCsvUpload(e) {
    e.preventDefault();
    if (!this.parsedCsvData || this.parsedCsvData.length === 0) {
      alert("กรุณาเลือกไฟล์ CSV ที่มีข้อมูลถูกต้อง");
      return;
    }

    const btn = document.getElementById('btn-submit-csv');
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> กำลังนำเข้าข้อมูล...`;

    try {
      await db.bulkInsert('records', this.parsedCsvData);
      this.closeCsvModal();
      app.showToast(`นำเข้าข้อมูลผลการเรียนสำเร็จจำนวน ${this.parsedCsvData.length} รายการ`, "success");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการนำเข้า CSV: " + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-upload mr-1"></i> ยืนยันนำเข้าข้อมูล`;
    }
  }

  closeModal() {
    const modal = document.getElementById('record-form-modal');
    if (modal) modal.classList.remove('active');
  }

  closeCsvModal() {
    const modal = document.getElementById('csv-import-modal');
    if (modal) modal.classList.remove('active');
    this.parsedCsvData = [];
  }
}

// Global Singleton Instance
const recordsService = new RecordsService();
