var columnIndex = {
  branch: 1,
  revision: 2,
  platform: 3,
  type: 6,
  testName: 8,
  testVariant: 9
};

var activeFilters = {
  branch: new Set(),
  revision: new Set(),
  platform: new Set(),
  type: new Set(),
  testName: new Set(),
  testVariant: new Set()
};

var openMenu = null;

function DocReady(fn) {
  // see if DOM is already available
  if (document.readyState === "complete" || document.readyState === "interactive") {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

function attachEventOnExpandableRow() {
  var expandableRow = document.getElementsByClassName("expandable");
  var i;

  for (i = 0; i < expandableRow.length; i++) {
    expandableRow[i].addEventListener("click", function() {
      let rowColumns = this.children;
      let lastColumn = rowColumns[rowColumns.length-1];
      let infoRow = this.nextElementSibling;

      this.classList.toggle("active");

      if (infoRow.style.display === "table-row") {
        infoRow.style.display = "none";
      } else {
        infoRow.style.display = "table-row";
      }
    });
  }
}

function scrollFunction(topArrow) {
// When the user scrolls down 20px from the top of the document, show the button
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    topArrow.style.display = "block";
  } else {
    topArrow.style.display = "none";
  }
}

function attachEventOnScrollArrow(topArrow) {
  topArrow.addEventListener("click", function() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  });
}

function createFilterMenu(columnKey, anchor) {
  if (openMenu) openMenu.remove();

  var menu = document.createElement("div");
  menu.className = "filter-menu";

  menu.addEventListener("click", function(e) {
    e.stopPropagation();
  });

  var index = columnIndex[columnKey];
  var rows = document.getElementsByClassName("expandable");
  var values = new Set();

  // Only include currently visible rows
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].style.display === "none") continue;
    values.add(rows[i].children[index].innerText.trim());
  }

  // Populate the menu
  values.forEach(function(val) {
    var label = document.createElement("label");
    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = val;
    cb.checked = activeFilters[columnKey].has(val);

    cb.addEventListener("change", function() {
      if (this.checked) {
        activeFilters[columnKey].add(this.value);
      } else {
        activeFilters[columnKey].delete(this.value);
      }
      filterTable();
    });

    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + val));
    menu.appendChild(label);
  });

  document.body.appendChild(menu);

  var rect = anchor.getBoundingClientRect();
  menu.style.left = rect.left + "px";
  menu.style.top = rect.bottom + "px";
  menu.style.display = "block";

  openMenu = menu;
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

function clearAllFilters() {
  // Clear all dropdown filters
  for (var key in activeFilters) {
    activeFilters[key].clear();
  }

  // Clear failure text input
  var failureInput = document.getElementById("failureFilter");
  if (failureInput) failureInput.value = "";

  // Refresh the table to show all rows
  filterTable();
}

function filterTable() {
  var rows = document.getElementsByClassName("expandable");

  // Get failure text input
  var failureInputRaw = document.getElementById("failureFilter").value.trim();
  var failureRegex = null;

  // If user types a regex (starts and ends with '/'), compile it
  if (failureInputRaw.startsWith("/") && failureInputRaw.endsWith("/")) {
    try {
      var pattern = failureInputRaw.slice(1, -1); // remove the slashes
      failureRegex = new RegExp(pattern, "si");   // s=dotAll, i=case-insensitive
    } catch (e) {
      console.warn("Invalid regex in failure filter:", e.message);
      failureRegex = null;
    }
  }

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var infoRow = row.nextElementSibling;
    var match = true;

    // Column dropdown filters (exact match)
    for (var key in activeFilters) {
      if (activeFilters[key].size === 0) continue;
      var cellText = row.children[columnIndex[key]].innerText.trim();
      if (!activeFilters[key].has(cellText)) {
        match = false;
        break;
      }
    }

    // Failure text filter
    if (match && failureInputRaw && infoRow) {
      var failureText = infoRow.innerText;

      if (failureRegex) {
        // Use regex if provided
        if (!failureRegex.test(failureText)) {
          match = false;
        }
      } else {
        // Plain substring search (case-insensitive)
        if (!failureText.toLowerCase().includes(failureInputRaw.toLowerCase())) {
          match = false;
        }
      }
    }

    // Show/hide rows
    if (match) {
      row.style.display = "table-row";
    } else {
      row.style.display = "none";
      if (infoRow) {
        infoRow.style.display = "none";
        row.classList.remove("active");
      }
    }
  }
}

DocReady(function() {
  var topArrow = document.getElementById("top-arrow");
  window.onscroll = function() {scrollFunction(topArrow)};
  attachEventOnScrollArrow(topArrow);
  attachEventOnExpandableRow();

  var failureInput = document.getElementById("failureFilter");
  if (failureInput) {
    failureInput.addEventListener("input", filterTable);
  }

  document.querySelectorAll(".filter-btn").forEach(function(btn) {
    btn.addEventListener("click", function(e) {
      e.stopPropagation();
      createFilterMenu(this.dataset.column, this);
    });
  });

  var clearBtn = document.getElementById("clearFiltersBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearAllFilters);
  }

  document.addEventListener("click", function() {
    if (openMenu) {
      openMenu.remove();
      openMenu = null;
    }
  });
});
