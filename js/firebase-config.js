/**
 * Firebase Realtime Database Configuration & Helper Utilities
 * Database URL: https://newclassroom-9fe3f-default-rtdb.asia-southeast1.firebasedatabase.app/
 */

const FIREBASE_CONFIG = {
  databaseURL: "https://newclassroom-9fe3f-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

let db = null;

// Initialize Firebase
try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    db = firebase.database();
    console.log("Firebase Realtime Database initialized successfully:", FIREBASE_CONFIG.databaseURL);
  } else {
    console.error("Firebase JS SDK not loaded!");
  }
} catch (err) {
  console.error("Error initializing Firebase:", err);
}

/**
 * Real-time listener for a given database path
 * @param {string} path - Database node path (e.g. 'users', 'courses')
 * @param {function} callback - Callback function receiving snapshot data
 */
function listenToData(path, callback) {
  if (!db) return;
  const ref = db.ref(path);
  ref.on('value', (snapshot) => {
    const data = snapshot.val();
    callback(data);
  }, (error) => {
    console.error(`Firebase Realtime error listening to ${path}:`, error);
  });
  return ref;
}

/**
 * Save or overwrite data at a specific path
 * @param {string} path 
 * @param {object} data 
 * @returns {Promise}
 */
function saveData(path, data) {
  if (!db) return Promise.reject("Database not initialized");
  return db.ref(path).set(data);
}

/**
 * Update data at a specific path atomically
 * @param {string} path 
 * @param {object} data 
 * @returns {Promise}
 */
function updateData(path, data) {
  if (!db) return Promise.reject("Database not initialized");
  return db.ref(path).update(data);
}

/**
 * Delete data at a specific path
 * @param {string} path 
 * @returns {Promise}
 */
function deleteData(path) {
  if (!db) return Promise.reject("Database not initialized");
  return db.ref(path).remove();
}

/**
 * Push new data to a list node generating a unique auto-key
 * @param {string} path 
 * @param {object} data 
 * @returns {Promise<string>} returns the newly generated key
 */
function pushData(path, data) {
  if (!db) return Promise.reject("Database not initialized");
  const newRef = db.ref(path).push();
  return newRef.set(data).then(() => newRef.key);
}

/**
 * Atomic transaction helper for data collision prevention
 * @param {string} path 
 * @param {function} updateFunction 
 */
function runTransaction(path, updateFunction) {
  if (!db) return Promise.reject("Database not initialized");
  return db.ref(path).transaction(updateFunction);
}
