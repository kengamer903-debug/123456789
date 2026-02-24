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
    request.onerror = () => {
      console.error("IndexedDB Open Error:", request.error);
      reject(request.error);
    };
  });
};

export const saveAudio = async (sceneId: number, file: Blob) => {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction('audios', 'readwrite');
      const store = tx.objectStore('audios');
      const request = store.put(file, sceneId);
      
      // Wait for transaction to complete, not just the request
      tx.oncomplete = () => {
        console.log(`Audio saved for scene ${sceneId}`);
        resolve();
      };
      
      tx.onerror = () => {
        console.error(`Error saving audio for scene ${sceneId}:`, tx.error);
        reject(tx.error);
      };
      
      request.onerror = () => {
        // Request error bubbles to transaction, but good to log
        console.error(`Request error saving audio for scene ${sceneId}:`, request.error);
      };
    });
  } catch (err) {
    console.error("Failed to open DB for saving:", err);
    throw err;
  }
};

export const getAudio = async (sceneId: number): Promise<Blob | undefined> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('audios', 'readonly');
      const store = tx.objectStore('audios');
      const request = store.get(sceneId);
      
      request.onsuccess = () => {
        if (request.result) {
          console.log(`Audio loaded for scene ${sceneId}`);
          resolve(request.result);
        } else {
          resolve(undefined);
        }
      };
      
      request.onerror = () => {
        console.error(`Error getting audio for scene ${sceneId}:`, request.error);
        reject(request.error);
      };
    });
  } catch (err) {
    console.error("Failed to open DB for loading:", err);
    return undefined;
  }
};
