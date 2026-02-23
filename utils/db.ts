export const openDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('AudioDB', 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('audios')) {
        db.createObjectStore('audios');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveAudio = async (sceneId: number, file: Blob) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('audios', 'readwrite');
    const store = tx.objectStore('audios');
    const request = store.put(file, sceneId);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getAudio = async (sceneId: number): Promise<Blob | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audios', 'readonly');
    const store = tx.objectStore('audios');
    const request = store.get(sceneId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
