// cache.js
const emailSentCache = new Map();

function checkAndUpdateEmailSent(userId) {
  if (!emailSentCache.has(userId)) {
    emailSentCache.set(userId, false);
  }
  return emailSentCache.get(userId);
}

function markEmailAsSent(userId) {
  emailSentCache.set(userId, true);
}

function removeEmailAsSent(userId) {
  emailSentCache.delete(userId, true);
}

module.exports = { checkAndUpdateEmailSent, markEmailAsSent,removeEmailAsSent };
