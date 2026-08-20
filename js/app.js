/**
 * Myclassroom Online Classroom Application Logic
 * Modern, Clean, Fluid, Real-Time Synchronized
 */

// Global State
let currentUser = null;
let activeLoginRole = 'teacher';
let activeNavView = 'dashboard';

// Realtime Cache Stores
let usersData = {};
let studentsData = {};
let coursesData = {};
let homeworkData = {};
let submissionsData = {};
let quizzesData = {};
let quizResultsData = {};
let announcementsData = {};

// Quiz Runner State
let activeQuizTimerInterval = null;
let activeQuizData = null;
let quizRemainingSeconds = 0;

// Dynamic Quiz Builder State
let quizQuestionsList = [];

/* -------------------------------------------------------------
   POPUP & NOTIFICATION HELPER ENGINE (SweetAlert2 Modern UI)
------------------------------------------------------------- */
function showPopupAlert(title, text = '', icon = 'info') {
  if (typeof Swal !== 'undefined') {
    return Swal.fire({
      title: title,
      text: text,
      icon: icon,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#2563eb',
      customClass: { popup: 'swal2-popup' }
    });
  } else {
    alert(text ? `${title}\n${text}` : title);
  }
}

function showPopupSuccess(title, text = '') {
  return showPopupAlert(title, text, 'success');
}

function showPopupWarning(title, text = '') {
  return showPopupAlert(title, text, 'warning');
}

function showPopupError(title, text = '') {
  return showPopupAlert(title, text, 'error');
}

function showPopupConfirm(title, text = '', confirmText = 'ยืนยัน', icon = 'warning') {
  if (typeof Swal !== 'undefined') {
    return Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      customClass: { popup: 'swal2-popup' }
    }).then((result) => result.isConfirmed);
  } else {
    return Promise.resolve(confirm(text ? `${title}\n${text}` : title));
  }
}

/* -------------------------------------------------------------
   0. 3D CYBER MATRIX & PROGRAMMING DATA FLOW CANVAS ENGINE (HIGH PERFORMANCE)
------------------------------------------------------------- */
let cyberCanvasAnimId = null;
let isCyberCanvasActive = false;

