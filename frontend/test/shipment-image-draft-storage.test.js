import test from "node:test";
import assert from "node:assert/strict";
import {
  clearShipmentDraftImages,
  loadShipmentDraftImage,
  saveShipmentDraftImage,
} from "../src/Authentication/shipmentImageDraftStorage.js";

function createIndexedDbMock() {
  const records = new Map();
  const storeName = "images";
  const database = {
    objectStoreNames: { contains: name => name === storeName },
    createObjectStore() {},
    close() {},
    transaction() {
      const transaction = {
        oncomplete: null,
        onerror: null,
        objectStore() {
          return {
            put(value) {
              const request = {};
              queueMicrotask(() => {
                records.set(value.key, value);
                request.onsuccess?.();
                transaction.oncomplete?.();
              });
              return request;
            },
            get(key) {
              const request = {};
              queueMicrotask(() => {
                request.result = records.get(key);
                request.onsuccess?.();
                transaction.oncomplete?.();
              });
              return request;
            },
            openCursor() {
              const request = {};
              const keys = [...records.keys()];
              let index = 0;
              const advance = () => queueMicrotask(() => {
                if (index >= keys.length) {
                  request.result = null;
                  request.onsuccess?.();
                  transaction.oncomplete?.();
                  return;
                }
                const key = keys[index++];
                request.result = { value: records.get(key), delete: () => records.delete(key), continue: advance };
                request.onsuccess?.();
              });
              advance();
              return request;
            },
          };
        },
      };
      return transaction;
    },
  };
  return {
    records,
    open() {
      const request = {};
      queueMicrotask(() => {
        request.result = database;
        request.onupgradeneeded?.();
        request.onsuccess?.();
      });
      return request;
    },
  };
}

test("image blobs survive draft reload and are isolated by user and shipment", async () => {
  const previousIndexedDb = globalThis.indexedDB;
  const previousCreateObjectURL = URL.createObjectURL;
  const mock = createIndexedDbMock();
  globalThis.indexedDB = mock;
  URL.createObjectURL = file => `blob:test/${file.name}`;
  try {
    const file = new File(["image bytes"], "box.jpg", { type: "image/jpeg" });
    const descriptor = { id: "photo-1", name: file.name, size: file.size, mimeType: file.type };
    await saveShipmentDraftImage("customer-a", 41, { ...descriptor, file });

    const restored = await loadShipmentDraftImage("customer-a", 41, descriptor);
    assert.equal(restored.name, "box.jpg");
    assert.equal(restored.file.type, "image/jpeg");
    assert.equal(await restored.file.text(), "image bytes");
    assert.equal(restored.url, "blob:test/box.jpg");
    assert.equal(await loadShipmentDraftImage("customer-b", 41, descriptor), null);
    assert.equal(await loadShipmentDraftImage("customer-a", 42, descriptor), null);

    await clearShipmentDraftImages("customer-a", 41);
    assert.equal(await loadShipmentDraftImage("customer-a", 41, descriptor), null);
  } finally {
    if (previousIndexedDb === undefined) delete globalThis.indexedDB;
    else globalThis.indexedDB = previousIndexedDb;
    if (previousCreateObjectURL === undefined) delete URL.createObjectURL;
    else URL.createObjectURL = previousCreateObjectURL;
  }
});
