/**
 * Lightweight server-side request body validator
 */

function validateRegisterInput(req, res, next) {
  const { email, password, fullName } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.',
    });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters in length.',
    });
  }

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Full name is required (minimum 2 characters).',
    });
  }

  next();
}

function validateLoginInput(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Both email and password are required.',
    });
  }

  next();
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
};
