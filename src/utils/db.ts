import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'EngineeringVisualizerDB';
const STORE_NAME = 'audio_files';
const VERSION = 1;

export async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function saveAudioLocal(sceneId: number, audioBlob: Blob): Promise<string> {
  const db = await getDB();
  await db.put(STORE_NAME, audioBlob, sceneId);
  return URL.createObjectURL(audioBlob);
}

export async function getAudioLocal(sceneId: number): Promise<string | null> {
  const db = await getDB();
  const blob = await db.get(STORE_NAME, sceneId);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return null;
}

export async function getAllAudioLocal(): Promise<Record<number, string>> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const keys = await store.getAllKeys();
  const values = await store.getAll();
  
  const map: Record<number, string> = {};
  keys.forEach((key, index) => {
    map[key as number] = URL.createObjectURL(values[index]);
  });
  return map;
}

export async function deleteAudioLocal(sceneId: number): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, sceneId);
}
