"use strict";

function compare(property, order) {
  var comparison = 0;

  return function (a, b) {
    if (a.hasOwnProperty(property)) {
      if (a[property] < b[property]) comparison = -1;
      if (a[property] > b[property]) comparison = 1;

      comparison = order === "desc" ? comparison * -1 : comparison;

      return comparison;
    } else {
      var props = [];for (var prop in a) {
        props.push(prop);
      }
      throw "The property you're trying to sort by doesn't exist. The possibilities are : " + props;
    }
  };
}

function filter(array, value) {
  return array.filter(function (element) {
    for (var prop in element) {
      var propVal = element[prop].toString();
      if (propVal.search(new RegExp(value)) !== -1 || propVal.includes(value)) return element;
    }
  });
}

module.exports = {
  compare: compare,
  filter: filter
};