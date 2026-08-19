const { ROLES } = require('../constants/roles');

/**
 * Builds a parameterized WHERE clause for role-scoped queries.
 * Table aliases: municipalities = m, schools = s, assets = a
 */

function buildMunicipalityScope(user, startIndex = 1) {
  switch (user.role) {
    case ROLES.STATE_ADMIN:
      return { clause: '1=1', params: [], nextIndex: startIndex };
    case ROLES.MUNICIPAL_OFFICER:
      return {
        clause: `m.id = $${startIndex}`,
        params: [user.municipalityId],
        nextIndex: startIndex + 1,
      };
    case ROLES.SCHOOL_ADMIN:
      return {
        clause: `m.id = (SELECT municipality_id FROM schools WHERE id = $${startIndex})`,
        params: [user.schoolId],
        nextIndex: startIndex + 1,
      };
    default:
      return { clause: '1=0', params: [], nextIndex: startIndex };
  }
}

function buildAssetScope(user, startIndex = 1) {
  switch (user.role) {
    case ROLES.STATE_ADMIN:
      return { clause: '1=1', params: [], nextIndex: startIndex };
    case ROLES.MUNICIPAL_OFFICER:
      return {
        clause: `s.municipality_id = $${startIndex}`,
        params: [user.municipalityId],
        nextIndex: startIndex + 1,
      };
    case ROLES.SCHOOL_ADMIN:
      return {
        clause: `a.school_id = $${startIndex}`,
        params: [user.schoolId],
        nextIndex: startIndex + 1,
      };
    default:
      return { clause: '1=0', params: [], nextIndex: startIndex };
  }
}

function buildSchoolScope(user, startIndex = 1) {
  switch (user.role) {
    case ROLES.STATE_ADMIN:
      return { clause: '1=1', params: [], nextIndex: startIndex };
    case ROLES.MUNICIPAL_OFFICER:
      return {
        clause: `s.municipality_id = $${startIndex}`,
        params: [user.municipalityId],
        nextIndex: startIndex + 1,
      };
    case ROLES.SCHOOL_ADMIN:
      return {
        clause: `s.id = $${startIndex}`,
        params: [user.schoolId],
        nextIndex: startIndex + 1,
      };
    default:
      return { clause: '1=0', params: [], nextIndex: startIndex };
  }
}

function buildTransferScope(user, startIndex = 1) {
  switch (user.role) {
    case ROLES.STATE_ADMIN:
      return { clause: '1=1', params: [], nextIndex: startIndex };
    case ROLES.MUNICIPAL_OFFICER:
      return {
        clause: `(from_s.municipality_id = $${startIndex} OR to_s.municipality_id = $${startIndex})`,
        params: [user.municipalityId],
        nextIndex: startIndex + 1,
      };
    case ROLES.SCHOOL_ADMIN:
      return {
        clause: `(t.from_school_id = $${startIndex} OR t.to_school_id = $${startIndex})`,
        params: [user.schoolId],
        nextIndex: startIndex + 1,
      };
    default:
      return { clause: '1=0', params: [], nextIndex: startIndex };
  }
}

module.exports = {
  buildMunicipalityScope,
  buildAssetScope,
  buildSchoolScope,
  buildTransferScope,
};
