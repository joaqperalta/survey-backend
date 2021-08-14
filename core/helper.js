const getTimeSpent = (json) => {
  var timeSpent = 0;
  var pageNo = 0;
  while (json[`pageNo${pageNo}`] !== undefined) {
    timeSpent += json[`pageNo${pageNo}`] + 1;
    pageNo ++;
  }
  return timeSpent;
}

module.exports = {
  getTimeSpent,
}