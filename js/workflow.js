/**
 * ระบบติดตามแก้ไขผลการเรียน (Academic Remediation System)
 * workflow.js - กระบวนการยื่นคำร้องและแก้ผลการเรียนครบวงจร (4-Step Remediation Workflow)
 */

class WorkflowService {
  constructor() {
    this.currentModalRecordId = null;
  }

  /**
   * ขั้นตอนที่ 1: นักเรียนยื่นคำร้องขอแก้ไขผลการเรียน
   */
  async submitStudentRequest(recordId, requestNote) {
    const record = db.getById('records', recordId);
    if (!record) throw new Error("ไม่พบข้อมูลผลการเรียน");

    const now = db.formatDateTime(new Date());
    const studentUser = authService.getCurrentUser();
    const actorName = studentUser ? studentUser.name : record.studentName;

    record.status = 'requested';
    record.requestDate = now;
    record.requestNote = requestNote || "ขออนุญาตยื่นคำร้องขอแก้ไขผลการเรียน";
    
    // บันทึก Timeline
    record.timeline = record.timeline || [];
    record.timeline.push({
      step: 1,
      title: "ยื่นคำร้องขอแก้ไข",
      date: now,
      actor: `${actorName} (นักเรียน)`,
      note: record.requestNote
    });

    await db.saveItem('records', record);

    // บันทึก Activity Log
    await db.addActivityLog(
      'request',
      'ยื่นคำร้องขอแก้ผลการเรียน',
      `${actorName} ยื่นคำร้องขอแก้ไขวิชา ${record.subjectCode} ${record.subjectName} (${record.conditionType})`,
      'badge-blue'
    );

    return record;
  }

  /**
   * ขั้นตอนที่ 2: ครูรับคำร้องและมอบหมายงาน (Task Assignment)
   */
  async assignTeacherTask(recordId, taskData) {
    const record = db.getById('records', recordId);
    if (!record) throw new Error("ไม่พบข้อมูลผลการเรียน");

    const now = db.formatDateTime(new Date());
    const teacherUser = authService.getCurrentUser();
    const actorName = teacherUser ? teacherUser.name : record.teacherName;

    record.status = 'assigned';
    record.taskTitle = taskData.taskTitle;
    record.taskDescription = taskData.taskDescription;
    record.taskDueDate = taskData.taskDueDate;
    record.taskAttachmentUrl = taskData.taskAttachmentUrl || null;
    record.taskAssignedDate = now;

    // บันทึก Timeline
    record.timeline = record.timeline || [];
    record.timeline.push({
      step: 2,
      title: "ครูมอบหมายงาน",
      date: now,
      actor: `${actorName} (ครูผู้สอน)`,
      note: `หัวข้องาน: ${taskData.taskTitle}`,
      attachmentUrl: taskData.taskAttachmentUrl
    });

    await db.saveItem('records', record);

    // บันทึก Activity Log
    await db.addActivityLog(
      'assignment',
      'มอบหมายงานแก้ไขผลการเรียน',
      `${actorName} มอบหมายงานวิชา ${record.subjectCode} ให้แก่ ${record.studentName}`,
      'badge-amber'
    );

    return record;
  }

  /**
   * ขั้นตอนที่ 3: นักเรียนส่งชิ้นงานและแนบรูปภาพ (Student Submission)
   */
  async submitStudentWork(recordId, submissionData) {
    const record = db.getById('records', recordId);
    if (!record) throw new Error("ไม่พบข้อมูลผลการเรียน");

    const now = db.formatDateTime(new Date());
    const studentUser = authService.getCurrentUser();
    const actorName = studentUser ? studentUser.name : record.studentName;

    record.status = 'submitted';
    record.submissionDate = now;
    record.submissionNote = submissionData.submissionNote || "ส่งงานเรียบร้อยแล้ว";
    record.submissionFileUrl = submissionData.submissionFileUrl || null;

    // บันทึก Timeline
    record.timeline = record.timeline || [];
    record.timeline.push({
      step: 3,
      title: "นักเรียนส่งงาน",
      date: now,
      actor: `${actorName} (นักเรียน)`,
      note: record.submissionNote,
      attachmentUrl: record.submissionFileUrl
    });

    await db.saveItem('records', record);

    // บันทึก Activity Log
    await db.addActivityLog(
      'submission',
      'นักเรียนส่งงานแล้ว',
      `${actorName} ส่งงานวิชา ${record.subjectCode} ${record.subjectName}`,
      'badge-purple'
    );

    return record;
  }

