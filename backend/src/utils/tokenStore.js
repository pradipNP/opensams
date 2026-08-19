const revokedTokens = new Map();

function revoke(jti, expiresAtMs) {
  if (!jti) {
    return;
  }
  revokedTokens.set(jti, expiresAtMs);
  prune();
}

function isRevoked(jti) {
  if (!jti) {
    return false;
  }
  prune();
  return revokedTokens.has(jti);
}

function prune() {
  const now = Date.now();
  for (const [jti, expiresAt] of revokedTokens.entries()) {
    if (expiresAt <= now) {
      revokedTokens.delete(jti);
    }
  }
}

module.exports = {
  revoke,
  isRevoked,
};
