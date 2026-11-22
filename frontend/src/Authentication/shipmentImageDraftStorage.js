const DATABASE_NAME = "routecargo-shipment-drafts";
const STORE_NAME = "images";
const DATABASE_VERSION = 1;

function openDatabase() {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("Image draft storage is unavailable in this browser."));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open image draft storage."));
  });
}

const imageKey = (userId, shipmentId, imageId) => `${userId}:${shipmentId}:${imageId}`;

export async function saveShipmentDraftImage(userId, shipmentId, image) {
  if (!userId || !shipmentId || !image?.file) return;
  const db = await openDatabase();
  try {
    await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put({
        key: imageKey(userId, shipmentId, image.id),
        blob: image.file,
        name: image.name,
        size: image.size,
        type: image.file.type || "application/octet-stream",
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error || new Error(`Could not save ${image.name}.`));
    });
  } finally { db.close(); }
}

export async function loadShipmentDraftImage(userId, shipmentId, image) {
  if (!userId || !shipmentId || !image?.id) return null;
  const db = await openDatabase();
  let record;
  try {
    record = await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME)
        .get(imageKey(userId, shipmentId, image.id));
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error(`Could not restore ${image.name}.`));
    });
  } finally { db.close(); }
  if (!record?.blob) return null;
  const file = new File([record.blob], record.name || image.name, { type: record.type || record.blob.type });
  return { ...image, file, name: record.name || image.name, size: record.size ?? file.size, url: URL.createObjectURL(file) };
}

export async function clearShipmentDraftImages(userId, shipmentId) {
  if (!userId || !shipmentId) return;
  const db = await openDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        if (cursor.value.key.startsWith(`${userId}:${shipmentId}:`)) cursor.delete();
        cursor.continue();
      };
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error("Could not clear image draft storage."));
    });
  } finally { db.close(); }
}
