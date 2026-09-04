/**
 * ระบบติดตามแก้ไขผลการเรียน (Academic Remediation System)
 * export-engine.js - เครื่องมือส่งออกข้อมูล Excel / CSV และพิมพ์รายงานทางการ
 */

class ExportEngine {
  constructor() {}

  /**
   * ส่งออกข้อมูลผลการเรียนเป็นไฟล์ CSV (UTF-8 BOM สำหรับ Excel)
   */
  exportRecordsCSV(filteredOnly = false) {
    const records = filteredOnly ? recordsService.getFilteredRecords() : db.get('records');
    if (!records || records.length === 0) {
      alert("ไม่มีข้อมูลที่จะส่งออก");
      return;
    }

    const headers = [
      "ลำดับ",
      "รหัสนักเรียน",
      "ชื่อ-นามสกุล",
      "ระดับชั้น",
      "ห้อง",
      "รหัสวิชา",
      "ชื่อวิชา",
      "กลุ่มสาระการเรียนรู้",
      "ผลการเรียนเดิม",
      "สถานะการแก้ไข",
      "เกรดใหม่",
      "ครูผู้สอน",
      "วันที่ยื่นคำร้อง",
      "วันที่ส่งงาน",
      "วันที่อนุมัติ",
      "หมายเหตุ"
    ];

    const rows = records.map((r, idx) => [
      idx + 1,
      `="${r.studentId}"`,
      `"${r.studentName}"`,
      `"${r.gradeLevel}"`,
      `"${r.room || '1'}"`,
      `"${r.subjectCode}"`,
      `"${r.subjectName}"`,
      `"${r.learningArea || '-'}"`,
      `"${r.conditionType}"`,
      `"${app.getStatusTitle(r.status)}"`,
      `"${r.newGrade || '-'}"`,
      `"${r.teacherName || '-'}"`,
      `"${r.requestDate || '-'}"`,
      `"${r.submissionDate || '-'}"`,
      `"${r.approvalDate || '-'}"`,
      `"${(r.approvalNote || r.requestNote || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\r\n');

    this.downloadFile(csvContent, `รายงานผลการแก้ไขผลการเรียน_${APP_CONFIG.ACADEMIC_YEAR}_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
    app.showToast("ส่งออกไฟล์ CSV เรียบร้อยแล้ว", "success");
  }

  /**
   * ส่งออกข้อมูลเป็นไฟล์ Excel (.xlsx) โดยใช้ SheetJS (XLSX)
   */
  exportRecordsExcel(filteredOnly = false) {
    const records = filteredOnly ? recordsService.getFilteredRecords() : db.get('records');
    if (!records || records.length === 0) {
      alert("ไม่มีข้อมูลที่จะส่งออก");
      return;
    }

    if (typeof XLSX === 'undefined') {
      // Fallback เป็น CSV ถ้าโหลด XLSX library ไม่ได้
      this.exportRecordsCSV(filteredOnly);
      return;
    }

    const data = records.map((r, idx) => ({
      "ลำดับ": idx + 1,
      "รหัสนักเรียน": r.studentId,
      "ชื่อ-นามสกุล": r.studentName,
      "ระดับชั้น": r.gradeLevel,
      "ห้อง": r.room || "1",
      "รหัสวิชา": r.subjectCode,
      "ชื่อรายวิชา": r.subjectName,
      "กลุ่มสาระฯ": r.learningArea || "-",
      "ผลการเรียนเดิม": r.conditionType,
      "สถานะ": app.getStatusTitle(r.status),
      "เกรดใหม่": r.newGrade || "-",
      "ครูผู้สอน": r.teacherName || "-",
      "วันที่ยื่นคำร้อง": r.requestDate || "-",
      "วันที่ส่งงาน": r.submissionDate || "-",
      "วันที่อนุมัติ": r.approvalDate || "-",
      "หมายเหตุ": r.approvalNote || r.requestNote || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ผลการแก้ไขผลการเรียน");

    // กำหนดความกว้างคอลัมน์อัตโนมัติ
    worksheet['!cols'] = [
      { wch: 6 },  // ลำดับ
      { wch: 12 }, // รหัสนักเรียน
      { wch: 24 }, // ชื่อ-นามสกุล
      { wch: 10 }, // ระดับชั้น
      { wch: 6 },  // ห้อง
      { wch: 12 }, // รหัสวิชา
      { wch: 26 }, // ชื่อวิชา
      { wch: 26 }, // กลุ่มสาระฯ
      { wch: 14 }, // ผลการเรียนเดิม
      { wch: 22 }, // สถานะ
      { wch: 10 }, // เกรดใหม่
      { wch: 22 }, // ครูผู้สอน
      { wch: 18 }, // วันที่ยื่น
      { wch: 18 }, // วันที่ส่ง
      { wch: 18 }, // วันที่อนุมัติ
      { wch: 30 }  // หมายเหตุ
    ];

    XLSX.writeFile(workbook, `รายงานสรุปการแก้ไขผลการเรียน_${APP_CONFIG.ACADEMIC_YEAR}_${Date.now()}.xlsx`);
    app.showToast("ส่งออกไฟล์ Excel (.xlsx) เรียบร้อยแล้ว", "success");
  }

  /**
   * ดาวน์โหลดไฟล์ตัวอย่าง CSV Template
   */
  downloadTemplate(type) {
    let content = "\uFEFF";
    let filename = "";

    switch (type) {
      case 'records':
        content += "student_id,student_name,grade_level,room,subject_code,subject_name,condition_type,teacher_name,learning_area,term,year\r\n";
        content += '50101,นายสมชาย รักดี,ม.4,1,ค31101,คณิตศาสตร์พื้นฐาน 1,0,ครูสมชาย ใจดี,กลุ่มสาระการเรียนรู้คณิตศาสตร์,1,2569\r\n';
        content += '50102,นางสาวดวงใจ มีสุข,ม.4,1,ว31101,วิทยาศาสตร์กายภาพ 1,ร,ครูอนุชา วิทยาการ,กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี,1,2569\r\n';
        content += '60205,นายธนพล มุ่งมั่น,ม.5,2,ท31101,ภาษาไทย 1,มส,ครูวรรณา รักเรียน,กลุ่มสาระการเรียนรู้ภาษาไทย,1,2569\r\n';
        content += '70112,นายปิยพัทธ์ สรรพวิช,ปวช.1,1,อ20201,ภาษาอังกฤษเพื่อการสื่อสาร,มผ,ครูสมชาย ใจดี,กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ,1,2569\r\n';
        filename = "template_remediation_records.csv";
        break;

      case 'teachers':
        content += "teacher_id,name,learning_area,phone,email,subjects\r\n";
        content += 'T001,ครูสมชาย ใจดี,กลุ่มสาระการเรียนรู้คณิตศาสตร์,089-111-2222,somchai@dongrak.ac.th,ค31101:คณิตศาสตร์ 1;ค32101:คณิตศาสตร์ 3\r\n';
        content += 'T002,ครูวรรณา รักเรียน,กลุ่มสาระการเรียนรู้ภาษาไทย,089-333-4444,wanna@dongrak.ac.th,ท31101:ภาษาไทย 1;ท21101:ภาษาไทยพื้นฐาน\r\n';
        filename = "template_teachers.csv";
        break;

      case 'students':
        content += "เลขที่,รหัสประจำตัว,ชื่อ-สกุล,ระดับชั้น,ครูที่ปรึกษา\r\n";
        content += '1,50101,นายกิตติศักดิ์ พากเพียร,ม.4/1,ครูสมชาย ใจดี\r\n';
        content += '2,50102,นางสาวศิริพร สุขเกษม,ม.4/1,ครูสมชาย ใจดี\r\n';
        content += '3,60205,นายธนพล มุ่งมั่น,ม.5/2,ครูวรรณา รักเรียน\r\n';
        filename = "template_students.csv";
        break;

      case 'users':
        content += "username,password,name,role,email,phone,student_id,teacher_id\r\n";
        content += 'std001,123456,นายกิตติศักดิ์ พากเพียร,student,std001@dongrak.ac.th,090-123-4567,50101,\r\n';
        content += 'teacher01,123456,ครูสมชาย ใจดี,teacher,somchai@dongrak.ac.th,089-111-2222,,T001\r\n';
        content += 'admin2,admin1234,นายวิชาญ บริหาร,admin,admin2@dongrak.ac.th,081-999-8888,,\r\n';
        filename = "template_users.csv";
        break;
    }

    this.downloadFile(content, filename, 'text/csv;charset=utf-8;');
  }

  downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * เปิดหน้าพิมพ์รายงานทางการ (Print Report)
   */
  openPrintReport(filterLevel = 'all', filterStatus = 'all') {
    const url = `print-report.html?level=${encodeURIComponent(filterLevel)}&status=${encodeURIComponent(filterStatus)}`;
    window.open(url, '_blank', 'width=1000,height=800');
  }

  /**
   * เปิดหน้าพิมพ์แบบอนุมัติผลการเรียนที่มีเงื่อนไข (ตามรายวิชา/ครูผู้สอน)
   */
  openConditionalApprovalModal() {
    if (typeof recordsService !== 'undefined' && recordsService.openConditionalApprovalModal) {
      recordsService.openConditionalApprovalModal();
    }
  }
}

// Global Singleton Instance
const exportEngine = new ExportEngine();
