function compare(property, order) {
  let comparison = 0;
  
  return (a,b) => {
    if(a.hasOwnProperty(property)) {
      if (a[property] < b[property])
       comparison = -1;
      if (a[property] > b[property])
        comparison = 1;

      comparison = (order === "desc") ? comparison * -1 : comparison;

      return comparison;
    } else {
      let props = []; for(let prop in a) { props.push(prop); }
      throw(`The property you're trying to sort by doesn't exist. The possibilities are : ${props}`);
    }
  } 
}

function filter(array, value) {
  return array.filter(element => {
    for(let prop in element) {
      const propVal = element[prop].toString();
      if(propVal.search(new RegExp(value)) !== -1 || propVal.includes(value))
        return element;
    }
  });
}

module.exports = {
  compare,
  filter
}