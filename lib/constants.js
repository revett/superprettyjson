/**
 * Regular expression to match characters that conflict with JSON.
 */
const conflictChars = /[^\w\s\n\r\v\t\.,]/i;

module.exports = {
  conflictChars,
};
