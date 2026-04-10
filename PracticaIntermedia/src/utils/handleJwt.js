import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_LONG_EXPIRES_IN = process.env.JWT_LONG_EXPIRES_IN || '2h';
const JWT_SHORT_EXPIRES_IN = process.env.JWT_SHORT_EXPIRES_IN || '15m';

export const longTokenSign = (user) => {
  const sign = jwt.sign(
    {
      userId: user._id
    },
    JWT_SECRET,
    {
      expiresIn: JWT_LONG_EXPIRES_IN
    }
  );
  return sign;
};

export const shortTokenSign = (user) => {
  const sign = jwt.sign(
    {
      userId: user._id
    },
    JWT_SECRET,
    {
      expiresIn: JWT_SHORT_EXPIRES_IN
    }
  );
  return sign;
};

export const verifyToken = (tokenJwt) => {
  try {
    return jwt.verify(tokenJwt, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
