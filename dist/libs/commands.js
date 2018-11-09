"use strict";

var sortParameters = ["Bucket_Name", "Location", "Creation_Date", "Total_Size", "File_Count", "Last_Modified"];

var bucketOption = {
  describe: 'The bucket\'s name',
  alias: 'b'
},
    sortOptions = {
  describe: "Sorts the detailed list by the specified parameter",
  alias: 's',
  choices: sortParameters
},
    orderOptions = {
  describe: 'Orders the detailed list either ascendingly or descendingly',
  choices: ["asc", "desc"],
  alias: 'o'
},
    startOptions = {
  describe: 'Start date for the cost command',
  alias: 'st'
},
    endOptions = {
  describe: 'End date for the cost command',
  choices: ["asc", "desc"],
  alias: 'e'
},
    filterOptions = {
  describe: 'Filters the detailed list by specified parameter (can be a RegExp)',
  alias: 'f'
},
    storageOptions = {
  describe: 'Storage type of objects to show. Defaults to "ALL".',
  choices: ["ALL", "STANDARD", "STANDARD_IA", "REDUCED_REDUNDANCY", "GLACIER", "ONEZONE_IA"],
  alias: ['t', 'type']
};

module.exports = {
  bucketOption: bucketOption,
  sortOptions: sortOptions,
  orderOptions: orderOptions,
  startOptions: startOptions,
  endOptions: endOptions,
  filterOptions: filterOptions,
  storageOptions: storageOptions
};