let io;

function attachNotificationHub(socketServer) {
  io = socketServer;
}

function emitNotification(notification) {
  if (!io || !notification?.userId) return;
  const payload = {
    id: String(notification._id),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    bookingId: notification.bookingId ? String(notification.bookingId) : null,
    createdAt: notification.createdAt,
  };
  io.to(`user:${notification.userId}`).emit("notification:new", payload);
}

function emitBookingStatus(booking) {
  if (!io || !booking?.customerId) return;
  io.to(`user:${booking.customerId}`).emit("booking:status", {
    bookingId: String(booking._id),
    status: booking.status,
    updatedAt: booking.updatedAt || new Date(),
  });
}

function emitTrackingLocation(location) {
  if (!io || !location?.customerId) return;
  io.to(`user:${location.customerId}`).emit("tracking:location", {
    bookingId: String(location.bookingId),
    latitude: location.latitude,
    longitude: location.longitude,
    accuracyMeters: location.accuracyMeters,
    recordedAt: location.recordedAt,
  });
}

async function disconnectSession(sessionId) {
  if (!io || !sessionId) return;
  const sockets = await io.in(`session:${sessionId}`).fetchSockets();
  for (const socket of sockets) socket.disconnect(true);
}

module.exports = { attachNotificationHub, emitNotification, emitBookingStatus, emitTrackingLocation, disconnectSession };
