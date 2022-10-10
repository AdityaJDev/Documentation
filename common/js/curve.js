// Function to get the row depth
const depth = ($row) => parseInt($row.data("depth"));
// const depth = ($row) => {
// console.log("depth", parseInt($row.data("depth")));
// return parseInt($row.data("depth"));
// }

// Function to find the next data-row for the given row
const next_row = ($row) => $row.nextAll(".data-row").first();
// const next_row = ($row) => {
// console.log("next row", $row.nextAll(".data-row").first());
//   return $row.nextAll(".data-row").first();
// }

// Function to determine whether the given row is expandable, i.e. has children
// Expandable if the next data-row has the next depth value
const has_children = ($row) => depth(next_row($row)) == depth($row) + 1;
// const has_children = ($row) => {
// console.log("has_children row", $row);
//   return depth(next_row($row)) == depth($row) + 1
// };

// Function to find children of given row based on depth
const find_children = ($parent) => {
// console.log($parent);
    // Get desired depth of the children; 1 more than the parent
    var parent_depth = $parent.data("depth");
    var children_depth = parent_depth + 1;
// console.log(parent_depth, children_depth);
    // Get all the siblings next to or after the parent
    var siblings = $parent.nextAll(".data-row");
// console.log(siblings);
    // Loop thru the siblings while they have children_depth
    var children = [];
    siblings.each((_index, sibling) => {
      // This is a child
// console.log("child check", $(sibling).data("depth"), sibling);
      if ($(sibling).data("depth") == children_depth) {
        children.push(sibling);
      // Stop once you hit the next parent (depth)
      } else if ($(sibling).data("depth") == parent_depth) {
        return false;
      }
    });
// console.log(children);
  return children;
}

// Function to show immediate or all children for given row
// The scope will be used to decide whether to recursively show children
const show_children = ($data_row, scope) => {
  // Loop thru child elements for given row
  $.each(find_children($data_row), (_index, child_row) => {
    // Show each child
    var $child_row = $(child_row);
    $child_row.removeClass("hidden").hide().slideDown("slow");
    // Recursive call if this child row has more children and all children are requested
    if ((scope == "all") && has_children($child_row)) {
      show_children($child_row, "all");
    } else {
      return;
    }
  });
  // console.log("done showing children");
  // Toggle the menu option and icon
  $expand_icon = $data_row.find("span.expand-row");
// console.log($expand_icon);
  // Toggle the class
  $expand_icon.removeClass("collapsed").addClass("expanded");
  // And the corresponding icons
  $expand_icon.find(".fa").removeClass("fa-plus").addClass("fa-minus");
}

// Function to hide all children recursively for given row
const hide_children = ($data_row, scope) => {
  // Loop thru child elements for given row
  $.each(find_children($data_row), (_index, child_row) => {
    // Hide this child
    var $child_row = $(child_row);
    $child_row.slideUp("fast", () => $child_row.addClass("hidden"));
    // Recursive call if this child row has more children
    if (has_children($child_row)) {
      hide_children($child_row, scope);
    } else {
      return;
    }
  });
  // console.log("done hiding children");
  // Toggle the class
  $expand_icon = $data_row.find("span.expand-row");
  $expand_icon.removeClass("expanded").addClass("collapsed");
  // And the corresponding glyphicons
  $expand_icon.find(".fa").removeClass("fa-minus").addClass("fa-plus");
}

// Function to check whether the given row is already expanded (showing children)
// First check for 'expanded' class - then check whether child rows are showing
const is_expanded = ($row) => (($row.find("div.expand-row").hasClass("expanded")) || (has_children($row) && !(next_row($row).hasClass("hidden"))));

