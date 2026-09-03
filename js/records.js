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

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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

    // กรองตามสิทธิ์ผู้ใช้งาน (Role-Based Access Control)
    if (currentUser) {
      if (currentUser.role === APP_CONFIG.ROLES.STUDENT) {
        // นักเรียนเห็นเฉพาะผลการเรียนของตัวเอง
        records = records.filter(r => 
          String(r.studentId) === String(currentUser.studentId) ||
          String(r.studentName).includes(currentUser.name)
        );
      } else if (currentUser.role === APP_CONFIG.ROLES.TEACHER) {
        // ครูจะเห็นเฉพาะนักเรียนที่มีผลการเรียนมีเงื่อนไขในวิชาที่ตัวเองสอนเท่านั้น
        records = records.filter(r => this.isTeacherRecordOwner(r, currentUser));
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

  /**
   * ตรวจสอบว่ารายการผลการเรียนนี้เป็นวิชาที่ครูท่านนี้สอนหรือไม่
   */
  isTeacherRecordOwner(r, currentUser) {
    if (!r || !currentUser) return false;

    // 1. ตรวจสอบจาก teacherId กับ currentUser.teacherId หรือ username
    const rTeacherId = String(r.teacherId || '').trim().toLowerCase();
    const curTeacherId = String(currentUser.teacherId || '').trim().toLowerCase();
    const curUsername = String(currentUser.username || '').trim().toLowerCase();

    if (rTeacherId && (rTeacherId === curTeacherId || rTeacherId === curUsername)) {
      return true;
    }

    // 2. ตรวจสอบจากชื่อครูผู้สอน (ตัดคำนำหน้าออกเพื่อเทียบชื่อ-นามสกุล)
    if (r.teacherName && currentUser.name) {
      const cleanR = String(r.teacherName).replace(/^(ครู|นาย|นางสาว|นาง|น\.ส\.)\s*/, '').trim().toLowerCase();
      const cleanU = String(currentUser.name).replace(/^(ครู|นาย|นางสาว|นาง|น\.ส\.)\s*/, '').trim().toLowerCase();
      if (cleanR === cleanU || cleanR.includes(cleanU) || cleanU.includes(cleanR)) {
        return true;
      }
    }

    return false;
  }

  renderRecordsTable() {
    const tableBody = document.getElementById('records-table-body');
    const countBadge = document.getElementById('records-count-badge');
    if (!tableBody) return;

    this.renderMiniStats();

    const filtered = this.getFilteredRecords();
    if (countBadge) countBadge.innerText = `${filtered.length} รายการ`;

    // Toggle search clear button
    const clearBtn = document.getElementById('btn-clear-search');
    if (clearBtn) {
      clearBtn.style.display = (this.searchQuery && this.searchQuery.trim().length > 0) ? 'flex' : 'none';
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-10 text-gray-500">
            <div class="empty-state-card" style="padding: 28px 16px; text-align: center;">
              <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; color: #2563eb; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 12px;">
                <i class="fas fa-search"></i>
              </div>
              <h4 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">ไม่พบข้อมูลผลการเรียนตามเงื่อนไขที่เลือก</h4>
              <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">ลองเปลี่ยนตัวกรอง ค้นหาด้วยคำอื่น หรือกดปุ่มล้างตัวกรอง</p>
              <button type="button" class="btn-sm btn-outline" onclick="recordsService.resetAllFilters()">
                <i class="fas fa-undo mr-1"></i> ล้างตัวกรองทั้งหมด
              </button>
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

    tableBody.innerHTML = pageRecords.map((r, idx) => {
      const statusTitle = app.getStatusTitle(r.status);
      const statusClass = app.getStatusBadgeClass(r.status);

      return `
        <tr class="hover-row">
          <td class="text-center text-xs text-gray-400 font-mono font-bold">${startIndex + idx + 1}</td>
          <td>
            <div class="student-cell-modern">
              <div class="student-avatar-circle" title="${this.escapeHtml(r.studentName)}">
                <i class="fas fa-user-graduate"></i>
              </div>
              <div class="student-info-col">
                <span class="student-name-bold">${this.escapeHtml(r.studentName)}</span>
                <div class="student-sub-row">
                  <span class="student-id-chip">รหัส ${this.escapeHtml(r.studentId)}</span>
                  <span class="class-room-badge">ชั้น ${this.escapeHtml(r.gradeLevel || '-')}/${this.escapeHtml(r.room || '1')}</span>
                </div>
              </div>
            </div>
          </td>
          <td>
            <div class="subject-cell-modern">
              <span class="subject-code-chip">${this.escapeHtml(r.subjectCode)}</span>
              <span class="subject-name-text">${this.escapeHtml(r.subjectName)}</span>
            </div>
          </td>
          <td class="text-center">
            <span class="grade-badge-modern grade-${r.conditionType}">${r.conditionType}</span>
          </td>
          <td>
            <div class="teacher-cell-modern">
              <span class="teacher-dot"></span>
              <span>${this.escapeHtml(r.teacherName || '-')}</span>
            </div>
          </td>
          <td class="text-center">
            <span class="status-pill-modern ${statusClass}">
              <i class="${app.getStatusIcon(r.status)}"></i> ${statusTitle}
            </span>
          </td>
          <td class="text-center">
            ${r.newGrade ? `<span class="new-grade-pill">${r.newGrade}</span>` : '<span class="text-gray-300 font-bold">-</span>'}
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

  /**
   * คำนวณและแสดง Mini Quick Stats Ticker ด้านบนของตาราง
   */
  renderMiniStats() {
    let allRecords = db.get('records') || [];
    const currentUser = authService.getCurrentUser();

    if (currentUser) {
      if (currentUser.role === APP_CONFIG.ROLES.STUDENT) {
        allRecords = allRecords.filter(r => 
          String(r.studentId) === String(currentUser.studentId) ||
          String(r.studentName).includes(currentUser.name)
        );
      } else if (currentUser.role === APP_CONFIG.ROLES.TEACHER) {
        allRecords = allRecords.filter(r => this.isTeacherRecordOwner(r, currentUser));
      }
    }

    let count0 = 0;
    let countR = 0;
    let countMS = 0;
    let countPass = 0;

    allRecords.forEach(r => {
      if (r.conditionType === '0') count0++;
      else if (r.conditionType === 'ร') countR++;
      else if (r.conditionType === 'มส') countMS++;

      if (r.status === 'approved') countPass++;
    });

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setVal('rec-stat-total', allRecords.length);
    setVal('rec-stat-0', count0);
    setVal('rec-stat-r', countR);
    setVal('rec-stat-ms', countMS);
    setVal('rec-stat-pass', countPass);
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
            <i class="fas fa-paper-plane mr-1"></i> ยื่นคำร้อง
          </button>
        `;
      } else if (r.status === 'assigned' || r.status === 'rejected') {
        buttons += `
          <button type="button" class="btn-sm btn-purple" onclick="workflowService.openStepModal('${r.id}', 'submit')">
            <i class="fas fa-upload mr-1"></i> ส่งงาน
          </button>
        `;
      } else if (r.status === 'approved') {
        buttons += `
          <button type="button" class="btn-sm btn-emerald" onclick="workflowService.openStepModal('${r.id}', 'timeline')" title="ผลการเรียนผ่านการอนุมัติแล้ว">
            <i class="fas fa-check-circle mr-1"></i> ผ่านแล้ว
          </button>
        `;
      }
    }

    // 2. สิทธิ์ครูผู้สอน & Admin
    if (role === APP_CONFIG.ROLES.TEACHER || role === APP_CONFIG.ROLES.ADMIN) {
      if (r.status === 'pending_request' || !r.status) {
        buttons += `
          <button type="button" class="btn-sm btn-outline text-gray-400" disabled style="cursor: not-allowed; opacity: 0.65; border-color: #cbd5e1;" title="รอนักเรียนกดยื่นคำร้องขอแก้ไขผลการเรียนก่อน จึงจะสามารถมอบหมายงานได้">
            <i class="fas fa-clock mr-1"></i> รอนักเรียนยื่นคำร้อง
          </button>
        `;
      } else if (r.status === 'requested') {
        buttons += `
          <button type="button" class="btn-sm btn-amber" onclick="workflowService.openStepModal('${r.id}', 'assign')">
            <i class="fas fa-tasks mr-1"></i> มอบหมายงาน
          </button>
        `;
      } else if (r.status === 'submitted') {
        buttons += `
          <button type="button" class="btn-sm btn-emerald" onclick="workflowService.openStepModal('${r.id}', 'review')">
            <i class="fas fa-gavel mr-1"></i> ตรวจชิ้นงาน
          </button>
        `;
      } else if (r.status === 'assigned') {
        buttons += `
          <button type="button" class="btn-sm btn-outline text-amber-600" title="แก้ไขงานที่มอบหมาย" onclick="workflowService.openStepModal('${r.id}', 'assign')">
            <i class="fas fa-edit mr-1"></i> แก้งาน
          </button>
        `;
      } else if (r.status === 'approved') {
        buttons += `
          <button type="button" class="btn-sm btn-outline text-emerald-600" title="ดูผลการอนุมัติ" onclick="workflowService.openStepModal('${r.id}', 'timeline')">
            <i class="fas fa-check-circle mr-1"></i> ผ่านแล้ว
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
        html += `<span class="page-ellipsis" style="padding: 0 4px; color: #94a3b8;">...</span>`;
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
    const statusSelect = document.getElementById('filter-records-status');
    if (statusSelect && statusSelect.value !== status) statusSelect.value = status;
    this.renderRecordsTable();
  }

  setGradeLevelFilter(level) {
    this.filterGradeLevel = level;
    this.currentPage = 1;
    const levelSelect = document.getElementById('filter-records-level');
    if (levelSelect && levelSelect.value !== level) levelSelect.value = level;
    this.renderRecordsTable();
  }

  setSearchQuery(q) {
    this.searchQuery = q;
    this.currentPage = 1;
    this.renderRecordsTable();
  }

  clearSearch() {
    this.searchQuery = '';
    const input = document.getElementById('search-records-input');
    if (input) input.value = '';
    this.currentPage = 1;
    this.renderRecordsTable();
  }

  resetAllFilters() {
    this.filterGradeType = 'all';
    this.filterStatus = 'all';
    this.filterGradeLevel = 'all';
    this.searchQuery = '';
    this.currentPage = 1;

    const searchInput = document.getElementById('search-records-input');
    if (searchInput) searchInput.value = '';

    const statusSelect = document.getElementById('filter-records-status');
    if (statusSelect) statusSelect.value = 'all';

    const levelSelect = document.getElementById('filter-records-level');
    if (levelSelect) levelSelect.value = 'all';

    document.querySelectorAll('.filter-pill-grade').forEach(el => {
      el.classList.toggle('active', el.dataset.grade === 'all');
    });

    this.renderRecordsTable();
    if (typeof app !== 'undefined' && app.showToast) {
      app.showToast('ล้างตัวกรองทั้งหมดแล้ว', 'info');
    }
  }

  /**
   * เปิด Modal บันทึกข้อมูลผลการเรียน 0/ร/มส รายบุคคล
   */
  openAddRecordModal() {
    const modal = document.getElementById('record-form-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="recordsService.closeModal()"></div>
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-blue"><i class="fas fa-plus-circle"></i> บันทึกข้อมูล</span>
            <h3 id="record-modal-title">เพิ่มข้อมูลนักเรียนติด 0 / ร / มส</h3>
          </div>
          <button class="btn-close-modal" onclick="recordsService.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="form-record-data" onsubmit="recordsService.handleRecordFormSubmit(event)">
            <div class="form-row">
              <!-- เลือกนักเรียน (Searchable Autocomplete) -->
              <div class="form-group col-md-6">
                <label for="rec-student-search">เลือกนักเรียน <span class="text-red-500">*</span> <span class="text-xs text-gray-500">(พิมพ์ค้นหาชื่อ หรือรหัสประจำตัว)</span></label>
                <div class="searchable-combobox-wrap" id="student-combobox-wrap">
                  <div class="searchable-input-wrapper">
                    <i class="fas fa-search combobox-icon-left"></i>
                    <input type="text" id="rec-student-search" class="form-control searchable-input" placeholder="พิมพ์ชื่อ, สกุล หรือรหัสประจำตัว..." autocomplete="off" oninput="recordsService.onStudentSearchInput(this.value)" onfocus="recordsService.renderStudentDropdown(this.value)">
                    <button type="button" class="combobox-clear-btn" title="ล้างการเลือก" onclick="recordsService.clearStudentSelection()">&times;</button>
                  </div>
                  <div id="rec-student-dropdown-list" class="combobox-dropdown-list hidden"></div>
                </div>
              </div>

              <!-- ครูผู้สอนประจำวิชา (Searchable Autocomplete) -->
              <div class="form-group col-md-6">
                <label for="rec-teacher-search">ครูผู้สอนประจำวิชา <span class="text-red-500">*</span> <span class="text-xs text-gray-500">(พิมพ์ค้นหาชื่อครู)</span></label>
                <div class="searchable-combobox-wrap" id="teacher-combobox-wrap">
                  <div class="searchable-input-wrapper">
                    <i class="fas fa-chalkboard-teacher combobox-icon-left"></i>
                    <input type="text" id="rec-teacher-search" class="form-control searchable-input" placeholder="พิมพ์ชื่อครู หรือกลุ่มสาระ..." autocomplete="off" oninput="recordsService.onTeacherSearchInput(this.value)" onfocus="recordsService.renderTeacherDropdown(this.value)">
                    <button type="button" class="combobox-clear-btn" title="ล้างการเลือก" onclick="recordsService.clearTeacherSelection()">&times;</button>
                  </div>
                  <div id="rec-teacher-dropdown-list" class="combobox-dropdown-list hidden"></div>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-4">
                <label for="rec-student-id">รหัสประจำตัวนักเรียน</label>
                <input type="text" id="rec-student-id" class="form-control" required placeholder="เช่น 09522">
              </div>
              <div class="form-group col-md-5">
                <label for="rec-student-name">ชื่อ - นามสกุล นักเรียน</label>
                <input type="text" id="rec-student-name" class="form-control" required placeholder="เช่น ด.ช.ศิลป์ชัย ชุเลิศ">
              </div>
              <div class="form-group col-md-3">
                <label for="rec-grade-level">ระดับชั้น</label>
                <select id="rec-grade-level" class="form-control" onchange="recordsService.onGradeLevelChange()">
                  ${APP_CONFIG.GRADE_LEVELS.map(g => `<option value="${g}">${g}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Dynamic Teacher Subjects Quick Picker Container -->
            <div id="teacher-subjects-quick-box" class="teacher-subjects-quick-box" style="display: none;">
              <div class="teacher-subjects-header flex items-center justify-between">
                <span id="teacher-subjects-label" class="text-xs font-bold text-blue-900">
                  <i class="fas fa-layer-group text-primary mr-1"></i> เลือกวิชาที่ครูผู้สอนสอนในระดับชั้นนี้:
                </span>
                <span class="text-xs text-blue-600 font-medium">คลิกเพื่อเลือกวิชาอัตโนมัติ</span>
              </div>
              <div id="teacher-subjects-chips" class="teacher-subject-chips-container"></div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-3">
                <label for="rec-subject-code">รหัสวิชา <span class="text-red-500">*</span></label>
                <input type="text" id="rec-subject-code" class="form-control" required placeholder="เช่น ค31101" list="teacher-subject-codes-datalist" autocomplete="off" oninput="recordsService.onSubjectCodeManualInput(this.value)">
                <datalist id="teacher-subject-codes-datalist"></datalist>
              </div>
              <div class="form-group col-md-6">
                <label for="rec-subject-name">ชื่อรายวิชา <span class="text-red-500">*</span></label>
                <input type="text" id="rec-subject-name" class="form-control" required placeholder="เช่น คณิตศาสตร์พื้นฐาน 1" list="teacher-subject-names-datalist" autocomplete="off">
                <datalist id="teacher-subject-names-datalist"></datalist>
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
                <select id="rec-semester" class="form-control">
                  <option value="1" ${String(APP_CONFIG.SEMESTER) === '1' ? 'selected' : ''}>ภาคเรียนที่ 1</option>
                  <option value="2" ${String(APP_CONFIG.SEMESTER) === '2' ? 'selected' : ''}>ภาคเรียนที่ 2</option>
                </select>
              </div>
              <div class="form-group col-md-3">
                <label for="rec-academic-year">ปีการศึกษา</label>
                <select id="rec-academic-year" class="form-control">
                  ${(APP_CONFIG.AVAILABLE_YEARS || ["2569", "2568", "2567", "2570"]).map(y => `
                    <option value="${y}" ${String(APP_CONFIG.ACADEMIC_YEAR) === String(y) ? 'selected' : ''}>${y}</option>
                  `).join('')}
                </select>
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

    this.setupComboboxClickOutside();
  }

  setupComboboxClickOutside() {
    if (this._comboboxBound) return;
    this._comboboxBound = true;
    document.addEventListener('click', (e) => {
      const sWrap = document.getElementById('student-combobox-wrap');
      const tWrap = document.getElementById('teacher-combobox-wrap');
      const sDropdown = document.getElementById('rec-student-dropdown-list');
      const tDropdown = document.getElementById('rec-teacher-dropdown-list');

      if (sDropdown && sWrap && !sWrap.contains(e.target)) {
        sDropdown.classList.add('hidden');
      }
      if (tDropdown && tWrap && !tWrap.contains(e.target)) {
        tDropdown.classList.add('hidden');
      }
    });
  }

  onStudentSearchInput(query) {
    this.renderStudentDropdown(query);
  }

  renderStudentDropdown(query = '') {
    const dropdown = document.getElementById('rec-student-dropdown-list');
    if (!dropdown) return;

    const students = db.get('students') || [];
    const q = (query || '').trim().toLowerCase();

    let filtered = students;
    if (q) {
      filtered = students.filter(s => 
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.studentId && String(s.studentId).toLowerCase().includes(q)) ||
        (s.gradeLevel && s.gradeLevel.toLowerCase().includes(q)) ||
        (s.advisor && s.advisor.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      dropdown.innerHTML = `<div class="combobox-empty"><i class="fas fa-info-circle mr-1"></i> ไม่พบรายชื่อนักเรียน "${query}"</div>`;
      dropdown.classList.remove('hidden');
      return;
    }

    dropdown.innerHTML = filtered.slice(0, 35).map(s => {
      const roomText = s.room ? `${s.gradeLevel}/${s.room}` : (s.gradeLevel || '');
      return `
        <div class="combobox-item" onclick="recordsService.selectStudent('${s.id}')">
          <div>
            <span class="item-title">${s.studentId} - ${s.name}</span>
            <span class="item-sub">(${roomText}${s.number ? ' เลขที่ ' + s.number : ''})</span>
          </div>
          <i class="fas fa-chevron-right text-gray-300 text-xs"></i>
        </div>
      `;
    }).join('');

    dropdown.classList.remove('hidden');
  }

  selectStudent(studentDbId) {
    const student = db.getById('students', studentDbId);
    if (!student) return;

    const searchInput = document.getElementById('rec-student-search');
    const idInput = document.getElementById('rec-student-id');
    const nameInput = document.getElementById('rec-student-name');
    const levelInput = document.getElementById('rec-grade-level');
    const dropdown = document.getElementById('rec-student-dropdown-list');

    const roomText = student.room ? `${student.gradeLevel}/${student.room}` : (student.gradeLevel || '');
    if (searchInput) searchInput.value = `${student.studentId} - ${student.name} (${roomText})`;
    if (idInput) idInput.value = student.studentId || '';
    if (nameInput) nameInput.value = `${student.prefix ? student.prefix : ''}${student.name || ''}`;
    if (levelInput && student.gradeLevel) {
      let g = student.gradeLevel;
      if (g.includes('/')) g = g.split('/')[0].trim();
      levelInput.value = g;
    }
    if (dropdown) dropdown.classList.add('hidden');

    // อัปเดตรายการวิชาที่ครูสอนตามระดับชั้นของนักเรียนทันที
    this.updateTeacherSubjectOptions();
  }

  clearStudentSelection() {
    const searchInput = document.getElementById('rec-student-search');
    const idInput = document.getElementById('rec-student-id');
    const nameInput = document.getElementById('rec-student-name');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    if (idInput) idInput.value = '';
    if (nameInput) nameInput.value = '';
    this.renderStudentDropdown('');
    this.updateTeacherSubjectOptions();
  }

  onGradeLevelChange() {
    // เมื่อเปลี่ยนระดับชั้น ให้รีเฟรชวิชาที่ครูสอนในระดับชั้นนั้นใหม่
    this.updateTeacherSubjectOptions();
  }

  onTeacherSearchInput(query) {
    this.renderTeacherDropdown(query);
  }

  renderTeacherDropdown(query = '') {
    const dropdown = document.getElementById('rec-teacher-dropdown-list');
    if (!dropdown) return;

    const teachers = db.get('teachers') || [];
    const q = (query || '').trim().toLowerCase();

    let filtered = teachers;
    if (q) {
      filtered = teachers.filter(t => 
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.teacherId && String(t.teacherId).toLowerCase().includes(q)) ||
        (t.learningArea && t.learningArea.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      dropdown.innerHTML = `<div class="combobox-empty"><i class="fas fa-info-circle mr-1"></i> ไม่พบข้อมูลครูผู้สอน "${query}"</div>`;
      dropdown.classList.remove('hidden');
      return;
    }

    dropdown.innerHTML = filtered.slice(0, 35).map(t => `
      <div class="combobox-item" onclick="recordsService.selectTeacher('${t.id}')">
        <div style="width: 100%;">
          <span class="item-title text-gray-900 font-semibold">${t.name}</span>
          <span class="item-sub text-gray-500 font-normal">(${t.learningArea || '-'})</span>
        </div>
      </div>
    `).join('');

    dropdown.classList.remove('hidden');
  }

  selectTeacher(teacherDbId) {
    const teacher = db.getById('teachers', teacherDbId);
    if (!teacher) return;

    this.selectedTeacherId = teacher.id;

    const searchInput = document.getElementById('rec-teacher-search');
    const nameHidden = document.getElementById('rec-teacher-name');
    const areaInput = document.getElementById('rec-learning-area');
    const dropdown = document.getElementById('rec-teacher-dropdown-list');

    if (searchInput) searchInput.value = `${teacher.name} (${teacher.learningArea || '-'})`;
    if (nameHidden) nameHidden.value = teacher.name;
    if (areaInput && teacher.learningArea) areaInput.value = teacher.learningArea;

    if (dropdown) dropdown.classList.add('hidden');

    // อัปเดตตัวเลือกวิชาที่ครูสอนในระดับชั้นนั้นมาให้เลือกทันที
    this.updateTeacherSubjectOptions(true);
  }

  clearTeacherSelection() {
    this.selectedTeacherId = null;
    const searchInput = document.getElementById('rec-teacher-search');
    const nameHidden = document.getElementById('rec-teacher-name');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    if (nameHidden) nameHidden.value = '';
    this.renderTeacherDropdown('');
    this.updateTeacherSubjectOptions();
  }

  /**
   * ดึงรายวิชาที่ครูสอน และกรองตามระดับชั้นที่เลือก นำมาแสดงให้เลือกอัตโนมัติ
   * @param {boolean} isInitialSelect - หากเป็นจริงและมีวิชาเดียวตรงระดับชั้น จะเลือกให้อัตโนมัติ
   */
  updateTeacherSubjectOptions(isInitialSelect = false) {
    const box = document.getElementById('teacher-subjects-quick-box');
    const chipsContainer = document.getElementById('teacher-subjects-chips');
    const labelEl = document.getElementById('teacher-subjects-label');
    const datalistCodes = document.getElementById('teacher-subject-codes-datalist');
    const datalistNames = document.getElementById('teacher-subject-names-datalist');

    if (!box || !chipsContainer) return;

    const teacherName = (document.getElementById('rec-teacher-name')?.value || '').trim();
    const teacherSearch = (document.getElementById('rec-teacher-search')?.value || '').trim();
    const gradeLevel = (document.getElementById('rec-grade-level')?.value || 'ม.1').trim();

    if (!teacherName && !teacherSearch) {
      box.style.display = 'none';
      if (datalistCodes) datalistCodes.innerHTML = '';
      if (datalistNames) datalistNames.innerHTML = '';
      return;
    }

    // ค้นหา Object ข้อมูลครู
    const teachers = db.get('teachers') || [];
    let teacher = teachers.find(t => 
      (this.selectedTeacherId && t.id === this.selectedTeacherId) ||
      (t.name && (t.name === teacherName || teacherSearch.includes(t.name) || t.name.includes(teacherSearch)))
    );

    // รวบรวมวิชาทั้งหมดที่ครูท่านนี้สอน
    let allSubjects = [];
    if (teacher && Array.isArray(teacher.subjects)) {
      teacher.subjects.forEach(s => {
        if (s && s.code) {
          allSubjects.push({
            code: s.code.trim(),
            name: (s.name || '').trim(),
            level: (s.level || '').trim(),
            learningArea: teacher.learningArea || ''
          });
        }
      });
    }

    // ค้นหาเพิ่มเติมจากประวัติผลการเรียนเดิม (Records Database) เพื่อให้ครอบคลุมที่สุด
    const records = db.get('records') || [];
    records.forEach(r => {
      const matchName = r.teacherName && (r.teacherName === teacherName || (teacher && r.teacherName === teacher.name));
      if (matchName && r.subjectCode) {
        const exists = allSubjects.some(s => s.code.toLowerCase() === r.subjectCode.trim().toLowerCase());
        if (!exists) {
          allSubjects.push({
            code: r.subjectCode.trim(),
            name: (r.subjectName || '').trim(),
            level: (r.gradeLevel || '').trim(),
            learningArea: r.learningArea || (teacher ? teacher.learningArea : '')
          });
        }
      }
    });

    if (allSubjects.length === 0) {
      box.style.display = 'none';
      if (datalistCodes) datalistCodes.innerHTML = '';
      if (datalistNames) datalistNames.innerHTML = '';
      return;
    }

    // ระดับชั้นเป้าหมาย เช่น "ม.1", "ม.2", "ม.4"
    let targetLevel = gradeLevel;
    if (targetLevel.includes('/')) targetLevel = targetLevel.split('/')[0].trim();

    // กรองวิชาที่ตรงกับระดับชั้นนี้ (หรือวิชาที่สอนทุกระดับชั้น)
    const levelMatches = allSubjects.filter(s => {
      if (!s.level || s.level === 'all' || s.level === 'ทุกระดับ') return true;
      let sLvl = s.level.trim();
      if (sLvl.includes('/')) sLvl = sLvl.split('/')[0].trim();
      return sLvl.startsWith(targetLevel) || targetLevel.startsWith(sLvl);
    });

    // วิชาอื่นๆ ที่ครูสอนในระดับชั้นอื่น
    const otherSubjects = allSubjects.filter(s => !levelMatches.includes(s));

    const currentCode = (document.getElementById('rec-subject-code')?.value || '').trim();

    // อัปเดต HTML Datalist เพื่อให้สามารถพิมพ์แล้วมีคำแนะนำขึ้นมา
    if (datalistCodes) {
      datalistCodes.innerHTML = allSubjects.map(s => 
        `<option value="${s.code}">${s.name} (${s.level || 'ทุกระดับ'})</option>`
      ).join('');
    }
    if (datalistNames) {
      datalistNames.innerHTML = allSubjects.map(s => 
        `<option value="${s.name}">${s.code} (${s.level || 'ทุกระดับ'})</option>`
      ).join('');
    }

    // แสดงกล่อง Quick Selector
    box.style.display = 'block';
    const teacherDisplayName = teacher ? teacher.name : teacherName;

    if (labelEl) {
      if (levelMatches.length > 0) {
        labelEl.innerHTML = `<i class="fas fa-book-open text-primary mr-1"></i> วิชาที่ <b>${teacherDisplayName}</b> สอนในระดับชั้น <b>${targetLevel}</b>:`;
      } else {
        labelEl.innerHTML = `<i class="fas fa-book-open text-primary mr-1"></i> รายวิชาทั้งหมดที่ <b>${teacherDisplayName}</b> สอน:`;
      }
    }

    let chipsHtml = '';

    if (levelMatches.length > 0) {
      chipsHtml += levelMatches.map(s => {
        const isSelected = currentCode && currentCode.toLowerCase() === s.code.toLowerCase();
        return `
          <button type="button" 
                  class="btn-subject-quick-chip ${isSelected ? 'active' : ''}" 
                  onclick="recordsService.applySubjectSelection('${s.code.replace(/'/g, "\\'")}', '${s.name.replace(/'/g, "\\'")}', '${(s.learningArea || '').replace(/'/g, "\\'")}')"
                  title="คลิกเพื่อเลือกรหัสวิชา ${s.code}">
            <span class="chip-code">${s.code}</span>
            <span class="chip-name">${s.name}</span>
            ${s.level ? `<span class="chip-level">${s.level}</span>` : ''}
            ${isSelected ? `<i class="fas fa-check-circle text-emerald-500 ml-1"></i>` : ''}
          </button>
        `;
      }).join('');
    }

    if (otherSubjects.length > 0) {
      if (levelMatches.length > 0) {
        chipsHtml += `<div class="w-full text-xs text-gray-500 mt-1 mb-0.5 font-medium">วิชาที่สอนในระดับชั้นอื่น:</div>`;
      }
      chipsHtml += otherSubjects.map(s => {
        const isSelected = currentCode && currentCode.toLowerCase() === s.code.toLowerCase();
        return `
          <button type="button" 
                  class="btn-subject-quick-chip chip-secondary ${isSelected ? 'active' : ''}" 
                  onclick="recordsService.applySubjectSelection('${s.code.replace(/'/g, "\\'")}', '${s.name.replace(/'/g, "\\'")}', '${(s.learningArea || '').replace(/'/g, "\\'")}')"
                  title="คลิกเพื่อเลือกรหัสวิชา ${s.code}">
            <span class="chip-code">${s.code}</span>
            <span class="chip-name">${s.name}</span>
            <span class="chip-level">${s.level || '-'}</span>
            ${isSelected ? `<i class="fas fa-check-circle text-emerald-500 ml-1"></i>` : ''}
          </button>
        `;
      }).join('');
    }

    chipsContainer.innerHTML = chipsHtml;

    // หากเป็นการเลือกครู และมีวิชาตรงกับระดับชั้นเพียง 1 วิชา ให้เลือกให้อัตโนมัติทันที
    if (isInitialSelect && levelMatches.length === 1 && !currentCode) {
      this.applySubjectSelection(levelMatches[0].code, levelMatches[0].name, levelMatches[0].learningArea);
    }
  }

  /**
   * ใส่ข้อมูลรหัสวิชา ชื่อวิชา และกลุ่มสาระการเรียนรู้ที่เลือก ลงในฟอร์มอัตโนมัติ
   */
  applySubjectSelection(code, name, learningArea) {
    const codeInput = document.getElementById('rec-subject-code');
    const nameInput = document.getElementById('rec-subject-name');
    const areaInput = document.getElementById('rec-learning-area');

    if (codeInput) codeInput.value = code;
    if (nameInput) nameInput.value = name;
    if (areaInput && learningArea) areaInput.value = learningArea;

    // อัปเดตสถานะ Active บน Chip
    document.querySelectorAll('.btn-subject-quick-chip').forEach(chip => {
      const c = chip.querySelector('.chip-code')?.innerText;
      const isMatch = c && c.trim().toLowerCase() === code.trim().toLowerCase();
      chip.classList.toggle('active', isMatch);
    });
  }

  /**
   * เมื่อผู้ใช้พิมพ์รหัสวิชาเอง ให้ค้นหาชื่อวิชาและกลุ่มสาระฯ เติมอัตโนมัติถ้ามีข้อมูล
   */
  onSubjectCodeManualInput(typedCode) {
    const code = (typedCode || '').trim().toLowerCase();
    if (!code) return;

    // ค้นหาวิชาจาก teachers หรือ records
    const teachers = db.get('teachers') || [];
    let matched = null;

    for (const t of teachers) {
      if (Array.isArray(t.subjects)) {
        const s = t.subjects.find(sub => sub.code && sub.code.toLowerCase() === code);
        if (s) {
          matched = { ...s, learningArea: t.learningArea || '' };
          break;
        }
      }
    }

    if (!matched) {
      const records = db.get('records') || [];
      const r = records.find(rec => rec.subjectCode && rec.subjectCode.toLowerCase() === code);
      if (r) {
        matched = { code: r.subjectCode, name: r.subjectName, learningArea: r.learningArea || '' };
      }
    }

    if (matched) {
      const nameInput = document.getElementById('rec-subject-name');
      const areaInput = document.getElementById('rec-learning-area');
      if (nameInput && !nameInput.value) nameInput.value = matched.name;
      if (areaInput && matched.learningArea) areaInput.value = matched.learningArea;
    }

    // Refresh active chips
    document.querySelectorAll('.btn-subject-quick-chip').forEach(chip => {
      const c = chip.querySelector('.chip-code')?.innerText;
      const isMatch = c && c.trim().toLowerCase() === code;
      chip.classList.toggle('active', isMatch);
    });
  }

  openEditRecordModal(id) {
    const record = db.getById('records', id);
    if (!record) return;

    this.openAddRecordModal();

    setTimeout(() => {
      const titleEl = document.getElementById('record-modal-title');
      if (titleEl) titleEl.innerText = "แก้ไขข้อมูลนักเรียนติด 0 / ร / มส";

      document.getElementById('rec-edit-id').value = record.id;
      document.getElementById('rec-student-id').value = record.studentId || '';
      document.getElementById('rec-student-name').value = record.studentName || '';
      
      const sSearch = document.getElementById('rec-student-search');
      if (sSearch) sSearch.value = `${record.studentId} - ${record.studentName} (${record.gradeLevel || ''})`;

      const tSearch = document.getElementById('rec-teacher-search');
      if (tSearch) tSearch.value = record.teacherName || '';

      document.getElementById('rec-grade-level').value = record.gradeLevel || 'ม.4';
      document.getElementById('rec-subject-code').value = record.subjectCode || '';
      document.getElementById('rec-subject-name').value = record.subjectName || '';
      document.getElementById('rec-condition-type').value = record.conditionType || '0';
      document.getElementById('rec-learning-area').value = record.learningArea || APP_CONFIG.LEARNING_AREAS[0];
      document.getElementById('rec-semester').value = record.semester || '1';
      document.getElementById('rec-academic-year').value = record.academicYear || '2569';
      document.getElementById('rec-teacher-name').value = record.teacherName || '';

      this.updateTeacherSubjectOptions();
    }, 50);
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
    const confirmed = await app.confirmAction({
      title: "ยืนยันการลบข้อมูลผลการเรียน",
      message: `คุณต้องการลบข้อมูลผลการเรียนของ "${studentName}" วิชา ${subjectCode} หรือไม่?`,
      type: "danger",
      confirmText: "ลบผลการเรียน",
      confirmIcon: "fas fa-trash-alt",
      btnClass: "btn-rose"
    });
    if (confirmed) {
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

  /**
   * เปิดหน้าต่างเลือกครูและรายวิชาสำหรับพิมพ์แบบอนุมัติผลการเรียนที่มีเงื่อนไข
   */
  openConditionalApprovalModal() {
    const modal = document.getElementById('conditional-approval-modal');
    if (!modal) return;

    const teachers = db.get('teachers') || [];
    const records = db.get('records') || [];
    const currentUser = authService.getCurrentUser();

    // รวบรวมรายชื่อครูทั้งหมด (จากฐานข้อมูลครู และจากประวัติ records)
    const teacherMap = new Map();
    teachers.forEach(t => {
      if (t && t.name) {
        teacherMap.set(t.name.trim(), { 
          id: t.id, 
          name: t.name.trim(), 
          area: t.learningArea || '', 
          subjects: Array.isArray(t.subjects) ? t.subjects : [] 
        });
      }
    });
    records.forEach(r => {
      if (r && r.teacherName && !teacherMap.has(r.teacherName.trim())) {
        teacherMap.set(r.teacherName.trim(), { 
          id: '', 
          name: r.teacherName.trim(), 
          area: r.learningArea || '', 
          subjects: [] 
        });
      }
    });

    const teacherList = Array.from(teacherMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'th'));
    this._cachedTeacherList = teacherList;

    // กำหนดครูเริ่มต้น (ถ้าผู้ใช้ที่ล็อกอินอยู่เป็นครู ให้เลือกชื่อตนเองอัตโนมัติ)
    let defaultTeacherName = '';
    if (currentUser && currentUser.role === APP_CONFIG.ROLES.TEACHER) {
      defaultTeacherName = currentUser.name;
    } else if (teacherList.length > 0) {
      defaultTeacherName = teacherList[0].name;
    }

    const defaultTeacherObj = teacherList.find(t => t.name === defaultTeacherName) || teacherList[0];
    const initialDisplayText = defaultTeacherObj ? `${defaultTeacherObj.name} ${defaultTeacherObj.area ? `(${defaultTeacherObj.area})` : ''}` : '';

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="recordsService.closeConditionalApprovalModal()"></div>
      <div class="modal-dialog animate-scale-in" style="max-width: 580px;">
        <div class="modal-header" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-bottom: 1.5px solid #bfdbfe;">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge bg-blue-soft text-primary">
              <i class="fas fa-file-signature"></i>
            </div>
            <div>
              <h3 style="color: #1e3a8a; font-size: 16px; margin: 0;">พิมพ์แบบอนุมัติผลการเรียนที่มีเงื่อนไข</h3>
              <p class="text-xs text-muted" style="margin: 2px 0 0 0;">แบบฟอร์มขออนุมัติผลการเรียน 0, ร, มส, มผ, ขร (ตามรายวิชา/ครูผู้สอน)</p>
            </div>
          </div>
          <button type="button" class="btn-close-modal" onclick="recordsService.closeConditionalApprovalModal()">&times;</button>
        </div>

        <div class="modal-body py-4 px-5">
          <!-- Step 1: Searchable Teacher Selector -->
          <div class="form-group mb-3">
            <label for="print-cond-teacher-search" class="font-bold text-gray-800 text-xs block mb-1">
              <i class="fas fa-chalkboard-teacher text-primary mr-1"></i> 1. เลือกครูผู้สอนประจำวิชา <span class="text-red-500">*</span>
              <span class="text-xs text-blue-600 font-normal ml-1">(พิมพ์ชื่อครูเพื่อค้นหาได้)</span>
            </label>
            <div class="cond-combobox-wrap" id="print-cond-combobox">
              <div class="cond-search-input-group">
                <i class="fas fa-search cond-search-icon"></i>
                <input 
                  type="text" 
                  id="print-cond-teacher-search" 
                  class="form-control" 
                  placeholder="🔍 พิมพ์ชื่อครู หรือกลุ่มสาระ เพื่อค้นหา..." 
                  value="${initialDisplayText.replace(/"/g, '&quot;')}" 
                  autocomplete="off"
                  oninput="recordsService.filterCondTeachers(this.value)"
                  onfocus="this.select(); recordsService.showCondTeacherDropdown()"
                  onclick="recordsService.showCondTeacherDropdown()"
                />
                <input type="hidden" id="print-cond-teacher" value="${defaultTeacherName.replace(/"/g, '&quot;')}" />
                <button type="button" class="cond-search-toggle-btn" onclick="recordsService.toggleCondTeacherDropdown()" title="เปิด/ปิด รายชื่อครู">
                  <i class="fas fa-chevron-down" id="print-cond-chevron"></i>
                </button>
              </div>
              <div id="print-cond-teacher-dropdown" class="cond-dropdown-list" style="display: none;">
                <!-- Dynamically populated -->
              </div>
            </div>
          </div>

          <!-- Step 2: Select Subject -->
          <div class="form-group mb-3">
            <label for="print-cond-subject" class="font-bold text-gray-800 text-xs block mb-1">
              <i class="fas fa-book-open text-primary mr-1"></i> 2. เลือกรายวิชาที่ครูท่านนี้สอน <span class="text-red-500">*</span>
            </label>
            <select id="print-cond-subject" class="form-control font-bold text-blue-900" onchange="recordsService.onCondSubjectSelect(this.value)">
              <!-- Dynamically populated -->
            </select>
          </div>

          <!-- Step 3: Semester & Year -->
          <div class="form-row mb-3">
            <div class="form-group col-md-6">
              <label for="print-cond-sem" class="font-bold text-gray-800 text-xs block mb-1">ภาคเรียน</label>
              <select id="print-cond-sem" class="form-control text-xs" onchange="recordsService.onCondTermChange()">
                <option value="1" ${String(APP_CONFIG.SEMESTER) === '1' ? 'selected' : ''}>ภาคเรียนที่ 1</option>
                <option value="2" ${String(APP_CONFIG.SEMESTER) === '2' ? 'selected' : ''}>ภาคเรียนที่ 2</option>
              </select>
            </div>
            <div class="form-group col-md-6">
              <label for="print-cond-year" class="font-bold text-gray-800 text-xs block mb-1">ปีการศึกษา</label>
              <select id="print-cond-year" class="form-control text-xs" onchange="recordsService.onCondTermChange()">
                ${(APP_CONFIG.AVAILABLE_YEARS || ["2569", "2568", "2567", "2570"]).map(y => `
                  <option value="${y}" ${String(APP_CONFIG.ACADEMIC_YEAR) === String(y) ? 'selected' : ''}>${y}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Live Student Summary Box -->
          <div id="print-cond-summary-box" class="print-cond-summary-box">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-xs text-gray-800 flex items-center gap-1">
                <i class="fas fa-users text-blue-600"></i> รายชื่อนักเรียนที่จะปรากฏในแบบอนุมัติ:
              </span>
              <span id="print-cond-badge-count" class="badge badge-primary">0 คน</span>
            </div>
            <div id="print-cond-students-list" class="print-cond-students-table-wrap">
              <!-- Rendered list of students -->
            </div>
          </div>

        </div>

        <div class="modal-footer" style="background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
          <button type="button" class="btn btn-outline" onclick="recordsService.closeConditionalApprovalModal()">
            ยกเลิก
          </button>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-outline-primary" onclick="recordsService.previewConditionalApproval()" style="border-color: #93c5fd; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
              <i class="fas fa-eye mr-1"></i> ดูตัวอย่างเอกสาร
            </button>
            <button type="button" class="btn btn-primary font-bold" onclick="recordsService.printConditionalApproval()">
              <i class="fas fa-print mr-1"></i> พิมพ์แบบอนุมัติ (Print)
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');

    // โหลดรายวิชาของครูเริ่มต้น
    this.onCondTeacherSelect(defaultTeacherName);
  }

  showCondTeacherDropdown() {
    const dropdown = document.getElementById('print-cond-teacher-dropdown');
    if (!dropdown) return;
    const searchInput = document.getElementById('print-cond-teacher-search');
    const query = searchInput ? searchInput.value : '';
    this.renderCondTeacherDropdown(query);
    dropdown.style.display = 'block';
    const chevron = document.getElementById('print-cond-chevron');
    if (chevron) chevron.className = 'fas fa-chevron-up';

    if (!this._condDocClickBound) {
      this._condDocClickBound = true;
      document.addEventListener('click', (e) => {
        const combobox = document.getElementById('print-cond-combobox');
        if (combobox && !combobox.contains(e.target)) {
          this.hideCondTeacherDropdown();
        }
      });
    }
  }

  hideCondTeacherDropdown() {
    const dropdown = document.getElementById('print-cond-teacher-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    const chevron = document.getElementById('print-cond-chevron');
    if (chevron) chevron.className = 'fas fa-chevron-down';
  }

  toggleCondTeacherDropdown() {
    const dropdown = document.getElementById('print-cond-teacher-dropdown');
    if (dropdown && dropdown.style.display === 'block') {
      this.hideCondTeacherDropdown();
    } else {
      this.showCondTeacherDropdown();
    }
  }

  filterCondTeachers(query) {
    const dropdown = document.getElementById('print-cond-teacher-dropdown');
    if (dropdown && dropdown.style.display !== 'block') {
      dropdown.style.display = 'block';
      const chevron = document.getElementById('print-cond-chevron');
      if (chevron) chevron.className = 'fas fa-chevron-up';
    }
    this.renderCondTeacherDropdown(query);
  }

  renderCondTeacherDropdown(query = '') {
    const dropdown = document.getElementById('print-cond-teacher-dropdown');
    if (!dropdown) return;

    const list = this._cachedTeacherList || [];
    const q = (query || '').trim().toLowerCase();
    const currentVal = (document.getElementById('print-cond-teacher')?.value || '').trim();

    const filtered = q 
      ? list.filter(t => (t.name && t.name.toLowerCase().includes(q)) || (t.area && t.area.toLowerCase().includes(q)))
      : list;

    if (filtered.length === 0) {
      dropdown.innerHTML = `<div class="cond-dropdown-empty"><i class="fas fa-search mr-1"></i> ไม่พบชื่อครูที่ตรงกับ "${query.replace(/</g, '&lt;')}"</div>`;
      return;
    }

    dropdown.innerHTML = filtered.map(t => {
      const isSelected = t.name === currentVal;
      const safeName = t.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
      const safeArea = (t.area || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
      return `
        <div class="cond-dropdown-item ${isSelected ? 'active' : ''}" onclick="recordsService.selectCondTeacher('${safeName}', '${safeArea}')">
          <span class="teacher-name"><i class="fas fa-user-tie text-blue-500 mr-1.5"></i>${t.name}</span>
          ${t.area ? `<span class="teacher-area">${t.area}</span>` : ''}
        </div>
      `;
    }).join('');
  }

  selectCondTeacher(teacherName, teacherArea) {
    const searchInput = document.getElementById('print-cond-teacher-search');
    const hiddenInput = document.getElementById('print-cond-teacher');

    if (hiddenInput) hiddenInput.value = teacherName;
    if (searchInput) searchInput.value = teacherArea ? `${teacherName} (${teacherArea})` : teacherName;

    this.hideCondTeacherDropdown();
    this.onCondTeacherSelect(teacherName);
  }

  closeConditionalApprovalModal() {
    const modal = document.getElementById('conditional-approval-modal');
    if (modal) modal.classList.remove('active');
  }

  onCondTeacherSelect(teacherName) {
    const subjectSelect = document.getElementById('print-cond-subject');
    if (!subjectSelect) return;

    const allRecords = db.get('records') || [];
    const allTeachers = db.get('teachers') || [];

    const teacher = allTeachers.find(t => t.name === teacherName);
    const subjectsMap = new Map();

    // 1. จากการตั้งค่าวิชาที่ครูสอน
    if (teacher && Array.isArray(teacher.subjects)) {
      teacher.subjects.forEach(s => {
        if (s && s.code) {
          const key = s.code.trim().toLowerCase();
          subjectsMap.set(key, {
            code: s.code.trim(),
            name: (s.name || '').trim(),
            level: (s.level || '').trim(),
            count: 0
          });
        }
      });
    }

    // 2. จากประวัติผลการเรียนในฐานข้อมูล
    allRecords.forEach(r => {
      if (r && r.teacherName && r.teacherName.trim() === teacherName.trim() && r.subjectCode) {
        const key = r.subjectCode.trim().toLowerCase();
        if (subjectsMap.has(key)) {
          subjectsMap.get(key).count++;
        } else {
          subjectsMap.set(key, {
            code: r.subjectCode.trim(),
            name: (r.subjectName || '').trim(),
            level: (r.gradeLevel || '').trim(),
            count: 1
          });
        }
      }
    });

    const subjectsList = Array.from(subjectsMap.values());

    if (subjectsList.length === 0) {
      subjectSelect.innerHTML = `<option value="">-- ไม่พบข้อมูลรายวิชาของครูท่านนี้ --</option>`;
      this.updateCondStudentPreview();
      return;
    }

    subjectSelect.innerHTML = subjectsList.map(s => {
      const label = `${s.code} - ${s.name} ${s.level ? `(${s.level})` : ''} [ติดเงื่อนไข ${s.count} รายการ]`;
      return `<option value="${s.code}" data-subject-code="${s.code}" data-subject-name="${s.name.replace(/"/g, '&quot;')}">${label}</option>`;
    }).join('');

    this.updateCondStudentPreview();
  }

  onCondSubjectSelect() {
    this.updateCondStudentPreview();
  }

  onCondTermChange() {
    this.updateCondStudentPreview();
  }

  updateCondStudentPreview() {
    const teacherName = (document.getElementById('print-cond-teacher')?.value || '').trim();
    const subjectCode = (document.getElementById('print-cond-subject')?.value || '').trim();
    const sem = document.getElementById('print-cond-sem')?.value || APP_CONFIG.SEMESTER || '1';
    const year = document.getElementById('print-cond-year')?.value || APP_CONFIG.ACADEMIC_YEAR || '2569';

    const countBadge = document.getElementById('print-cond-badge-count');
    const listWrap = document.getElementById('print-cond-students-list');

    if (!listWrap) return;

    if (!teacherName || !subjectCode) {
      if (countBadge) countBadge.innerText = '0 คน';
      listWrap.innerHTML = '<div class="text-center text-xs text-gray-400 py-3">กรุณาเลือกครูผู้สอนและรายวิชา</div>';
      return;
    }

    const allRecords = db.get('records') || [];
    const matched = allRecords.filter(r => 
      (r.teacherName && (r.teacherName.trim() === teacherName || r.teacherName.includes(teacherName) || teacherName.includes(r.teacherName.trim()))) &&
      (r.subjectCode && r.subjectCode.trim().toLowerCase() === subjectCode.toLowerCase()) &&
      (String(r.semester) === String(sem)) &&
      (String(r.academicYear) === String(year))
    );

    if (countBadge) countBadge.innerText = `${matched.length} คน`;

    if (matched.length === 0) {
      listWrap.innerHTML = `
        <div class="text-center text-xs text-amber-700 py-3 bg-amber-50 rounded border border-amber-200">
          <i class="fas fa-info-circle mr-1"></i> ยังไม่มีข้อมูลนักเรียนติด 0/ร/มส ในวิชานี้ สำหรับภาคเรียนที่ ${sem} ปีการศึกษา ${year}
          <div class="text-gray-500 mt-0.5 text-xs">(เมื่อกดพิมพ์ แบบฟอร์มจะมีหัวเอกสารวิชานี้ พร้อมตารางเปล่า 18 แถว)</div>
        </div>
      `;
      return;
    }

    listWrap.innerHTML = `
      <table class="table-cond-preview">
        <thead>
          <tr>
            <th style="width: 8%; text-align: center;">ที่</th>
            <th style="width: 14%; text-align: center;">ชั้น</th>
            <th style="width: 18%; text-align: center;">รหัส</th>
            <th style="width: 42%;">ชื่อ - นามสกุล</th>
            <th style="width: 18%; text-align: center;">ผลการเรียน</th>
          </tr>
        </thead>
        <tbody>
          ${matched.map((r, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td class="text-center">${r.room ? `${r.gradeLevel}/${r.room}` : r.gradeLevel}</td>
              <td class="text-center font-mono">${r.studentId}</td>
              <td>${r.studentName}</td>
              <td class="text-center font-bold text-red-600">${r.conditionType}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  previewConditionalApproval() {
    const teacherSelect = document.getElementById('print-cond-teacher');
    const subjectSelect = document.getElementById('print-cond-subject');
    const teacherName = (teacherSelect?.value || '').trim();
    const subjectCode = (subjectSelect?.value || '').trim();
    const selectedOption = subjectSelect?.options[subjectSelect.selectedIndex];
    const subjectName = (selectedOption?.getAttribute('data-subject-name') || '').trim();
    const sem = document.getElementById('print-cond-sem')?.value || '1';
    const year = document.getElementById('print-cond-year')?.value || '2569';

    if (!teacherName || !subjectCode) {
      alert("กรุณาเลือกครูผู้สอนและรายวิชาก่อน");
      return;
    }

    const url = `print-conditional-approval.html?teacher=${encodeURIComponent(teacherName)}&subjectCode=${encodeURIComponent(subjectCode)}&subjectName=${encodeURIComponent(subjectName)}&subject=${encodeURIComponent(subjectCode)}&semester=${encodeURIComponent(sem)}&year=${encodeURIComponent(year)}`;
    window.open(url, '_blank');
  }

  printConditionalApproval() {
    const teacherSelect = document.getElementById('print-cond-teacher');
    const subjectSelect = document.getElementById('print-cond-subject');
    const teacherName = (teacherSelect?.value || '').trim();
    const subjectCode = (subjectSelect?.value || '').trim();
    const selectedOption = subjectSelect?.options[subjectSelect.selectedIndex];
    const subjectName = (selectedOption?.getAttribute('data-subject-name') || '').trim();
    const sem = document.getElementById('print-cond-sem')?.value || '1';
    const year = document.getElementById('print-cond-year')?.value || '2569';

    if (!teacherName || !subjectCode) {
      alert("กรุณาเลือกครูผู้สอนและรายวิชาก่อน");
      return;
    }

    const url = `print-conditional-approval.html?teacher=${encodeURIComponent(teacherName)}&subjectCode=${encodeURIComponent(subjectCode)}&subjectName=${encodeURIComponent(subjectName)}&subject=${encodeURIComponent(subjectCode)}&semester=${encodeURIComponent(sem)}&year=${encodeURIComponent(year)}&autoprint=1`;
    window.open(url, '_blank');
  }
}

// Global Singleton Instance
const recordsService = new RecordsService();

