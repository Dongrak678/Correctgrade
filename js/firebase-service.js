/**
 * ระบบติดตามแก้ไขผลการเรียน (Academic Remediation System)
 * firebase-service.js - การเชื่อมต่อและซิงค์ข้อมูลกับ Firebase Realtime Database
 */

class FirebaseService {
  constructor() {
    this.baseUrl = APP_CONFIG.FIREBASE_DB_URL.endsWith('/') 
      ? APP_CONFIG.FIREBASE_DB_URL 
      : `${APP_CONFIG.FIREBASE_DB_URL}/`;
    
    this.listeners = {};
    this.cache = {
      users: [],
      teachers: [],
      students: [],
      records: [],
      auditLogs: [],
      activityLogs: []
    };
    this.isOnline = navigator.onLine;
    this.syncStatus = 'idle'; // 'idle', 'syncing', 'error'
    this.pollInterval = null;

    // Listen to network changes
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));
  }

  async init() {
    console.log("⚡ กำลังเชื่อมต่อ Firebase Realtime Database...", this.baseUrl);
    
    // โหลดข้อมูลจาก LocalStorage ก่อนเพื่อความเร็วสูงที่สุด (Instant Load)
    this.loadFromLocalStorage();

    // ดึงข้อมูลจริงจาก Firebase
    try {
      await this.syncAllData();
      // เริ่มต้นโพลตรวจสอบการเปลี่ยนแปลง (SSE/Polling 5 วินาที สำหรับ Realtime Sync)
      this.startRealtimePolling(5000);
      this.updateConnectionStatus('online', 'เชื่อมต่อฐานข้อมูลสำเร็จ (Realtime Live)');
    } catch (err) {
      console.warn("⚠️ ไม่สามารถเชื่อมต่อ Firebase ได้ทันที ใช้ข้อมูล Local Cache แทน:", err);
      // ถ้าไม่มีการตั้งค่าระบบและไม่มีข้อมูลใน LocalStorage เลย ให้โหลด Initial Seed
      const isInit = localStorage.getItem('dongrak_system_initialized');
      if (!isInit && (!this.cache.users || this.cache.users.length === 0)) {
        this.seedInitialDataLocally();
      }
      this.updateConnectionStatus('offline', 'ทำงานในโหมด Offline Cache');
    }
  }

  handleNetworkChange(online) {
    this.isOnline = online;
    if (online) {
      this.updateConnectionStatus('online', 'ออนไลน์ - กำลังซิงค์ข้อมูล');
      this.syncAllData();
    } else {
      this.updateConnectionStatus('offline', 'ออฟไลน์ - กำลังใช้งานข้อมูลแคช');
    }
  }

  updateConnectionStatus(status, text) {
    const badge = document.getElementById('db-status-badge');
    const textEl = document.getElementById('db-status-text');
    if (badge && textEl) {
      badge.className = `status-dot ${status === 'online' ? 'dot-online' : 'dot-offline'}`;
      textEl.innerText = text || (status === 'online' ? 'Realtime DB พร้อมใช้งาน' : 'Offline Mode');
    }
  }

  loadFromLocalStorage() {
    try {
      const keys = ['users', 'teachers', 'students', 'records', 'auditLogs', 'activityLogs'];
      const isInit = localStorage.getItem('dongrak_system_initialized');

      if (!isInit) {
        // ครั้งแรกสุดที่ยังไม่เคยเปิดแอปเลย
        this.seedInitialDataLocally();
        return;
      }

      keys.forEach(key => {
        const stored = localStorage.getItem(`dongrak_${key}`);
        if (stored !== null) {
          this.cache[key] = JSON.parse(stored);
        } else {
          this.cache[key] = [];
        }
      });
    } catch (e) {
      console.error("Error loading from localStorage:", e);
      this.cache = { users: [], teachers: [], students: [], records: [], auditLogs: [], activityLogs: [] };
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('dongrak_system_initialized', 'true');
      Object.keys(this.cache).forEach(key => {
        localStorage.setItem(`dongrak_${key}`, JSON.stringify(this.cache[key] || []));
      });
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  }

  seedInitialDataLocally() {
    this.cache = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    this.saveToLocalStorage();
  }

  // ซิงค์ข้อมูลทั้งหมดจาก Firebase REST API
  async syncAllData() {
    this.syncStatus = 'syncing';
    try {
      const response = await fetch(`${this.baseUrl}.json`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();

      const isInit = localStorage.getItem('dongrak_system_initialized');

      if ((!data || Object.keys(data).length === 0) && !isInit) {
        // หาก Firebase ว่างเปล่าและยังไม่เคยเริ่มต้นระบบ ให้ Seed ข้อมูลเริ่มต้นขึ้น Firebase
        console.log("🌱 ฐานข้อมูล Firebase ยังว่างอยู่ กำลังเริ่มต้นส่งชุดข้อมูลตัวอย่าง...");
        await this.seedFirebaseDatabase();
      } else {
        // ดึงข้อมูลจาก Firebase โดยเมื่อผู้ใช้ลบข้อมูลออก (data.collection เป็น undefined/null) ให้ได้เป็น [] (ว่างเปล่า)
        // ไม่ทำการยัดเยียดค่าเริ่มต้นกลับมาทับสิ่งที่ผู้ใช้ลบไปแล้ว
        this.cache.users = this.normalizeCollection(data ? data.users : null, []);
        this.cache.teachers = this.normalizeCollection(data ? data.teachers : null, []);
        this.cache.students = this.normalizeCollection(data ? data.students : null, []);
        this.cache.records = this.normalizeCollection(data ? data.records : null, []);
        this.cache.auditLogs = this.normalizeCollection(data ? data.auditLogs : null, []);
        this.cache.activityLogs = this.normalizeCollection(data ? data.activityLogs : null, []);

        // หากผู้ใช้มี user ใน cache แต่ใน Firebase ว่างเปล่า ให้คง user admin ไว้เพื่อไม่ให้ล็อกอินไม่ได้
        if (this.cache.users.length === 0 && isInit) {
          const adminUser = INITIAL_SEED_DATA.users[0];
          this.cache.users = [adminUser];
          await this.saveItem('users', adminUser);
        }

        this.saveToLocalStorage();
      }

      this.syncStatus = 'idle';
      this.notifyAllListeners();
    } catch (error) {
      this.syncStatus = 'error';
      throw error;
    }
  }

  normalizeCollection(data, fallback = []) {
    if (data === null || data === undefined) return fallback;
    if (Array.isArray(data)) return data.filter(item => item !== null && item !== undefined);
    if (typeof data === 'object') {
      return Object.keys(data).map(key => {
        const item = data[key];
        if (item && typeof item === 'object' && !item.id) {
          item.id = key;
        }
        return item;
      }).filter(Boolean);
    }
    return fallback;
  }

  async seedFirebaseDatabase() {
    try {
      const payload = {
        users: this.arrayToObject(INITIAL_SEED_DATA.users),
        teachers: this.arrayToObject(INITIAL_SEED_DATA.teachers),
        students: this.arrayToObject(INITIAL_SEED_DATA.students),
        records: this.arrayToObject(INITIAL_SEED_DATA.records),
        auditLogs: this.arrayToObject(INITIAL_SEED_DATA.auditLogs),
        activityLogs: this.arrayToObject(INITIAL_SEED_DATA.activityLogs),
        meta: {
          initializedAt: new Date().toISOString(),
          version: APP_CONFIG.APP_VERSION,
          school: APP_CONFIG.SCHOOL_NAME
        }
      };

      await fetch(`${this.baseUrl}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      this.cache = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
      this.saveToLocalStorage();
      console.log("✅ Seed ข้อมูลตัวอย่างขึ้น Firebase สำเร็จแล้ว");
    } catch (err) {
      console.error("ไม่สามารถ Seed ข้อมูลขึ้น Firebase:", err);
    }
  }

  arrayToObject(arr) {
    const obj = {};
    if (!Array.isArray(arr)) return obj;
    arr.forEach(item => {
      const key = item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      obj[key] = item;
    });
    return obj;
  }

  startRealtimePolling(intervalMs = 5000) {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(async () => {
      if (this.isOnline) {
        try {
          const res = await fetch(`${this.baseUrl}.json`);
          if (res.ok) {
            const data = await res.json();
            if (data !== undefined) {
              this.cache.users = this.normalizeCollection(data ? data.users : null, []);
              this.cache.teachers = this.normalizeCollection(data ? data.teachers : null, []);
              this.cache.students = this.normalizeCollection(data ? data.students : null, []);
              this.cache.records = this.normalizeCollection(data ? data.records : null, []);
              this.cache.auditLogs = this.normalizeCollection(data ? data.auditLogs : null, []);
              this.cache.activityLogs = this.normalizeCollection(data ? data.activityLogs : null, []);
              this.saveToLocalStorage();
              this.notifyAllListeners();
            }
          }
        } catch (e) {
          // silent polling fail
        }
      }
    }, intervalMs);
  }

  // --- CRUD METHODS ---

  get(collection) {
    return this.cache[collection] || [];
  }

  getById(collection, id) {
    const items = this.get(collection);
    return items.find(item => String(item.id) === String(id)) || null;
  }

  async saveItem(collection, item) {
    if (!item.id) {
      item.id = `${collection.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    }

    const items = this.get(collection);
    const existingIndex = items.findIndex(i => String(i.id) === String(item.id));
    
    if (existingIndex >= 0) {
      items[existingIndex] = { ...items[existingIndex], ...item, updatedAt: new Date().toISOString() };
    } else {
      item.createdAt = item.createdAt || new Date().toISOString();
      items.unshift(item);
    }

    this.cache[collection] = items;
    this.saveToLocalStorage();
    this.notifyListeners(collection);

    // Sync ไปยัง Firebase
    try {
      await fetch(`${this.baseUrl}${collection}/${item.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    } catch (e) {
      console.warn(`Sync to Firebase for ${collection}/${item.id} failed, saved locally.`, e);
    }

    return item;
  }

  async deleteItem(collection, id) {
    const items = this.get(collection);
    this.cache[collection] = items.filter(i => String(i.id) !== String(id));
    this.saveToLocalStorage();
    this.notifyListeners(collection);

    try {
      await fetch(`${this.baseUrl}${collection}/${id}.json`, {
        method: 'DELETE'
      });
      
      // ถ้าลบจนไม่มีข้อมูลเหลือเลย ให้ลบ key collection ออกหรือเซ็ตว่าง
      if (this.cache[collection].length === 0) {
        await fetch(`${this.baseUrl}${collection}.json`, {
          method: 'DELETE'
        });
      }
    } catch (e) {
      console.warn(`Delete on Firebase for ${collection}/${id} failed, deleted locally.`, e);
    }
    return true;
  }

  async clearCollection(collection) {
    this.cache[collection] = [];
    this.saveToLocalStorage();
    this.notifyListeners(collection);

    try {
      await fetch(`${this.baseUrl}${collection}.json`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn(`Clear collection ${collection} failed on Firebase.`, e);
    }
    return true;
  }

  async bulkInsert(collection, newItems) {
    const current = this.get(collection);
    const idMap = new Set(current.map(i => String(i.id)));
    
    newItems.forEach(item => {
      if (!item.id) {
        item.id = `${collection.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      }
      if (idMap.has(String(item.id))) {
        const idx = current.findIndex(i => String(i.id) === String(item.id));
        current[idx] = { ...current[idx], ...item };
      } else {
        current.unshift(item);
        idMap.add(String(item.id));
      }
    });

    this.cache[collection] = current;
    this.saveToLocalStorage();
    this.notifyListeners(collection);

    try {
      const obj = this.arrayToObject(current);
      await fetch(`${this.baseUrl}${collection}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
      });
    } catch (e) {
      console.warn(`Bulk insert on Firebase failed for ${collection}, saved locally.`, e);
    }
    return current;
  }

  // --- ACTIVITY LOG HELPER ---
  async addActivityLog(type, title, message, badgeClass = "badge-blue") {
    const logItem = {
      id: `act_${Date.now()}`,
      type,
      title,
      message,
      timestamp: this.formatDateTime(new Date()),
      badgeClass
    };
    await this.saveItem('activityLogs', logItem);
    return logItem;
  }

  formatDateTime(d) {
    const pad = n => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // --- SUBSCRIPTIONS ---
  subscribe(collection, callback) {
    if (!this.listeners[collection]) {
      this.listeners[collection] = [];
    }
    this.listeners[collection].push(callback);
    // ส่งข้อมูลปัจจุบันให้ทันที
    callback(this.get(collection));
  }

  notifyListeners(collection) {
    if (this.listeners[collection]) {
      this.listeners[collection].forEach(cb => {
        try { cb(this.get(collection)); } catch(e) { console.error(e); }
      });
    }
  }

  notifyAllListeners() {
    Object.keys(this.listeners).forEach(collection => {
      this.notifyListeners(collection);
    });
  }
}

// Global Singleton Instance
const db = new FirebaseService();
