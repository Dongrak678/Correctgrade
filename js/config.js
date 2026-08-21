/**
 * ระบบติดตามแก้ไขผลการเรียน (Academic Remediation System)
 * config.js - การตั้งค่าระบบ ฐานข้อมูล Firebase และ Cloudinary CDN
 */

const APP_CONFIG = {
  APP_NAME: "ระบบติดตามแก้ไขผลการเรียน",
  APP_VERSION: "1.0.0",
  SCHOOL_NAME: "โรงเรียนพนมดงรักวิทยา",
  ACADEMIC_YEAR: localStorage.getItem('dongrak_academic_year') || "2569",
  SEMESTER: localStorage.getItem('dongrak_semester') || "1",
  AVAILABLE_YEARS: ["2569", "2568", "2567", "2566", "2570"],
  AVAILABLE_SEMESTERS: [
    { value: "1", label: "ภาคเรียนที่ 1", desc: "ภาคเรียนที่ 1 (เทอมต้น)" },
    { value: "2", label: "ภาคเรียนที่ 2", desc: "ภาคเรียนที่ 2 (เทอมปลาย)" }
  ],
  
  // Firebase Realtime Database
  FIREBASE_DB_URL: "https://newdatadongrak-default-rtdb.asia-southeast1.firebasedatabase.app/",
  
  // Cloudinary Configuration
  CLOUDINARY: {
    CLOUD_NAME: "oyjoc3og",
    UPLOAD_PRESET: "Dongraksystem",
    UPLOAD_URL: "https://api.cloudinary.com/v1_1/oyjoc3og/image/upload"
  },
  
  // 9 กลุ่มสาระการเรียนรู้
  LEARNING_AREAS: [
    "กลุ่มสาระการเรียนรู้ภาษาไทย",
    "กลุ่มสาระการเรียนรู้คณิตศาสตร์",
    "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    "กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม",
    "กลุ่มสาระการเรียนรู้สุขศึกษาและพลศึกษา",
    "กลุ่มสาระการเรียนรู้ศิลปะ",
    "กลุ่มสาระการเรียนรู้การงานอาชีพ",
    "กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ",
    "หลักสูตรประกาศนียบัตรวิชาชีพ (ปวช.)"
  ],

  // ระดับชั้นที่รองรับ
  GRADE_LEVELS: [
    "ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6", "ปวช.1", "ปวช.2", "ปวช.3"
  ],

  // ประเภทผลการเรียนที่มีเงื่อนไข
  CONDITION_TYPES: {
    "0": { label: "ผลการเรียน '0'", color: "#ef4444", bg: "#fee2e2", text: "text-red-600" },
    "ร": { label: "ผลการเรียน 'ร'", color: "#f59e0b", bg: "#fef3c7", text: "text-amber-600" },
    "มส": { label: "ผลการเรียน 'มส'", color: "#8b5cf6", bg: "#ede9fe", text: "text-purple-600" }
  },

  // ขั้นตอนของกระบวนการแก้ไข (4-Step Workflow)
  WORKFLOW_STEPS: {
    STEP_1_PENDING_REQUEST: {
      code: "pending_request",
      step: 1,
      title: "ยังไม่ยื่นคำร้อง",
      description: "นักเรียนยังไม่ได้ยื่นคำร้องขอแก้ไขผลการเรียน",
      badgeClass: "badge-gray",
      color: "#64748b"
    },
    STEP_1_REQUESTED: {
      code: "requested",
      step: 1,
      title: "ยื่นคำร้องแล้ว",
      description: "นักเรียนยื่นคำร้องแล้ว รอกำหนดงานจากครูผู้สอน",
      badgeClass: "badge-blue",
      color: "#3b82f6"
    },
    STEP_2_ASSIGNED: {
      code: "assigned",
      step: 2,
      title: "ครูมอบหมายงานแล้ว",
      description: "ครูได้กำหนดภาระงาน/ใบงานแล้ว นักเรียนอยู่ระหว่างดำเนินการ",
      badgeClass: "badge-amber",
      color: "#f59e0b"
    },
    STEP_3_SUBMITTED: {
      code: "submitted",
      step: 3,
      title: "นักเรียนส่งงานแล้ว",
      description: "นักเรียนส่งงานและแนบหลักฐานแล้ว รอครูตรวจประเมิน",
      badgeClass: "badge-purple",
      color: "#8b5cf6"
    },
    STEP_4_APPROVED: {
      code: "approved",
      step: 4,
      title: "ผ่านการแก้ไข (อนุมัติแล้ว)",
      description: "ครูตรวจประเมินและอนุมัติปรับผลการเรียนเรียบร้อยแล้ว",
      badgeClass: "badge-emerald",
      color: "#10b981"
    },
    STEP_4_REJECTED: {
      code: "rejected",
      step: 4,
      title: "ส่งคืนให้แก้ไขเพิ่มเติม",
      description: "ชิ้นงานยังไม่ผ่านเกณฑ์ ครูส่งคืนให้นักเรียนปรับปรุงใหม่",
      badgeClass: "badge-rose",
      color: "#f43f5e"
    }
  },

  // สิทธิ์และบทบาทผู้ใช้งาน
  ROLES: {
    ADMIN: "admin",
    TEACHER: "teacher",
    STUDENT: "student"
  }
};

