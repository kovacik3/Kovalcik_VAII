function datetimeLocalToMySql(value) {
  // input: "YYYY-MM-DDTHH:MM" -> output: "YYYY-MM-DD HH:MM:SS"
  if (!value || typeof value !== "string") return null;
  return value.replace("T", " ") + ":00";
}

function datetimeLocalToDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

module.exports = {
  datetimeLocalToMySql,
  datetimeLocalToDate,
};
