import { openDB } from 'idb';

async function openDefectsDB() {
  return openDB('defectsDB', 1, {
    upgrade(db) {
      db.createObjectStore('defects', { keyPath: 'id', autoIncrement: true });
    },
  });
}

async function saveDefect(defect) {
  const db = await openDefectsDB();
  const tx = db.transaction('defects', 'readwrite');
  tx.store.add(defect);
  await tx.done;
}