// ข้อมูลเริ่มต้นสำหรับระบบ (Initial Seed Data เมื่อเปิดใช้งานครั้งแรก)
const INITIAL_SEED_DATA = {
  users: [
    {
      id: "u_admin",
      username: "admin",
      password: "admin1234",
      name: "ผู้ดูแลระบบ งานทะเบียนและวัดผล",
      role: "admin",
      email: "admin@dongrak.ac.th",
      phone: "081-234-5678",
      createdAt: "2026-08-01T08:00:00.000Z"
    },
    {
      id: "u_t01",
      username: "teacher01",
      password: "123456",
      name: "ครูสมชาย ใจดี",
      role: "teacher",
      teacherId: "T001",
      learningArea: "กลุ่มสาระการเรียนรู้คณิตศาสตร์",
      phone: "089-111-2222",
      email: "somchai@dongrak.ac.th",
      createdAt: "2026-08-01T08:00:00.000Z"
    },
    {
      id: "u_t02",
      username: "teacher02",
      password: "123456",
      name: "ครูวรรณา รักเรียน",
      role: "teacher",
      teacherId: "T002",
      learningArea: "กลุ่มสาระการเรียนรู้ภาษาไทย",
      phone: "089-333-4444",
      email: "wanna@dongrak.ac.th",
      createdAt: "2026-08-01T08:00:00.000Z"
    },
    {
      id: "u_t03",
      username: "teacher03",
      password: "123456",
      name: "ครูอนุชา วิทยาการ",
      role: "teacher",
      teacherId: "T003",
      learningArea: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
      phone: "089-555-6666",
      email: "anucha@dongrak.ac.th",
      createdAt: "2026-08-01T08:00:00.000Z"
    },
    {
      id: "u_s01",
      username: "std001",
      password: "123456",
      name: "นายกิตติศักดิ์ พากเพียร",
      role: "student",
      studentId: "50101",
      gradeLevel: "ม.4",
      room: "1",
      phone: "090-123-4567",
      advisor: "ครูสมชาย ใจดี",
      createdAt: "2026-08-01T08:00:00.000Z"
    },
    {
      id: "u_s02",
      username: "std002",
      password: "123456",
      name: "นางสาวศิริพร สุขเกษม",
      role: "student",
      studentId: "50102",
      gradeLevel: "ม.4",
      room: "1",
      phone: "090-234-5678",
      advisor: "ครูสมชาย ใจดี",
      createdAt: "2026-08-01T08:00:00.000Z"
    },
    {
      id: "u_s03",
      username: "std003",
      password: "123456",
      name: "นายธนพล มุ่งมั่น",
      role: "student",
      studentId: "60205",
      gradeLevel: "ม.5",
      room: "2",
      phone: "090-345-6789",
      advisor: "ครูวรรณา รักเรียน",
      createdAt: "2026-08-01T08:00:00.000Z"
    }
  ],

  teachers: [
    {
      id: "t_01",
      teacherId: "T001",
      username: "teacher01",
      name: "ครูสมชาย ใจดี",
      learningArea: "กลุ่มสาระการเรียนรู้คณิตศาสตร์",
      semester: "1",
      academicYear: "2569",
      phone: "089-111-2222",
      email: "somchai@dongrak.ac.th",
      subjects: [
        { code: "ค31101", name: "คณิตศาสตร์พื้นฐาน 1", level: "ม.4" },
        { code: "ค32101", name: "คณิตศาสตร์พื้นฐาน 3", level: "ม.5" }
      ]
    },
    {
      id: "t_02",
      teacherId: "T002",
      username: "teacher02",
      name: "ครูวรรณา รักเรียน",
      learningArea: "กลุ่มสาระการเรียนรู้ภาษาไทย",
      semester: "1",
      academicYear: "2569",
      phone: "089-333-4444",
      email: "wanna@dongrak.ac.th",
      subjects: [
        { code: "ท31101", name: "ภาษาไทย 1", level: "ม.4" },
        { code: "ท21101", name: "ภาษาไทยพื้นฐาน", level: "ม.1" }
      ]
    },
    {
      id: "t_03",
      teacherId: "T003",
      username: "teacher03",
      name: "ครูอนุชา วิทยาการ",
      learningArea: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
      semester: "1",
      academicYear: "2569",
      phone: "089-555-6666",
      email: "anucha@dongrak.ac.th",
      subjects: [
        { code: "ว31101", name: "วิทยาศาสตร์กายภาพ 1", level: "ม.4" },
        { code: "ว30281", name: "วิทยาการคำนวณ", level: "ม.4" }
      ]
    }
  ],

  students: [
    {
      id: "s_01",
      studentId: "50101",
      username: "std001",
      number: "1",
      prefix: "นาย",
      name: "กิตติศักดิ์ พากเพียร",
      gradeLevel: "ม.4",
      room: "1",
      advisor: "ครูสมชาย ใจดี",
      phone: "090-123-4567"
    },
    {
      id: "s_02",
      studentId: "50102",
      username: "std002",
      number: "2",
      prefix: "นางสาว",
      name: "ศิริพร สุขเกษม",
      gradeLevel: "ม.4",
      room: "1",
      advisor: "ครูสมชาย ใจดี",
      phone: "090-234-5678"
    },
    {
      id: "s_03",
      studentId: "60205",
      username: "std003",
      number: "5",
      prefix: "นาย",
      name: "ธนพล มุ่งมั่น",
      gradeLevel: "ม.5",
      room: "2",
      advisor: "ครูวรรณา รักเรียน",
      phone: "090-345-6789"
    },
    {
      id: "s_04",
      studentId: "40108",
      username: "std004",
      number: "8",
      prefix: "เด็กชาย",
      name: "ณัฐวุฒิ สดใส",
      gradeLevel: "ม.1",
      room: "2",
      advisor: "ครูวรรณา รักเรียน",
      phone: "090-456-7890"
    },
    {
      id: "s_05",
      studentId: "70112",
      username: "std005",
      number: "12",
      prefix: "นาย",
      name: "ปิยพัทธ์ สรรพวิช",
      gradeLevel: "ปวช.1",
      room: "1",
      advisor: "ครูอนุชา วิทยาการ",
      phone: "090-567-8901"
    }
  ],

  records: [
    {
      id: "rec_001",
      studentId: "50101",
      studentName: "นายกิตติศักดิ์ พากเพียร",
      gradeLevel: "ม.4",
      room: "1",
      subjectCode: "ค31101",
      subjectName: "คณิตศาสตร์พื้นฐาน 1",
      learningArea: "กลุ่มสาระการเรียนรู้คณิตศาสตร์",
      conditionType: "0",
      teacherId: "T001",
      teacherName: "ครูสมชาย ใจดี",
      semester: "1",
      academicYear: "2569",
      status: "assigned",
      requestDate: "2026-08-10 09:30",
      requestNote: "ขออนุญาตยื่นคำร้องแก้เกรด 0 ครับ เนื่องจากช่วงสอบกลางภาคป่วยและส่งงานไม่ครบ",
      taskTitle: "ทำแบบฝึกหัดทบทวนเรื่องเซตและตรรกศาสตร์",
      taskDescription: "ให้นักเรียนทำแบบฝึกหัดท้ายบทที่ 1 ข้อ 1-20 และบทที่ 2 ข้อ 1-15 ลงในสมุดพร้อมแสดงวิธีทำอย่างละเอียด",
      taskAttachmentUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
      taskAssignedDate: "2026-08-11 14:15",
      taskDueDate: "2026-08-25",
      submissionDate: null,
      submissionNote: null,
      submissionFileUrl: null,
      newGrade: null,
      approvalDate: null,
      approvalNote: null,
      timeline: [
        { step: 1, title: "ยื่นคำร้องขอแก้ไข", date: "2026-08-10 09:30", actor: "นายกิตติศักดิ์ พากเพียร (นักเรียน)", note: "ยื่นคำร้องขอแก้ไขผลการเรียน 0" },
        { step: 2, title: "ครูมอบหมายงาน", date: "2026-08-11 14:15", actor: "ครูสมชาย ใจดี (ครูผู้สอน)", note: "มอบหมายแบบฝึกหัดทบทวนเรื่องเซตและตรรกศาสตร์" }
      ]
    },
    {
      id: "rec_002",
      studentId: "50102",
      studentName: "นางสาวศิริพร สุขเกษม",
      gradeLevel: "ม.4",
      room: "1",
      subjectCode: "ว31101",
      subjectName: "วิทยาศาสตร์กายภาพ 1",
      learningArea: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
      conditionType: "ร",
      teacherId: "T003",
      teacherName: "ครูอนุชา วิทยาการ",
      semester: "1",
      academicYear: "2569",
      status: "submitted",
      requestDate: "2026-08-12 10:00",
      requestNote: "ขอส่งงานค้างเพื่อแก้ ร ค่ะ",
      taskTitle: "จัดทำรายงานการทดลองเรื่องการเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย",
      taskDescription: "ทำรายงานการทดลองจำนวน 5 หน้า พร้อมวาดกราฟและสรุปผลการทดลอง",
      taskAttachmentUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80",
      taskAssignedDate: "2026-08-13 11:30",
      taskDueDate: "2026-08-20",
      submissionDate: "2026-08-16 16:45",
      submissionNote: "ส่งเล่มรายงานการทดลองและกราฟครบถ้วนเรียบร้อยแล้วค่ะ",
      submissionFileUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
      newGrade: null,
      approvalDate: null,
      approvalNote: null,
      timeline: [
        { step: 1, title: "ยื่นคำร้องขอแก้ไข", date: "2026-08-12 10:00", actor: "นางสาวศิริพร สุขเกษม", note: "ยื่นคำร้องแก้ ร" },
        { step: 2, title: "ครูมอบหมายงาน", date: "2026-08-13 11:30", actor: "ครูอนุชา วิทยาการ", note: "กำหนดรายงานการทดลอง" },
        { step: 3, title: "นักเรียนส่งงาน", date: "2026-08-16 16:45", actor: "นางสาวศิริพร สุขเกษม", note: "แนบหลักฐานชิ้นงานรายงาน" }
      ]
    },
    {
      id: "rec_003",
      studentId: "60205",
      studentName: "นายธนพล มุ่งมั่น",
      gradeLevel: "ม.5",
      room: "2",
      subjectCode: "ท31101",
      subjectName: "ภาษาไทย 1",
      learningArea: "กลุ่มสาระการเรียนรู้ภาษาไทย",
      conditionType: "มส",
      teacherId: "T002",
      teacherName: "ครูวรรณา รักเรียน",
      semester: "1",
      academicYear: "2569",
      status: "approved",
      requestDate: "2026-08-05 08:30",
      requestNote: "ยื่นคำร้องแก้ มส เนื่องจากเวลาเรียนขาดเกินเกณฑ์",
      taskTitle: "เรียนซ่อมเสริมและจัดทำสมุดถอดบทประพันธ์เรื่องลิลิตพระลอ",
      taskDescription: "เข้าเรียนเสริมเวลา 10 คาบ และทำสมุดบันทึกสรุปบทเรียนและถอดคำประพันธ์",
      taskAttachmentUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80",
      taskAssignedDate: "2026-08-06 13:00",
      taskDueDate: "2026-08-15",
      submissionDate: "2026-08-14 15:20",
      submissionNote: "ส่งสมุดถอดบทประพันธ์และใบเช็คชื่อเรียนซ่อมเสริมครบ 10 คาบครับ",
      submissionFileUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      newGrade: "1.0",
      approvalDate: "2026-08-15 10:30",
      approvalNote: "นักเรียนเข้าเรียนซ่อมเสริมครบถ้วน และงานมีคุณภาพถูกต้องตามเกณฑ์ อนุมัติผ่านให้เกรด 1.0",
      timeline: [
        { step: 1, title: "ยื่นคำร้องขอแก้ไข", date: "2026-08-05 08:30", actor: "นายธนพล มุ่งมั่น", note: "ยื่นคำร้องแก้ มส" },
        { step: 2, title: "ครูมอบหมายงาน", date: "2026-08-06 13:00", actor: "ครูวรรณา รักเรียน", note: "มอบหมายเรียนซ่อมเสริมและสมุดถอดบทประพันธ์" },
        { step: 3, title: "นักเรียนส่งงาน", date: "2026-08-14 15:20", actor: "นายธนพล มุ่งมั่น", note: "ส่งงานและหลักฐานครบถ้วน" },
        { step: 4, title: "ครูอนุมัติผลการเรียน", date: "2026-08-15 10:30", actor: "ครูวรรณา รักเรียน", note: "อนุมัติปรับเกรด มส ➔ 1.0" }
      ]
    },
    {
      id: "rec_004",
      studentId: "40108",
      studentName: "เด็กชายณัฐวุฒิ สดใส",
      gradeLevel: "ม.1",
      room: "2",
      subjectCode: "ท21101",
      subjectName: "ภาษาไทยพื้นฐาน",
      learningArea: "กลุ่มสาระการเรียนรู้ภาษาไทย",
      conditionType: "0",
      teacherId: "T002",
      teacherName: "ครูวรรณา รักเรียน",
      semester: "1",
      academicYear: "2569",
      status: "pending_request",
      requestDate: null,
      requestNote: null,
      taskTitle: null,
      taskDescription: null,
      taskAttachmentUrl: null,
      taskAssignedDate: null,
      taskDueDate: null,
      submissionDate: null,
      submissionNote: null,
      submissionFileUrl: null,
      newGrade: null,
      approvalDate: null,
      approvalNote: null,
      timeline: []
    }
  ],

  auditLogs: [
    {
      id: "aud_001",
      recordId: "rec_003",
      studentId: "60205",
      studentName: "นายธนพล มุ่งมั่น",
      gradeLevel: "ม.5/2",
      subjectCode: "ท31101",
      subjectName: "ภาษาไทย 1",
      previousGrade: "มส",
      newGrade: "1.0",
      approvedBy: "ครูวรรณา รักเรียน",
      approvedAt: "2026-08-15 10:30",
      notes: "เข้าเรียนซ่อมเสริมครบ 10 คาบ และส่งสมุดถอดบทประพันธ์ถูกต้องตามเกณฑ์"
    }
  ],

  activityLogs: [
    {
      id: "act_001",
      type: "approval",
      title: "อนุมัติปรับผลการเรียนสำเร็จ",
      message: "ครูวรรณา รักเรียน อนุมัติผลการเรียนวิชา ท31101 ภาษาไทย 1 ให้แก่ นายธนพล มุ่งมั่น (มส ➔ 1.0)",
      timestamp: "2026-08-15 10:30",
      badgeClass: "badge-emerald"
    },
    {
      id: "act_002",
      type: "submission",
      title: "นักเรียนส่งชิ้นงาน",
      message: "นางสาวศิริพร สุขเกษม ส่งรายงานการทดลองวิชา ว31101 วิทยาศาสตร์กายภาพ 1",
      timestamp: "2026-08-16 16:45",
      badgeClass: "badge-purple"
    },
    {
      id: "act_003",
      type: "assignment",
      title: "ครูมอบหมายงานแก้ไข",
      message: "ครูสมชาย ใจดี มอบหมายงานแก้ผลการเรียน 0 วิชา ค31101 ให้แก่ นายกิตติศักดิ์ พากเพียร",
      timestamp: "2026-08-11 14:15",
      badgeClass: "badge-amber"
    }
  ]
};
