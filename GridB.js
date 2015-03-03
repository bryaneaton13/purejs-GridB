var GridB = function(options) {

  // Check for the id, if it doesn't exist generate it. 
  // The grid div will just be attached to the body of the page
  if (typeof options.id === 'undefined') {
    options.id = "GridB_"+Math.floor(Math.random()*10000000);
    console.log('No ID defined. Auto assigned ID: ', options.id);
  }
  var dataRows = [],
    headerRow,
    prevBtn,
    id,
    div,
    table,
    pageNum = 1,
    pageNumberSpan,
    nextBtn,
    properties = {
      maxRows: 10,
      noData: "No Data",
      data: {},
      columns: {},
      indexCol: false,
      reverse: false
    };

  // Loop through all the properties and overwrite the defaults
  (function(props) {
    var key;
    for (key in props) {
      if (props.hasOwnProperty(key)) {
        properties[key] = props[key];
      }
    }

  })(options);

  /* Creates an using the document.createElement based on the type
   * Sets some default classes for the certain elements
   *
   * returns the element created with the optional classes and id attached
   *
   * type - The type of object being created based on the document.createElement(type)
   * id   - The optional id of the element to create
   *
   * Example
   *
   *   el = createElement('table', 'tableId');
   *
   * Returns the element that was created
   */
  var createElement = function(type, id) {
    var el = document.createElement(type);
    if (typeof id !== 'undefined')
      el.id = id;
    switch (type) {
      case 'table':
        el.className = "table table-striped";
        break;
      case 'button':
        el.className = "btn btn-default";
        break;
      case 'span':
        el.className = "large";
        break;
      case 'div':
        el.className = "table-responsive";
        if (el.id)
          document.body.appendChild(el);
        break;
    }
    return el;
  };

  // Get the id for the div based on the id passed in through options or generating
  //  the id based on the number of instances created
  id = options.id;
  div = document.getElementById(id) || createElement("div", id);

  // Create the previous/next/page number fields
  (function() {
    prevBtn = createElement("button");
    prevBtn.innerHTML = "&lt;";
    prevBtn.onclick = function() {
        pageNum--;
        setTable(properties.maxRows*(pageNum-1));
    };
    nextBtn = createElement("button");
    nextBtn.innerHTML = "&gt;";
    nextBtn.onclick = function() {
        pageNum++;
        setTable(properties.maxRows*(pageNum-1));
    };
    pageNumberSpan = createElement("span");
    pageNumberSpan.style.padding = "15px";
  })();

  var updatePage = function() {
    pageNumberSpan.innerHTML = pageNum + " / " + properties.totalPages;
  };

  var domFind = function(el, findTag) {
    var i,
        l = el.childNodes.length;
    for (i=0; i<l; i++) {
      if (el.childNodes[i].tagName.toLowerCase() === findTag.toLowerCase())
        return el.childNodes[i];
    }
    return undefined;
  };

  var tableRow = function(rowData) {
      var newtr,
          newtd,
          key,
          columns = properties.columns;
      newtr = createElement("tr");
      if (properties.indexCol === true) {
        newtd = createElement("td");
        newtd.innerHTML = rowData.rowIndex;
        newtr.appendChild(newtd);
      }
      for (key in columns) {
        if (columns.hasOwnProperty(key)) {
          newtd = createElement("td");
          newtd.innerHTML = typeof rowData[key] != "undefined" ? rowData[key] : "BLANK";
          newtr.appendChild(newtd);
        }
      }
    if (properties.reverse) {
      dataRows.unshift(newtr);
    }
    else {
      dataRows.push(newtr);
    }
  };
  var appendDataRow = function(rowData) {
    var len = properties.data.length;
    if (properties.indexCol === true)
      rowData.rowIndex = len+1;
    if (properties.reverse) {
      properties.data.unshift(rowData);
    }
    else {
      properties.data.push(rowData);
    }
    len++;
    if (properties.totalPages !== Math.ceil(len/properties.maxRows)) {
      properties.totalPages = Math.ceil(len/properties.maxRows);
      updatePage();
    }
    tableRow(rowData);

    var tbody = domFind(table, "tbody");
    if (properties.reverse) {
      tbody.insertBefore(dataRows[0], tbody.childNodes[0]);
      if (pageNum * properties.maxRows < len) {
        tbody.removeChild(tbody.childNodes[tbody.childNodes.length-1]);
      }
    }
    else if (pageNum * properties.maxRows >= len) {
      tbody.appendChild(dataRows[dataRows.length-1]);
    }
    // If there are more rows than the table is showing, enable the next button
    if (nextBtn.disabled === true && pageNum * properties.maxRows < len) {
      nextBtn.disabled = false;
    }
  };

  var setTable = function(i) {
    if (properties.data.length === 0)
      return;
    var l = properties.data.length,
      j,
      tBody = createElement("tbody"),
      maxRows = properties.maxRows;

    if (typeof i === 'undefined')
      i = 0;
    // Reset the disabled buttons to false
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    if (i === 0) {
      pageNum = 1;
      prevBtn.disabled = true;
    }
    // Find out if it's the last page, disable the next button
    if (data.length > maxRows && data.length-maxRows <= i) {
      nextBtn.disabled = true;
    }

    updatePage();

    // Go through all the data rows
    for (j=0; i<l && j<maxRows; j++, i++) {
      tBody.appendChild(dataRows[i]);
    }
    // Create the table object and add it to the div
    if (div.children.length > 0)
      div.removeChild(table);
    // Create a table element and add the header row and the body to it
    table = createElement("table");
    table.appendChild(headerRow);
    table.appendChild(tBody);
    if (!domFind(div, "button") && data.length > maxRows) {
      div.appendChild(prevBtn);
      div.appendChild(pageNumberSpan);
      div.appendChild(nextBtn);
    }
    div.appendChild(table);

  };

  var buildHeader = function() {
    var key,
      header,
      row = createElement("tr"),
      columns = properties.columns;
      if (properties.indexCol === true) {
        header = createElement("th");
        header.innerHTML = "Row";
        row.appendChild(header);
      }
    for (key in columns) {
      if (columns.hasOwnProperty(key)) {
        header = createElement("th");
        header.id = typeof key === 'string' ? key : columns[key];
        header.innerHTML = columns[key];
        row.appendChild(header);
      }
    }
    headerRow = createElement("thead");
    headerRow.appendChild(row);
  };

  var buildData = function() {
    var i,
      data = properties.data,
      l = data.length;
    properties.totalPages = Math.ceil(l/properties.maxRows);
    dataRows = [];

    // Loop through all data rows. Add a row index property and then create the table row
    for (i=0; i<l; i++) {
      if (properties.indexCol === true && typeof data[i].rowIndex === 'undefined') {
        data[i].rowIndex = i+1;
      }
      tableRow(data[i]);
    }
    setTable();
  };
  buildHeader();
  buildData();

  return {
    prop: function(prop, value) {
      // Setting property
      if (typeof value !== 'undefined') {
        properties[prop] = value;
        if (prop === 'columns') {
          buildHeader();
        }
        if (['data','maxRows','columns'].indexOf(prop) >= 0) {
          buildData();
        }
        return value;
      }
      else {
        return properties[prop] || null;
      }
    },
    forward: nextBtn.onclick,
    backward: prevBtn.onclick,
    addRow: appendDataRow,
    addRows: function(rows) {
      var i,
          l = rows.length;
      for (i=0; i<l; i++) {
        appendDataRow(rows[i]);
      }
    },
    goToPage: function(page) {
      if (page < 0 || page > Math.ceil(properties.data.length / properties.maxRows))
        return; // Page doesn't exist
      pageNum = page;
      setTable(properties.maxRows*(page-1));
    },
    reverse: function() {
      properties.reverse = !properties.reverse;
      data.reverse();
      dataRows.reverse();
      setTable();
    }
  };
};

function createCols(num) {
  var obj = {},
    i;
  for (i=1; i<=num; i++) {
    obj["col"+i] = "Column " + i;
  }
  return obj;
}
function createData(cols, num) {
  var key,
    i,
    obj = {},
    arr = [];

  for (i=1; i<=num; i++) {
    obj = {};
    for (key in cols) {
      if (columns.hasOwnProperty(key)) {
        obj[key] = "" + Math.floor(Math.random()*1000000);
      }
    }
    arr.push(obj);
  }

  return arr;
}

var columns = createCols(5);
var data = createData(columns, 102);
var g = new GridB({
  maxRows: 7,
  id: "grid",
  columns: columns,
  data: data,
  indexCol: true
});


var g2 = new GridB({
  maxRows: 5,
  id: "grid2",
  columns: columns,
  data: data
});