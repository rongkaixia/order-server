let jwt = require('jsonwebtoken');

// Authenticity Token expire time, seconds
const TIME_LIMIT = 2 * 24 * 3600;
const SECRET_KEY = '7trRhA482C4Nrs0R7UxMwXl2HnVyEHd9';
const VALIDATE_RESULT = {SUCCESS: 'SUCCESS', INVALID_TOKEN: 'INVALID_TOKEN', TOKEN_EXPIRED: 'TOKEN_EXPIRED'};
const PADDING = '##<IDS'

// export VALIDATE_RESULT
// define csrf token function
function generateCsrfToken(playload) {
  let randomNum = jwt.sign(Math.random(), SECRET_KEY);
  let playloadExt = Object.assign(playload, {random: randomNum});
  if (TIME_LIMIT) {
    Object.assign(playloadExt, {expires: new Date(Date.now() + TIME_LIMIT * 1000).getTime()});
  }
  console.log('generateCsrfToken playloadExt: ' + JSON.stringify(playloadExt));
  let token = jwt.sign(playloadExt, SECRET_KEY, {noTimestamp: true});
  console.log('generateCsrfToken token: ' + token);
  return randomNum + PADDING + token;
}

function validateCsrfToken(authKey, playload) {
  try {
    let data = authKey.split(PADDING);
    let randomNum = data[0];
    let token = data[1];
    let playloadExt = jwt.verify(token, SECRET_KEY);
    if (!playloadExt.random || playloadExt.random !== randomNum) {
      return VALIDATE_RESULT.INVALID_TOKEN;
    }
    let checkVal = Object.assign(playload, {random: randomNum});
    // check expire auth key
    if (TIME_LIMIT && playloadExt.expires) {
      let currentTime = Date.now();
      let expires = playloadExt.expires;
      if (expires < currentTime) {
        return VALIDATE_RESULT.TOKEN_EXPIRED;
      }
      Object.assign(checkVal, {expires: expires});
    }
    console.log('validateCsrfToken checkVal: ' + JSON.stringify(checkVal));
    let tmp = jwt.sign(checkVal, SECRET_KEY, {noTimestamp: true});
    console.log('validateCsrfToken signKey: ' + tmp);
    console.log('validateCsrfToken expected token: ' + token);
    // validate auth key
    if (jwt.sign(checkVal, SECRET_KEY, {noTimestamp: true}) !== token) {
      return VALIDATE_RESULT.INVALID_TOKEN;
    }
    return VALIDATE_RESULT.SUCCESS;
  } catch (error) {
    console.log('validateCsrfToken error: ' + error);
    return VALIDATE_RESULT.INVALID_TOKEN;
  }
}

module.exports = {
  generateCsrfToken: generateCsrfToken,
  validateCsrfToken: validateCsrfToken,
  VALIDATE_RESULT: VALIDATE_RESULT
}