function initCyberDataFlowCanvas() {
  const canvas = document.getElementById('cyber-matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 150);
  }, { passive: true });

  // Mouse cursor attraction with passive listener
  const mouse = { x: null, y: null, maxDist: 150 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  }, { passive: true });

  // Cyber Neon Colors Palette
  const neonColors = [
    { r: 56, g: 189, b: 248 },   // Vivid Cyan
    { r: 74, g: 222, b: 128 },   // Neon Green
    { r: 96, g: 165, b: 250 },   // Electric Sky Blue
    { r: 250, g: 204, b: 21 },   // Cyber Gold
    { r: 232, g: 121, b: 249 }   // Neon Violet
  ];

  // 1. Cyber Network Nodes (Optimized count for 60fps)
  const isMobile = window.innerWidth < 768;
  const nodeCount = isMobile ? 24 : Math.min(Math.floor((window.innerWidth * window.innerHeight) / 22000), 50);
  const nodes = [];

  for (let i = 0; i < nodeCount; i++) {
    const col = neonColors[i % neonColors.length];
    nodes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 1.8 + 1.2,
      color: col,
      pulse: Math.random() * Math.PI,
      pulseSpeed: Math.random() * 0.03 + 0.015
    });
  }

  // 2. Fiber-Optic Data Packet Pulses
  const packets = [];
  const maxPackets = isMobile ? 8 : 16;

  function spawnPacket(n1, n2) {
    if (packets.length >= maxPackets) return;
    packets.push({
      x1: n1.x,
      y1: n1.y,
      x2: n2.x,
      y2: n2.y,
      progress: 0,
      speed: Math.random() * 0.02 + 0.015,
      color: n1.color
    });
  }

  // 3. Floating Programming Code & Data Stream Tokens
  const codeSnippets = [
    "const classroom = new OnlineSystem();",
    "<code data-stream=\"active\" />",
    "async function syncFirebaseRealtime() {",
    "01001011 01110010 01110101 01101110 01101001",
    "Cloudinary.upload(compressedImage, { quality: 'auto' });",
    "if (student.quizScore >= passScore) { status = 'PASSED'; }",
    "import { realtimeDB, auth } from '@firebase/app';",
    "01010100 01100101 01100011 01101000 01101110",
    "git commit -m 'Release classroom v3.2' && git push",
    "SELECT student_id, name, score FROM exam_matrix;",
    "const token = await generateSecureAuthToken();",
    "while (connection.status === 'CONNECTED') { stream(); }",
    "11001010 10101100 01010101 11110000",
    "console.log('🚀 Realtime Classroom Ready 100%');",
    "01000011 01101111 01100100 01101001 01101110 01100111",
    "function gradeEvaluation(score, total) { return (score/total)*100; }",
    "{ status: 200, latency: '12ms', sync: 'LIVE' }",
    "addEventListener('DOMContentLoaded', () => initApp());",
    "<div class=\"live-education-platform\">",
    "return new Promise((resolve) => resolve({ connected: true }));"
  ];

  const floatingCodes = [];
  const codeCount = isMobile ? 8 : Math.min(Math.floor(window.innerWidth / 110), 16);

  for (let i = 0; i < codeCount; i++) {
    floatingCodes.push({
      text: codeSnippets[i % codeSnippets.length],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vy: -(Math.random() * 0.4 + 0.3),
      alpha: Math.random() * 0.35 + 0.45,
      size: Math.floor(Math.random() * 2) + 12,
      color: neonColors[i % neonColors.length]
    });
  }

  function render() {
    if (!isCyberCanvasActive) return;

    const width = canvas.width;
    const height = canvas.height;

    // Check if login screen is active; if not, suspend loop to save 100% CPU
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen && loginScreen.style.display === 'none') {
      isCyberCanvasActive = false;
      return;
    }

    ctx.clearRect(0, 0, width, height);

    // --- A. Draw & Update Floating Code Streams (Optimized without heavy shadowBlur) ---
    ctx.textBaseline = 'middle';
    for (let i = 0; i < floatingCodes.length; i++) {
      const fc = floatingCodes[i];
      fc.y += fc.vy;
      if (fc.y < -30) {
        fc.y = height + 30;
        fc.x = Math.random() * (width - 150) + 20;
        fc.text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
      }

      ctx.font = `600 ${fc.size}px 'Consolas', 'Fira Code', monospace`;
      ctx.fillStyle = `rgba(${fc.color.r}, ${fc.color.g}, ${fc.color.b}, ${fc.alpha})`;
      ctx.fillText(fc.text, fc.x, fc.y);
    }

    // --- B. Update & Draw Connected Cyber Network ---
    const connectionDist = 120;

    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];

      // Move node
      n1.x += n1.vx;
      n1.y += n1.vy;
      n1.pulse += n1.pulseSpeed;

      // Bounce boundaries
      if (n1.x < 0 || n1.x > width) n1.vx *= -1;
      if (n1.y < 0 || n1.y > height) n1.vy *= -1;

      // Mouse attraction & connection
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - n1.x;
        const dy = mouse.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.maxDist) {
          const force = (1 - dist / mouse.maxDist) * 0.02;
          n1.x += dx * force;
          n1.y += dy * force;

          const mAlpha = (1 - dist / mouse.maxDist) * 0.4;
          ctx.strokeStyle = `rgba(56, 189, 248, ${mAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // Connect with nearby nodes
      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDist) {
          const alpha = (1 - dist / connectionDist) * 0.28;
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();

          // Occasionally spawn a data packet
          if (Math.random() < 0.0015) {
            spawnPacket(n1, n2);
          }
        }
      }

      // Draw node circle
      const currentRadius = n1.radius + Math.sin(n1.pulse) * 0.5;
      ctx.fillStyle = `rgba(${n1.color.r}, ${n1.color.g}, ${n1.color.b}, 0.9)`;
      ctx.beginPath();
      ctx.arc(n1.x, n1.y, Math.max(currentRadius, 1), 0, Math.PI * 2);
      ctx.fill();
    }

    // --- C. Update & Draw Fiber-Optic Data Packets ---
    for (let k = packets.length - 1; k >= 0; k--) {
      const p = packets[k];
      p.progress += p.speed;

      if (p.progress >= 1) {
        packets.splice(k, 1);
        continue;
      }

      const currX = p.x1 + (p.x2 - p.x1) * p.progress;
      const currY = p.y1 + (p.y2 - p.y1) * p.progress;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(currX, currY, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    cyberCanvasAnimId = requestAnimationFrame(render);
  }

  window.startCyberCanvas = function() {
    if (isCyberCanvasActive) return;
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen && loginScreen.style.display === 'none') return;
    isCyberCanvasActive = true;
    cyberCanvasAnimId = requestAnimationFrame(render);
  };

  window.stopCyberCanvas = function() {
    isCyberCanvasActive = false;
    if (cyberCanvasAnimId) {
      cancelAnimationFrame(cyberCanvasAnimId);
      cyberCanvasAnimId = null;
    }
  };

  window.startCyberCanvas();
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  console.log("Krunoii Classroom application starting...");
  
  // Recover local client cache (ag_homework) for instant offline startup
  try {
    const cachedHw = localStorage.getItem('ag_homework');
    if (cachedHw) {
      homeworkData = JSON.parse(cachedHw);
    }
  } catch (e) {
    console.warn("Failed reading ag_homework from localStorage:", e);
  }

  initCyberDataFlowCanvas();
  initRealtimeSync();
  checkSavedSession();
  
  // Initialize default quiz question builder with 1 question
  addQuizQuestionItem();
});

/* -------------------------------------------------------------
   1. REALTIME SYNCHRONIZATION & SEEDING (DEBOUNCED & BATCHED)
------------------------------------------------------------- */
let renderDebounceTimers = {};
function scheduleViewRender(viewName, delay = 50) {
  if (renderDebounceTimers[viewName]) {
    clearTimeout(renderDebounceTimers[viewName]);
  }
  renderDebounceTimers[viewName] = setTimeout(() => {
    if (viewName === 'dashboard' || activeNavView === 'dashboard') {
      updateDashboardStats();
      renderDashboardHomeworkSummary();
      renderDashboardQuizSummary();
    }
    if (activeNavView === viewName) {
      if (viewName === 'students') renderStudentsTable();
      if (viewName === 'courses') renderCoursesList();
      if (viewName === 'quizzes') renderQuizzesList();
      if (viewName === 'reports') renderScoreReports();
      if (viewName === 'users') renderUsersTable();
    }
  }, delay);
}

function initRealtimeSync() {
  if (typeof listenToData !== 'function') return;

  // Listen to Users
  listenToData('users', (data) => {
    usersData = data || {};
    populateTeacherDropdowns();
    checkInitialSeedNeeded();
    scheduleViewRender('users');
  });

  // Listen to Students Roster
  listenToData('students', (data) => {
    studentsData = data || {};
    updateClassFilterDropdowns();
    scheduleViewRender('students');
    scheduleViewRender('dashboard');
    scheduleViewRender('reports');
  });

  // Listen to Courses
  listenToData('courses', (data) => {
    coursesData = data || {};
    updateCourseDropdowns();
    scheduleViewRender('courses');
    scheduleViewRender('dashboard');
    scheduleViewRender('reports');
  });

  // Listen to Homework (Primary Firebase node + Local Client Cache)
  listenToData('homework', (data) => {
    homeworkData = data || {};
    try {
      localStorage.setItem('ag_homework', JSON.stringify(homeworkData));
    } catch (e) {}
    scheduleViewRender('courses');
    scheduleViewRender('dashboard');
    scheduleViewRender('reports');
  });

  // Listen to Homework Submissions
  listenToData('homework_submissions', (data) => {
    submissionsData = data || {};
    scheduleViewRender('courses');
    scheduleViewRender('dashboard');
    scheduleViewRender('reports');
  });

  // Listen to Quizzes
  listenToData('quizzes', (data) => {
    quizzesData = data || {};
    scheduleViewRender('quizzes');
    scheduleViewRender('dashboard');
    scheduleViewRender('reports');
  });

  // Listen to Quiz Results
  listenToData('quiz_results', (data) => {
    quizResultsData = data || {};
    scheduleViewRender('quizzes');
    scheduleViewRender('reports');
  });

  // Listen to Announcements
  listenToData('announcements', (data) => {
    announcementsData = data || {};
    renderAnnouncements();
  });
}

/**
 * Seed initial database records if empty
 */
function checkInitialSeedNeeded() {
  // Always ensure admin user exists in DB with admin56 password
  if (!usersData['admin'] || usersData['admin'].password !== 'admin56') {
    saveData('users/admin', {
      username: "admin",
      name: "ผู้ดูแลระบบ (Admin)",
      password: "admin56",
      role: "admin"
    });
  }

  if (Object.keys(usersData).length === 0) {
    console.log("Seeding default initial users and system data...");
    
    // Seed default Admin & Teacher
    const initialUsers = {
      "admin": { username: "admin", name: "ผู้ดูแลระบบ (Admin)", password: "admin56", role: "admin" },
      "0812345678": { username: "0812345678", name: "คุณครูสมศักดิ์ รักเรียน", password: "123456", role: "teacher" }
    };
    
    // Seed sample Announcement
    const initialAnnounce = {
      title: "ยินดีต้อนรับสู่ระบบห้องเรียนออนไลน์ Krunoii Classroom",
      content: "ขอให้นักเรียนทุกคนเข้าตรวจสอบรายวิชา การบ้าน และแบบทดสอบล่าสุดผ่านหน้าแดชบอร์ด ข้อมูลทุกอย่างจะอัปเดตสดแบบ Real-Time",
      updatedAt: new Date().toISOString()
    };

    saveData('users', initialUsers);
    saveData('announcements', initialAnnounce);
    saveData('_system_seeded', true);
  }
}


/* -------------------------------------------------------------
   2. AUTHENTICATION & LOGIN LOGIC (Unified Single Sign-On)
------------------------------------------------------------- */
function switchLoginRole(role) {
  // Kept for backward compatibility
  activeLoginRole = role;
}

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!username || !password) {
    showPopupWarning("กรุณากรอกข้อมูล", "กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน");
    return;
  }

  let foundUser = null;

  // 1. Embedded hardcoded Admin credentials check (for instant guaranteed login)
  if (username.toLowerCase() === 'admin' && (password === 'admin56' || password === 'admin123' || password === 'admin')) {
    foundUser = {
      username: "admin",
      name: "ผู้ดูแลระบบ (Admin)",
      password: "admin56",
      role: "admin"
    };
    saveData('users/admin', foundUser);
  }

  // 2. Direct key match in usersData (Teacher, Admin, or Student)
  if (!foundUser && usersData[username]) {
    const u = usersData[username];
    if (u.password === password || (u.role === 'student' && (u.studentId === password || password === username))) {
      foundUser = u;
    }
  }

  // 3. Search by username or studentId across all usersData
  if (!foundUser) {
    const matchedKey = Object.keys(usersData).find(k => {
      const u = usersData[k];
      return (u.username === username || u.studentId === username || k === username) && 
             (u.password === password || (u.role === 'student' && password === username));
    });
    if (matchedKey) {
      foundUser = usersData[matchedKey];
    }
  }

  // 4. Check in studentsData (Auto Student ID Login)
  if (!foundUser) {
    const std = studentsData[username] || Object.values(studentsData).find(s => s.studentId === username);
    if (std && (password === std.studentId || password === username)) {
      foundUser = {
        username: std.studentId,
        password: std.studentId,
        name: std.name,
        role: 'student',
        studentId: std.studentId,
        classLevel: std.classLevel
      };
      saveData(`users/${std.studentId}`, foundUser);
    }
  }

  if (foundUser) {
    currentUser = foundUser;
    sessionStorage.setItem('myclassroom_user', JSON.stringify(currentUser));
    showAppScreen();
    logActivity(`ผู้ใช้งาน ${currentUser.name} เข้าสู่ระบบแล้ว`);
  } else {
    showPopupError("เข้าสู่ระบบไม่สำเร็จ", "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (สำหรับนักเรียนให้ใช้รหัสประจำตัวเป็นทั้งชื่อผู้ใช้และรหัสผ่าน)");
  }
}

function checkSavedSession() {
  const saved = sessionStorage.getItem('myclassroom_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      showAppScreen();
    } catch (e) {
      sessionStorage.removeItem('myclassroom_user');
    }
  }
}

function handleLogout() {
  showPopupConfirm("ยืนยันออกจากระบบ", "คุณต้องการออกจากระบบ Krunoii Classroom ใช่หรือไม่?", "ออกจากระบบ", "warning").then((confirmed) => {
    if (confirmed) {
      currentUser = null;
      sessionStorage.removeItem('myclassroom_user');
      document.body.classList.remove('role-student', 'role-teacher');
      document.getElementById('app-screen').style.display = 'none';
      document.getElementById('login-screen').style.display = 'flex';
      if (typeof window.startCyberCanvas === 'function') {
        window.startCyberCanvas();
      }
      showPopupSuccess("ออกจากระบบเรียบร้อย", "ขอบคุณที่ใช้งานระบบ Krunoii Classroom");
    }
  });
}

function showAppScreen() {
  // Stop login canvas loop to save 100% CPU/GPU while using the app
  if (typeof window.stopCyberCanvas === 'function') {
    window.stopCyberCanvas();
  }

  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'flex';

  const isStudent = currentUser && currentUser.role === 'student';
  document.body.classList.toggle('role-student', isStudent);
  document.body.classList.toggle('role-teacher', !isStudent);

  // Set user profile in sidebar
  document.getElementById('sidebar-user-name').innerText = currentUser.name;
  document.getElementById('sidebar-user-avatar').innerText = currentUser.name.charAt(0);
  
  let roleText = "ครูผู้สอน";
  if (currentUser.role === 'admin') roleText = "ผู้ดูแลระบบ";
  if (currentUser.role === 'student') roleText = `นักเรียน (${currentUser.classLevel || 'เรียน'})`;
  document.getElementById('sidebar-user-role').innerText = roleText;

  // Toggle role-specific controls
  const teacherElements = document.querySelectorAll('.teacher-only');
  teacherElements.forEach(el => {
    if (isStudent) {
      el.style.setProperty('display', 'none', 'important');
    } else {
      if (el.classList.contains('nav-item')) {
        el.style.display = 'flex';
      } else if (el.tagName === 'BUTTON' || el.classList.contains('btn')) {
        el.style.display = 'inline-flex';
      } else {
        el.style.display = 'flex';
      }
    }
  });

  // Default view
  switchNav('dashboard');
}

function togglePasswordVisibility(inputId, buttonEl) {
  const input = document.getElementById(inputId);
  const icon = buttonEl.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa-solid fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fa-solid fa-eye';
  }
}


/* -------------------------------------------------------------
   3. NAVIGATION & VIEW SWITCHING
------------------------------------------------------------- */
function switchNav(viewName) {
  // Security permission guard for students: only allowed dashboard, courses, quizzes
  if (currentUser && currentUser.role === 'student') {
    const studentAllowedViews = ['dashboard', 'courses', 'quizzes'];
    if (!studentAllowedViews.includes(viewName)) {
      viewName = 'dashboard';
    }
  }

  activeNavView = viewName;
  
  // Update sidebar active link
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const navBtn = document.getElementById(`nav-${viewName}`);
  if (navBtn) navBtn.classList.add('active');

  // Hide all views, show selected
  document.querySelectorAll('.app-view').forEach(view => view.style.display = 'none');
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) targetView.style.display = 'block';

  // Page title mapping
  const titleMap = {
    dashboard: "แดชบอร์ดภาพรวมระบบ",
    students: "รายชื่อนักเรียนในระบบ",
    courses: "รายวิชาและการบ้าน",
    quizzes: "คลังแบบทดสอบและข้อสอบ",
    reports: "สรุปรายงานคะแนนเก็บและคะแนนสอบ",
    users: "จัดการผู้ใช้งานในระบบ"
  };
  document.getElementById('page-title').innerText = titleMap[viewName] || "Myclassroom";

  // Trigger render functions for target view
  if (viewName === 'dashboard') updateDashboardStats();
  if (viewName === 'students') renderStudentsTable();
  if (viewName === 'courses') renderCoursesList();
  if (viewName === 'quizzes') renderQuizzesList();
  if (viewName === 'reports') renderScoreReports();
  if (viewName === 'users') renderUsersTable();

  // Close sidebar on mobile
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('show', 'mobile-active');
  if (backdrop) backdrop.classList.remove('active');
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar) return;
  const isShow = sidebar.classList.toggle('show');
  sidebar.classList.toggle('mobile-active', isShow);
  if (backdrop) backdrop.classList.toggle('active', isShow);
}


/* -------------------------------------------------------------
   4. DASHBOARD RENDERERS & STUDENT ELIGIBILITY FILTER
------------------------------------------------------------- */
function isStudentEligibleForCourse(studentClass, course) {
  if (!studentClass || !course) return true;
  const sClass = studentClass.trim().replace(/^"|"$/g, '');
  const sBase = sClass.includes('/') ? sClass.split('/')[0].trim() : sClass;

  if (!course.level || course.level === 'all') return true;
  const cLevel = course.level.trim().replace(/^"|"$/g, '');
  const cBase = cLevel.includes('/') ? cLevel.split('/')[0].trim() : cLevel;

  return cLevel === sClass || cLevel === sBase || sClass.startsWith(cLevel) || cLevel.startsWith(sBase);
}

function isStudentEligibleForHomework(studentClass, hw) {
  if (!studentClass || !hw) return true;
  const sClass = studentClass.trim().replace(/^"|"$/g, '');
  const sBase = sClass.includes('/') ? sClass.split('/')[0].trim() : sClass;

  // 1. Must belong to an existing course that matches student's grade level
  if (hw.courseId && coursesData[hw.courseId]) {
    const course = coursesData[hw.courseId];
    if (!isStudentEligibleForCourse(sClass, course)) {
      return false;
    }
  } else if (hw.courseId && !coursesData[hw.courseId]) {
    return false;
  } else if (!hw.courseId) {
    // If no courseId is attached, only allow if targets explicitly specified student's room
    const targets = hw.targetClasses || (hw.targetClass ? hw.targetClass.split(',').map(s => s.trim()) : ['all']);
    if (targets.includes('all')) return false;
  }

  // 2. Must match targetClasses
  const targets = hw.targetClasses || (hw.targetClass ? hw.targetClass.split(',').map(s => s.trim()) : ['all']);
  if (!targets.includes('all') && targets.length > 0) {
    const match = targets.some(t => {
      const cleanT = t.trim().replace(/^"|"$/g, '');
      return cleanT === sClass || cleanT === sBase || sClass.startsWith(cleanT);
    });
    if (!match) return false;
  }

  return true;
}

function isStudentEligibleForQuiz(studentClass, quiz) {
  if (!studentClass || !quiz) return true;
  const sClass = studentClass.trim().replace(/^"|"$/g, '');
  const sBase = sClass.includes('/') ? sClass.split('/')[0].trim() : sClass;

  // 1. Must belong to an existing course that matches student's grade level
  if (quiz.courseId && coursesData[quiz.courseId]) {
    const course = coursesData[quiz.courseId];
    if (!isStudentEligibleForCourse(sClass, course)) {
      return false;
    }
  } else if (quiz.courseId && !coursesData[quiz.courseId]) {
    return false;
  }

  // 2. Must match targetClasses
  const targets = quiz.targetClasses || (quiz.targetClass ? quiz.targetClass.split(',').map(s => s.trim()) : ['all']);
  if (!targets.includes('all') && targets.length > 0) {
    const match = targets.some(t => {
      const cleanT = t.trim().replace(/^"|"$/g, '');
      return cleanT === sClass || cleanT === sBase || sClass.startsWith(cleanT);
    });
    if (!match) return false;
  }

  return true;
}

function updateDashboardStats() {
  const isStudent = currentUser && currentUser.role === 'student';
  const studentClass = (currentUser && currentUser.classLevel) ? currentUser.classLevel.trim() : '';

  const studentCount = Object.keys(studentsData).length;
  const courseCount = Object.keys(coursesData).length;
  const quizCount = Object.keys(quizzesData).length;

  if (isStudent) {
    // Filter courses for this student's grade level
    const myCourseKeys = Object.keys(coursesData).filter(id => {
      return isStudentEligibleForCourse(studentClass, coursesData[id]);
    });

    // Filter homework for this student's grade level and target classes
    const myHwKeys = Object.keys(homeworkData).filter(id => {
      return isStudentEligibleForHomework(studentClass, homeworkData[id]);
    });

    // Filter quizzes for this student's grade level and target classes
    const myQuizKeys = Object.keys(quizzesData).filter(id => {
      return isStudentEligibleForQuiz(studentClass, quizzesData[id]);
    });

    document.getElementById('stat-students-count').innerText = studentClass || 'นักเรียน';
    const lbl1 = document.querySelector('#stat-students-count + .stat-label');
    if (lbl1) lbl1.innerText = 'ห้องเรียนของฉัน';

    document.getElementById('stat-courses-count').innerText = myCourseKeys.length;
    const lbl2 = document.querySelector('#stat-courses-count + .stat-label');
    if (lbl2) lbl2.innerText = 'รายวิชาของฉัน';

    document.getElementById('stat-homework-count').innerText = myHwKeys.length;
    const lbl3 = document.querySelector('#stat-homework-count + .stat-label');
    if (lbl3) lbl3.innerText = 'การบ้านห้องของฉัน';

    document.getElementById('stat-quizzes-count').innerText = myQuizKeys.length;
    const lbl4 = document.querySelector('#stat-quizzes-count + .stat-label');
    if (lbl4) lbl4.innerText = 'แบบทดสอบห้องของฉัน';
  } else {
    const homeworkCount = Object.keys(homeworkData).length;

    document.getElementById('stat-students-count').innerText = studentCount;
    const lbl1 = document.querySelector('#stat-students-count + .stat-label');
    if (lbl1) lbl1.innerText = 'นักเรียนในระบบ (คน)';

    document.getElementById('stat-courses-count').innerText = courseCount;
    const lbl2 = document.querySelector('#stat-courses-count + .stat-label');
    if (lbl2) lbl2.innerText = 'รายวิชาทั้งหมด';

    document.getElementById('stat-homework-count').innerText = homeworkCount;
    const lbl3 = document.querySelector('#stat-homework-count + .stat-label');
    if (lbl3) lbl3.innerText = 'การบ้านที่สั่งแล้ว';

    document.getElementById('stat-quizzes-count').innerText = quizCount;
    const lbl4 = document.querySelector('#stat-quizzes-count + .stat-label');
    if (lbl4) lbl4.innerText = 'แบบทดสอบที่สร้าง';
  }
}

function renderAnnouncements() {
  const heading = document.getElementById('announcement-heading');
  const body = document.getElementById('announcement-body');
  
  if (announcementsData.title) {
    heading.innerText = announcementsData.title;
    body.innerText = announcementsData.content;
  }
}

function openAnnouncementModal() {
  document.getElementById('announce-title').value = announcementsData.title || '';
  document.getElementById('announce-body').value = announcementsData.content || '';
  openModal('modal-announcement');
}

function saveAnnouncementForm(e) {
  e.preventDefault();
  const title = document.getElementById('announce-title').value.trim();
  const content = document.getElementById('announce-body').value.trim();

  saveData('announcements', {
    title,
    content,
    updatedAt: new Date().toISOString(),
    updatedBy: currentUser.name
  }).then(() => {
    closeModal('modal-announcement');
    showPopupSuccess("บันทึกประกาศสำเร็จ!", "ปรับปรุงประกาศข่าวสารห้องเรียนเรียบร้อยแล้ว");
    logActivity(`ปรับปรุงประกาศห้องเรียน: ${title}`);
  });
}

function renderDashboardHomeworkSummary() {
  const container = document.getElementById('dashboard-homework-summary');
  let hwKeys = Object.keys(homeworkData);
  const isStudent = currentUser && currentUser.role === 'student';
  const studentClass = (currentUser && currentUser.classLevel) ? currentUser.classLevel.trim() : '';

  if (isStudent) {
    hwKeys = hwKeys.filter(id => {
      return isStudentEligibleForHomework(studentClass, homeworkData[id]);
    });
  }

  if (hwKeys.length === 0) {
    container.innerHTML = `<p class="text-muted" style="text-align:center; padding:20px;">ยังไม่มีข้อมูลการบ้าน (หรือไม่มีงานที่มอบหมายให้ห้องของคุณ)</p>`;
    return;
  }

  let html = `<div style="display:flex; flex-direction:column; gap:12px;">`;
  hwKeys.slice(-2).reverse().forEach(id => {
    const hw = homeworkData[id];
    const course = coursesData[hw.courseId] || { code: 'วิชา', name: '' };
    const subs = submissionsData[id] ? Object.keys(submissionsData[id]).length : 0;

    let statusBadge = '';
    if (isStudent) {
      const mySub = (submissionsData[id] && currentUser.studentId) ? submissionsData[id][currentUser.studentId] : null;
      if (mySub) {
        statusBadge = `<span class="badge badge-green"><i class="fa-solid fa-check"></i> ส่งแล้ว (${mySub.score !== undefined ? mySub.score + ' คะแนน' : 'รอตรวจ'})</span>`;
      } else {
        statusBadge = `<button class="btn btn-sm btn-primary" onclick="switchNav('courses')"><i class="fa-solid fa-paper-plane"></i> ส่งงาน</button>`;
      }
    } else {
      statusBadge = `<span class="badge badge-blue">ส่งแล้ว ${subs} คน</span>`;
    }

    html += `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#f8fafc; border-radius:12px; border:1px solid var(--border); flex-wrap:wrap; gap:8px;">
        <div>
          <div style="font-weight:700; color:#0f172a;">${hw.title}</div>
          <div style="font-size:0.85rem; color:var(--text-muted);">${course.code} ${course.name} | กำหนดส่ง: ${hw.dueDate}</div>
        </div>
        <div style="text-align:right;">
          ${statusBadge}
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function renderDashboardQuizSummary() {
  const container = document.getElementById('dashboard-quiz-summary');
  let qKeys = Object.keys(quizzesData);
  const isStudent = currentUser && currentUser.role === 'student';
  const studentClass = (currentUser && currentUser.classLevel) ? currentUser.classLevel.trim() : '';

  if (isStudent) {
    qKeys = qKeys.filter(id => {
      return isStudentEligibleForQuiz(studentClass, quizzesData[id]);
    });
  }

  if (qKeys.length === 0) {
    container.innerHTML = `<p class="text-muted" style="text-align:center; padding:20px;">ยังไม่มีแบบทดสอบ (หรือไม่มีแบบทดสอบสำหรับห้องของคุณ)</p>`;
    return;
  }

  let html = `<div style="display:flex; flex-direction:column; gap:12px;">`;
  qKeys.slice(-2).reverse().forEach(id => {
    const q = quizzesData[id];
    const course = coursesData[q.courseId] || { name: 'วิชา' };
    const doneCount = quizResultsData[id] ? Object.keys(quizResultsData[id]).length : 0;

    html += `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#f8fafc; border-radius:12px; border:1px solid var(--border);">
        <div>
          <div style="font-weight:700; color:#0f172a;">${q.title}</div>
          <div style="font-size:0.85rem; color:var(--text-muted);">${course.name} | ${q.type} ตัวเลือก | เวลา ${q.duration} นาที</div>
        </div>
        <div>
          <span class="badge badge-green">ทำแล้ว ${doneCount} คน</span>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function logActivity(text) {
  const feed = document.getElementById('activity-feed');
  if (!feed) return;

  const item = document.createElement('div');
  item.className = 'activity-item';
  const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  
  item.innerHTML = `
    <div class="activity-icon"><i class="fa-solid fa-bell"></i></div>
    <div>
      <div class="activity-text">${text}</div>
      <div class="activity-time">${nowStr} น.</div>
    </div>
  `;
  feed.insertBefore(item, feed.firstChild);

  // Keep only the latest 2 activity items
  while (feed.children.length > 2) {
    feed.removeChild(feed.lastChild);
  }
}


/* -------------------------------------------------------------
   5. STUDENT ROSTER & CSV IMPORT
------------------------------------------------------------- */
function updateClassFilterDropdowns() {
  const classSet = new Set();
  Object.values(studentsData).forEach(s => {
    if (s.classLevel && s.classLevel.trim()) {
      classSet.add(s.classLevel.trim().replace(/^"|"$/g, ''));
    }
  });

  const sortedClasses = Array.from(classSet).sort((a, b) => a.localeCompare(b, 'th', { numeric: true }));

  const stdFilter = document.getElementById('student-class-filter');
  const repFilter = document.getElementById('report-class-filter');

  // Find preferred default room: ม.1/1 first, or the first available room
  let defaultRoom = '';
  if (sortedClasses.includes('ม.1/1')) {
    defaultRoom = 'ม.1/1';
  } else if (sortedClasses.length > 0) {
    defaultRoom = sortedClasses[0];
  }

  let stdOptions = '';
  sortedClasses.forEach(c => {
    stdOptions += `<option value="${c}">ห้อง ${c}</option>`;
  });
  stdOptions += `<option value="all">-- แสดงทุกห้องเรียน (${sortedClasses.length} ห้อง) --</option>`;

  if (stdFilter) {
    const currentVal = stdFilter.value;
    stdFilter.innerHTML = stdOptions;
    if (currentVal && (sortedClasses.includes(currentVal) || currentVal === 'all')) {
      stdFilter.value = currentVal;
    } else if (defaultRoom) {
      stdFilter.value = defaultRoom;
    }
  }

  let repOptions = '';
  sortedClasses.forEach(c => {
    repOptions += `<option value="${c}">ห้อง ${c}</option>`;
  });
  repOptions += `<option value="all">-- แสดงทุกห้องเรียน (${sortedClasses.length} ห้อง) --</option>`;

  if (repFilter) {
    const currentVal = repFilter.value;
    repFilter.innerHTML = repOptions;
    if (currentVal && (sortedClasses.includes(currentVal) || currentVal === 'all')) {
      repFilter.value = currentVal;
    } else if (defaultRoom) {
      repFilter.value = defaultRoom;
    }
  }
}

function renderStudentsTable() {
  const tbody = document.getElementById('students-table-body');
  const summaryCard = document.getElementById('student-room-summary-card');
  const search = document.getElementById('student-search-input').value.toLowerCase().trim();
  const classFilter = document.getElementById('student-class-filter').value;

  const allStudents = Object.values(studentsData);
  if (allStudents.length === 0) {
    if (summaryCard) summaryCard.innerHTML = '';
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:36px;" class="text-muted"><i class="fa-solid fa-folder-open fa-2x" style="margin-bottom:8px; display:block; color:#94a3b8;"></i>ยังไม่มีข้อมูลนักเรียนในระบบ กรุณานำเข้าไฟล์ CSV หรือเพิ่มนักเรียนใหม่</td></tr>`;
    return;
  }

  // Filter students based on classroom and search
  const filteredStudents = allStudents.filter(std => {
    const cleanClass = (std.classLevel || '').trim().replace(/^"|"$/g, '');
    if (classFilter && classFilter !== 'all' && cleanClass !== classFilter) {
      return false;
    }
    if (search) {
      const searchStr = `${std.no || ''} ${std.studentId || ''} ${std.name || ''} ${std.classLevel || ''}`.toLowerCase();
      if (!searchStr.includes(search)) return false;
    }
    return true;
  });

  // Sort numerically by เลขที่ (no)
  filteredStudents.sort((a, b) => {
    const noA = parseInt(a.no) || 9999;
    const noB = parseInt(b.no) || 9999;
    if (noA !== noB) return noA - noB;
    return (a.studentId || '').localeCompare(b.studentId || '', 'th');
  });

  // Determine current room metadata
  let currentRoomTitle = classFilter && classFilter !== 'all' ? `ห้อง ${classFilter}` : `ทุกห้องเรียนทั้งหมด`;
  let advisors = new Set();
  filteredStudents.forEach(s => {
    if (s.advisor) advisors.add(s.advisor.trim().replace(/^"|"$/g, ''));
  });
  let advisorText = advisors.size > 0 ? Array.from(advisors).join(', ') : 'ยังไม่ระบุ';

  // Render Room Summary Card
  if (summaryCard) {
    summaryCard.innerHTML = `
      <div style="background:linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%); border:1px solid #bfdbfe; border-radius:14px; padding:14px 18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; box-shadow:0 2px 6px rgba(37,99,235,0.06);">
        <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
          <span class="badge badge-purple" style="font-size:0.95rem; padding:6px 14px; font-weight:800; border-radius:10px;">
            <i class="fa-solid fa-graduation-cap"></i> ${currentRoomTitle}
          </span>
          <div style="font-size:0.92rem; font-weight:700; color:#1e293b;">
            <i class="fa-solid fa-users" style="color:var(--primary);"></i> จำนวนนักเรียน: <span style="color:var(--primary);">${filteredStudents.length} คน</span>
          </div>
          <div style="font-size:0.9rem; color:#475569;">
            <i class="fa-solid fa-chalkboard-user" style="color:#0284c7;"></i> ครูที่ปรึกษา: <strong>${advisorText}</strong>
          </div>
        </div>
        <div style="font-size:0.82rem; color:#16a34a; font-weight:700; display:flex; align-items:center; gap:6px;">
          <i class="fa-solid fa-circle-check"></i> บัญชี Login ซิงค์อัตโนมัติ 100%
        </div>
      </div>
    `;
  }

  if (filteredStudents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:36px;" class="text-muted"><i class="fa-solid fa-magnifying-glass fa-2x" style="margin-bottom:8px; display:block; color:#94a3b8;"></i>ไม่พบรายชื่อนักเรียนในห้องนี้ หรือไม่ตรงกับคำค้นหา</td></tr>`;
    return;
  }

  let html = '';
  filteredStudents.forEach(std => {
    const hasUserAccount = usersData[std.studentId] ? true : false;
    const accountBadge = hasUserAccount 
      ? `<span class="badge badge-green" style="padding:4px 10px; font-size:0.8rem;"><i class="fa-solid fa-circle-check"></i> พร้อมใช้งาน</span>`
      : `<span class="badge badge-yellow" style="padding:4px 10px; font-size:0.8rem;"><i class="fa-solid fa-clock"></i> รอดำเนินการ</span>`;

    const cleanAdvisor = (std.advisor || '-').trim().replace(/^"|"$/g, '');
    const cleanClass = (std.classLevel || '-').trim().replace(/^"|"$/g, '');

    html += `
      <tr style="transition:background 0.2s ease;">
        <td style="text-align:center; font-weight:800; color:#334155; font-size:0.95rem;">${std.no || '-'}</td>
        <td>
          <span style="font-family:monospace; font-size:0.95rem; font-weight:700; color:#1d4ed8; background:#eff6ff; padding:3px 8px; border-radius:6px; border:1px solid #bfdbfe;">
            ${std.studentId}
          </span>
        </td>
        <td>
          <div style="font-weight:700; color:#0f172a; font-size:0.95rem;">${std.name}</div>
        </td>
        <td style="text-align:center;">
          <span class="badge badge-purple" style="font-size:0.82rem; padding:3px 10px; font-weight:700;">
            ${cleanClass}
          </span>
        </td>
        <td style="color:#334155; font-size:0.9rem;">
          <i class="fa-solid fa-user-tie" style="color:#94a3b8; margin-right:4px;"></i> ${cleanAdvisor}
        </td>
        <td style="text-align:center;">${accountBadge}</td>
        <td class="teacher-only" style="text-align:center;">
          <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent('${std.studentId}')" title="ลบข้อมูลนักเรียนคนนี้" style="padding:4px 8px; border-radius:8px;">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function openBatchDeleteStudentsModal() {
  if (!currentUser || currentUser.role === 'student') {
    showPopupError("ไม่มีสิทธิ์", "นักเรียนไม่มีสิทธิ์ดำเนินการนี้");
    return;
  }

  const allStudents = Object.values(studentsData);
  if (allStudents.length === 0) {
    showPopupWarning("ไม่พบข้อมูล", "ยังไม่มีรายชื่อนักเรียนในระบบให้ลบ");
    return;
  }

  // Count students per classroom
  const classCountMap = {};
  allStudents.forEach(s => {
    const c = (s.classLevel || 'ไม่ระบุห้อง').trim().replace(/^"|"$/g, '');
    classCountMap[c] = (classCountMap[c] || 0) + 1;
  });

  const sortedRooms = Object.keys(classCountMap).sort((a, b) => a.localeCompare(b, 'th', { numeric: true }));

  let optionsHtml = '';
  sortedRooms.forEach(room => {
    optionsHtml += `<option value="${room}">ห้อง ${room} (${classCountMap[room]} คน)</option>`;
  });
  optionsHtml += `<option value="ALL_CLASSES" style="color:#ef4444; font-weight:bold;">⚠️ ลบนักเรียนทั้งหมดทุกห้อง (${allStudents.length} คน)</option>`;

  Swal.fire({
    title: '<span style="font-weight:800; color:#0f172a;"><i class="fa-solid fa-trash-can" style="color:#ef4444;"></i> เลือกลบรายชื่อนักเรียน</span>',
    html: `
      <div style="text-align:left; font-size:0.95rem; color:#475569; margin-bottom:14px; line-height:1.5;">
        กรุณาเลือกห้องเรียนที่ต้องการลบข้อมูลนักเรียนและบัญชีผู้ใช้งานออกจากระบบ:
      </div>
      <select id="swal-batch-delete-class" class="swal2-select" style="width:100%; padding:10px 14px; font-weight:700; border-radius:10px; border:1.5px solid #cbd5e1; font-size:1rem; color:#0f172a; margin:0 0 14px 0;">
        ${optionsHtml}
      </select>
      <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:10px 14px; font-size:0.85rem; color:#991b1b; text-align:left;">
        <i class="fa-solid fa-triangle-exclamation"></i> <strong>คำเตือน:</strong> ข้อมูลนักเรียนและบัญชี Login ในห้องที่เลือกจะถูกลบออกจากฐานข้อมูลอย่างถาวร
      </div>
    `,
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: '<i class="fa-solid fa-trash-can"></i> ยืนยันการลบข้อมูล',
    cancelButtonText: 'ยกเลิก',
    preConfirm: () => {
      const selectedClass = document.getElementById('swal-batch-delete-class').value;
      if (!selectedClass) {
        Swal.showValidationMessage('กรุณาเลือกห้องเรียนที่ต้องการลบ');
        return false;
      }
      return selectedClass;
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const targetRoom = result.value;
      const studentsToDelete = allStudents.filter(s => {
        if (targetRoom === 'ALL_CLASSES') return true;
        const c = (s.classLevel || 'ไม่ระบุห้อง').trim().replace(/^"|"$/g, '');
        return c === targetRoom;
      });

      if (studentsToDelete.length === 0) {
        showPopupWarning("ไม่พบข้อมูล", "ไม่พบนักเรียนในห้องที่เลือก");
        return;
      }

      // Execute batch deletion
      const deletePromises = [];
      studentsToDelete.forEach(s => {
        deletePromises.push(deleteData(`students/${s.studentId}`));
        deletePromises.push(deleteData(`users/${s.studentId}`));
      });

      Promise.all(deletePromises).then(() => {
        const roomNameText = targetRoom === 'ALL_CLASSES' ? 'ทุกห้องเรียน' : `ห้อง ${targetRoom}`;
        showPopupSuccess("ลบรายชื่อสำเร็จ!", `ลบข้อมูลนักเรียน ${roomNameText} จำนวน ${studentsToDelete.length} คน เรียบร้อยแล้ว`);
        logActivity(`ลบรายชื่อนักเรียน ${roomNameText} จำนวน ${studentsToDelete.length} คน`);
        
        // Auto refresh
        updateClassFilterDropdowns();
        renderStudentsTable();
      });
    }
  });
}

function openAddStudentModal() {
  document.getElementById('std-no').value = '';
  document.getElementById('std-id').value = '';
  document.getElementById('std-name').value = '';
  document.getElementById('std-class').value = '';
  populateTeacherDropdowns();
  openModal('modal-add-student');
}

function saveStudentForm(e) {
  e.preventDefault();
  const no = document.getElementById('std-no').value;
  const studentId = document.getElementById('std-id').value.trim();
  const name = document.getElementById('std-name').value.trim();
  const classLevel = document.getElementById('std-class').value.trim();
  const advisor = document.getElementById('std-advisor').value.trim();

  // Save student record
  saveData(`students/${studentId}`, {
    no,
    studentId,
    name,
    classLevel,
    advisor
  });

  // Auto-sync Student Login User Credential (Username & Password = Student ID)
  saveData(`users/${studentId}`, {
    username: studentId,
    password: studentId,
    name: name,
    role: 'student',
    studentId: studentId,
    classLevel: classLevel
  });

  closeModal('modal-add-student');
  showPopupSuccess("บันทึกข้อมูลสำเร็จ!", `เพิ่มนักเรียน ${name} (รหัส ${studentId}) เข้าสู่ระบบเรียบร้อยแล้ว`);
  logActivity(`เพิ่มนักเรียนใหม่: ${name} (รหัส ${studentId})`);
}

function deleteStudent(studentId) {
  showPopupConfirm("ยืนยันลบข้อมูลนักเรียน", `คุณต้องการลบข้อมูลนักเรียนรหัส ${studentId} ใช่หรือไม่?`, "ลบข้อมูล", "warning").then((confirmed) => {
    if (confirmed) {
      deleteData(`students/${studentId}`);
      deleteData(`users/${studentId}`);
      showPopupSuccess("ลบข้อมูลสำเร็จ", `ลบข้อมูลนักเรียนรหัส ${studentId} เรียบร้อยแล้ว`);
      logActivity(`ลบข้อมูลนักเรียนรหัส ${studentId}`);
    }
  });
}

function openImportCsvModal() {
  document.getElementById('csv-file-input').value = '';
  openModal('modal-import-csv');
}

function processCsvImport(e) {
  e.preventDefault();
  const fileInput = document.getElementById('csv-file-input');
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const text = evt.target.result;
    parseAndImportCsvData(text);
  };
  reader.readAsText(file, 'UTF-8');
}

function parseAndImportCsvData(csvText) {
  // Normalize line endings
  const lines = csvText.split(/\r\n|\n|\r/);
  if (lines.length < 2) {
    showPopupWarning("ไม่พบข้อมูล", "ไฟล์ CSV ไม่มีข้อมูลเพียงพอ");
    return;
  }

  // Parse Headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^[\uFEFF]/, ''));
  
  // Required Header Names: เลขที่, รหัสประจำตัว, ชื่อ-สกุล, ระดับชั้น, ครูที่ปรึกษา
  const idxNo = headers.findIndex(h => h.includes('เลขที่'));
  const idxId = headers.findIndex(h => h.includes('รหัสประจำตัว') || h.includes('รหัส'));
  const idxName = headers.findIndex(h => h.includes('ชื่อ-สกุล') || h.includes('ชื่อ'));
  const idxClass = headers.findIndex(h => h.includes('ระดับชั้น') || h.includes('ชั้น'));
  const idxAdvisor = headers.findIndex(h => h.includes('ครูที่ปรึกษา') || h.includes('ครู'));

  if (idxId === -1 || idxName === -1) {
    showPopupError("รูปแบบไฟล์ไม่ถูกต้อง", "รูปแบบคอลัมน์ CSV ไม่ถูกต้อง กรุณาตรวจสอบหัวคอลัมน์: เลขที่, รหัสประจำตัว, ชื่อ-สกุล, ระดับชั้น, ครูที่ปรึกษา");
    return;
  }

  let importedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row = line.split(',').map(cell => cell.trim().replace(/^"(.*)"$/, '$1'));
    const studentId = row[idxId];
    const name = row[idxName];

    if (studentId && name) {
      const no = idxNo !== -1 ? row[idxNo] : i;
      const classLevel = idxClass !== -1 ? row[idxClass] : '';
      const advisor = idxAdvisor !== -1 ? row[idxAdvisor] : '';

      // Save Student
      saveData(`students/${studentId}`, {
        no,
        studentId,
        name,
        classLevel,
        advisor
      });

      // Auto-create Student User Account (Username = Student ID, Password = Student ID)
      saveData(`users/${studentId}`, {
        username: studentId,
        password: studentId,
        name: name,
        role: 'student',
        studentId: studentId,
        classLevel: classLevel
      });

      importedCount++;
    }
  }

  closeModal('modal-import-csv');
  showPopupSuccess("นำเข้าข้อมูลสำเร็จ!", `นำข้อมูลนักเรียนเข้าสู่ระบบสำเร็จจำนวน ${importedCount} รายการ!`);
  logActivity(`นำเข้าข้อมูลนักเรียนด้วย CSV จำนวน ${importedCount} คน`);
}


/* -------------------------------------------------------------
   6. COURSES & HOMEWORK MANAGEMENT
------------------------------------------------------------- */
function populateTeacherDropdowns() {
  const courseTeacherSelect = document.getElementById('course-teacher');
  const editCourseTeacherSelect = document.getElementById('edit-course-teacher');
  const stdAdvisorSelect = document.getElementById('std-advisor');

  // Collect teachers and admins from usersData, coursesData, studentsData, and currentUser
  const teachers = [];

  // 1. From usersData
  Object.values(usersData).forEach(u => {
    if (u.name && (u.role === 'teacher' || u.role === 'admin' || !u.role)) {
      teachers.push(u.name.trim().replace(/^"|"$/g, ''));
    }
  });

  // 2. From coursesData
  Object.values(coursesData).forEach(c => {
    if (c.teacher && c.teacher.trim()) {
      teachers.push(c.teacher.trim().replace(/^"|"$/g, ''));
    }
  });

  // 3. From studentsData advisors
  Object.values(studentsData).forEach(s => {
    if (s.advisor && s.advisor.trim()) {
      teachers.push(s.advisor.trim().replace(/^"|"$/g, ''));
    }
  });

  // 4. Current user
  if (currentUser && currentUser.name) {
    teachers.push(currentUser.name.trim().replace(/^"|"$/g, ''));
  }

  // Unique teacher names
  const uniqueTeachers = Array.from(new Set(teachers.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'th'));

  let optionsCourse = `<option value="">-- เลือกครูผู้สอน --</option>`;
  let optionsAdvisor = `<option value="">-- เลือกครูที่ปรึกษา --</option>`;

  uniqueTeachers.forEach(tName => {
    optionsCourse += `<option value="${tName}">${tName}</option>`;
    optionsAdvisor += `<option value="${tName}">${tName}</option>`;
  });

  if (courseTeacherSelect) {
    courseTeacherSelect.innerHTML = optionsCourse;
    if (currentUser && currentUser.name && uniqueTeachers.includes(currentUser.name)) {
      courseTeacherSelect.value = currentUser.name;
    }
  }

  if (editCourseTeacherSelect) {
    editCourseTeacherSelect.innerHTML = optionsCourse;
  }

  if (stdAdvisorSelect) {
    stdAdvisorSelect.innerHTML = optionsAdvisor;
  }
}

function renderTargetClassChips(containerId, courseId, selectedClasses = ['all']) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Gather distinct classes from studentsData
  const classLevels = new Set();
  Object.values(studentsData).forEach(s => {
    if (s.classLevel && s.classLevel.trim()) {
      classLevels.add(s.classLevel.trim());
    }
  });

  // Also include course level if available
  const course = coursesData[courseId];
  if (course && course.level) {
    classLevels.add(course.level.trim());
  }

  // Sort classes
  const sortedClasses = Array.from(classLevels).sort((a, b) => a.localeCompare(b, 'th'));

  // Normalize selectedClasses
  if (typeof selectedClasses === 'string') {
    selectedClasses = selectedClasses.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(selectedClasses) || selectedClasses.length === 0) {
    selectedClasses = ['all'];
  }

  const isAll = selectedClasses.includes('all');

  let html = `
    <label class="target-chip ${isAll ? 'active' : ''}" onclick="toggleTargetClassChip('${containerId}', 'all', this)">
      <input type="checkbox" value="all" ${isAll ? 'checked' : ''} style="display:none;">
      <i class="fa-solid fa-globe"></i> ทุกห้องเรียน (ทั้งหมด)
    </label>
  `;

  sortedClasses.forEach(cls => {
    const isChecked = !isAll && selectedClasses.includes(cls);
    html += `
      <label class="target-chip ${isChecked ? 'active' : ''}" onclick="toggleTargetClassChip('${containerId}', '${cls}', this)">
        <input type="checkbox" value="${cls}" ${isChecked ? 'checked' : ''} style="display:none;">
        <i class="fa-solid fa-graduation-cap"></i> ห้อง ${cls}
      </label>
    `;
  });

  container.innerHTML = html;
  updateTargetChipsSummary(containerId);
}

function toggleTargetClassChip(containerId, value, labelEl) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const chips = container.querySelectorAll('.target-chip');
  const allChip = container.querySelector('.target-chip input[value="all"]')?.parentElement;

  if (value === 'all') {
    // If clicking "all", select "all" and uncheck all specific rooms
    chips.forEach(chip => {
      const input = chip.querySelector('input');
      if (input.value === 'all') {
        input.checked = true;
        chip.classList.add('active');
      } else {
        input.checked = false;
        chip.classList.remove('active');
      }
    });
  } else {
    // Specific room chip toggled
    const input = labelEl.querySelector('input');
    const newState = !input.checked;
    input.checked = newState;
    if (newState) {
      labelEl.classList.add('active');
      // Uncheck "all"
      if (allChip) {
        allChip.querySelector('input').checked = false;
        allChip.classList.remove('active');
      }
    } else {
      labelEl.classList.remove('active');
    }

    // If no room is checked, revert back to "all"
    const anyChecked = Array.from(chips).some(chip => {
      const inp = chip.querySelector('input');
      return inp.value !== 'all' && inp.checked;
    });

    if (!anyChecked && allChip) {
      allChip.querySelector('input').checked = true;
      allChip.classList.add('active');
    }
  }

  updateTargetChipsSummary(containerId);
}

function updateTargetChipsSummary(containerId) {
  const selected = getSelectedTargetClasses(containerId);
  let summaryId = 'hw-target-summary';
  if (containerId === 'hw-target-chips-container') summaryId = 'hw-target-summary';
  else if (containerId === 'edit-hw-target-chips-container') summaryId = 'edit-hw-target-summary';
  else if (containerId === 'quiz-target-chips-container') summaryId = 'quiz-target-summary';
  else if (containerId === 'edit-quiz-target-chips-container') summaryId = 'edit-quiz-target-summary';

  const summaryEl = document.getElementById(summaryId);
  if (!summaryEl) return;

  if (selected.includes('all')) {
    summaryEl.innerText = 'ทุกห้องเรียน';
  } else {
    summaryEl.innerText = `เลือกแล้ว (${selected.length} ห้อง): ${selected.join(', ')}`;
  }
}

function onQuizCourseChange(courseId) {
  renderTargetClassChips('quiz-target-chips-container', courseId, ['all']);
}

function onEditQuizCourseChange(courseId) {
  renderTargetClassChips('edit-quiz-target-chips-container', courseId, ['all']);
}

function getSelectedTargetClasses(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return ['all'];

  const checkedInputs = Array.from(container.querySelectorAll('input:checked'));
  const values = checkedInputs.map(inp => inp.value);

  if (values.includes('all') || values.length === 0) {
    return ['all'];
  }
  return values;
}

function updateCourseDropdowns() {
  const hwCourseSelect = document.getElementById('hw-course-id');
  const quizCourseSelect = document.getElementById('quiz-course-id');
  const repCourseFilter = document.getElementById('report-course-filter');

  let options = `<option value="">-- เลือกรายวิชา --</option>`;
  Object.keys(coursesData).forEach(id => {
    const c = coursesData[id];
    options += `<option value="${id}">${c.code} ${c.name} (${c.level})</option>`;
  });

  if (hwCourseSelect) hwCourseSelect.innerHTML = options;
if (quizCourseSelect) quizCourseSelect.innerHTML = options;
  if (repCourseFilter) repCourseFilter.innerHTML = `<option value="">-- ทุกรายวิชา --</option>` + options.replace('<option value="">-- เลือกรายวิชา --</option>', '');
}

function formatThaiDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const day = parseInt(parts[2]);
      const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const thaiYear = year > 2500 ? year : year + 543;
      return `${day} ${months[month - 1]} ${thaiYear}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
}

function populateGradeLevelDropdowns(selectId, selectedValue = '') {
  const selectEl = document.getElementById(selectId);
  if (!selectEl) return;

  // 1. Extract base grade levels from studentsData (e.g. 'ม.1/1' -> 'ม.1', 'ปวช.2/2' -> 'ปวช.2')
  const systemLevels = new Set();
  Object.values(studentsData).forEach(s => {
    if (s.classLevel && s.classLevel.trim()) {
      const fullClass = s.classLevel.trim();
      const baseLevel = fullClass.includes('/') ? fullClass.split('/')[0].trim() : fullClass;
      if (baseLevel) systemLevels.add(baseLevel);
    }
  });

  // 2. Extract existing levels from coursesData
  Object.values(coursesData).forEach(c => {
    if (c.level && c.level.trim()) {
      const courseLvl = c.level.includes('/') ? c.level.split('/')[0].trim() : c.level.trim();
      if (courseLvl) systemLevels.add(courseLvl);
    }
  });

  // If selectedValue is present, ensure it's included
  if (selectedValue && selectedValue.trim()) {
    systemLevels.add(selectedValue.trim());
  }

  // Fallback if system has no students or courses yet
  if (systemLevels.size === 0) {
    ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6', 'ปวช.1', 'ปวช.2', 'ปวช.3'].forEach(l => systemLevels.add(l));
  }

  // Sort natural Thai order
  const sortedLevels = Array.from(systemLevels).sort((a, b) => a.localeCompare(b, 'th'));

  let html = `<option value="">-- เลือกระดับชั้น --</option>`;
  sortedLevels.forEach(lvl => {
    html += `<option value="${lvl}">ระดับชั้น ${lvl}</option>`;
  });
  html += `<option value="__custom__">+ กำหนดระดับชั้นอื่น (เพิ่มใหม่)...</option>`;

  selectEl.innerHTML = html;

  if (selectedValue) {
    selectEl.value = selectedValue;
  }

  selectEl.onchange = function() {
    if (this.value === '__custom__') {
      promptCustomGradeLevel(selectId);
    }
  };
}

function promptCustomGradeLevel(selectId) {
  const selectEl = document.getElementById(selectId);
  if (!selectEl) return;

  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'กำหนดระดับชั้นใหม่',
      text: 'กรอกชื่อระดับชั้นที่ต้องการ (เช่น ม.1, ม.2, ปวช.1, ปวช.2):',
      input: 'text',
      inputPlaceholder: 'เช่น ปวช.3 พิเศษ',
      showCancelButton: true,
      confirmButtonText: 'บันทึกระดับชั้น',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#2563eb',
      customClass: { popup: 'swal2-popup' },
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'กรุณากรอกชื่อระดับชั้น!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const customVal = result.value.trim();
        let opt = selectEl.querySelector(`option[value="${customVal}"]`);
        if (!opt) {
          opt = document.createElement('option');
          opt.value = customVal;
          opt.text = customVal;
          selectEl.insertBefore(opt, selectEl.lastElementChild);
        }
        selectEl.value = customVal;
      } else {
        selectEl.value = '';
      }
    });
  } else {
    const customVal = prompt('กรุณากรอกชื่อระดับชั้น (เช่น ม.1, ปวช.2):');
    if (customVal && customVal.trim()) {
      const val = customVal.trim();
      let opt = selectEl.querySelector(`option[value="${val}"]`);
      if (!opt) {
        opt = document.createElement('option');
        opt.value = val;
        opt.text = val;
        selectEl.appendChild(opt);
      }
      selectEl.value = val;
    } else {
      selectEl.value = '';
    }
  }
}

