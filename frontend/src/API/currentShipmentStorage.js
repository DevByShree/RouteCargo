const activeShipmentKey = userId => userId ? `routecargo:active-shipment:${encodeURIComponent(userId)}` : null;

export function rememberCurrentShipment(userId, shipment) {
  const key = activeShipmentKey(userId);
  const shipmentId = shipment?.shipmentid ?? shipment?.shipmentId ?? shipment?.id;
  if (!key || !Number.isSafeInteger(Number(shipmentId)) || Number(shipmentId) < 1 || typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify({
      shipmentId: Number(shipmentId),
      pickup: shipment.pickup || "",
      destination: shipment.destination || "",
      pickupDate: shipment.pickupDate || "",
    }));
  } catch { /* Route state and session storage still support the current tab. */ }
}

export function getRememberedShipment(userId) {
  const key = activeShipmentKey(userId);
  if (!key || typeof localStorage === "undefined") return null;
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Number.isSafeInteger(value?.shipmentId) && value.shipmentId > 0 ? value : null;
  } catch { return null; }
}

export function clearRememberedShipment(userId) {
  const key = activeShipmentKey(userId);
  if (key && typeof localStorage !== "undefined") try { localStorage.removeItem(key); } catch { /* Best effort cleanup. */ }
}
