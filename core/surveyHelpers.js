
const filterResults = (results, filter) => {
  return results.filter(result => {
      edate = result["created_at"];
      result = JSON.parse(result["json"]);

      var isFilter = true;
      if (filter.conditionfilter == true) {
          if (filter.conditions) {
              for (let cond of filter.conditions) {
                  isFilter = isFilter && ((result[cond.question] == cond.option) == (cond.operator == "equal"));
              }
          }
      }
      if (filter.datefilter == true) {
          startdate = new Date(filter.startdate);
          enddate = new Date(filter.enddate);
          reportdate = new Date(edate);

          isFilter = isFilter && ((startdate <= reportdate) && (reportdate <= enddate));
      }

      return isFilter;
  });
}

module.exports = {
  filterResults,
}