  /**
   * ขั้นตอนที่ 4: ครูตรวจและอนุมัติเกรด หรือส่งคืนให้แก้ไข
   */
  async reviewAndApproveGrade(recordId, decisionData) {
    const record = db.getById('records', recordId);
    if (!record) throw new Error("ไม่พบข้อมูลผลการเรียน");

    const now = db.formatDateTime(new Date());
    const teacherUser = authService.getCurrentUser();
    const actorName = teacherUser ? teacherUser.name : record.teacherName;

    if (decisionData.action === 'approve') {
      // 1. อนุมัติผ่าน
      record.status = 'approved';
      record.newGrade = decisionData.newGrade || "1.0";
      record.approvalDate = now;
      record.approvalNote = decisionData.approvalNote || "ผ่านการประเมินตามเกณฑ์";

      // Timeline
      record.timeline = record.timeline || [];
      record.timeline.push({
        step: 4,
        title: "อนุมัติผลการเรียน (ผ่าน)",
        date: now,
        actor: `${actorName} (ครูผู้สอน)`,
        note: `อนุมัติปรับผลการเรียนเป็น ${record.newGrade} (${record.approvalNote})`
      });

      await db.saveItem('records', record);

      // สร้างบันทึกประวัติใน Audit Log อัตโนมัติ (Audit Trail)
      const auditItem = {
        id: `aud_${Date.now()}`,
        recordId: record.id,
        studentId: record.studentId,
        studentName: record.studentName,
        gradeLevel: `${record.gradeLevel}/${record.room || '1'}`,
        subjectCode: record.subjectCode,
        subjectName: record.subjectName,
        previousGrade: record.conditionType,
        newGrade: record.newGrade,
        approvedBy: actorName,
        approvedAt: now,
        notes: record.approvalNote
      };
      await db.saveItem('auditLogs', auditItem);

      // Activity Log
      await db.addActivityLog(
        'approval',
        'อนุมัติปรับผลการเรียนสำเร็จ',
        `${actorName} อนุมัติผลการเรียนวิชา ${record.subjectCode} ให้แก่ ${record.studentName} (${record.conditionType} ➔ ${record.newGrade})`,
        'badge-emerald'
      );

    } else {
      // 2. ไม่อนุมัติ / ส่งกลับแก้ไข
      record.status = 'rejected';
      record.approvalDate = now;
      record.approvalNote = decisionData.approvalNote || "ชิ้นงานยังไม่สมบูรณ์ กรุณาแก้ไขและส่งใหม่";

      // Timeline
      record.timeline = record.timeline || [];
      record.timeline.push({
        step: 4,
        title: "ส่งคืนให้แก้ไขเพิ่มเติม",
        date: now,
        actor: `${actorName} (ครูผู้สอน)`,
        note: `ส่งคืน: ${record.approvalNote}`
      });

      await db.saveItem('records', record);

      // Activity Log
      await db.addActivityLog(
        'reject',
        'ส่งคืนงานให้นักเรียนแก้ไข',
        `${actorName} ส่งคืนงานวิชา ${record.subjectCode} ให้นักเรียน ${record.studentName} ปรับปรุง`,
        'badge-rose'
      );
    }

    return record;
  }

