import { handleHttpError } from '../utils/handleError.js';

const checkRol = (rolesRequeridos) => (req, res, next) => {
  try {
    const { user } = req;
    const rolesArray = Array.isArray(rolesRequeridos) ? rolesRequeridos : [rolesRequeridos];

    if (!rolesArray.includes(user.role)) {
      return handleHttpError(res, 'NOT_ALLOWED', 403);
    }

    next();
  } catch (err) {
    handleHttpError(res, 'ERROR_PERMISSIONS', 403);
  }
};

export default checkRol;
