const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;

function auth(req, res, next) {
  let payload;
  try {
    const { authorization } = req.headers;
    console.log(authorization);
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedError('Невалидные почта или пароль');
    }
    const token = authorization.replace('Bearer ', '');
    const secret = NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key';
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      throw new UnauthorizedError('Невалидные почта или пароль');
    }
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { auth };