  /**
   * เปิด Modal สำหรับแต่ละขั้นตอน
   */
  openStepModal(recordId, stepType) {
    this.currentModalRecordId = recordId;
    const record = db.getById('records', recordId);
    if (!record) return;

    switch (stepType) {
      case 'request':
        this.renderRequestModal(record);
        break;
      case 'assign':
        if (record.status === 'pending_request' || !record.status) {
          alert("ไม่สามารถมอบหมายงานได้ เนื่องจากนักเรียนยังไม่ได้กดยื่นคำร้องขอแก้ไขผลการเรียน");
          return;
        }
        this.renderAssignModal(record);
        break;
      case 'submit':
        this.renderSubmitModal(record);
        break;
      case 'review':
        this.renderReviewModal(record);
        break;
      case 'timeline':
        this.renderTimelineModal(record);
        break;
    }
  }

  // --- Modal Renderers ---

  renderRequestModal(record) {
    const modal = document.getElementById('workflow-action-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="workflowService.closeModal()"></div>
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-blue">ขั้นตอนที่ 1</span>
            <h3>ยื่นคำร้องขอแก้ไขผลการเรียน</h3>
          </div>
          <button class="btn-close-modal" onclick="workflowService.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="record-summary-card">
            <div class="info-row">
              <span class="info-label">นักเรียน:</span>
              <span class="info-val font-semibold">${record.studentName} (${record.studentId})</span>
            </div>
            <div class="info-row">
              <span class="info-label">วิชา:</span>
              <span class="info-val">${record.subjectCode} ${record.subjectName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ผลการเรียนเดิม:</span>
              <span class="grade-badge grade-${record.conditionType}">${record.conditionType}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ครูผู้สอน:</span>
              <span class="info-val">${record.teacherName}</span>
            </div>
          </div>

          <form id="form-submit-request" onsubmit="workflowService.handleRequestSubmit(event)">
            <div class="form-group">
              <label for="req-note">เหตุผลหรือหมายเหตุประกอบการยื่นคำร้อง <span class="text-red-500">*</span></label>
              <textarea id="req-note" class="form-control" rows="3" placeholder="ระบุสาเหตุที่ติดเงื่อนไข หรือความประสงค์ในการขอแก้ไข..." required></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="workflowService.closeModal()">ยกเลิก</button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-paper-plane mr-1"></i> ยืนยันยื่นคำร้อง
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    modal.classList.add('active');
  }

  async handleRequestSubmit(e) {
    e.preventDefault();
    const note = document.getElementById('req-note').value;
    try {
      await this.submitStudentRequest(this.currentModalRecordId, note);
      this.closeModal();
      app.showToast("ยื่นคำร้องสำเร็จแล้ว รอครูมอบหมายงาน", "success");
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  }

  renderAssignModal(record) {
    const modal = document.getElementById('workflow-action-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="workflowService.closeModal()"></div>
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-amber">ขั้นตอนที่ 2</span>
            <h3>มอบหมายภาระงาน / กำหนดงานแก้ไข</h3>
          </div>
          <button class="btn-close-modal" onclick="workflowService.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="record-summary-card">
            <div class="info-row">
              <span class="info-label">นักเรียน:</span>
              <span class="info-val font-semibold">${record.studentName} (${record.studentId})</span>
            </div>
            <div class="info-row">
              <span class="info-label">วิชา:</span>
              <span class="info-val">${record.subjectCode} ${record.subjectName} (ติด ${record.conditionType})</span>
            </div>
            ${record.requestNote ? `
            <div class="info-row">
              <span class="info-label">คำร้องนักเรียน:</span>
              <span class="info-val text-blue-600">"${record.requestNote}"</span>
            </div>` : ''}
          </div>

          <form id="form-assign-task" onsubmit="workflowService.handleAssignSubmit(event)">
            <div class="form-group">
              <label for="assign-title">หัวข้อภาระงาน / งานที่มอบหมาย <span class="text-red-500">*</span></label>
              <input type="text" id="assign-title" class="form-control" placeholder="เช่น ทำแบบฝึกหัดทบทวนหน่วยที่ 1-3, รายงานค้นคว้า" required value="${record.taskTitle || ''}">
            </div>

            <div class="form-group">
              <label for="assign-desc">รายละเอียดภาระงานและเกณฑ์การประเมิน <span class="text-red-500">*</span></label>
              <textarea id="assign-desc" class="form-control" rows="4" placeholder="ระบุสิ่งที่นักเรียนต้องทำอย่างละเอียด จำนวนหน้า หรือหัวข้อที่ต้องนำเสนอ..." required>${record.taskDescription || ''}</textarea>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="assign-due">กำหนดส่งงาน (Due Date)</label>
                <input type="date" id="assign-due" class="form-control" value="${record.taskDueDate || ''}">
              </div>
              <div class="form-group col-md-6">
                <label>แนบรูปภาพใบงาน / คำสั่งงาน (ผ่าน Cloudinary)</label>
                <div class="custom-file-upload">
                  <input type="file" id="assign-file" accept="image/*" onchange="workflowService.handleFilePreview(this, 'assign-file-preview')">
                  <div class="upload-btn-ui">
                    <i class="fas fa-cloud-upload-alt"></i> เลือกรูปภาพใบงาน
                  </div>
                </div>
              </div>
            </div>

            <div id="assign-file-preview" class="file-preview-box ${record.taskAttachmentUrl ? '' : 'hidden'}">
              <img id="assign-preview-img" src="${record.taskAttachmentUrl || ''}" alt="Attachment">
              <div class="preview-actions">
                <button type="button" class="btn-sm btn-outline" onclick="cloudinaryService.previewImage(document.getElementById('assign-preview-img').src, 'ใบงานที่มอบหมาย')">
                  <i class="fas fa-search-plus"></i> ดูรูปใหญ่
                </button>
                <button type="button" class="btn-sm btn-danger" onclick="workflowService.removePreview('assign-file-preview', 'assign-file')">
                  <i class="fas fa-trash"></i> ลบรูป
                </button>
              </div>
            </div>

            <div id="assign-upload-progress" class="upload-progress-bar hidden">
              <div class="progress-fill" style="width: 0%"></div>
              <span class="progress-text">กำลังอัปโหลดรูปภาพขึ้น CDN... 0%</span>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="workflowService.closeModal()">ยกเลิก</button>
              <button type="submit" id="btn-save-assign" class="btn btn-amber">
                <i class="fas fa-check-circle mr-1"></i> บันทึกและส่งมอบหมายงาน
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    modal.classList.add('active');
  }

  async handleAssignSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-save-assign');
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> กำลังบันทึก...`;

    try {
      const title = document.getElementById('assign-title').value;
      const desc = document.getElementById('assign-desc').value;
      const due = document.getElementById('assign-due').value;
      const fileInput = document.getElementById('assign-file');
      
      let attachmentUrl = document.getElementById('assign-preview-img') ? document.getElementById('assign-preview-img').src : null;

      // ถ้ามีการเลือกไฟล์ใหม่ ให้อัปโหลดขึ้น Cloudinary
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const progressBox = document.getElementById('assign-upload-progress');
        if (progressBox) progressBox.classList.remove('hidden');

        attachmentUrl = await cloudinaryService.uploadImage(fileInput.files[0], (percent) => {
          if (progressBox) {
            progressBox.querySelector('.progress-fill').style.width = `${percent}%`;
            progressBox.querySelector('.progress-text').innerText = `กำลังอัปโหลดขึ้น CDN... ${percent}%`;
          }
        });
      }

      await this.assignTeacherTask(this.currentModalRecordId, {
        taskTitle: title,
        taskDescription: desc,
        taskDueDate: due,
        taskAttachmentUrl: attachmentUrl
      });

      this.closeModal();
      app.showToast("มอบหมายงานให้นักเรียนเรียบร้อยแล้ว", "success");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการมอบหมายงาน: " + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-check-circle mr-1"></i> บันทึกและส่งมอบหมายงาน`;
    }
  }

  renderSubmitModal(record) {
    const modal = document.getElementById('workflow-action-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="workflowService.closeModal()"></div>
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-purple">ขั้นตอนที่ 3</span>
            <h3>ส่งชิ้นงานและหลักฐานการแก้ไข</h3>
          </div>
          <button class="btn-close-modal" onclick="workflowService.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="task-assigned-display">
            <h4><i class="fas fa-clipboard-list text-amber-500 mr-2"></i>ภาระงานที่ครูมอบหมาย:</h4>
            <div class="task-title-highlight">${record.taskTitle || 'งานที่มอบหมาย'}</div>
            <p class="task-desc-highlight">${record.taskDescription || '-'}</p>
            ${record.taskDueDate ? `<div class="task-due-tag"><i class="far fa-calendar-alt"></i> กำหนดส่ง: ${record.taskDueDate}</div>` : ''}
            
            ${record.taskAttachmentUrl ? `
            <div class="task-attachment-preview">
              <span class="text-xs text-gray-500 font-semibold mb-1 block">ใบงานแนบจากครู:</span>
              <img src="${record.taskAttachmentUrl}" alt="Task Attachment" onclick="cloudinaryService.previewImage('${record.taskAttachmentUrl}', 'ใบงานจากครู')">
              <button type="button" class="btn-link" onclick="cloudinaryService.previewImage('${record.taskAttachmentUrl}', 'ใบงานจากครู')">
                <i class="fas fa-search-plus"></i> คลิกเพื่อดูรูปใบงานขนาดใหญ่
              </button>
            </div>` : ''}
          </div>

          <form id="form-submit-work" onsubmit="workflowService.handleSubmitWork(event)">
            <div class="form-group">
              <label for="sub-note">คำอธิบายงาน / ข้อความถึงครูผู้สอน <span class="text-red-500">*</span></label>
              <textarea id="sub-note" class="form-control" rows="3" placeholder="อธิบายขั้นตอนการทำ หรือผลงานที่ส่งมอบ..." required>${record.submissionNote || ''}</textarea>
            </div>

            <div class="form-group">
              <label>ถ่ายรูป / แนบรูปภาพชิ้นงานที่ทำเสร็จแล้ว <span class="text-red-500">*</span></label>
              <div class="custom-file-upload">
                <input type="file" id="sub-file" accept="image/*" onchange="workflowService.handleFilePreview(this, 'sub-file-preview')" ${record.submissionFileUrl ? '' : 'required'}>
                <div class="upload-btn-ui">
                  <i class="fas fa-camera"></i> ถ่ายรูปหรือเลือกรูปภาพผลงาน
                </div>
              </div>
            </div>

            <div id="sub-file-preview" class="file-preview-box ${record.submissionFileUrl ? '' : 'hidden'}">
              <img id="sub-preview-img" src="${record.submissionFileUrl || ''}" alt="Work Submission">
              <div class="preview-actions">
                <button type="button" class="btn-sm btn-outline" onclick="cloudinaryService.previewImage(document.getElementById('sub-preview-img').src, 'รูปชิ้นงานที่ส่ง')">
                  <i class="fas fa-search-plus"></i> ดูรูปใหญ่
                </button>
                <button type="button" class="btn-sm btn-danger" onclick="workflowService.removePreview('sub-file-preview', 'sub-file')">
                  <i class="fas fa-trash"></i> เปลี่ยนรูป
                </button>
              </div>
            </div>

            <div id="sub-upload-progress" class="upload-progress-bar hidden">
              <div class="progress-fill" style="width: 0%"></div>
              <span class="progress-text">กำลังอัปโหลดชิ้นงานขึ้น CDN... 0%</span>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="workflowService.closeModal()">ยกเลิก</button>
              <button type="submit" id="btn-save-sub" class="btn btn-purple">
                <i class="fas fa-upload mr-1"></i> ยืนยันส่งผลงานให้ครูตรวจ
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    modal.classList.add('active');
  }

  async handleSubmitWork(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-save-sub');
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> กำลังอัปโหลดและส่งงาน...`;

    try {
      const note = document.getElementById('sub-note').value;
      const fileInput = document.getElementById('sub-file');
      let fileUrl = document.getElementById('sub-preview-img') ? document.getElementById('sub-preview-img').src : null;

      if (fileInput && fileInput.files && fileInput.files[0]) {
        const progressBox = document.getElementById('sub-upload-progress');
        if (progressBox) progressBox.classList.remove('hidden');

        fileUrl = await cloudinaryService.uploadImage(fileInput.files[0], (percent) => {
          if (progressBox) {
            progressBox.querySelector('.progress-fill').style.width = `${percent}%`;
            progressBox.querySelector('.progress-text').innerText = `กำลังอัปโหลดชิ้นงาน... ${percent}%`;
          }
        });
      }

      if (!fileUrl) {
        throw new Error("กรุณาแนบรูปภาพผลงานก่อนส่ง");
      }

      await this.submitStudentWork(this.currentModalRecordId, {
        submissionNote: note,
        submissionFileUrl: fileUrl
      });

      this.closeModal();
      app.showToast("ส่งชิ้นงานสำเร็จแล้ว รอครูผู้สอนตรวจประเมิน", "success");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการส่งงาน: " + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-upload mr-1"></i> ยืนยันส่งผลงานให้ครูตรวจ`;
    }
  }

  renderReviewModal(record) {
    const modal = document.getElementById('workflow-action-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="workflowService.closeModal()"></div>
      <div class="modal-dialog modal-xl">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-emerald">ขั้นตอนที่ 4</span>
            <h3>ตรวจชิ้นงานและอนุมัติปรับผลการเรียน</h3>
          </div>
          <button class="btn-close-modal" onclick="workflowService.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="review-grid">
            <div class="review-left">
              <div class="record-summary-card mb-4">
                <div class="info-row">
                  <span class="info-label">นักเรียน:</span>
                  <span class="info-val font-semibold">${record.studentName} (${record.studentId}) ชั้น ${record.gradeLevel}/${record.room || '1'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">วิชา:</span>
                  <span class="info-val">${record.subjectCode} ${record.subjectName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">ผลการเรียนเดิม:</span>
                  <span class="grade-badge grade-${record.conditionType}">${record.conditionType}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">ภาระงานที่สั่ง:</span>
                  <span class="info-val">${record.taskTitle || '-'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">คำอธิบายของนักเรียน:</span>
                  <span class="info-val text-purple-700 italic">"${record.submissionNote || 'ไม่ได้ระบุ'}"</span>
                </div>
                <div class="info-row">
                  <span class="info-label">วันที่ส่ง:</span>
                  <span class="info-val">${record.submissionDate || '-'}</span>
                </div>
              </div>

              <div class="submission-work-preview-container">
                <div class="preview-header-bar">
                  <span class="font-bold"><i class="fas fa-image text-purple-600"></i> ชิ้นงานและรูปถ่ายหลักฐาน:</span>
                  ${record.submissionFileUrl ? `
                  <button type="button" class="btn-sm btn-primary" onclick="cloudinaryService.previewImage('${record.submissionFileUrl}', 'ชิ้นงานของ ${record.studentName}')">
                    <i class="fas fa-search-plus"></i> ดูรูปเต็มจอ (Zoom)
                  </button>` : ''}
                </div>
                
                ${record.submissionFileUrl ? `
                <div class="submission-img-box" onclick="cloudinaryService.previewImage('${record.submissionFileUrl}', 'ชิ้นงานของ ${record.studentName}')">
                  <img src="${record.submissionFileUrl}" alt="Student Submission Preview">
                  <div class="img-overlay-tip"><i class="fas fa-expand"></i> คลิกเพื่อขยายดูรูปใหญ่</div>
                </div>` : `
                <div class="empty-state-box">
                  <i class="far fa-file-image"></i>
                  <p>ไม่พบรูปภาพชิ้นงานที่แนบมา</p>
                </div>`}
              </div>
            </div>

            <div class="review-right">
              <form id="form-review-decision" onsubmit="workflowService.handleReviewSubmit(event)">
                <div class="decision-box">
                  <h4 class="mb-3 font-bold text-gray-800"><i class="fas fa-gavel text-indigo-600 mr-1"></i> ผลการประเมิน</h4>
                  
                  <div class="decision-radios">
                    <label class="decision-label approve-label">
                      <input type="radio" name="decision_action" value="approve" checked onchange="workflowService.toggleDecisionFields('approve')">
                      <div class="decision-card-inner">
                        <i class="fas fa-check-circle text-emerald-500"></i>
                        <div>
                          <strong>อนุมัติผ่าน</strong>
                          <span>กำหนดเกรดใหม่และผ่านการแก้ไข</span>
                        </div>
                      </div>
                    </label>

                    <label class="decision-label reject-label">
                      <input type="radio" name="decision_action" value="reject" onchange="workflowService.toggleDecisionFields('reject')">
                      <div class="decision-card-inner">
                        <i class="fas fa-times-circle text-rose-500"></i>
                        <div>
                          <strong>ไม่อนุมัติ / ส่งกลับแก้ไข</strong>
                          <span>ให้นักเรียนแก้ไขชิ้นงานเพิ่มเติม</span>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div id="new-grade-group" class="form-group mt-3">
                    <label for="review-new-grade">กำหนดเกรดใหม่ (New Grade) <span class="text-red-500">*</span></label>
                    <select id="review-new-grade" class="form-control font-semibold text-emerald-700">
                      <option value="1.0" selected>เกรด 1.0 (มาตรฐานการแก้ 0)</option>
                      <option value="1.5">เกรด 1.5</option>
                      <option value="2.0">เกรด 2.0</option>
                      <option value="2.5">เกรด 2.5</option>
                      <option value="3.0">เกรด 3.0</option>
                      <option value="3.5">เกรด 3.5</option>
                      <option value="4.0">เกรด 4.0</option>
                      <option value="ผ่าน">ผ่าน (สำหรับกิจกรรม/วิชาที่ไม่มีเกรดเฉลี่ย)</option>
                    </select>
                  </div>

                  <div class="form-group mt-3">
                    <label for="review-note">ความเห็นครูผู้สอน / หมายเหตุการประเมิน <span class="text-red-500">*</span></label>
                    <textarea id="review-note" class="form-control" rows="4" placeholder="ระบุเหตุผลการอนุมัติ หรือคำแนะนำในการปรับปรุงงาน..." required>ผ่านเกณฑ์การประเมินการแก้ผลการเรียน ผลงานมีความสมบูรณ์</textarea>
                  </div>

                  <div class="modal-footer mt-4">
                    <button type="button" class="btn btn-outline" onclick="workflowService.closeModal()">ยกเลิก</button>
                    <button type="submit" id="btn-save-review" class="btn btn-emerald">
                      <i class="fas fa-save mr-1"></i> บันทึกผลการประเมิน
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
    modal.classList.add('active');
  }

  toggleDecisionFields(action) {
    const gradeGroup = document.getElementById('new-grade-group');
    const noteInput = document.getElementById('review-note');
    const submitBtn = document.getElementById('btn-save-review');

    if (action === 'approve') {
      if (gradeGroup) gradeGroup.style.display = 'block';
      if (noteInput) noteInput.value = "ผ่านเกณฑ์การประเมินการแก้ผลการเรียน ผลงานมีความสมบูรณ์";
      if (submitBtn) {
        submitBtn.className = "btn btn-emerald";
        submitBtn.innerHTML = `<i class="fas fa-check-circle mr-1"></i> ยืนยันอนุมัติผลการเรียน`;
      }
    } else {
      if (gradeGroup) gradeGroup.style.display = 'none';
      if (noteInput) noteInput.value = "ชิ้นงานยังไม่ครบถ้วนตามเกณฑ์ กรุณาปรับปรุงและแนบส่งใหม่อีกครั้ง";
      if (submitBtn) {
        submitBtn.className = "btn btn-rose";
        submitBtn.innerHTML = `<i class="fas fa-undo-alt mr-1"></i> ยืนยันส่งคืนให้แก้ไข`;
      }
    }
  }

  async handleReviewSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-save-review');
    btn.disabled = true;

    try {
      const action = document.querySelector('input[name="decision_action"]:checked').value;
      const newGrade = document.getElementById('review-new-grade').value;
      const note = document.getElementById('review-note').value;

      await this.reviewAndApproveGrade(this.currentModalRecordId, {
        action,
        newGrade,
        approvalNote: note
      });

      this.closeModal();
      if (action === 'approve') {
        app.showToast(`อนุมัติผลการเรียนเรียบร้อยแล้ว (เกรดใหม่: ${newGrade})`, "success");
      } else {
        app.showToast("ส่งคืนงานให้นักเรียนแก้ไขเรียบร้อยแล้ว", "info");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      btn.disabled = false;
    }
  }

  renderTimelineModal(record) {
    const modal = document.getElementById('workflow-action-modal');
    if (!modal) return;

    const timeline = record.timeline || [];

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="workflowService.closeModal()"></div>
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-badge badge-blue"><i class="fas fa-history"></i> ประวัติการดำเนินการ</span>
            <h3>ลำดับขั้นตอนการแก้ไขผลการเรียน (Timeline)</h3>
          </div>
          <button class="btn-close-modal" onclick="workflowService.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="record-summary-card mb-4">
            <div class="info-row">
              <span class="info-label">นักเรียน:</span>
              <span class="info-val font-semibold">${record.studentName} (${record.studentId}) ชั้น ${record.gradeLevel}/${record.room || '1'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">วิชา:</span>
              <span class="info-val">${record.subjectCode} ${record.subjectName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">สถานะปัจจุบัน:</span>
              <span class="status-pill ${app.getStatusBadgeClass(record.status)}">${app.getStatusTitle(record.status)}</span>
            </div>
          </div>

          <div class="timeline-stepper">
            ${timeline.length === 0 ? `
              <div class="text-center py-6 text-gray-500">
                <i class="far fa-clock text-4xl mb-2 text-gray-300"></i>
                <p>ยังไม่มีบันทึกประวัติการแก้ไขในรายการนี้</p>
              </div>
            ` : timeline.map((t, idx) => `
              <div class="timeline-node step-${t.step || 1}">
                <div class="timeline-marker">${t.step || (idx + 1)}</div>
                <div class="timeline-content-card">
                  <div class="node-header">
                    <h4 class="node-title">${t.title}</h4>
                    <span class="node-time"><i class="far fa-clock"></i> ${t.date}</span>
                  </div>
                  <div class="node-actor"><i class="fas fa-user-circle"></i> ${t.actor || '-'}</div>
                  <p class="node-note">${t.note || '-'}</p>
                  ${t.attachmentUrl ? `
                  <div class="node-attachment">
                    <img src="${t.attachmentUrl}" alt="Evidence" onclick="cloudinaryService.previewImage('${t.attachmentUrl}', '${t.title}')">
                    <button type="button" class="btn-sm btn-outline" onclick="cloudinaryService.previewImage('${t.attachmentUrl}', '${t.title}')">
                      <i class="fas fa-search-plus"></i> ดูรูปใหญ่
                    </button>
                  </div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="workflowService.closeModal()">ปิดหน้าต่าง</button>
          </div>
        </div>
      </div>
    `;
    modal.classList.add('active');
  }

  handleFilePreview(input, containerId) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const container = document.getElementById(containerId);
        if (container) {
          const img = container.querySelector('img');
          if (img) img.src = e.target.result;
          container.classList.remove('hidden');
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removePreview(containerId, inputId) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    if (container) container.classList.add('hidden');
    if (input) input.value = '';
  }

  closeModal() {
    const modal = document.getElementById('workflow-action-modal');
    if (modal) modal.classList.remove('active');
    this.currentModalRecordId = null;
  }
}

// Global Singleton Instance
const workflowService = new WorkflowService();
