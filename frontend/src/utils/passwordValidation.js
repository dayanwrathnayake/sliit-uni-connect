// Password validation utility with strength scoring
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: { label: 'At least 8 characters', regex: /.{8,}/, key: 'minLength' },
  UPPERCASE: { label: 'At least 1 uppercase letter', regex: /[A-Z]/, key: 'uppercase' },
  LOWERCASE: { label: 'At least 1 lowercase letter', regex: /[a-z]/, key: 'lowercase' },
  NUMBER: { label: 'At least 1 number', regex: /[0-9]/, key: 'number' },
  SPECIAL: { label: 'At least 1 special character (!@#$%^&*)', regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, key: 'special' },
};

/**
 * Validates password against all requirements
 * @param {string} password - Password to validate
 * @returns {Object} - Object with requirement status for each rule
 */
export const validatePassword = (password) => {
  const result = {};
  Object.entries(PASSWORD_REQUIREMENTS).forEach(([key, req]) => {
    result[req.key] = req.regex.test(password);
  });
  return result;
};

/**
 * Checks overall password strength
 * @param {string} password - Password to check
 * @returns {Object} - { strength: 'weak'|'fair'|'good'|'strong', score: 0-5 }
 */
export const getPasswordStrength = (password) => {
  if (!password) {
    return { strength: 'weak', score: 0, label: 'No password' };
  }

  const requirements = validatePassword(password);
  const score = Object.values(requirements).filter(Boolean).length;

  let strength = 'weak';
  if (score >= 5) strength = 'strong';
  else if (score >= 4) strength = 'good';
  else if (score >= 3) strength = 'fair';

  return { strength, score, label: strengthLabels[strength] };
};

const strengthLabels = {
  weak: 'Too weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Very strong',
};

/**
 * Gets color classes for strength meter based on strength level
 */
export const getStrengthColors = (strength) => {
  const colors = {
    weak: { bg: 'bg-red-500', border: 'border-red-500/30', text: 'text-red-400' },
    fair: { bg: 'bg-amber-500', border: 'border-amber-500/30', text: 'text-amber-400' },
    good: { bg: 'bg-blue-500', border: 'border-blue-500/30', text: 'text-blue-400' },
    strong: { bg: 'bg-emerald-500', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  };
  return colors[strength] || colors.weak;
};

/**
 * Gets requirement status with colors
 */
export const getRequirementStatus = (password) => {
  const requirements = validatePassword(password);
  return Object.entries(PASSWORD_REQUIREMENTS).map(([key, req]) => {
    const isMet = requirements[req.key];
    return {
      label: req.label,
      isMet,
      color: isMet ? 'text-emerald-400' : 'text-slate-500',
      icon: isMet ? '✓' : '○',
    };
  });
};
