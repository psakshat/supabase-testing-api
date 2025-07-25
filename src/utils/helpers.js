const generateRandomString = (length = 10) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const truncate = (str, length) => {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
};

module.exports = {
  generateRandomString,
  capitalize,
  truncate,
};
