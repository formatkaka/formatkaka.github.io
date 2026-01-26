/**
 * IndexedDB utilities for storing battle history
 */

const DB_NAME = 'llm-wars';
const DB_VERSION = 1;
const STORE_NAME = 'battles';

type BattleRecord = {
  id: string;
  topic: string;
  title: string;
  createdAt: number;
  status: string;
};

/**
 * Initialize IndexedDB database
 */
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * Save battle to IndexedDB
 */
export async function saveBattleToIndexedDB(
  id: string,
  topic: string,
  title: string,
  status: string
): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record: BattleRecord = {
      id,
      topic,
      title,
      createdAt: Date.now(),
      status,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error('Failed to save battle to IndexedDB:', error);
  }
}

/**
 * Get all battles from IndexedDB
 */
export async function getBattlesFromIndexedDB(): Promise<BattleRecord[]> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('createdAt');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev'); // Sort by createdAt descending
      const battles: BattleRecord[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          battles.push(cursor.value);
          cursor.continue();
        } else {
          db.close();
          resolve(battles);
        }
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to get battles from IndexedDB:', error);
    return [];
  }
}

/**
 * Delete battle from IndexedDB
 */
export async function deleteBattleFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error('Failed to delete battle from IndexedDB:', error);
  }
}

/**
 * Clear all battles from IndexedDB
 */
export async function clearBattlesFromIndexedDB(): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error('Failed to clear battles from IndexedDB:', error);
  }
}