// Function to display the curve level records
const display_curve_records = () => {
  // Get the list of curve records
  $.getJSON("/api/curve/curves?ts=" + (new Date).getTime().toString(), function(response) {
console.log("curves:", response);
    // Check for success
    if (response.success) {
      // Get the isos
      var isos = response.data;
      // Loop thru all the isos
      $.each(isos, (i, iso) => {
        // Loop thru all the curves for this iso
        $.each(iso.curve, (i, c) => {
          // Build iso/curve row using template
          let template = $.trim($("#curve-row-template").html());
          // Set template for showing curve information
          let td_template = `
            <span class="curve-code"><%curve_code%></span>
            &nbsp;:&nbsp;
            <span class="curve-name"><%curve_name%></span>
          `
          template = template
            .replace(/<%curve_td_template%>/ig, td_template);
          // Prepare html for appending to curve table
          let html = template
            .replace(/<%curve_iso_id%>/ig, iso.id)
            .replace(/<%curve_iso_name%>/ig, iso.name)
            .replace(/<%curve_id%>/ig, c.id)
            .replace(/<%curve_code%>/ig, c.code)
            .replace(/<%curve_name%>/ig, c.name)
            .replace(/<%symbol_id%>/ig, '-1')
            .replace(/<%source_id%>/ig, '-1')
            .replace(/<%data_depth%>/ig, 0)
            .replace(/<%display_row%>/ig, '')
            .replace(/<%show_menu%>/ig, 'transparent') // Hide iso row menu
// console.log(html);
          // Append row to curve table
          $(html).appendTo("#curve-table tbody");

          // Loop thru all the symbols for this curve
          $.each(c.symbol, (i, s) => {
            // Build symbol row using template
            let template = $.trim($("#curve-row-template").html());
            // Set template for showing symbol information
            let td_template = `
              <span class="indent-marker dimmed"></span>
              <span class="curve-symbol-name"><%symbol_name%></span>
            `
            template = template
              .replace(/<%curve_td_template%>/ig, td_template);
            // Prepare html for appending to curve table
            let html = template
              .replace(/<%curve_iso_id%>/ig, iso.id)
              .replace(/<%curve_iso_name%>/ig, iso.name)
              .replace(/<%curve_id%>/ig, c.id)
              .replace(/<%symbol_id%>/ig, s.id)
              .replace(/<%symbol_name%>/ig, s.symbol)
              .replace(/<%source_id%>/ig, '-1')
              .replace(/<%data_depth%>/ig, 1)
              .replace(/<%display_row%>/ig, 'hidden')
              .replace(/<%show_menu%>/ig, 'transparent') // Hide symbol row menu
              // console.log(html);
            // Append row to curve table
            $(html).appendTo("#curve-table tbody");
// console.log(html);

            // Loop thru all the sources for this symbol
            $.each(s.source, (i, o) => {
              // Build source row using template
              let template = $.trim($("#curve-row-template").html());
              // Set template for showing source information
              let td_template = `
                <span class="indent-marker dimmed"></span>
                <span class="indent-marker dimmed"></span>
                <%source_name%>
              `
              template = template
                .replace(/<%curve_td_template%>/ig, td_template);
              // Prepare html for appending to curve table
              let html = template
                .replace(/<%curve_iso_id%>/ig, iso.id)
                .replace(/<%curve_iso_name%>/ig, iso.name)
                .replace(/<%curve_id%>/ig, c.id)
                .replace(/<%symbol_id%>/ig, s.id)
                .replace(/<%source_id%>/ig, o.id)
                .replace(/<%source_name%>/ig, o.source)
                .replace(/<%data_depth%>/ig, 2)
                .replace(/<%display_row%>/ig, 'hidden')
                .replace(/<%show_menu%>/ig, '') // Show source row menu
                // console.log(html);
              // Append row to curve table
              $(html).appendTo("#curve-table tbody");
// console.log(html);
            });
          });
        });
      });

      // Initialize number of data rows to add ref dates to
      rows_to_process = $("#curve-table .data-row").length;
      rows_processed = 0;

      // Populate the dates on all data records, asynchronously
      insert_dates_on_rows($("#curve-table .data-row"), (data_row) => {
        insert_dates_on_row(data_row);
      });
    } else {
      flash("danger", "Unable to load curves");
    }
  });
}

// Function to process dependent tasks once all rows are populated with dates
const process_dependent_tasks = () => {

}

// Function to check for completion of background tasks
const check_background_tasks_completion = () => {
  // Increment processed counter
  rows_processed++;
  // Check if all items are processed; if so, process dependent functionality
  if (rows_processed >= rows_to_process) {
    process_dependent_tasks();
  }
}

// Function to populate dates on given data row using ajax
const insert_dates_on_row = (data_row) => {
  // Get ids for iso, curve and symbol (if any) for given data row
  let iso_id = $(data_row).data("isoId");
  let curve_id = $(data_row).data("curveId");
  let symbol_id = $(data_row).data("symbolId");
  let source_id = $(data_row).data("sourceId");

  // Form url based on the above ids
  // Pass only valid symbol id - it will be only on child rows
  let url = "/api/curve/refdaterange/?iso=" + iso_id + "&curve=" + curve_id + ((symbol_id != -1) ? ("&symbol=" + symbol_id) : "") + ((source_id != -1) ? ("&source=" + source_id) : "");

  // Ajax call to get ref dates
  $.getJSON(url, (result) => {
    // Check for success
    if (result.success) {
      // Get the ref dates
      let data = result.data;
      let min_date = data.refdate_min;
      let max_date = data.refdate_max;
      // Insert these dates in the right locations on the given data row
      $(data_row).find(".min-date").text(min_date);
      $(data_row).find(".max-date").text(max_date);
    }
    // Check if all rows are processed
    check_background_tasks_completion();
  });
}

// Function to populate dates on all data rows
const insert_dates_on_rows = (data_rows, insert_dates_on_row) => {
  setTimeout( function insert_dates() {
    // Pick the 1st row
    data_row = $(data_rows).eq(0);

    // Remove it from array
    data_rows.splice(0,1);
    // Insert dates on this row
    insert_dates_on_row(data_row);
    // Check if any more data rows left to process
    if (data_rows.length > 0) {
      // Call this function again after 5ms
      setTimeout(insert_dates(), 5);
    }
  }, 5);
}