function openAddCourseModal() {
  document.getElementById('course-code').value = '';
  document.getElementById('course-name').value = '';
  populateGradeLevelDropdowns('course-level');
  populateTeacherDropdowns();
  openModal('modal-add-course');
}

function saveCourseForm(e) {
  e.preventDefault();
  const code = document.getElementById('course-code').value.trim();
  const name = document.getElementById('course-name').value.trim();
  const level = document.getElementById('course-level').value.trim();
  const teacher = document.getElementById('course-teacher').value.trim();

  pushData('courses', {
    code,
    name,
    level,
    teacher,
    createdAt: new Date().toISOString()
  }).then(() => {
    closeModal('modal-add-course');
    showPopupSuccess("สร้างรายวิชาสำเร็จ!", `สร้างรายวิชา ${code} ${name} เรียบร้อยแล้ว`);
    logActivity(`สร้างรายวิชาใหม่: ${code} ${name}`);
  });
}

function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const str = url.trim();
  if (!str) return null;

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = str.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  
  if (str.includes('youtube.com/embed/')) {
    return str;
  }
  return null;
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function openCreateHomeworkModal(preselectedCourseId = '') {
  document.getElementById('hw-title').value = '';
  document.getElementById('hw-desc').value = '';
  document.getElementById('hw-max-score').value = 10;
  document.getElementById('hw-due-date').value = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  document.getElementById('hw-youtube-url').value = '';
  document.getElementById('hw-img-file').value = '';

  const courseSelect = document.getElementById('hw-course-id');
  if (courseSelect && preselectedCourseId) {
    courseSelect.value = preselectedCourseId;
  }

  const courseId = courseSelect ? courseSelect.value : '';
  renderTargetClassChips('hw-target-chips-container', courseId, ['all']);

  openModal('modal-create-homework');
}

