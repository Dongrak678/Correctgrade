/**
 * ระบบติดตามแก้ไขผลการเรียน (Academic Remediation System)
 * audit.js - ตารางเปรียบเทียบผลการเรียนก่อน-หลัง (Audit Log & Comparison Table)
 */

class AuditService {
  constructor() {
    this.searchQuery = '';
    this.currentPage = 1;
    this.pageSize = 10;
  }

  init() {
    this.renderAuditTable();

    db.subscribe('auditLogs', () => {
      this.renderAuditTable();
    });
  }

  getFilteredLogs() {
    let logs = db.get('auditLogs') || [];

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      logs = logs.filter(l => 
        (l.studentId && l.studentId.toLowerCase().includes(q)) ||
        (l.studentName && l.studentName.toLowerCase().includes(q)) ||
        (l.subjectCode && l.subjectCode.toLowerCase().includes(q)) ||
        (l.subjectName && l.subjectName.toLowerCase().includes(q)) ||
        (l.approvedBy && l.approvedBy.toLowerCase().includes(q))
      );
    }

    return logs;
  }

  renderAuditTable() {
    const tableBody = document.getElementById('audit-table-body');
    const countBadge = document.getElementById('audit-count-badge');
    if (!tableBody) return;

    const filtered = this.getFilteredLogs();
    if (countBadge) countBadge.innerText = `${filtered.length} รายการที่อนุมัติแล้ว`;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-8 text-gray-500">
            <div class="empty-state-card">
              <i class="fas fa-balance-scale text-4xl mb-2 text-gray-300"></i>
              <p class="font-semibold">ยังไม่มีประวัติการอนุมัติปรับผลการเรียน</p>
              <span class="text-xs text-gray-400">เมื่อครูผู้สอนอนุมัติผลการเรียนในขั้นตอนที่ 4 ข้อมูลจะถูกบันทึกที่นี่โดยอัตโนมัติ</span>
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
    const pageLogs = filtered.slice(startIndex, startIndex + this.pageSize);

    const isAdmin = authService.isAdmin();

    tableBody.innerHTML = pageLogs.map((l, idx) => `
      <tr class="hover-row">
        <td class="text-center text-xs text-gray-500 font-mono">${startIndex + idx + 1}</td>
        <td>
          <div class="student-cell">
            <span class="student-name font-medium text-gray-900">${l.studentName}</span>
            <span class="student-sub text-xs text-gray-500">รหัส ${l.studentId} • ชั้น ${l.gradeLevel || '-'}</span>
          </div>
        </td>
        <td>
          <div class="subject-cell">
            <span class="subject-code font-bold text-indigo-700">${l.subjectCode}</span>
            <span class="subject-name text-xs text-gray-600">${l.subjectName}</span>
          </div>
        </td>
        <td class="text-center">
          <div class="grade-compare-wrapper">
            <span class="grade-badge grade-${l.previousGrade}">${l.previousGrade}</span>
            <i class="fas fa-long-arrow-alt-right grade-arrow"></i>
            <span class="new-grade-pill font-bold">${l.newGrade}</span>
          </div>
        </td>
        <td>
          <div class="approver-cell">
            <span class="font-medium text-gray-800"><i class="fas fa-user-check text-emerald-600 mr-1"></i> ${l.approvedBy}</span>
          </div>
        </td>
        <td class="text-xs text-gray-600">
          <i class="far fa-clock text-gray-400"></i> ${l.approvedAt}
        </td>
        <td class="text-xs text-gray-700 max-w-xs truncate" title="${l.notes || '-'}">
          ${l.notes || '-'}
        </td>
        <td class="text-right">
          ${isAdmin ? `
            <button type="button" class="btn-icon text-gray-400 hover:text-red-600" title="ลบประวัติรายการนี้" onclick="auditService.deleteAuditPrompt('${l.id}')">
              <i class="fas fa-trash-alt"></i>
            </button>
          ` : '<span class="text-gray-300">-</span>'}
        </td>
      </tr>
    `).join('');

    this.renderPagination(filtered.length);
  }

  renderPagination(totalCount) {
    const paginationContainer = document.getElementById('audit-pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(totalCount / this.pageSize);
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let html = `
      <div class="pagination-wrapper">
        <button class="btn-page" ${this.currentPage === 1 ? 'disabled' : ''} onclick="auditService.changePage(${this.currentPage - 1})">
          <i class="fas fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        html += `<button class="btn-page ${i === this.currentPage ? 'active' : ''}" onclick="auditService.changePage(${i})">${i}</button>`;
      }
    }

    html += `
        <button class="btn-page" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="auditService.changePage(${this.currentPage + 1})">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    `;

    paginationContainer.innerHTML = html;
  }

  changePage(page) {
    this.currentPage = page;
    this.renderAuditTable();
  }

  setSearchQuery(q) {
    this.searchQuery = q;
    this.currentPage = 1;
    this.renderAuditTable();
  }

  async deleteAuditPrompt(id) {
    if (confirm("คุณต้องการลบประวัติการอนุมัตินี้ออกจาก Audit Log หรือไม่?")) {
      await db.deleteItem('auditLogs', id);
      app.showToast("ลบประวัติการอนุมัติเรียบร้อยแล้ว", "info");
    }
  }

  async clearAllAuditPrompt() {
    const confirmation = prompt('คำเตือน: การล้างข้อมูลจะลบประวัติการอนุมัติทั้งหมดในระบบ\nพิมพ์ "ยืนยันล้างประวัติ" เพื่อดำเนินการ:');
    if (confirmation === 'ยืนยันล้างประวัติ') {
      await db.clearCollection('auditLogs');
      app.showToast("ล้างประวัติ Audit Log ทั้งหมดเรียบร้อยแล้ว", "warning");
    } else if (confirmation !== null) {
      alert("ข้อความยืนยันไม่ถูกต้อง");
    }
  }
}

// Global Singleton Instance
const auditService = new AuditService();
