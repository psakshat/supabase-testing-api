const moment = require("moment");

const formatDate = (date, format = "YYYY-MM-DD") => {
  return moment(date).format(format);
};

const isSameDay = (date1, date2) => {
  return moment(date1).isSame(moment(date2), "day");
};

const getStartOfDay = (date) => {
  return moment(date).startOf("day").toDate();
};

const getEndOfDay = (date) => {
  return moment(date).endOf("day").toDate();
};

const getDaysBetweenDates = (startDate, endDate) => {
  return moment(endDate).diff(moment(startDate), "days");
};

module.exports = {
  formatDate,
  isSameDay,
  getStartOfDay,
  getEndOfDay,
  getDaysBetweenDates,
};