async function saveHomeworkForm(e) {
  e.preventDefault();
  const courseId = document.getElementById('hw-course-id').value;
  const targetClasses = getSelectedTargetClasses('hw-target-chips-container');
  const targetClass = targetClasses.join(', ');
  const title = document.getElementById('hw-title').value.trim();
  const desc = document.getElementById('hw-desc').value.trim();
  const maxScore = parseInt(document.getElementById('hw-max-score').value) || 10;
  const dueDate = document.getElementById('hw-due-date').value;
  const youtubeUrl = document.getElementById('hw-youtube-url').value.trim();
  const imgFile = document.getElementById('hw-img-file').files[0];

  const btnSave = document.getElementById('btn-save-hw');
  btnSave.disabled = true;
  btnSave.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึกการบ้าน...`;

  let pdfs = null;
  let imageUrl = null;

  if (imgFile) {
    // Convert to Base64 Data URL via FileReader (data:application/pdf;base64,...)
    const base64Data = await readFileAsBase64(imgFile);
    imageUrl = base64Data;
    pdfs = [{ name: imgFile.name, url: base64Data, size: imgFile.size }];
  }

  const newHw = {
    courseId,
    targetClasses,
    targetClass,
    title,
    desc,
    maxScore,
    dueDate,
    youtubeUrl: youtubeUrl || null,
    imageUrl,
    pdfs,
    createdAt: new Date().toISOString(),
    createdBy: currentUser.name
  };

  pushData('homework', newHw).then((newKey) => {
    btnSave.disabled = false;
    btnSave.innerHTML = `<i class="fa-solid fa-paper-plane"></i> ประกาศการบ้าน`;
    closeModal('modal-create-homework');

    // Backup to local client cache (localStorage)
    if (newKey) {
      homeworkData[newKey] = newHw;
      try {
        localStorage.setItem('ag_homework', JSON.stringify(homeworkData));
      } catch (e) {}
    }

    showPopupSuccess("ประกาศการบ้านสำเร็จ!", `มอบหมายการบ้าน ${title} และบันทึกไฟล์เอกสารเรียบร้อยแล้ว`);
    logActivity(`สั่งการบ้านใหม่: ${title}`);
  });
}

function resetCourseFilters() {
  const searchInput = document.getElementById('course-search-input');
  const levelFilter = document.getElementById('course-level-filter');
  if (searchInput) searchInput.value = '';
  if (levelFilter) levelFilter.value = 'all';
  renderCoursesList();
}

function renderCoursesList() {
  const container = document.getElementById('courses-list-container');
  if (!container) return;

  const searchInput = document.getElementById('course-search-input');
  const levelFilter = document.getElementById('course-level-filter');
  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedLevel = levelFilter ? levelFilter.value : 'all';

  let courseKeys = Object.keys(coursesData);
  const isStudent = currentUser && currentUser.role === 'student';
  const studentClass = (currentUser && currentUser.classLevel) ? currentUser.classLevel.trim() : '';

  // Populate level filter dropdown dynamically
  if (levelFilter && levelFilter.options.length <= 1) {
    const levelSet = new Set();
    Object.values(coursesData).forEach(c => {
      if (c.level && c.level.trim()) levelSet.add(c.level.trim());
    });
    const sortedLevels = Array.from(levelSet).sort((a, b) => a.localeCompare(b, 'th', { numeric: true }));
    let levelOpts = `<option value="all">-- ทุกระดับชั้น --</option>`;
    sortedLevels.forEach(lvl => {
      levelOpts += `<option value="${lvl}">ระดับชั้น ${lvl}</option>`;
    });
    levelFilter.innerHTML = levelOpts;
  }

  // Student eligibility filter
  if (isStudent) {
    courseKeys = courseKeys.filter(courseId => {
      return isStudentEligibleForCourse(studentClass, coursesData[courseId]);
    });
  }

  // Level filter
  if (selectedLevel !== 'all') {
    courseKeys = courseKeys.filter(courseId => {
      const c = coursesData[courseId];
      return (c.level || '').trim() === selectedLevel;
    });
  }

  // Search filter
  if (searchQuery) {
    courseKeys = courseKeys.filter(courseId => {
      const c = coursesData[courseId];
      const matchCourse = (c.name || '').toLowerCase().includes(searchQuery) ||
                          (c.code || '').toLowerCase().includes(searchQuery) ||
                          (c.teacher || '').toLowerCase().includes(searchQuery);
      if (matchCourse) return true;

      // Also search through its homeworks
      const hasMatchingHw = Object.values(homeworkData).some(hw => {
        return hw.courseId === courseId && (
          (hw.title || '').toLowerCase().includes(searchQuery) ||
          (hw.desc || '').toLowerCase().includes(searchQuery)
        );
      });
      return hasMatchingHw;
    });
  }

  if (courseKeys.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:48px 20px; background:#f8fafc; border:2px dashed #cbd5e1; border-radius:18px; margin:10px 0;">
        <div style="width:64px; height:64px; border-radius:50%; background:#eff6ff; color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:1.8rem; margin:0 auto 16px;">
          <i class="fa-solid fa-folder-open"></i>
        </div>
        <h4 style="font-size:1.2rem; font-weight:800; color:#0f172a; margin-bottom:6px;">${searchQuery ? 'ไม่พบรายวิชาหรือการบ้านที่ค้นหา' : (isStudent ? 'ยังไม่มีรายวิชาสำหรับห้องเรียนของคุณ' : 'ยังไม่มีรายวิชาในระบบ')}</h4>
        <p style="color:#64748b; font-size:0.9rem; margin-bottom:18px;">${searchQuery ? `ไม่พบข้อมูลที่ตรงกับคำค้นหา "${searchQuery}"` : (isStudent ? 'เมื่อคุณครูเพิ่มรายวิชาสำหรับระดับชั้นของคุณ รายวิชาจะปรากฏที่นี่โดยอัตโนมัติ' : 'คุณครูสามารถสร้างรายวิชาและมอบหมายการบ้านเพื่อเริ่มต้นการเรียนการสอนได้ทันที')}</p>
        ${(currentUser && currentUser.role !== 'student' && !searchQuery) ? `
          <button class="btn btn-primary" onclick="openAddCourseModal()" style="border-radius:10px; font-weight:700;">
            <i class="fa-solid fa-plus-circle"></i> สร้างรายวิชาแรก
          </button>
        ` : ''}
      </div>
    `;
    return;
  }

  const courseThemes = [
    { cls: 'course-theme-blue', border: '#2563eb', icon: 'fa-solid fa-code' },
    { cls: 'course-theme-indigo', border: '#4f46e5', icon: 'fa-solid fa-microchip' },
    { cls: 'course-theme-emerald', border: '#059669', icon: 'fa-solid fa-laptop-code' },
    { cls: 'course-theme-purple', border: '#7e22ce', icon: 'fa-solid fa-robot' },
    { cls: 'course-theme-amber', border: '#ea580c', icon: 'fa-solid fa-book-open' }
  ];

  let html = '';
  courseKeys.forEach((courseId, index) => {
    const course = coursesData[courseId];
    const theme = courseThemes[index % courseThemes.length];
    const cleanTeacher = (course.teacher || 'ยังไม่ระบุ').trim().replace(/^"|"$/g, '');
    const cleanCode = (course.code || '-').trim();
    
    // Find homeworks for this course
    const courseHws = Object.keys(homeworkData)
      .filter(hwId => {
        const hw = homeworkData[hwId];
        if (hw.courseId !== courseId) return false;

        // Target classroom visibility filter for students
        if (isStudent) {
          return isStudentEligibleForHomework(studentClass, hw);
        }
        return true;
      })
      .map(hwId => ({ id: hwId, ...homeworkData[hwId] }));

    html += `
      <div class="course-card-modern">
        <!-- Vibrant Hero Banner -->
        <div class="course-hero-banner ${theme.cls}">
          <div style="flex:1; min-width:260px;">
            <div class="course-meta-pills">
              <span class="course-pill-code">
                <i class="${theme.icon}"></i> ${cleanCode}
              </span>
              <span class="course-pill-level">
                <i class="fa-solid fa-graduation-cap"></i> ระดับชั้น ${course.level || '-'}
              </span>
              <span class="course-pill-count">
                <i class="fa-solid fa-clipboard-list" style="color:${theme.border};"></i> ${courseHws.length} ชิ้นงาน
              </span>
            </div>
            <h3 class="course-title-text">${course.name}</h3>
            <div class="course-teacher-info">
              <i class="fa-solid fa-chalkboard-user"></i> ครูผู้สอน: <span>${cleanTeacher}</span>
            </div>
          </div>

          ${(currentUser && currentUser.role !== 'student') ? `
            <div class="course-hero-actions">
              <button class="course-glass-btn btn-glass-success" onclick="openCreateHomeworkModal('${courseId}')" title="สั่งการบ้านในวิชานี้">
                <i class="fa-solid fa-plus-circle"></i> สั่งการบ้าน
              </button>
              <button class="course-glass-btn" onclick="openEditCourseModal('${courseId}')" title="แก้ไขข้อมูลวิชา">
                <i class="fa-solid fa-pen-to-square"></i> แก้ไขวิชา
              </button>
              <button class="course-glass-btn btn-glass-danger" onclick="deleteCourse('${courseId}')" title="ลบรายวิชานี้">
                <i class="fa-solid fa-trash-can"></i> ลบวิชา
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Course Content & Homework Grid -->
        <div class="course-card-content">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #f1f5f9;">
            <div style="font-size:1.05rem; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:8px;">
              <i class="fa-solid fa-layer-group" style="color:${theme.border};"></i> รายการการบ้านและภาระงาน (${courseHws.length} ชิ้น)
            </div>
          </div>
    `;

    if (courseHws.length === 0) {
      html += `
        <div style="padding:28px 20px; background:#f8fafc; border:1.5px dashed #cbd5e1; border-radius:14px; text-align:center; color:#64748b; font-size:0.92rem; margin:10px 0;">
          <i class="fa-solid fa-inbox" style="font-size:1.6rem; color:#94a3b8; display:block; margin-bottom:6px;"></i>
          ยังไม่มีการบ้านในวิชานี้ (หรือไม่มีงานที่มอบหมายให้ห้องของคุณ)
        </div>
      `;
    } else {
      html += `<div class="homework-grid">`;
      courseHws.forEach(hw => {
        const studentSub = (submissionsData[hw.id] && currentUser.studentId) 
          ? submissionsData[hw.id][currentUser.studentId] 
          : null;
        
        const subCount = submissionsData[hw.id] ? Object.keys(submissionsData[hw.id]).length : 0;
        
        // Extract PDF / Attachment file info
        let fileUrl = null;
        let fileName = hw.title || 'เอกสารคำสั่งงาน';
        if (hw.pdfs && Array.isArray(hw.pdfs) && hw.pdfs.length > 0 && hw.pdfs[0].url) {
          fileUrl = hw.pdfs[0].url;
          if (hw.pdfs[0].name) fileName = hw.pdfs[0].name;
        } else if (hw.imageUrl) {
          fileUrl = hw.imageUrl;
        }

        const isPdf = fileUrl && (fileUrl.includes('application/pdf') || fileUrl.includes('.pdf') || fileUrl.toLowerCase().includes('pdf'));
        const targets = hw.targetClasses || (hw.targetClass ? hw.targetClass.split(',').map(s => s.trim()) : ['all']);
        const isTargetAll = targets.includes('all') || targets.length === 0;
        const targetLabel = isTargetAll ? 'ทุกห้องเรียน' : 'ห้อง ' + targets.join(', ');
        const embedUrl = getYouTubeEmbedUrl(hw.youtubeUrl);

        html += `
          <div class="homework-card-modern" style="border-top-color:${theme.border};">
            <div>
              <!-- Top Badges -->
              <div class="hw-card-top">
                <span class="badge ${isTargetAll ? 'badge-purple' : 'badge-yellow'}" style="font-size:0.8rem; font-weight:700; padding:4px 10px; border-radius:8px;">
                  <i class="${isTargetAll ? 'fa-solid fa-globe' : 'fa-solid fa-chalkboard'}"></i> ${targetLabel}
                </span>
                <span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-weight:800; font-size:0.8rem; padding:4px 10px; border-radius:8px;">
                  <i class="fa-solid fa-star"></i> เต็ม ${hw.maxScore} คะแนน
                </span>
              </div>

              <!-- Title & Description -->
              <h4 class="hw-title-text">${hw.title}</h4>
              <div class="hw-desc-text">${hw.desc || 'ไม่มีคำอธิบายเพิ่มเติม'}</div>

              <!-- YouTube Embed -->
              ${embedUrl ? `
                <div style="margin:10px 0; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 2px 8px rgba(0,0,0,0.1); background:#000;">
                  <div style="position:relative; padding-bottom:56.25%; height:0;">
                    <iframe src="${embedUrl}" title="${hw.title || 'YouTube video'}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                  </div>
                </div>
              ` : ''}
              
              <!-- PDF / Image Attachment Button -->
              ${fileUrl ? `
                <div style="margin:8px 0;">
                  <button type="button" class="hw-attachment-btn" onclick="showPDFPreviewModal('${fileUrl.replace(/'/g, "\\'")}', '${fileName.replace(/'/g, "\\'")}')">
                    <i class="${isPdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-image'}" style="font-size:1.2rem; color:${isPdf ? '#ef4444' : '#2563eb'};"></i> 
                    <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">📄 ${fileName}</span>
                    <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem; opacity:0.6;"></i>
                  </button>
                </div>
              ` : ''}

              <!-- Due Date -->
              <div class="hw-due-date-badge">
                <i class="fa-regular fa-calendar-check" style="color:${theme.border}; font-size:0.92rem;"></i> กำหนดส่ง: <span style="color:#1e293b; font-weight:700;">${formatThaiDate(hw.dueDate)}</span>
              </div>
            </div>

            <!-- Footer Controls -->
            <div class="hw-card-bottom">
              ${(currentUser && currentUser.role === 'student') ? `
                ${studentSub ? `
                  <div style="display:flex; justify-content:space-between; align-items:center; background:#ecfdf5; border:1.5px solid #a7f3d0; border-radius:10px; padding:8px 12px; width:100%;">
                    <span style="color:#059669; font-weight:700; font-size:0.86rem;"><i class="fa-solid fa-circle-check"></i> ส่งงานเรียบร้อยแล้ว</span>
                    <span class="badge ${studentSub.score !== undefined ? 'badge-green' : 'badge-yellow'}" style="font-weight:800; font-size:0.84rem; padding:4px 10px;">
                      ${studentSub.score !== undefined ? studentSub.score + ' / ' + hw.maxScore + ' คะแนน' : 'รอตรวจ'}
                    </span>
                  </div>
                ` : `
                  <button class="btn btn-primary" onclick="openSubmitHomeworkModal('${hw.id}')" style="width:100%; border-radius:10px; font-weight:800; padding:9px 14px; background:linear-gradient(135deg, #2563eb, #1d4ed8); box-shadow:0 4px 12px rgba(37,99,235,0.3);">
                    <i class="fa-solid fa-cloud-arrow-up"></i> ส่งการบ้านชิ้นนี้
                  </button>
                `}
              ` : `
                <span class="badge badge-purple" style="font-size:0.82rem; font-weight:700; padding:6px 12px; border-radius:8px;">
                  <i class="fa-solid fa-user-check"></i> ส่งแล้ว ${subCount} คน
                </span>
                <div style="display:flex; gap:6px;">
                  <button class="btn btn-sm btn-primary" onclick="openGradeSubmissionsModal('${hw.id}')" title="ตรวจงานนักเรียน" style="border-radius:8px; font-weight:700; padding:6px 12px; box-shadow:0 2px 6px rgba(37,99,235,0.25);">
                    <i class="fa-solid fa-clipboard-check"></i> ตรวจงาน
                  </button>
                  <button class="btn btn-sm btn-outline-primary" onclick="openEditHomeworkModal('${hw.id}')" title="แก้ไขการบ้าน" style="border-radius:8px; padding:6px 9px;">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" onclick="deleteHomework('${hw.id}')" title="ลบการบ้าน" style="border-radius:8px; padding:6px 9px;">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              `}
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function deleteCourse(courseId) {
  if (!currentUser || currentUser.role === 'student') {
    showPopupError("ไม่มีสิทธิ์ดำเนินการ", "นักเรียนไม่มีสิทธิ์ลบรายวิชา");
    return;
  }
  showPopupConfirm("ยืนยันลบรายวิชา", "คุณต้องการลบรายวิชานี้และข้อมูลการบ้านทั้งหมดใช่หรือไม่?", "ลบรายวิชา", "warning").then((confirmed) => {
    if (confirmed) {
      deleteData(`courses/${courseId}`);
      showPopupSuccess("ลบรายวิชาสำเร็จ", "ลบข้อมูลรายวิชาเรียบร้อยแล้ว");
      logActivity(`ลบรายวิชา`);
    }
  });
}

function openEditCourseModal(courseId) {
  if (!currentUser || currentUser.role === 'student') {
    showPopupError("ไม่มีสิทธิ์ดำเนินการ", "นักเรียนไม่มีสิทธิ์แก้ไขรายวิชา");
    return;
  }
  const course = coursesData[courseId];
  if (!course) return;

  document.getElementById('edit-course-id').value = courseId;
  document.getElementById('edit-course-code').value = course.code || '';
  document.getElementById('edit-course-name').value = course.name || '';
  
  populateGradeLevelDropdowns('edit-course-level', course.level || '');
  populateTeacherDropdowns();

  const teacherSelect = document.getElementById('edit-course-teacher');
  if (teacherSelect) {
    const courseTeacher = (course.teacher || '').trim().replace(/^"|"$/g, '');
    if (courseTeacher) {
      let exists = Array.from(teacherSelect.options).some(opt => opt.value === courseTeacher);
      if (!exists) {
        const newOpt = document.createElement('option');
        newOpt.value = courseTeacher;
        newOpt.textContent = courseTeacher;
        teacherSelect.appendChild(newOpt);
      }
      teacherSelect.value = courseTeacher;
    }
  }

  openModal('modal-edit-course');
}

function saveEditCourseForm(e) {
  e.preventDefault();
  if (!currentUser || currentUser.role === 'student') {
    showPopupError("ไม่มีสิทธิ์ดำเนินการ", "นักเรียนไม่มีสิทธิ์แก้ไขรายวิชา");
    return;
  }
  const courseId = document.getElementById('edit-course-id').value;
  const code = document.getElementById('edit-course-code').value.trim();
  const name = document.getElementById('edit-course-name').value.trim();
  const level = document.getElementById('edit-course-level').value.trim();
  const teacher = document.getElementById('edit-course-teacher').value.trim();

  updateData(`courses/${courseId}`, {
    code,
    name,
    level,
    teacher,
    updatedAt: new Date().toISOString()
  }).then(() => {
    closeModal('modal-edit-course');
    showPopupSuccess("แก้ไขรายวิชาสำเร็จ!", `อัปเดตข้อมูลวิชา ${code} ${name} เรียบร้อยแล้ว`);
    logActivity(`แก้ไขรายวิชา: ${code} ${name}`);
  });
}

function openEditHomeworkModal(hwId) {
  const hw = homeworkData[hwId];
  if (!hw) return;

  document.getElementById('edit-hw-id').value = hwId;
  document.getElementById('edit-hw-title').value = hw.title || '';
  document.getElementById('edit-hw-desc').value = hw.desc || '';
  document.getElementById('edit-hw-max-score').value = hw.maxScore || 10;
  document.getElementById('edit-hw-due-date').value = hw.dueDate || '';
  document.getElementById('edit-hw-youtube-url').value = hw.youtubeUrl || '';
  document.getElementById('edit-hw-file').value = '';

  const selectedTargets = hw.targetClasses || (hw.targetClass ? hw.targetClass.split(',').map(s => s.trim()) : ['all']);
  renderTargetClassChips('edit-hw-target-chips-container', hw.courseId, selectedTargets);

  const currentFileDiv = document.getElementById('edit-hw-file-current');
  let currentFileUrl = null;
  let currentFileName = hw.title || 'ไฟล์แนบปัจจุบัน';
  if (hw.pdfs && Array.isArray(hw.pdfs) && hw.pdfs.length > 0 && hw.pdfs[0].url) {
    currentFileUrl = hw.pdfs[0].url;
    if (hw.pdfs[0].name) currentFileName = hw.pdfs[0].name;
  } else if (hw.imageUrl) {
    currentFileUrl = hw.imageUrl;
  }

  if (currentFileUrl) {
    const isPdf = currentFileUrl.includes('application/pdf') || currentFileUrl.includes('.pdf') || currentFileUrl.toLowerCase().includes('pdf');
    currentFileDiv.innerHTML = `
      <div style="font-size:0.88rem; color:var(--text-muted); margin-bottom:4px;">ไฟล์แนบปัจจุบัน:</div>
      <button type="button" class="btn btn-sm ${isPdf ? 'btn-outline-danger' : 'btn-outline-primary'}" onclick="showPDFPreviewModal('${currentFileUrl.replace(/'/g, "\\'")}', '${currentFileName.replace(/'/g, "\\'")}')">
        <i class="${isPdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-image'}" style="color:${isPdf ? '#ef4444' : '#2563eb'};"></i> ดูตัวอย่างไฟล์แนบปัจจุบัน (${currentFileName})
      </button>
    `;
  } else {
    currentFileDiv.innerHTML = '<span style="font-size:0.85rem; color:var(--text-muted);">ยังไม่มีไฟล์แนบ</span>';
  }

  openModal('modal-edit-homework');
}

async function saveEditHomeworkForm(e) {
  e.preventDefault();
  const hwId = document.getElementById('edit-hw-id').value;
  const targetClasses = getSelectedTargetClasses('edit-hw-target-chips-container');
  const targetClass = targetClasses.join(', ');
  const title = document.getElementById('edit-hw-title').value.trim();
  const desc = document.getElementById('edit-hw-desc').value.trim();
  const maxScore = parseInt(document.getElementById('edit-hw-max-score').value) || 10;
  const dueDate = document.getElementById('edit-hw-due-date').value;
  const youtubeUrl = document.getElementById('edit-hw-youtube-url').value.trim();
  const fileInput = document.getElementById('edit-hw-file').files[0];

  const btnUpdate = document.getElementById('btn-update-hw');
  btnUpdate.disabled = true;
  btnUpdate.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึก...`;

  const existingHw = homeworkData[hwId] || {};
  let imageUrl = existingHw.imageUrl || null;
  let pdfs = existingHw.pdfs || null;

  if (fileInput) {
    const base64Data = await readFileAsBase64(fileInput);
    imageUrl = base64Data;
    pdfs = [{ name: fileInput.name, url: base64Data, size: fileInput.size }];
  }

  const updatedHw = {
    targetClasses,
    targetClass,
    title,
    desc,
    maxScore,
    dueDate,
    youtubeUrl: youtubeUrl || null,
    imageUrl,
    pdfs,
    updatedAt: new Date().toISOString()
  };

  updateData(`homework/${hwId}`, updatedHw).then(() => {
    btnUpdate.disabled = false;
    btnUpdate.innerHTML = `<i class="fa-solid fa-save"></i> บันทึกการแก้ไข`;
    closeModal('modal-edit-homework');

    // Backup to local client cache (localStorage)
    homeworkData[hwId] = { ...existingHw, ...updatedHw };
    try {
      localStorage.setItem('ag_homework', JSON.stringify(homeworkData));
    } catch (e) {}

    showPopupSuccess("แก้ไขการบ้านสำเร็จ!", `อัปเดตข้อมูลการบ้าน ${title} เรียบร้อยแล้ว`);
    logActivity(`แก้ไขการบ้าน: ${title}`);
  });
}

function deleteHomework(hwId) {
  const hw = homeworkData[hwId];
  const title = hw ? hw.title : 'การบ้าน';

  showPopupConfirm("ยืนยันลบการบ้าน", `คุณต้องการลบการบ้าน "${title}" ใช่หรือไม่?`, "ลบการบ้าน", "warning").then((confirmed) => {
    if (confirmed) {
      deleteData(`homework/${hwId}`);
      deleteData(`homework_submissions/${hwId}`);
      showPopupSuccess("ลบการบ้านสำเร็จ", `ลบการบ้าน "${title}" ออกจากระบบเรียบร้อยแล้ว`);
      logActivity(`ลบการบ้าน: ${title}`);
    }
  });
}

// Student Submit Homework - Live Preview & Upload Handling
let currentSelectedStudentFile = null;

function handleStudentFileSelection(input) {
  const file = input.files ? input.files[0] : null;
  const promptEl = document.getElementById('submit-dropzone-prompt');
  const previewContainer = document.getElementById('submit-preview-container');
  const statusBadge = document.getElementById('submit-file-status-badge');
  const dropzone = document.getElementById('submit-dropzone');

  if (!file) {
    clearStudentFileSelection();
    return;
  }

  currentSelectedStudentFile = file;
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);
  const fileSizeText = file.size > 1024 * 1024 ? `${fileSizeMb} MB` : `${Math.round(file.size / 1024)} KB`;

  if (dropzone) dropzone.classList.add('has-file');
  if (promptEl) promptEl.style.display = 'none';
  if (statusBadge) {
    statusBadge.className = isPdf ? 'badge badge-red' : 'badge badge-green';
    statusBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${isPdf ? 'เอกสาร PDF' : 'ไฟล์รูปภาพ'} (${fileSizeText})`;
  }

  if (isPdf) {
    // PDF File Selected Card
    previewContainer.style.display = 'block';
    previewContainer.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; background:#fff1f2; border:1px solid #fecdd3; padding:14px 18px; border-radius:14px; gap:12px;">
        <div style="display:flex; align-items:center; gap:14px; overflow:hidden;">
          <div style="width:46px; height:46px; border-radius:12px; background:#ef4444; color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0; box-shadow:0 4px 10px rgba(239,68,68,0.25);">
            <i class="fa-solid fa-file-pdf"></i>
          </div>
          <div style="overflow:hidden;">
            <div style="font-weight:700; color:#0f172a; font-size:0.95rem; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${file.name}</div>
            <div style="font-size:0.8rem; color:#e11d48; margin-top:2px;">เอกสาร PDF พร้อมส่ง • ${fileSizeText}</div>
          </div>
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger" onclick="clearStudentFileSelection(event)" style="border-radius:8px; flex-shrink:0;">
          <i class="fa-solid fa-trash-can"></i> เปลี่ยนไฟล์
        </button>
      </div>
    `;
  } else {
    // Image Selected -> Read as Data URL & Show Instant Live Image Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewContainer.style.display = 'block';
      previewContainer.innerHTML = `
        <div class="preview-image-card">
          <div style="width:100%; display:flex; justify-content:space-between; align-items:center; padding:4px 6px;">
            <div style="font-size:0.88rem; font-weight:700; color:#1e293b; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:70%;">
              <i class="fa-solid fa-image" style="color:var(--primary);"></i> ${file.name}
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="clearStudentFileSelection(event)" style="border-radius:8px; padding:4px 10px; font-size:0.8rem;">
              <i class="fa-solid fa-trash-can"></i> เปลี่ยนรูป
            </button>
          </div>
          <img src="${e.target.result}" class="preview-image-thumb" alt="ตัวอย่างรูปภาพที่เลือก">
          <span class="badge badge-green" style="font-size:0.78rem; font-weight:600;"><i class="fa-solid fa-check"></i> พร้อมอัปโหลดชิ้นงาน (${fileSizeText})</span>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  }
}

function clearStudentFileSelection(e) {
  if (e) e.stopPropagation();
  const fileInput = document.getElementById('submit-img-file');
  if (fileInput) fileInput.value = '';
  currentSelectedStudentFile = null;

  const promptEl = document.getElementById('submit-dropzone-prompt');
  const previewContainer = document.getElementById('submit-preview-container');
  const statusBadge = document.getElementById('submit-file-status-badge');
  const dropzone = document.getElementById('submit-dropzone');

  if (dropzone) dropzone.classList.remove('has-file');
  if (promptEl) promptEl.style.display = 'flex';
  if (previewContainer) {
    previewContainer.style.display = 'none';
    previewContainer.innerHTML = '';
  }
  if (statusBadge) {
    statusBadge.className = 'badge badge-purple';
    statusBadge.innerText = 'ยังไม่ได้เลือกไฟล์';
  }
}

function openSubmitHomeworkModal(hwId) {
  const hw = homeworkData[hwId];
  if (!hw) return;

  const embedUrl = getYouTubeEmbedUrl(hw.youtubeUrl);
  
  let fileUrl = null;
  let fileName = hw.title || 'เอกสารคำสั่งงาน';
  if (hw.pdfs && Array.isArray(hw.pdfs) && hw.pdfs.length > 0 && hw.pdfs[0].url) {
    fileUrl = hw.pdfs[0].url;
    if (hw.pdfs[0].name) fileName = hw.pdfs[0].name;
  } else if (hw.imageUrl) {
    fileUrl = hw.imageUrl;
  }

  const isPdf = fileUrl && (fileUrl.includes('application/pdf') || fileUrl.includes('.pdf') || fileUrl.toLowerCase().includes('pdf'));

  let mediaHtml = '';
  if (embedUrl) {
    mediaHtml += `
      <div style="margin:12px 0; border-radius:12px; overflow:hidden; border:1px solid var(--border); background:#000; box-shadow:var(--shadow-sm);">
        <div style="position:relative; padding-bottom:56.25%; height:0;">
          <iframe src="${embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
      </div>
    `;
  }
  if (fileUrl) {
    mediaHtml += `
      <div style="margin:10px 0;">
        <button type="button" class="btn btn-sm ${isPdf ? 'btn-outline-danger' : 'btn-outline-primary'}" onclick="showPDFPreviewModal('${fileUrl.replace(/'/g, "\\'")}', '${fileName.replace(/'/g, "\\'")}')" style="display:inline-flex; align-items:center; gap:8px; font-weight:600; padding:6px 14px; border-radius:10px;">
          <i class="${isPdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-image'}" style="color:${isPdf ? '#ef4444' : '#2563eb'}; font-size:1.1rem;"></i> 
          <span>📄 ดูเอกสารคำสั่งงาน (${fileName})</span>
        </button>
      </div>
    `;
  }

  document.getElementById('submit-hw-id').value = hwId;
  document.getElementById('submit-hw-details').innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
      <h4 style="font-weight:800; color:#0f172a; font-size:1.2rem; margin:0;">${hw.title}</h4>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <span class="badge badge-blue"><i class="fa-solid fa-award"></i> เต็ม ${hw.maxScore} คะแนน</span>
        <span class="badge badge-yellow"><i class="fa-solid fa-calendar"></i> กำหนดส่ง ${hw.dueDate}</span>
      </div>
    </div>
    <div style="font-size:0.92rem; color:#334155; line-height:1.5; background:#ffffff; padding:10px 14px; border-radius:10px; border:1px solid #e2e8f0;">
      ${hw.desc || 'ไม่มีคำอธิบายเพิ่มเติม'}
    </div>
    ${mediaHtml}
  `;

  document.getElementById('submit-text-answer').value = '';
  clearStudentFileSelection();
  openModal('modal-submit-homework');
}

async function handleStudentHomeworkSubmit(e) {
  e.preventDefault();
  const hwId = document.getElementById('submit-hw-id').value;
  const textAnswer = document.getElementById('submit-text-answer').value.trim();
  const imgFile = document.getElementById('submit-img-file').files[0];

  const btnSubmit = document.getElementById('btn-do-submit-hw');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังบีบอัดและอัปโหลดภาพ...`;

  let imageUrl = null;
  if (imgFile) {
    imageUrl = await uploadImageFile(imgFile);
  }

  btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึกข้อมูล...`;

  // Save submission non-conflicting key: homework_submissions/{hwId}/{studentId}
  const submissionPath = `homework_submissions/${hwId}/${currentUser.studentId}`;
  
  saveData(submissionPath, {
    studentId: currentUser.studentId,
    studentName: currentUser.name,
    classLevel: currentUser.classLevel || '',
    textAnswer,
    imageUrl,
    submittedAt: new Date().toLocaleString('th-TH'),
    status: 'submitted'
  }).then(() => {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `<i class="fa-solid fa-paper-plane"></i> ยืนยันการส่งงาน`;
    closeModal('modal-submit-homework');
    showPopupSuccess("ส่งการบ้านเรียบร้อย!", "ส่งการบ้านและอัปโหลดไฟล์ชิ้นงานเข้าสู่ระบบเรียบร้อยแล้ว");
    logActivity(`นักเรียน ${currentUser.name} ส่งการบ้านเรียบร้อยแล้ว`);
  });
}

// Teacher Grade Submissions
// Teacher Grade Submissions with Classroom Filter
function openGradeSubmissionsModal(hwId) {
  const hw = homeworkData[hwId];
  if (!hw) return;

  const course = coursesData[hw.courseId] || { code: '-', name: 'วิชาทั่วไป' };
  document.getElementById('active-grading-hw-id').value = hwId;
  document.getElementById('grade-hw-subtitle').innerHTML = `
    <span style="color:#60a5fa; font-weight:700;"><i class="fa-solid fa-book"></i> ${course.code || '-'} ${course.name}</span> 
    • <strong style="color:#ffffff;">${hw.title}</strong> 
    • คะแนนเต็ม ${hw.maxScore} คะแนน 
    • กำหนดส่ง ${hw.dueDate}
  `;

  // Populate Classrooms Filter
  const filterSelect = document.getElementById('grade-hw-class-filter');
  const classSet = new Set();

  // Add classes from students who submitted
  const hwSubs = submissionsData[hwId] || {};
  Object.values(hwSubs).forEach(sub => {
    if (sub.classLevel && sub.classLevel.trim()) {
      classSet.add(sub.classLevel.trim().replace(/^"|"$/g, ''));
    }
  });

  // Add target classes from homework definition
  const targets = hw.targetClasses || (hw.targetClass ? hw.targetClass.split(',').map(s => s.trim()) : ['all']);
  if (!targets.includes('all')) {
    targets.forEach(t => classSet.add(t.replace(/^"|"$/g, '')));
  } else {
    // Add all classes from studentsData
    Object.values(studentsData).forEach(s => {
      if (s.classLevel && s.classLevel.trim()) {
        classSet.add(s.classLevel.trim().replace(/^"|"$/g, ''));
      }
    });
  }

  const sortedClasses = Array.from(classSet).sort((a, b) => a.localeCompare(b, 'th', { numeric: true }));

  let filterOptions = `<option value="all">-- แสดงทุกห้องเรียน (${Object.keys(hwSubs).length} คนส่ง) --</option>`;
  sortedClasses.forEach(c => {
    const inClassCount = Object.values(hwSubs).filter(s => {
      const sClass = (s.classLevel || '').trim().replace(/^"|"$/g, '');
      return sClass === c;
    }).length;
    filterOptions += `<option value="${c}">ห้อง ${c} (ส่งแล้ว ${inClassCount} คน)</option>`;
  });

  filterSelect.innerHTML = filterOptions;
  filterSelect.value = 'all';

  renderGradeSubmissionsTable();
  openModal('modal-grade-submissions');
}

function renderGradeSubmissionsTable() {
  const hwId = document.getElementById('active-grading-hw-id').value;
  if (!hwId) return;

  const hw = homeworkData[hwId];
  if (!hw) return;

  const selectedClass = document.getElementById('grade-hw-class-filter').value;
  const tbody = document.getElementById('grade-submissions-body');
  const statsContainer = document.getElementById('grade-hw-stats-pill');

  const hwSubs = submissionsData[hwId] || {};
  let studentKeys = Object.keys(hwSubs);

  // Filter submissions by selected classroom
  if (selectedClass !== 'all') {
    studentKeys = studentKeys.filter(sId => {
      const sub = hwSubs[sId];
      const sClass = (sub.classLevel || '').trim().replace(/^"|"$/g, '');
      return sClass === selectedClass;
    });
  }

  // Calculate submission & grading statistics
  const totalSubmissions = studentKeys.length;
  let gradedCount = 0;
  studentKeys.forEach(sId => {
    if (hwSubs[sId].score !== undefined && hwSubs[sId].score !== '') {
      gradedCount++;
    }
  });
  const pendingCount = totalSubmissions - gradedCount;

  // Render stats pills
  if (statsContainer) {
    statsContainer.innerHTML = `
      <span class="badge badge-blue" style="font-size:0.82rem; font-weight:700; padding:5px 10px;">
        <i class="fa-solid fa-users"></i> ส่งงานแล้ว ${totalSubmissions} คน
      </span>
      <span class="badge badge-green" style="font-size:0.82rem; font-weight:700; padding:5px 10px;">
        <i class="fa-solid fa-check-double"></i> ตรวจแล้ว ${gradedCount} คน
      </span>
      ${pendingCount > 0 ? `
        <span class="badge badge-yellow" style="font-size:0.82rem; font-weight:700; padding:5px 10px;">
          <i class="fa-solid fa-hourglass-half"></i> รอตรวจ ${pendingCount} คน
        </span>
      ` : ''}
    `;
  }

  if (studentKeys.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:30px 20px;" class="text-muted">
          <i class="fa-regular fa-folder-open" style="font-size:2rem; margin-bottom:8px; display:block; color:#94a3b8;"></i>
          ${selectedClass === 'all' ? 'ยังไม่มีนักเรียนส่งงานชิ้นนี้' : `ยังไม่มีนักเรียนห้อง ${selectedClass} ส่งงานชิ้นนี้`}
        </td>
      </tr>
    `;
    return;
  }

  // Sort by student name / room
  studentKeys.sort((a, b) => {
    const subA = hwSubs[a];
    const subB = hwSubs[b];
    return (subA.studentName || '').localeCompare(subB.studentName || '', 'th');
  });

  let html = '';
  studentKeys.forEach((studentId, idx) => {
    const sub = hwSubs[studentId];
    const currentScore = sub.score !== undefined ? sub.score : '';
    const currentComment = sub.comment !== undefined ? sub.comment : '';
    const isGraded = sub.score !== undefined && sub.score !== '';

    html += `
      <tr style="${isGraded ? 'background:rgba(240, 253, 244, 0.4);' : ''}">
        <td style="text-align:center; font-weight:700; color:#64748b;">${idx + 1}</td>
        <td>
          <div style="font-weight:700; color:#0f172a;">${sub.studentName}</div>
          <div style="font-size:0.8rem; color:var(--text-muted); font-family:monospace;">รหัส: ${sub.studentId}</div>
        </td>
        <td style="text-align:center;">
          <span class="badge badge-yellow" style="font-weight:700; padding:3px 8px; font-size:0.8rem;">
            ห้อง ${sub.classLevel || '-'}
          </span>
        </td>
        <td style="font-size:0.84rem; color:#475569; white-space:nowrap;">
          <i class="fa-regular fa-calendar-check" style="color:var(--primary);"></i> ${sub.submittedAt}
        </td>
        <td>
          <div style="font-size:0.9rem; color:#1e293b; max-width:260px; word-break:break-word;">
            ${sub.textAnswer ? sub.textAnswer : '<span style="color:#94a3b8; font-style:italic;">(ไม่มีข้อความ)</span>'}
          </div>
          ${sub.imageUrl ? `
            <button type="button" class="btn btn-sm btn-outline-primary" style="margin-top:6px; border-radius:8px; font-weight:600;" onclick="showPDFPreviewModal('${sub.imageUrl.replace(/'/g, "\\'")}', '${sub.studentName.replace(/'/g, "\\'")}')">
              <i class="${(sub.imageUrl.includes('.pdf') || sub.imageUrl.includes('data:application/pdf')) ? 'fa-solid fa-file-pdf' : 'fa-solid fa-image'}"></i> ดูไฟล์แนบชิ้นงาน
            </button>
          ` : ''}
        </td>
        <td style="text-align:center;">
          <div style="display:flex; align-items:center; justify-content:center; gap:4px;">
            <input type="number" id="grade-score-${hwId}-${studentId}" class="form-control" style="padding:6px 8px; width:80px; text-align:center; font-weight:800; font-size:1rem; border-radius:8px; ${isGraded ? 'border-color:#10b981; color:#059669;' : 'border-color:#cbd5e1;'}" min="0" max="${hw.maxScore}" step="0.5" value="${currentScore}" placeholder="0">
            <span style="font-size:0.82rem; color:#64748b; font-weight:600;">/ ${hw.maxScore}</span>
          </div>
        </td>
        <td>
          <input type="text" id="grade-comment-${hwId}-${studentId}" class="form-control" style="padding:6px 10px; border-radius:8px; font-size:0.88rem;" placeholder="ข้อเสนอแนะ..." value="${currentComment}">
        </td>
        <td style="text-align:center;">
          <div style="display:flex; align-items:center; justify-content:center; gap:6px;">
            <button type="button" class="btn btn-sm ${isGraded ? 'btn-success' : 'btn-primary'}" style="border-radius:8px; font-weight:700; padding:6px 10px;" onclick="saveSubmissionGrade('${hwId}', '${studentId}')" title="บันทึกผลการตรวจ">
              <i class="fa-solid fa-check"></i> บันทึก
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger" style="border-radius:8px; padding:6px 9px;" onclick="deleteStudentSubmission('${hwId}', '${studentId}', '${(sub.studentName || 'นักเรียน').replace(/'/g, "\\'")}')" title="ลบงานนี้เพื่อให้นักเรียนส่งใหม่">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

function saveSubmissionGrade(hwId, studentId) {
  const scoreVal = document.getElementById(`grade-score-${hwId}-${studentId}`).value;
  const commentVal = document.getElementById(`grade-comment-${hwId}-${studentId}`).value.trim();

  if (scoreVal === '') {
    showPopupWarning("กรุณากรอกคะแนน", "กรุณากรอกคะแนนตัวเลขให้ถูกต้องก่อนบันทึก");
    return;
  }

  const scoreNum = parseFloat(scoreVal);
  const hw = homeworkData[hwId];
  if (hw && scoreNum > hw.maxScore) {
    showPopupWarning("คะแนนเกินกำหนด", `คะแนนที่กรอก (${scoreNum}) เกินคะแนนเต็มของการบ้าน (${hw.maxScore} คะแนน)`);
    return;
  }

  updateData(`homework_submissions/${hwId}/${studentId}`, {
    score: scoreNum,
    comment: commentVal,
    gradedAt: new Date().toLocaleString('th-TH'),
    gradedBy: currentUser.name
  }).then(() => {
    // Update local memory
    if (submissionsData[hwId] && submissionsData[hwId][studentId]) {
      submissionsData[hwId][studentId].score = scoreNum;
      submissionsData[hwId][studentId].comment = commentVal;
    }
    showPopupSuccess("บันทึกคะแนนเรียบร้อย", "บันทึกผลการตรวจชิ้นงานเรียบร้อยแล้ว");
    renderGradeSubmissionsTable();
  });
}

function deleteStudentSubmission(hwId, studentId, studentName = 'นักเรียน') {
  if (!currentUser || currentUser.role === 'student') {
    showPopupError("ไม่มีสิทธิ์ดำเนินการ", "นักเรียนไม่มีสิทธิ์ลบประวัติการส่งงาน");
    return;
  }

  showPopupConfirm(
    "ยืนยันลบการส่งงาน",
    `คุณต้องการลบงานที่ส่งของ "${studentName}" ใช่หรือไม่?\n\n(เมื่อลบแล้ว นักเรียนจะสามารถกดส่งงานชิ้นนี้ใหม่ได้ทันที)`,
    "ลบงานและให้ส่งใหม่",
    "warning"
  ).then((confirmed) => {
    if (confirmed) {
      deleteData(`homework_submissions/${hwId}/${studentId}`).then(() => {
        // Remove from local memory
        if (submissionsData[hwId] && submissionsData[hwId][studentId]) {
          delete submissionsData[hwId][studentId];
        }

        showPopupSuccess("ลบงานสำเร็จ!", `ลบประวัติการส่งงานของ ${studentName} เรียบร้อยแล้ว (นักเรียนสามารถส่งงานใหม่ได้ทันที)`);
        logActivity(`ลบงานส่งของนักเรียน: ${studentName} (รหัส ${studentId}) เพื่อให้ส่งใหม่`);

        // Re-render grading table, courses list, and dashboard
        renderGradeSubmissionsTable();
        renderCoursesList();
        renderDashboard();
      });
    }
  });
}


/* -------------------------------------------------------------
   7. QUIZ / EXAM BUILDER & RUNNER
------------------------------------------------------------- */
function renderQuizQuestionsBuilder() {
  const container = document.getElementById('quiz-questions-builder-container');
  const quizType = document.getElementById('quiz-type').value; // 4 or 5 choices
  const choiceCount = parseInt(quizType);

  let html = '';
  quizQuestionsList.forEach((q, qIndex) => {
    html += `
      <div class="quiz-question-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h5 style="font-weight:700; color:var(--primary);">ข้อที่ ${qIndex + 1}</h5>
          ${quizQuestionsList.length > 1 ? `
            <button type="button" class="btn btn-sm btn-danger" onclick="removeQuizQuestionItem(${qIndex})"><i class="fa-solid fa-trash"></i> ลบข้อนี้</button>
          ` : ''}
        </div>

        <div class="form-group">
          <label class="form-label">คำถาม ข้อที่ ${qIndex + 1} *</label>
          <input type="text" id="builder-question-${qIndex}" class="form-control" style="padding-left:14px;" value="${q.question || ''}" required placeholder="กรอกคำถาม...">
        </div>

        <div style="margin-bottom:10px; font-weight:600; font-size:0.95rem; color:#334155;">ตัวเลือกคำตอบ (ทำเครื่องหมายเลือกคำตอบที่ถูกต้อง):</div>
    `;

    const choiceLabels = choiceCount === 4 ? ['ก', 'ข', 'ค', 'ง'] : ['ก', 'ข', 'ค', 'ง', 'จ'];
    
    choiceLabels.forEach((label, cIndex) => {
      const isCorrect = q.correctIndex === cIndex;
      const choiceVal = (q.options && q.options[cIndex]) ? q.options[cIndex] : '';

      html += `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
          <input type="radio" name="builder-correct-${qIndex}" value="${cIndex}" ${isCorrect ? 'checked' : ''} style="width:20px; height:20px; accent-color:var(--primary);">
          <span style="font-weight:700; width:24px;">${label}.</span>
          <input type="text" id="builder-option-${qIndex}-${cIndex}" class="form-control" style="padding-left:14px;" value="${choiceVal}" placeholder="ข้อความตัวเลือก ${label}" required>
        </div>
      `;
    });

    html += `
        <div class="form-group" style="margin-top:12px;">
          <label class="form-label">คำอธิบายเฉลย (Explanation)</label>
          <input type="text" id="builder-explanation-${qIndex}" class="form-control" style="padding-left:14px;" value="${q.explanation || ''}" placeholder="เหตุผลคำอธิบายคำตอบที่ถูกต้อง...">
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function addQuizQuestionItem() {
  quizQuestionsList.push({ question: '', options: ['', '', '', '', ''], correctIndex: 0, explanation: '' });
  renderQuizQuestionsBuilder();
}

function removeQuizQuestionItem(index) {
  quizQuestionsList.splice(index, 1);
  renderQuizQuestionsBuilder();
}

function openCreateQuizModal() {
  quizQuestionsList = [{ question: '', options: ['', '', '', '', ''], correctIndex: 0, explanation: '' }];
  document.getElementById('quiz-title').value = '';
  document.getElementById('quiz-duration').value = 15;
  document.getElementById('quiz-pass-score').value = 50;

  const courseSelect = document.getElementById('quiz-course-id');
  const courseId = courseSelect ? courseSelect.value : '';
  renderTargetClassChips('quiz-target-chips-container', courseId, ['all']);

  renderQuizQuestionsBuilder();
  openModal('modal-create-quiz');
}

function saveQuizForm(e) {
  e.preventDefault();
  const courseId = document.getElementById('quiz-course-id').value;
  const targetClasses = getSelectedTargetClasses('quiz-target-chips-container');
  const targetClass = targetClasses.join(', ');
  const title = document.getElementById('quiz-title').value.trim();
  const type = document.getElementById('quiz-type').value;
  const duration = parseInt(document.getElementById('quiz-duration').value) || 15;
  const passScore = parseInt(document.getElementById('quiz-pass-score').value) || 50;

  const choiceCount = parseInt(type);
  const compiledQuestions = [];

  for (let i = 0; i < quizQuestionsList.length; i++) {
    const qText = document.getElementById(`builder-question-${i}`).value.trim();
    const expText = document.getElementById(`builder-explanation-${i}`).value.trim();
    const correctRadios = document.getElementsByName(`builder-correct-${i}`);
    
    let selectedCorrectIndex = 0;
    correctRadios.forEach((r, idx) => {
      if (r.checked) selectedCorrectIndex = idx;
    });

    const optionsArr = [];
    for (let c = 0; c < choiceCount; c++) {
      const optVal = document.getElementById(`builder-option-${i}-${c}`).value.trim();
      optionsArr.push(optVal);
    }

    compiledQuestions.push({
      id: i + 1,
      question: qText,
      options: optionsArr,
      correctIndex: selectedCorrectIndex,
      explanation: expText
    });
  }

  pushData('quizzes', {
    courseId,
    targetClasses,
    targetClass,
    title,
    type,
    duration,
    passScore,
    questions: compiledQuestions,
    createdAt: new Date().toISOString(),
    createdBy: currentUser.name
  }).then(() => {
    closeModal('modal-create-quiz');
    showPopupSuccess("สร้างแบบทดสอบสำเร็จ!", `สร้างแบบทดสอบ ${title} เรียบร้อยแล้ว`);
    logActivity(`สร้างแบบทดสอบใหม่: ${title}`);
  });
}

function openEditQuizModal(quizId) {
  if (!currentUser || currentUser.role === 'student') {
    showPopupError("ไม่มีสิทธิ์ดำเนินการ", "นักเรียนไม่มีสิทธิ์แก้ไขแบบทดสอบ");
    return;
  }
  const quiz = quizzesData[quizId];
  if (!quiz) return;

  document.getElementById('edit-quiz-id').value = quizId;
  
  // Populate Course dropdown
  const courseSelect = document.getElementById('edit-quiz-course-id');
  if (courseSelect) {
    let options = '';
    Object.keys(coursesData).forEach(cId => {
      const c = coursesData[cId];
      options += `<option value="${cId}">${c.code} ${c.name} (${c.level})</option>`;
    });
    courseSelect.innerHTML = options || `<option value="">-- เลือกรายวิชา --</option>`;
    courseSelect.value = quiz.courseId || '';
  }

  // Populate Target Classrooms
  const selectedClasses = quiz.targetClasses || (quiz.targetClass ? quiz.targetClass.split(',').map(s => s.trim()) : ['all']);
  renderTargetClassChips('edit-quiz-target-chips-container', quiz.courseId, selectedClasses);

  document.getElementById('edit-quiz-title').value = quiz.title || '';
  document.getElementById('edit-quiz-type').value = quiz.type || '4';
  document.getElementById('edit-quiz-duration').value = quiz.duration || 15;
  document.getElementById('edit-quiz-pass-score').value = quiz.passScore || 50;

  // Load Questions
  if (quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0) {
    editQuizQuestionsList = JSON.parse(JSON.stringify(quiz.questions));
  } else {
    editQuizQuestionsList = [{ question: '', options: ['', '', '', '', ''], correctIndex: 0, explanation: '' }];
  }

  renderEditQuizQuestionsBuilder();
  openModal('modal-edit-quiz');
}

let editQuizQuestionsList = [];

function renderEditQuizQuestionsBuilder() {
  const container = document.getElementById('edit-quiz-questions-builder-container');
  if (!container) return;
  const quizType = document.getElementById('edit-quiz-type').value; // 4 or 5 choices
  const choiceCount = parseInt(quizType);

  let html = '';
  editQuizQuestionsList.forEach((q, qIndex) => {
    html += `
      <div class="quiz-question-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h5 style="font-weight:700; color:var(--primary);">ข้อที่ ${qIndex + 1}</h5>
          ${editQuizQuestionsList.length > 1 ? `
            <button type="button" class="btn btn-sm btn-danger" onclick="removeEditQuizQuestionItem(${qIndex})"><i class="fa-solid fa-trash"></i> ลบข้อนี้</button>
          ` : ''}
        </div>

        <div class="form-group">
          <label class="form-label">คำถาม ข้อที่ ${qIndex + 1} *</label>
          <input type="text" id="edit-builder-question-${qIndex}" class="form-control" style="padding-left:14px;" value="${q.question ? q.question.replace(/"/g, '&quot;') : ''}" required placeholder="กรอกคำถาม...">
        </div>

        <div style="margin-bottom:10px; font-weight:600; font-size:0.95rem; color:#334155;">ตัวเลือกคำตอบ (ทำเครื่องหมายเลือกคำตอบที่ถูกต้อง):</div>
    `;

    const choiceLabels = choiceCount === 4 ? ['ก', 'ข', 'ค', 'ง'] : ['ก', 'ข', 'ค', 'ง', 'จ'];
    
    choiceLabels.forEach((label, cIndex) => {
      const isCorrect = q.correctIndex === cIndex;
      const choiceVal = (q.options && q.options[cIndex]) ? q.options[cIndex].replace(/"/g, '&quot;') : '';

      html += `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
          <input type="radio" name="edit-builder-correct-${qIndex}" value="${cIndex}" ${isCorrect ? 'checked' : ''} style="width:20px; height:20px; accent-color:var(--primary);">
          <span style="font-weight:700; width:24px;">${label}.</span>
          <input type="text" id="edit-builder-option-${qIndex}-${cIndex}" class="form-control" style="padding-left:14px;" value="${choiceVal}" placeholder="ข้อความตัวเลือก ${label}" required>
        </div>
      `;
    });

    html += `
        <div class="form-group" style="margin-top:12px;">
          <label class="form-label">คำอธิบายเฉลย (Explanation)</label>
          <input type="text" id="edit-builder-explanation-${qIndex}" class="form-control" style="padding-left:14px;" value="${q.explanation ? q.explanation.replace(/"/g, '&quot;') : ''}" placeholder="เหตุผลคำอธิบายคำตอบที่ถูกต้อง...">
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function addEditQuizQuestionItem() {
  editQuizQuestionsList.push({ question: '', options: ['', '', '', '', ''], correctIndex: 0, explanation: '' });
  renderEditQuizQuestionsBuilder();
}

function removeEditQuizQuestionItem(index) {
  editQuizQuestionsList.splice(index, 1);
  renderEditQuizQuestionsBuilder();
}

function saveEditQuizForm(e) {
  e.preventDefault();
  if (!currentUser || currentUser.role === 'student') {
    showPopupError("ไม่มีสิทธิ์ดำเนินการ", "นักเรียนไม่มีสิทธิ์แก้ไขแบบทดสอบ");
    return;
  }

  const quizId = document.getElementById('edit-quiz-id').value;
  const courseId = document.getElementById('edit-quiz-course-id').value;
  const targetClasses = getSelectedTargetClasses('edit-quiz-target-chips-container');
  const targetClass = targetClasses.join(', ');
  const title = document.getElementById('edit-quiz-title').value.trim();
  const type = document.getElementById('edit-quiz-type').value;
  const duration = parseInt(document.getElementById('edit-quiz-duration').value) || 15;
  const passScore = parseInt(document.getElementById('edit-quiz-pass-score').value) || 50;

  const choiceCount = parseInt(type);
  const compiledQuestions = [];

  for (let i = 0; i < editQuizQuestionsList.length; i++) {
    const qText = document.getElementById(`edit-builder-question-${i}`).value.trim();
    const expText = document.getElementById(`edit-builder-explanation-${i}`).value.trim();
    const correctRadios = document.getElementsByName(`edit-builder-correct-${i}`);
    
    let selectedCorrectIndex = 0;
    correctRadios.forEach((r, idx) => {
      if (r.checked) selectedCorrectIndex = idx;
    });

    const optionsArr = [];
    for (let c = 0; c < choiceCount; c++) {
      const optVal = document.getElementById(`edit-builder-option-${i}-${c}`).value.trim();
      optionsArr.push(optVal);
    }

    compiledQuestions.push({
      id: i + 1,
      question: qText,
      options: optionsArr,
      correctIndex: selectedCorrectIndex,
      explanation: expText
    });
  }

  updateData(`quizzes/${quizId}`, {
    courseId,
    targetClasses,
    targetClass,
    title,
    type,
    duration,
    passScore,
    questions: compiledQuestions,
    updatedAt: new Date().toISOString()
  }).then(() => {
    closeModal('modal-edit-quiz');
    showPopupSuccess("แก้ไขแบบทดสอบสำเร็จ!", `อัปเดตข้อมูลแบบทดสอบ ${title} เรียบร้อยแล้ว`);
    logActivity(`แก้ไขแบบทดสอบ: ${title}`);
  });
}

function resetQuizFilters() {
  const searchInput = document.getElementById('quiz-search-input');
  const courseFilter = document.getElementById('quiz-course-filter');
  const classFilter = document.getElementById('quiz-class-filter');
  if (searchInput) searchInput.value = '';
  if (courseFilter) courseFilter.value = 'all';
  if (classFilter) classFilter.value = 'all';
  renderQuizzesList();
}

function renderQuizzesList() {
  const container = document.getElementById('quizzes-list-container');
  if (!container) return;

  const searchInput = document.getElementById('quiz-search-input');
  const courseFilter = document.getElementById('quiz-course-filter');
  const classFilter = document.getElementById('quiz-class-filter');

  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedCourse = courseFilter ? courseFilter.value : 'all';
  const selectedClass = classFilter ? classFilter.value : 'all';

  let quizKeys = Object.keys(quizzesData);
  const isStudent = currentUser && currentUser.role === 'student';
  const studentClass = (currentUser && currentUser.classLevel) ? currentUser.classLevel.trim() : '';

  // Populate course dropdown if needed
  if (courseFilter && courseFilter.options.length <= 1) {
    let courseOpts = `<option value="all">-- ทุกรายวิชา --</option>`;
    Object.keys(coursesData).forEach(cId => {
      const c = coursesData[cId];
      courseOpts += `<option value="${cId}">${c.code || ''} ${c.name || ''}</option>`;
    });
    courseFilter.innerHTML = courseOpts;
  }

  // Populate classroom dropdown if needed
  if (classFilter && classFilter.options.length <= 1) {
    const classSet = new Set();
    Object.values(studentsData).forEach(s => {
      if (s.classLevel && s.classLevel.trim()) classSet.add(s.classLevel.trim());
    });
    const sortedClasses = Array.from(classSet).sort((a, b) => a.localeCompare(b, 'th', { numeric: true }));
    let classOpts = `<option value="all">-- ทุกห้องเรียน --</option>`;
    sortedClasses.forEach(cls => {
      classOpts += `<option value="${cls}">ห้อง ${cls}</option>`;
    });
    classFilter.innerHTML = classOpts;
  }

  // Filter for student eligibility
  if (isStudent) {
    quizKeys = quizKeys.filter(quizId => {
      return isStudentEligibleForQuiz(studentClass, quizzesData[quizId]);
    });
  }

  // Course filter
  if (selectedCourse !== 'all') {
    quizKeys = quizKeys.filter(quizId => {
      const q = quizzesData[quizId];
      return q.courseId === selectedCourse;
    });
  }

  // Classroom filter
  if (selectedClass !== 'all') {
    quizKeys = quizKeys.filter(quizId => {
      const q = quizzesData[quizId];
      const targets = q.targetClasses || (q.targetClass ? q.targetClass.split(',').map(s => s.trim()) : ['all']);
      return targets.includes('all') || targets.includes(selectedClass);
    });
  }

  // Search filter
  if (searchQuery) {
    quizKeys = quizKeys.filter(quizId => {
      const q = quizzesData[quizId];
      const course = coursesData[q.courseId] || { name: '', code: '' };
      return (q.title || '').toLowerCase().includes(searchQuery) ||
             (course.name || '').toLowerCase().includes(searchQuery) ||
             (course.code || '').toLowerCase().includes(searchQuery);
    });
  }

  if (quizKeys.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:48px 20px; background:#f8fafc; border:2px dashed #cbd5e1; border-radius:18px; margin:10px 0;">
        <div style="width:64px; height:64px; border-radius:50%; background:#fdf2f8; color:#db2777; display:flex; align-items:center; justify-content:center; font-size:1.8rem; margin:0 auto 16px;">
          <i class="fa-solid fa-file-circle-question"></i>
        </div>
        <h4 style="font-size:1.2rem; font-weight:800; color:#0f172a; margin-bottom:6px;">${searchQuery ? 'ไม่พบแบบทดสอบที่ค้นหา' : (isStudent ? 'ยังไม่มีแบบทดสอบสำหรับห้องเรียนของคุณ' : 'ยังไม่มีแบบทดสอบในระบบ')}</h4>
        <p style="color:#64748b; font-size:0.9rem; margin-bottom:18px;">${searchQuery ? `ไม่พบข้อมูลที่ตรงกับคำค้นหา "${searchQuery}"` : (isStudent ? 'เมื่อคุณครูเปิดระบบแบบทดสอบ จะปรากฏที่นี่โดยอัตโนมัติ' : 'คุณครูสามารถสร้างแบบทดสอบออนไลน์ ปรนัย 4-5 ตัวเลือก ได้ทันที')}</p>
        ${(currentUser && currentUser.role !== 'student' && !searchQuery) ? `
          <button class="btn btn-primary" onclick="openCreateQuizModal()" style="border-radius:10px; font-weight:700;">
            <i class="fa-solid fa-square-plus"></i> สร้างแบบทดสอบแรก
          </button>
        ` : ''}
      </div>
    `;
    return;
  }

  const quizThemes = [
    { cls: 'quiz-theme-violet', accent: '#7c3aed', icon: 'fa-solid fa-graduation-cap' },
    { cls: 'quiz-theme-rose', accent: '#e11d48', icon: 'fa-solid fa-award' },
    { cls: 'quiz-theme-blue', accent: '#2563eb', icon: 'fa-solid fa-brain' },
    { cls: 'quiz-theme-emerald', accent: '#059669', icon: 'fa-solid fa-lightbulb' },
    { cls: 'quiz-theme-amber', accent: '#d97706', icon: 'fa-solid fa-fire' }
  ];

  let html = `<div class="quiz-grid-modern">`;
  quizKeys.forEach((quizId, index) => {
    const q = quizzesData[quizId];
    const theme = quizThemes[index % quizThemes.length];
    const course = coursesData[q.courseId] || { name: 'วิชาทั่วไป', code: '-' };
    const qCount = q.questions ? q.questions.length : 0;
    const choiceType = q.type ? `${q.type} ตัวเลือก` : '4 ตัวเลือก';
    const targets = q.targetClasses || (q.targetClass ? q.targetClass.split(',').map(s => s.trim()) : ['all']);
    const isTargetAll = targets.includes('all') || targets.length === 0;
    const targetLabel = isTargetAll ? 'ทุกห้องเรียน' : 'ห้อง ' + targets.join(', ');

    // Student Quiz attempt check
    const studentResult = (quizResultsData[quizId] && currentUser && currentUser.studentId) 
      ? quizResultsData[quizId][currentUser.studentId]
      : null;

    const completedCount = quizResultsData[quizId] ? Object.keys(quizResultsData[quizId]).length : 0;

    html += `
      <div class="quiz-card-modern">
        <!-- Vibrant Hero Banner -->
        <div class="quiz-hero-banner ${theme.cls}">
          <div class="quiz-meta-pills">
            <span class="quiz-pill-course">
              <i class="${theme.icon}"></i> ${course.name}
            </span>
            <span class="quiz-pill-target">
              <i class="${isTargetAll ? 'fa-solid fa-globe' : 'fa-solid fa-chalkboard'}"></i> ${targetLabel}
            </span>
            <span class="quiz-pill-course" style="font-size:0.75rem; background:rgba(0,0,0,0.2);">
              <i class="fa-solid fa-check-to-slot"></i> ${choiceType}
            </span>
          </div>

          <h4 class="quiz-title-text">${q.title}</h4>
          ${q.createdBy ? `
            <div class="quiz-creator-info">
              <i class="fa-solid fa-user-pen"></i> ครูผู้สร้าง: <span style="font-weight:700;">${q.createdBy}</span>
            </div>
          ` : ''}
        </div>

        <!-- Quiz Body & Stats Grid -->
        <div class="quiz-card-body">
          <div class="quiz-stats-grid">
            <div class="quiz-stat-pill">
              <span class="quiz-stat-label">จำนวนข้อ</span>
              <span class="quiz-stat-val" style="color:${theme.accent};">
                <i class="fa-solid fa-list-ol"></i> ${qCount} ข้อ
              </span>
            </div>
            <div class="quiz-stat-pill">
              <span class="quiz-stat-label">เวลาสอบ</span>
              <span class="quiz-stat-val" style="color:#d97706;">
                <i class="fa-solid fa-clock"></i> ${q.duration} นาที
              </span>
            </div>
            <div class="quiz-stat-pill">
              <span class="quiz-stat-label">เกณฑ์ผ่าน</span>
              <span class="quiz-stat-val" style="color:#059669;">
                <i class="fa-solid fa-bullseye"></i> ${q.passScore}%
              </span>
            </div>
          </div>

          <!-- Footer & Action Buttons -->
          <div class="quiz-card-footer">
            ${(currentUser && currentUser.role === 'student') ? `
              ${studentResult ? `
                <div class="quiz-result-ribbon ${studentResult.passed ? 'quiz-result-passed' : 'quiz-result-failed'}">
                  <div>
                    <div style="font-weight:800; font-size:0.92rem; color:${studentResult.passed ? '#059669' : '#e11d48'};">
                      <i class="${studentResult.passed ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'}"></i>
                      ${studentResult.passed ? 'สอบผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์'}
                    </div>
                    <div style="font-size:0.8rem; color:#475569; font-weight:700;">
                      ได้ ${studentResult.score}/${studentResult.totalScore} คะแนน (${studentResult.percentage}%)
                    </div>
                  </div>
                  <button class="btn btn-sm btn-outline-primary" onclick="viewQuizResultModal('${quizId}', '${currentUser.studentId}')" style="border-radius:10px; font-weight:700; padding:6px 12px;">
                    <i class="fa-solid fa-chart-simple"></i> ดูเฉลย
                  </button>
                </div>
              ` : `
                <button class="quiz-btn-start" onclick="startQuizRunner('${quizId}')">
                  <i class="fa-solid fa-circle-play"></i> เริ่มทำข้อสอบทันที
                </button>
              `}
            ` : `
              <span class="badge badge-purple" style="font-size:0.84rem; font-weight:700; padding:6px 12px; border-radius:10px; cursor:pointer;" onclick="openQuizScoresModal('${quizId}')" title="คลิกเพื่อดูคะแนนนักเรียน">
                <i class="fa-solid fa-user-check"></i> ทำแล้ว ${completedCount} คน
              </span>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-sm btn-primary" onclick="openQuizScoresModal('${quizId}')" style="border-radius:10px; font-weight:700; padding:7px 14px; box-shadow:0 2px 8px rgba(37,99,235,0.25);" title="ดูรายงานคะแนนสอบนักเรียนทุกคน">
                  <i class="fa-solid fa-square-poll-vertical"></i> ดูคะแนน
                </button>
                <button class="btn btn-sm btn-outline-primary" onclick="openEditQuizModal('${quizId}')" style="border-radius:10px; padding:7px 10px;" title="แก้ไขแบบทดสอบ">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteQuiz('${quizId}')" style="border-radius:10px; padding:7px 10px;" title="ลบแบบทดสอบ">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function deleteQuiz(quizId) {
  showPopupConfirm("ยืนยันลบแบบทดสอบ", "คุณต้องการลบแบบทดสอบนี้ใช่หรือไม่?", "ลบข้อสอบ", "warning").then((confirmed) => {
    if (confirmed) {
      deleteData(`quizzes/${quizId}`);
      showPopupSuccess("ลบแบบทดสอบสำเร็จ", "ลบแบบทดสอบออกจากระบบเรียบร้อยแล้ว");
      logActivity(`ลบแบบทดสอบ`);
    }
  });
}

// Start Quiz Runner (Official Academic Examination Engine)
function startQuizRunner(quizId) {
  const quiz = quizzesData[quizId];
  if (!quiz || !quiz.questions) return;

  activeQuizData = { ...quiz, id: quizId };
  quizRemainingSeconds = quiz.duration * 60;

  const course = coursesData[quiz.courseId] || { name: 'วิชาทั่วไป', code: '-' };

  // Set Header Information
  document.getElementById('runner-quiz-title').innerText = quiz.title;
  document.getElementById('runner-course-name').innerHTML = `<i class="fa-solid fa-barcode"></i> ${course.code || '-'} ${course.name}`;
  
  const studentInfoEl = document.getElementById('runner-student-info');
  if (studentInfoEl && currentUser) {
    studentInfoEl.innerHTML = `
      <span style="display:inline-flex; align-items:center; gap:6px; min-width:0; overflow:hidden; text-overflow:ellipsis;">
        <i class="fa-solid fa-user-graduate" style="color:#60a5fa; flex-shrink:0;"></i> 
        <strong style="color:#ffffff; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${currentUser.name}</strong>
      </span>
      <span style="display:inline-flex; align-items:center; gap:6px; flex-shrink:0; font-size:0.76rem;">
        <span style="background:rgba(253,224,71,0.18); color:#fde047; padding:2px 6px; border-radius:6px; font-weight:700;">ห้อง ${currentUser.classLevel || '-'}</span>
        <span style="background:rgba(147,197,253,0.18); color:#93c5fd; padding:2px 6px; border-radius:6px; font-family:monospace; font-weight:700;">${currentUser.studentId || '-'}</span>
      </span>
    `;
  }

  // Set Progress Tracker
  const totalCount = quiz.questions.length;
  document.getElementById('exam-total-count').innerText = totalCount;
  document.getElementById('exam-answered-count').innerText = '0';
  document.getElementById('exam-progress-percent').innerText = '0%';
  document.getElementById('exam-progress-fill').style.width = '0%';

  // Render questions
  const container = document.getElementById('quiz-runner-body');
  let html = '';
  
  const choiceLabels = parseInt(quiz.type) === 4 ? ['ก', 'ข', 'ค', 'ง'] : ['ก', 'ข', 'ค', 'ง', 'จ'];

  quiz.questions.forEach((q, idx) => {
    html += `
      <div class="exam-question-card-modern" id="exam-q-box-${idx}">
        <div class="exam-q-header">
          <span class="exam-q-num-badge">ข้อที่ ${idx + 1}</span>
          <h4 class="exam-q-title">${q.question}</h4>
        </div>
        <div class="exam-options-grid">
    `;

    q.options.forEach((opt, oIdx) => {
      html += `
        <div class="exam-choice-card" onclick="selectExamChoiceRadio(this, ${idx}, ${oIdx})">
          <input type="radio" name="quiz-ans-${idx}" value="${oIdx}" style="display:none;">
          <span class="choice-letter-badge">${choiceLabels[oIdx]}</span>
          <span class="choice-text">${opt}</span>
          <i class="fa-solid fa-circle-check choice-check-icon"></i>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Start Countdown Timer
  clearInterval(activeQuizTimerInterval);
  updateTimerDisplay();
  
  activeQuizTimerInterval = setInterval(() => {
    quizRemainingSeconds--;
    updateTimerDisplay();

    if (quizRemainingSeconds <= 0) {
      clearInterval(activeQuizTimerInterval);
      showPopupWarning("หมดเวลาทำข้อสอบ", "หมดเวลาการทำแบบทดสอบ! ระบบกำลังส่งและประมวลผลคำตอบอัตโนมัติ...");
      submitQuizAnswers(false);
    }
  }, 1000);

  openModal('modal-take-quiz');
}

function selectExamChoiceRadio(cardEl, qIdx, oIdx) {
  const container = cardEl.closest('.exam-options-grid');
  if (!container) return;

  // Deselect other options in this question
  container.querySelectorAll('.exam-choice-card').forEach(card => {
    card.classList.remove('selected');
    const inp = card.querySelector('input[type="radio"]');
    if (inp) inp.checked = false;
  });

  // Select clicked card
  cardEl.classList.add('selected');
  const radio = cardEl.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;

  // Calculate Progress
  if (activeQuizData && activeQuizData.questions) {
    let answered = 0;
    activeQuizData.questions.forEach((_, i) => {
      const radios = document.getElementsByName(`quiz-ans-${i}`);
      const isAns = Array.from(radios).some(r => r.checked);
      if (isAns) answered++;
    });

    const total = activeQuizData.questions.length;
    const pct = Math.round((answered / total) * 100);
    const answeredCountEl = document.getElementById('exam-answered-count');
    const progressPctEl = document.getElementById('exam-progress-percent');
    const progressFillEl = document.getElementById('exam-progress-fill');

    if (answeredCountEl) answeredCountEl.innerText = answered;
    if (progressPctEl) progressPctEl.innerText = `${pct}%`;
    if (progressFillEl) progressFillEl.style.width = `${pct}%`;
  }
}

// Backward compatibility helper
function selectChoiceRadio(labelEl) {
  selectExamChoiceRadio(labelEl);
}

function updateTimerDisplay() {
  const minutes = Math.floor(quizRemainingSeconds / 60);
  const seconds = quizRemainingSeconds % 60;
  const str = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const display = document.getElementById('quiz-countdown-display');
  const timerCard = document.getElementById('exam-timer-card');

  if (display) display.innerText = str;

  if (timerCard) {
    if (quizRemainingSeconds <= 60) {
      timerCard.classList.add('urgent');
    } else {
      timerCard.classList.remove('urgent');
    }
  }
}

function confirmCancelQuiz() {
  showPopupConfirm("ยืนยันยกเลิกการสอบ", "หากยกเลิกตอนนี้ คำตอบของคุณจะไม่ถูกบันทึกและระบบจะถือว่ายังไม่ได้ส่งกระดาษคำตอบ ยืนยันยกเลิกหรือไม่?", "ยืนยันยกเลิก", "warning").then((confirmed) => {
    if (confirmed) {
      clearInterval(activeQuizTimerInterval);
      closeModal('modal-take-quiz');
    }
  });
}

function submitQuizAnswers(isManual) {
  clearInterval(activeQuizTimerInterval);

  if (!activeQuizData) return;

  const questions = activeQuizData.questions;
  let earnedScore = 0;
  const userAnswersArr = [];

  questions.forEach((q, idx) => {
    const radios = document.getElementsByName(`quiz-ans-${idx}`);
    let selectedVal = -1;
    radios.forEach(r => {
      if (r.checked) selectedVal = parseInt(r.value);
    });

    userAnswersArr.push(selectedVal);
    if (selectedVal === q.correctIndex) {
      earnedScore++;
    }
  });

  const totalScore = questions.length;
  const percentage = Math.round((earnedScore / totalScore) * 100);
  const passed = percentage >= activeQuizData.passScore;

  // Save non-colliding path: quiz_results/{quizId}/{studentId}
  const resultPath = `quiz_results/${activeQuizData.id}/${currentUser.studentId}`;
  
  saveData(resultPath, {
    studentId: currentUser.studentId,
    studentName: currentUser.name,
    classLevel: currentUser.classLevel || '',
    score: earnedScore,
    totalScore: totalScore,
    percentage: percentage,
    passed: passed,
    userAnswers: userAnswersArr,
    completedAt: new Date().toLocaleString('th-TH')
  }).then(() => {
    closeModal('modal-take-quiz');
    viewQuizResultModal(activeQuizData.id, currentUser.studentId);
    logActivity(`นักเรียน ${currentUser.name} ทำแบบทดสอบ ${activeQuizData.title} ได้ ${earnedScore}/${totalScore} คะแนน`);
  });
}

// View Quiz Result Modal (Official Score Report)
function viewQuizResultModal(quizId, studentId) {
  const quiz = quizzesData[quizId];
  const res = (quizResultsData[quizId] && quizResultsData[quizId][studentId]) 
    ? quizResultsData[quizId][studentId]
    : null;

  if (!quiz || !res) return;

  document.getElementById('res-score-display').innerText = `${res.score} / ${res.totalScore}`;
  const badgeContainer = document.getElementById('res-status-badge');
  badgeContainer.innerHTML = res.passed 
    ? `<span class="badge badge-green" style="font-size:0.95rem; font-weight:800; padding:6px 18px; border-radius:10px;"><i class="fa-solid fa-circle-check"></i> ผ่านการทดสอบ (${res.percentage}%)</span>`
    : `<span class="badge badge-red" style="font-size:0.95rem; font-weight:800; padding:6px 18px; border-radius:10px;"><i class="fa-solid fa-circle-xmark"></i> ไม่ผ่านเกณฑ์ (${res.percentage}%)</span>`;

  // Render Stats Summary
  const statsContainer = document.getElementById('res-stats-summary');
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="exam-stat-card">
        <div class="val" style="color:${res.passed ? '#059669' : '#dc2626'};">${res.percentage}%</div>
        <div class="lbl">ร้อยละที่ได้</div>
      </div>
      <div class="exam-stat-card">
        <div class="val" style="color:#2563eb;">${res.score}/${res.totalScore}</div>
        <div class="lbl">ข้อที่ถูก</div>
      </div>
      <div class="exam-stat-card">
        <div class="val" style="color:#d97706;">${quiz.passScore}%</div>
        <div class="lbl">เกณฑ์ผ่าน</div>
      </div>
    `;
  }

  openModal('modal-quiz-result');
}

// Open Teacher Quiz Scores Modal
function openQuizScoresModal(quizId) {
  if (!currentUser || currentUser.role === 'student') {
    showPopupError("ไม่มีสิทธิ์ดำเนินการ", "นักเรียนไม่มีสิทธิ์ดูรายงานคะแนนสอบของห้อง");
    return;
  }

  const quiz = quizzesData[quizId];
  if (!quiz) return;

  const course = coursesData[quiz.courseId] || { name: 'วิชาทั่วไป', code: '-' };
  document.getElementById('active-viewing-quiz-id').value = quizId;
  document.getElementById('quiz-scores-subtitle').innerHTML = `
    <span style="color:#60a5fa; font-weight:700;"><i class="fa-solid fa-book"></i> ${course.code || '-'} ${course.name}</span> 
    • <strong style="color:#ffffff;">${quiz.title}</strong> 
    • เกณฑ์ผ่าน ${quiz.passScore}%
  `;

  // Populate Classrooms Filter
  const filterSelect = document.getElementById('quiz-score-class-filter');
  const classSet = new Set();

  // Add classes from students who submitted
  const quizSubs = quizResultsData[quizId] || {};
  Object.values(quizSubs).forEach(sub => {
    if (sub.classLevel && sub.classLevel.trim()) {
      classSet.add(sub.classLevel.trim().replace(/^"|"$/g, ''));
    }
  });

  // Add target classes from quiz
  const targets = quiz.targetClasses || (quiz.targetClass ? quiz.targetClass.split(',').map(s => s.trim()) : ['all']);
  if (!targets.includes('all')) {
    targets.forEach(t => classSet.add(t.replace(/^"|"$/g, '')));
  } else {
    // Add all classes from studentsData
    Object.values(studentsData).forEach(s => {
      if (s.classLevel && s.classLevel.trim()) {
        classSet.add(s.classLevel.trim().replace(/^"|"$/g, ''));
      }
    });
  }

  const sortedClasses = Array.from(classSet).filter(Boolean).sort((a, b) => a.localeCompare(b, 'th', { numeric: true }));
  let optionsHtml = `<option value="all">-- ทุกห้องเรียน (${sortedClasses.length} ห้อง) --</option>`;
  sortedClasses.forEach(cls => {
    optionsHtml += `<option value="${cls}">ห้อง ${cls}</option>`;
  });
  filterSelect.innerHTML = optionsHtml;
  filterSelect.value = 'all';

  renderQuizScoresTable();
  openModal('modal-quiz-scores');
}

function renderQuizScoresTable() {
  const quizId = document.getElementById('active-viewing-quiz-id').value;
  const quiz = quizzesData[quizId];
  if (!quiz) return;

  const classFilter = document.getElementById('quiz-score-class-filter').value;
  const tbody = document.getElementById('quiz-scores-table-body');
  const pillsContainer = document.getElementById('quiz-score-summary-pills');

  const quizSubs = quizResultsData[quizId] || {};
  let studentIds = Object.keys(quizSubs);

  // Filter submissions by selected classroom
  if (classFilter && classFilter !== 'all') {
    studentIds = studentIds.filter(sId => {
      const sub = quizSubs[sId];
      const std = studentsData[sId] || {};
      const actualClass = (sub.classLevel || std.classLevel || '').trim().replace(/^"|"$/g, '');
      return actualClass === classFilter;
    });
  }

  // Sort by classroom, then by No (เลขที่)
  studentIds.sort((a, b) => {
    const stdA = studentsData[a] || {};
    const stdB = studentsData[b] || {};
    const classA = (quizSubs[a].classLevel || stdA.classLevel || '').trim();
    const classB = (quizSubs[b].classLevel || stdB.classLevel || '').trim();
    if (classA !== classB) return classA.localeCompare(classB, 'th', { numeric: true });
    const noA = parseInt(stdA.no) || 999;
    const noB = parseInt(stdB.no) || 999;
    return noA - noB;
  });

  // Calculate Statistics
  const totalCount = studentIds.length;
  let passedCount = 0;
  let failedCount = 0;
  let totalScoresSum = 0;

  studentIds.forEach(sId => {
    const sub = quizSubs[sId];
    if (sub.passed) passedCount++;
    else failedCount++;
    totalScoresSum += (sub.score !== undefined ? sub.score : 0);
  });

  const maxScore = quiz.questions ? quiz.questions.length : 0;
  const avgScore = totalCount > 0 ? (totalScoresSum / totalCount).toFixed(1) : '0';
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  // Render Summary Pills
  if (pillsContainer) {
    pillsContainer.innerHTML = `
      <span class="badge badge-purple" style="font-size:0.82rem; font-weight:700; padding:6px 12px; border-radius:8px;">
        <i class="fa-solid fa-users"></i> ผู้เข้าสอบ ${totalCount} คน
      </span>
      <span class="badge" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-size:0.82rem; font-weight:700; padding:6px 12px; border-radius:8px;">
        <i class="fa-solid fa-calculator"></i> เฉลี่ย ${avgScore} / ${maxScore} คะแนน
      </span>
      <span class="badge badge-green" style="font-size:0.82rem; font-weight:700; padding:6px 12px; border-radius:8px;">
        <i class="fa-solid fa-circle-check"></i> ผ่าน ${passedCount} คน (${passRate}%)
      </span>
      ${failedCount > 0 ? `
        <span class="badge badge-red" style="font-size:0.82rem; font-weight:700; padding:6px 12px; border-radius:8px;">
          <i class="fa-solid fa-circle-xmark"></i> ไม่ผ่าน ${failedCount} คน
        </span>
      ` : ''}
    `;
  }

  // Render Table Body
  if (totalCount === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding:40px 20px; color:#64748b;">
          <i class="fa-solid fa-inbox" style="font-size:2rem; color:#cbd5e1; display:block; margin-bottom:8px;"></i>
          ยังไม่มีนักเรียนใน${classFilter === 'all' ? 'ระบบ' : 'ห้อง ' + classFilter} ทำแบบทดสอบชุดนี้
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  studentIds.forEach((studentId, idx) => {
    const sub = quizSubs[studentId];
    const std = studentsData[studentId] || {};
    const no = std.no ? std.no : idx + 1;
    const studentName = sub.studentName || std.name || '-';
    const classLevel = (sub.classLevel || std.classLevel || '-').trim().replace(/^"|"$/g, '');
    const isPassed = sub.passed;
    const completedAt = sub.completedAt || '-';

    html += `
      <tr>
        <td style="text-align:center; font-weight:600; color:#64748b;">${idx + 1}</td>
        <td style="text-align:center; font-weight:700; color:#1e293b;">${no}</td>
        <td>
          <span class="badge badge-blue" style="font-family:monospace; font-weight:700; font-size:0.85rem;">
            ${studentId}
          </span>
        </td>
        <td>
          <strong style="color:#0f172a; font-size:0.95rem;">${studentName}</strong>
        </td>
        <td>
          <span class="badge badge-purple" style="font-size:0.8rem; font-weight:700;">
            ห้อง ${classLevel}
          </span>
        </td>
        <td style="text-align:center; font-size:0.84rem; color:#64748b;">
          ${completedAt}
        </td>
        <td style="text-align:center;">
          <strong style="font-size:1.05rem; color:${isPassed ? '#059669' : '#dc2626'};">
            ${sub.score} / ${sub.totalScore || maxScore}
          </strong>
        </td>
        <td style="text-align:center; font-weight:700; color:#475569; font-size:0.92rem;">
          ${sub.percentage}%
        </td>
        <td style="text-align:center;">
          <span class="badge ${isPassed ? 'badge-green' : 'badge-red'}" style="font-size:0.8rem; font-weight:800; padding:4px 10px; border-radius:8px;">
            <i class="${isPassed ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'}"></i> ${isPassed ? 'ผ่านเกณฑ์' : 'ไม่ผ่าน'}
          </span>
        </td>
        <td style="text-align:center;">
          <button type="button" class="btn btn-sm btn-outline-danger" onclick="resetStudentQuizAttempt('${quizId}', '${studentId}', '${studentName.replace(/'/g, "\\'")}')" style="border-radius:8px; padding:4px 8px; font-size:0.78rem;" title="ลบคะแนนเพื่อให้นักเรียนสอบใหม่">
            <i class="fa-solid fa-rotate-left"></i> สอบใหม่
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function resetStudentQuizAttempt(quizId, studentId, studentName) {
  showPopupConfirm(
    "ยืนยันลบคะแนนสอบ", 
    `คุณต้องการลบผลการสอบของ "${studentName}" (รหัส ${studentId}) เพื่อให้นักเรียนสามารถเข้าทำแบบทดสอบใหม่อีกครั้งใช่หรือไม่?`, 
    "ลบคะแนนสอบ", 
    "warning"
  ).then((confirmed) => {
    if (confirmed) {
      deleteData(`quiz_results/${quizId}/${studentId}`).then(() => {
        showPopupSuccess("ลบผลการสอบสำเร็จ", `ลบข้อมูลผลสอบของ ${studentName} เรียบร้อยแล้ว นักเรียนสามารถเข้าทำแบบทดสอบใหม่ได้ทันที`);
        renderQuizScoresTable();
        logActivity(`ลบผลคะแนนสอบของนักเรียน: ${studentName}`);
      });
    }
  });
}


/* -------------------------------------------------------------
   8. SCORE REPORT MATRIX WITH ROOM FILTER & STUDENT SEARCH
------------------------------------------------------------- */
function resetReportFilters() {
  const repFilter = document.getElementById('report-class-filter');
  const courseFilter = document.getElementById('report-course-filter');
  const searchInput = document.getElementById('report-student-search-input');
  
  if (searchInput) searchInput.value = '';
  if (courseFilter) courseFilter.value = '';
  
  // Set default back to ม.1/1 if available
  const classSet = new Set();
  Object.values(studentsData).forEach(s => {
    if (s.classLevel && s.classLevel.trim()) classSet.add(s.classLevel.trim().replace(/^"|"$/g, ''));
  });
  const sortedClasses = Array.from(classSet).sort((a, b) => a.localeCompare(b, 'th', { numeric: true }));
  if (repFilter) {
    if (sortedClasses.includes('ม.1/1')) {
      repFilter.value = 'ม.1/1';
    } else if (sortedClasses.length > 0) {
      repFilter.value = sortedClasses[0];
    } else {
      repFilter.value = 'all';
    }
  }
  
  renderScoreReports();
}

function renderScoreReports() {
  const tbody = document.getElementById('reports-table-body');
  if (!tbody) return;
  const classFilter = document.getElementById('report-class-filter')?.value;
  const courseFilter = document.getElementById('report-course-filter')?.value;
  const searchQuery = document.getElementById('report-student-search-input')?.value.toLowerCase().trim() || '';

  const allStudents = Object.values(studentsData);
  if (allStudents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px;" class="text-muted">ยังไม่มีข้อมูลนักเรียน</td></tr>`;
    return;
  }

  // Pre-filter active homework & quizzes once for all students
  const activeHws = Object.keys(homeworkData)
    .filter(hwId => !courseFilter || homeworkData[hwId].courseId === courseFilter)
    .map(hwId => ({ id: hwId, maxScore: homeworkData[hwId].maxScore || 10 }));
  const totalHwPossible = activeHws.reduce((sum, hw) => sum + hw.maxScore, 0);

  const activeQuizzes = Object.keys(quizzesData)
    .filter(qId => !courseFilter || quizzesData[qId].courseId === courseFilter)
    .map(qId => ({ id: qId, totalQuestions: (quizzesData[qId].questions ? quizzesData[qId].questions.length : 0) }));
  const totalQuizPossible = activeQuizzes.reduce((sum, q) => sum + q.totalQuestions, 0);

  const totalPossible = totalHwPossible + totalQuizPossible;

  // Filter students by classroom and search query
  let filteredStudents = allStudents.filter(std => {
    const sClass = (std.classLevel || '').trim().replace(/^"|"$/g, '');
    if (classFilter && classFilter !== 'all' && sClass !== classFilter) {
      return false;
    }

    if (searchQuery) {
      const sNo = String(std.no || '').toLowerCase();
      const sId = String(std.studentId || '').toLowerCase();
      const sName = String(std.name || '').toLowerCase();
      if (!sNo.includes(searchQuery) && !sId.includes(searchQuery) && !sName.includes(searchQuery)) {
        return false;
      }
    }
    return true;
  });

  if (filteredStudents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:35px 20px;" class="text-muted"><i class="fa-solid fa-magnifying-glass fa-2x" style="margin-bottom:8px; display:block; color:#94a3b8;"></i>ไม่พบข้อมูลคะแนนตามเงื่อนไขที่เลือก</td></tr>`;
    return;
  }

  // Sort by student number (no) ascending, then studentId
  filteredStudents.sort((a, b) => {
    const noA = parseInt(a.no) || 9999;
    const noB = parseInt(b.no) || 9999;
    if (noA !== noB) return noA - noB;
    return (a.studentId || '').localeCompare(b.studentId || '', 'th');
  });

  let html = '';
  filteredStudents.forEach(std => {
    const studentId = std.studentId;

    let totalHwEarned = 0;
    for (let h = 0; h < activeHws.length; h++) {
      const hw = activeHws[h];
      const sub = submissionsData[hw.id]?.[studentId];
      if (sub && sub.score !== undefined) {
        totalHwEarned += sub.score;
      }
    }

    let totalQuizEarned = 0;
    for (let q = 0; q < activeQuizzes.length; q++) {
      const quiz = activeQuizzes[q];
      const qRes = quizResultsData[quiz.id]?.[studentId];
      if (qRes && qRes.score !== undefined) {
        totalQuizEarned += qRes.score;
      }
    }

    const totalEarned = totalHwEarned + totalQuizEarned;
    const percent = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

    html += `
      <tr>
        <td style="text-align:center; font-weight:700; color:#64748b;">${std.no || '-'}</td>
        <td><code style="font-weight:700; font-size:0.9rem;">${std.studentId}</code></td>
        <td><strong>${std.name}</strong></td>
        <td style="text-align:center;"><span class="badge badge-yellow" style="font-weight:700;">ห้อง ${std.classLevel || '-'}</span></td>
        <td style="text-align:center; font-weight:600;">${totalHwEarned} <span style="font-size:0.8rem; color:#64748b;">/ ${totalHwPossible}</span></td>
        <td style="text-align:center; font-weight:600;">${totalQuizEarned} <span style="font-size:0.8rem; color:#64748b;">/ ${totalQuizPossible}</span></td>
        <td style="text-align:center;">
          <strong style="color:var(--primary); font-size:1.05rem;">${totalEarned} / ${totalPossible}</strong> 
          <span class="badge ${percent >= 50 ? 'badge-green' : 'badge-red'}" style="margin-left:6px; font-weight:800;">${percent}%</span>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}


/* -------------------------------------------------------------
   9. USER MANAGEMENT (SEARCH & 10-PER-PAGE PAGINATION)
------------------------------------------------------------- */
let userManagementCurrentPage = 1;
const USERS_PER_PAGE = 10;

function onUserSearchInput() {
  userManagementCurrentPage = 1;
  renderUsersTable();
}

function onUserFilterChange() {
  userManagementCurrentPage = 1;
  renderUsersTable();
}

function resetUserFilters() {
  const searchInput = document.getElementById('user-search-input');
  const roleFilter = document.getElementById('user-role-filter');
  if (searchInput) searchInput.value = '';
  if (roleFilter) roleFilter.value = 'all';
  userManagementCurrentPage = 1;
  renderUsersTable();
}

function changeUsersPage(page) {
  userManagementCurrentPage = page;
  renderUsersTable();
}

function renderUsersTable() {
  const tbody = document.getElementById('users-table-body');
  const paginationInfo = document.getElementById('users-pagination-info');
  const paginationControls = document.getElementById('users-pagination-controls');
  if (!tbody) return;

  const searchInput = document.getElementById('user-search-input');
  const roleFilter = document.getElementById('user-role-filter');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedRole = roleFilter ? roleFilter.value : 'all';

  let userKeys = Object.keys(usersData);

  if (userKeys.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px;" class="text-muted">กำลังโหลดข้อมูลผู้ใช้...</td></tr>`;
    if (paginationInfo) paginationInfo.innerText = `แสดง 0 - 0 จากทั้งหมด 0 คน`;
    if (paginationControls) paginationControls.innerHTML = '';
    return;
  }

  // Filter users by search term and role
  const filteredUsers = userKeys
    .map(username => usersData[username])
    .filter(u => {
      if (!u) return false;

      // Role filter
      if (selectedRole !== 'all') {
        const uRole = u.role || 'teacher';
        if (selectedRole === 'teacher' && uRole !== 'teacher') return false;
        if (selectedRole === 'admin' && uRole !== 'admin') return false;
        if (selectedRole === 'student' && uRole !== 'student') return false;
      }

      // Text search filter
      if (query) {
        const username = (u.username || '').toLowerCase();
        const name = (u.name || '').toLowerCase();
        const studentId = (u.studentId || '').toLowerCase();
        const classLevel = (u.classLevel || '').toLowerCase();
        const role = (u.role || '').toLowerCase();
        const roleTh = role === 'admin' ? 'ผู้ดูแลระบบ' : (role === 'student' ? 'นักเรียน' : 'ครู บุคลากร');

        const match = username.includes(query) || 
                      name.includes(query) || 
                      studentId.includes(query) || 
                      classLevel.includes(query) || 
                      roleTh.includes(query);
        if (!match) return false;
      }

      return true;
    });

  const totalFiltered = filteredUsers.length;
  const totalPages = Math.ceil(totalFiltered / USERS_PER_PAGE) || 1;

  // Boundary check
  if (userManagementCurrentPage > totalPages) {
    userManagementCurrentPage = totalPages;
  }
  if (userManagementCurrentPage < 1) {
    userManagementCurrentPage = 1;
  }

  // Slice items for current page (10 per page)
  const startIndex = (userManagementCurrentPage - 1) * USERS_PER_PAGE;
  const endIndex = Math.min(startIndex + USERS_PER_PAGE, totalFiltered);
  const pageItems = filteredUsers.slice(startIndex, endIndex);

  if (pageItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:35px 20px;" class="text-muted">
          <i class="fa-solid fa-user-slash" style="font-size:2rem; margin-bottom:8px; display:block; color:#94a3b8;"></i>
          ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา "${query}"
        </td>
      </tr>
    `;
    if (paginationInfo) paginationInfo.innerText = `ไม่พบข้อมูลผู้ใช้งาน`;
    if (paginationControls) paginationControls.innerHTML = '';
    return;
  }

  // Render table rows
  let html = '';
  pageItems.forEach((u, index) => {
    const rowNumber = startIndex + index + 1;
    let roleBadge = `<span class="badge badge-blue"><i class="fa-solid fa-chalkboard-user"></i> ครู / บุคลากร</span>`;
    if (u.role === 'admin') roleBadge = `<span class="badge badge-purple"><i class="fa-solid fa-shield-halved"></i> ผู้ดูแลระบบ</span>`;
    if (u.role === 'student') roleBadge = `<span class="badge badge-green"><i class="fa-solid fa-user-graduate"></i> นักเรียน</span>`;

    html += `
      <tr>
        <td style="text-align:center; font-weight:700; color:#64748b;">${rowNumber}</td>
        <td><code style="font-weight:700; font-size:0.92rem; color:#1d4ed8; background:#eff6ff; padding:2px 8px; border-radius:6px; border:1px solid #bfdbfe;">${u.username}</code></td>
        <td><strong>${u.name}</strong></td>
        <td style="text-align:center;">${roleBadge}</td>
        <td>
          ${u.classLevel ? `<span class="badge badge-yellow" style="font-weight:700;">ระดับชั้น ${u.classLevel}</span>` : ''}
          ${u.studentId ? `<span class="badge badge-blue" style="font-family:monospace; margin-left:4px;">รหัส ${u.studentId}</span>` : ''}
          ${!u.classLevel && !u.studentId ? '<span style="color:#94a3b8;">-</span>' : ''}
        </td>
        <td style="text-align:center;">
          <button class="btn btn-sm btn-secondary" onclick="openChangePasswordModal('${u.username}')" style="border-radius:8px; font-weight:600; padding:5px 10px;" title="เปลี่ยนรหัสผ่าน">
            <i class="fa-solid fa-key"></i> เปลี่ยนรหัส
          </button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;

  // Render pagination info
  if (paginationInfo) {
    paginationInfo.innerHTML = `แสดง <strong>${startIndex + 1} - ${endIndex}</strong> จากทั้งหมด <strong>${totalFiltered}</strong> คน (หน้า ${userManagementCurrentPage}/${totalPages})`;
  }

  // Render pagination buttons (Page 1, 2, 3, 4, 5... Previous, Next)
  if (paginationControls) {
    let pagesHtml = '';

    // First & Previous Buttons
    pagesHtml += `
      <button class="page-btn" onclick="changeUsersPage(1)" ${userManagementCurrentPage === 1 ? 'disabled' : ''} title="หน้าแรก">
        <i class="fa-solid fa-angles-left"></i>
      </button>
      <button class="page-btn" onclick="changeUsersPage(${userManagementCurrentPage - 1})" ${userManagementCurrentPage === 1 ? 'disabled' : ''} title="ก่อนหน้า">
        <i class="fa-solid fa-angle-left"></i>
      </button>
    `;

    // Smart Page Numbers (show up to 5 adjacent pages with dots)
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, userManagementCurrentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    if (startPage > 1) {
      pagesHtml += `<button class="page-btn" onclick="changeUsersPage(1)">1</button>`;
      if (startPage > 2) pagesHtml += `<span class="page-dots">...</span>`;
    }

    for (let p = startPage; p <= endPage; p++) {
      pagesHtml += `
        <button class="page-btn ${p === userManagementCurrentPage ? 'active' : ''}" onclick="changeUsersPage(${p})">
          ${p}
        </button>
      `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pagesHtml += `<span class="page-dots">...</span>`;
      pagesHtml += `<button class="page-btn" onclick="changeUsersPage(${totalPages})">${totalPages}</button>`;
    }

    // Next & Last Buttons
    pagesHtml += `
      <button class="page-btn" onclick="changeUsersPage(${userManagementCurrentPage + 1})" ${userManagementCurrentPage === totalPages ? 'disabled' : ''} title="ถัดไป">
        <i class="fa-solid fa-angle-right"></i>
      </button>
      <button class="page-btn" onclick="changeUsersPage(${totalPages})" ${userManagementCurrentPage === totalPages ? 'disabled' : ''} title="หน้าสุดท้าย">
        <i class="fa-solid fa-angles-right"></i>
      </button>
    `;

    paginationControls.innerHTML = pagesHtml;
  }
}

function openAddUserModal() {
  document.getElementById('new-username').value = '';
  document.getElementById('new-user-fullname').value = '';
  document.getElementById('new-user-password').value = '';
  openModal('modal-add-user');
}

function toggleUserFormFields() {
  // Can add dynamic field behavior if needed
}

function saveUserForm(e) {
  e.preventDefault();
  const role = document.getElementById('new-user-role').value;
  const username = document.getElementById('new-username').value.trim();
  const name = document.getElementById('new-user-fullname').value.trim();
  const password = document.getElementById('new-user-password').value.trim();

  saveData(`users/${username}`, {
    username,
    name,
    password,
    role,
    createdAt: new Date().toISOString()
  }).then(() => {
    closeModal('modal-add-user');
    showPopupSuccess("สร้างผู้ใช้สำเร็จ!", `สร้างบัญชีผู้ใช้งาน ${name} (${role}) เรียบร้อยแล้ว`);
    logActivity(`เพิ่มผู้ใช้งานใหม่: ${name} (${role})`);
  });
}

function openChangePasswordModal(username) {
  const u = usersData[username];
  if (!u) return;

  document.getElementById('change-pwd-username').value = username;
  document.getElementById('change-pwd-target-info').innerText = `ผู้ใช้งาน: ${u.name} (${u.username})`;
  document.getElementById('target-new-password').value = '';
  openModal('modal-change-password');
}

function saveChangePassword(e) {
  e.preventDefault();
  const username = document.getElementById('change-pwd-username').value;
  const newPassword = document.getElementById('target-new-password').value.trim();

  updateData(`users/${username}`, {
    password: newPassword
  }).then(() => {
    closeModal('modal-change-password');
    showPopupSuccess("เปลี่ยนรหัสผ่านสำเร็จ!", `อัปเดตรหัสผ่านใหม่สำหรับ ${username} เรียบร้อยแล้ว`);
    logActivity(`เปลี่ยนรหัสผ่านสำหรับผู้ใช้: ${username}`);
  });
}


/* -------------------------------------------------------------
   10. MODAL & INTERACTIVE PDF VIEWER UTILITIES
------------------------------------------------------------- */
function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add('active');
}

function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('active');
}

let currentActivePdfDoc = null;
let currentPdfRenderScale = 1.0;
let currentActivePdfDataOrUrl = null;
let currentActiveFileTitle = 'document';

function convertDataURIToBinary(dataURI) {
  const base64Index = dataURI.indexOf(';base64,');
  let base64 = dataURI;
  if (base64Index !== -1) {
    base64 = dataURI.substring(base64Index + ';base64,'.length);
  }
  const raw = window.atob(base64);
  const rawLength = raw.length;
  const array = new Uint8Array(new ArrayBuffer(rawLength));
  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

function zoomPdf(delta) {
  if (!currentActivePdfDoc) return;
  const newScale = Math.min(3.0, Math.max(0.4, currentPdfRenderScale + delta));
  if (Math.abs(newScale - currentPdfRenderScale) < 0.05) return;
  currentPdfRenderScale = newScale;
  renderPdfPages();
}

function resetPdfZoom() {
  if (!currentActivePdfDoc) return;
  calculatePdfFitScale();
  renderPdfPages();
}

function openPdfInNewTab() {
  if (!currentActivePdfDataOrUrl) return;

  if (currentActivePdfDataOrUrl.startsWith('data:application/pdf')) {
    const blob = getPdfBlob(currentActivePdfDataOrUrl);
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  } else {
    window.open(currentActivePdfDataOrUrl, '_blank');
  }
}

function getPdfBlob(base64DataUrl) {
  try {
    const parts = base64DataUrl.split(';base64,');
    const contentType = parts[0].split(':')[1] || 'application/pdf';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  } catch (err) {
    return new Blob([base64DataUrl], { type: 'application/pdf' });
  }
}

function getPdfBlobUrl(base64DataUrl) {
  try {
    if (!base64DataUrl || !base64DataUrl.startsWith('data:application/pdf')) {
      return base64DataUrl;
    }
    const blob = getPdfBlob(base64DataUrl);
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn("Error converting base64 to blob:", err);
    return base64DataUrl;
  }
}

function calculatePdfFitScale() {
  if (!currentActivePdfDoc) return;
  const container = document.getElementById('file-preview-body');
  const availableWidth = container ? (container.clientWidth - 36) : (window.innerWidth - 60);
  const defaultPageWidth = 595;
  const fitScale = Math.min(1.6, Math.max(0.45, availableWidth / defaultPageWidth));
  currentPdfRenderScale = fitScale;
}

async function renderPdfPages() {
  if (!currentActivePdfDoc) return;

  const container = document.getElementById('file-preview-body');
  const zoomText = document.getElementById('pdf-zoom-level-text');
  const pageInfo = document.getElementById('pdf-page-count-info');

  if (zoomText) {
    zoomText.innerText = `${Math.round(currentPdfRenderScale * 100)}%`;
  }
  if (pageInfo) {
    pageInfo.innerText = `เอกสารทั้งหมด ${currentActivePdfDoc.numPages} หน้า`;
  }

  container.innerHTML = '';

  const pagesWrapper = document.createElement('div');
  pagesWrapper.id = 'pdf-pages-scroll-wrapper';
  pagesWrapper.style.cssText = 'width:100%; display:flex; flex-direction:column; align-items:center; gap:16px; padding:12px 6px;';
  container.appendChild(pagesWrapper);

  const pixelRatio = Math.min(2, window.devicePixelRatio || 1);

  for (let pageNum = 1; pageNum <= currentActivePdfDoc.numPages; pageNum++) {
    try {
      const page = await currentActivePdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: currentPdfRenderScale });

      const pageCard = document.createElement('div');
      pageCard.style.cssText = 'background:#ffffff; box-shadow:0 6px 20px rgba(0,0,0,0.3); border-radius:8px; overflow:hidden; position:relative; max-width:100%;';

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      canvas.style.maxWidth = '100%';
      canvas.style.display = 'block';

      ctx.scale(pixelRatio, pixelRatio);

      const pageBadge = document.createElement('div');
      pageBadge.innerText = `หน้า ${pageNum} / ${currentActivePdfDoc.numPages}`;
      pageBadge.style.cssText = 'position:absolute; bottom:8px; right:8px; background:rgba(15,23,42,0.75); color:#fff; font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:6px; pointer-events:none; backdrop-filter:blur(4px);';

      pageCard.appendChild(canvas);
      pageCard.appendChild(pageBadge);
      pagesWrapper.appendChild(pageCard);

      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;
    } catch (pageErr) {
      console.warn(`Error rendering PDF page ${pageNum}:`, pageErr);
    }
  }
}

async function showPDFPreviewModal(fileUrl, fileTitle = 'เอกสารคำสั่งงาน PDF') {
  if (!fileUrl) return;

  fileUrl = fileUrl.replace(/^http:\/\//i, 'https://');
  const isPdf = fileUrl.includes('application/pdf') || fileUrl.includes('.pdf') || fileUrl.toLowerCase().includes('pdf');

  currentActivePdfDataOrUrl = fileUrl;
  currentActiveFileTitle = fileTitle;

  const titleEl = document.getElementById('file-preview-title');
  if (titleEl) {
    titleEl.innerHTML = `<i class="${isPdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-image'}" style="color:${isPdf ? '#ef4444' : '#2563eb'};"></i> ${fileTitle}`;
  }

  const zoomControls = document.getElementById('pdf-zoom-controls');
  const pageInfo = document.getElementById('pdf-page-count-info');
  const container = document.getElementById('file-preview-body');
  const downloadBtn = document.getElementById('file-preview-download');

  if (downloadBtn) {
    if (fileUrl.startsWith('data:application/pdf')) {
      const blob = getPdfBlob(fileUrl);
      downloadBtn.href = URL.createObjectURL(blob);
    } else {
      downloadBtn.href = fileUrl;
    }
    downloadBtn.setAttribute('download', `${fileTitle || 'document'}.pdf`);
  }

  openModal('modal-file-preview');

  if (!container) return;

  if (isPdf) {
    if (zoomControls) zoomControls.style.display = 'inline-flex';
    if (pageInfo) pageInfo.innerText = 'กำลังโหลดเอกสาร...';
    container.style.background = '#334155';

    container.innerHTML = `
      <div style="padding:60px 20px; text-align:center; color:#e2e8f0;">
        <i class="fa-solid fa-spinner fa-spin fa-3x" style="color:#38bdf8; margin-bottom:16px;"></i>
        <h4 style="font-weight:700; color:#ffffff; font-size:1.15rem;">กำลังเรนเดอร์เอกสาร PDF...</h4>
        <p style="font-size:0.86rem; color:#94a3b8; margin-top:4px;">ระบบกำลังเตรียมหน้าเอกสารสำหรับมือถือและแท็บเล็ต</p>
      </div>
    `;

    try {
      if (typeof window.pdfjsLib === 'undefined') {
        throw new Error("pdfjsLib not available");
      }

      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      let loadingTask;
      if (fileUrl.startsWith('data:application/pdf')) {
        const pdfBytes = convertDataURIToBinary(fileUrl);
        loadingTask = window.pdfjsLib.getDocument({ data: pdfBytes });
      } else {
        loadingTask = window.pdfjsLib.getDocument(fileUrl);
      }

      const pdfDoc = await loadingTask.promise;
      currentActivePdfDoc = pdfDoc;

      calculatePdfFitScale();
      await renderPdfPages();

    } catch (err) {
      console.error("PDF.js loading failed, using fallback:", err);
      if (pageInfo) pageInfo.innerText = '';
      if (zoomControls) zoomControls.style.display = 'none';

      container.innerHTML = `
        <div style="padding:40px 20px; text-align:center; color:#e2e8f0; max-width:480px; margin:auto;">
          <div style="width:64px; height:64px; border-radius:50%; background:rgba(239,68,68,0.2); color:#ef4444; display:flex; align-items:center; justify-content:center; font-size:1.8rem; margin:0 auto 16px;">
            <i class="fa-solid fa-file-pdf"></i>
          </div>
          <h4 style="font-weight:800; color:#ffffff; font-size:1.2rem; margin-bottom:8px;">${fileTitle}</h4>
          <p style="font-size:0.88rem; color:#cbd5e1; margin-bottom:20px; line-height:1.5;">
            กดปุ่มด้านล่างเพื่อเปิดอ่านเอกสาร PDF ในแท็บใหม่ หรือดาวน์โหลดลงในโทรศัพท์/ไอแพดของคุณได้ทันที
          </p>
          <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
            <button type="button" class="btn btn-primary" onclick="openPdfInNewTab()" style="border-radius:10px; font-weight:700; padding:10px 18px;">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> เปิดดูเอกสาร
            </button>
            <a href="${fileUrl}" download="${fileTitle}.pdf" class="btn btn-success" style="border-radius:10px; font-weight:700; padding:10px 18px;">
              <i class="fa-solid fa-download"></i> ดาวน์โหลด PDF
            </a>
          </div>
        </div>
      `;
    }

  } else {
    // Image File Preview
    if (zoomControls) zoomControls.style.display = 'none';
    if (pageInfo) pageInfo.innerText = '';
    container.style.background = '#f8fafc';
    container.innerHTML = `
      <div style="padding:16px; text-align:center;">
        <img src="${fileUrl}" style="max-width:100%; max-height:75vh; object-fit:contain; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.15);" alt="ตัวอย่างรูปภาพ">
      </div>
    `;
  }
}

// Backward compatibility alias
function openFilePreviewModal(fileUrl, fileTitle) {
  showPDFPreviewModal(fileUrl, fileTitle);
}

function openLightbox(imageUrl) {
  showPDFPreviewModal(imageUrl, 'รูปภาพชิ้นงาน');
}

/* -------------------------------------------------------------
   11. LIVE DIGITAL CLOCK (Header Clock)
------------------------------------------------------------- */
function updateLiveClock() {
  const clockEl = document.getElementById('live-clock-time');
  if (!clockEl) return;
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  clockEl.innerText = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateLiveClock, 1000);
updateLiveClock();

