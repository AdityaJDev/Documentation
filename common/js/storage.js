const display_output_items = (data) => {
  // Initialize html templates
  var row_template = $.trim($("#row-template").html());
  var shape_template = $.trim($("#shape-template").html());
  var shapes = [];

  // Loop thru the data items
  $.each(data, (_i, d) => {
    // Loop thru all the shapes for each data item and build html for it
    $.each(d.shapes, (i, s) => {
      // Build html for a shape
      let shape_html = shape_template
        .replace(/<%shape_index%>/ig, i)
        .replace(/<%shape%>/ig, s);
      // Append to shapes array
      shapes.push(shape_html);
    });
    // Build html for a row, embedding the shapes html in it
    let row_html = row_template
      .replace(/<%row_label%>/ig, d.label)
      .replace(/<%row_type%>/ig, d.paramtype)
      .replace(/<%shapes_html%>/ig, shapes.join(''));
// console.log(row_html);
      // Append the row html to output container
      $(row_html).appendTo('#output-container');
      // Reset the shapes array
      shapes = [];
  });
}

// Function to check if each shape can be calculated given the user inputs,
// and mark the output as such
// It will be called every time any input is changed
const check_index_params = () => {
  // Check in all input parameters are provided
  if ( !allParamsSelected() ) return false;

  // Get the user selections
  var symbol_id = $("#curve-index").data("symbolId");
  var valuation_date = $("#valuation-date").val();
  var start_date = $("#start-date").val();
  var end_date = $("#end-date").val();

  // Loop thru all the shape rows and its shapes
  $("#output-container .shape-row").each((_i, r) => {
    var $row = $(r);
    var param_type = $row.data("rowType");
    // Set the url and payload based on all the above inputs
    var url = "/api/curve/checkindexparams/";
    var data = { symbol: symbol_id, refdate: valuation_date, startdate: start_date, enddate: end_date, paramname: param_type, ts: (new Date).getTime().toString() };
console.log(data);
    // Call API to get output items via ajax
    $.getJSON(url, data, (result) => {
console.log(result);
      // Check for success
      if (result.success) {
console.log("output", result.data[param_type]);
        // Match result booleans with respective set of checkboxes on the page
        // Loop thru result for this shape
        $.each( result.data[param_type], ( i, b ) => {
          // Check the checkbox based on its index within the row
          if (b) {
            $row.find(".checkbox-" + i).find("i.far").removeClass("fa-square").addClass("fa-check-square");
          } else {
            $row.find(".checkbox-" + i).find("i.far").removeClass("fa-check-square").addClass("fa-square");
          }
        });
      }

      // After the scalars are resolved, check if calculate can be enabled
      // Enable the calculate button if all shapes are available
      if (param_type == 'scalars') {
        console.log("can calculate", can_calculate());
        if (can_calculate()) {
          enable_calculate();
        } else {
          disable_calculate();
        }
      }
    });
  });
};

// Function to determine if Calculate button can be enabled
const can_calculate = () => {
  // If there is atleast one empty square (i.e. one with no check inside square or fa-check-square), then we cannot calculate
  // So, we can calculate if there are zero empty squares, or all boxes are checked
  return $(document).find(".shape-row .fa-square").length == 0;
};

// Function to enable Calculate button
const enable_calculate = () => {
  // Enable the calculate button if all shapes are available
  $(".btn-calculate").removeClass("btn-secondary disabled").addClass("btn-primary");
};

// Function to disable Calculate button
const disable_calculate = () => {
  $(".btn-calculate").removeClass("btn-primary").addClass("btn-secondary disabled");
};

// Function to check if all input parameters are selected/given
const allParamsSelected = () => {
  if ( $("#curve-index").val() != '' &&
      $("#curve-index").val() != 'Choose symbol' &&
      $("#valuation-date").val() != '' &&
      $("#start-date").val() != '' &&
      $("#end-date").val() != '' ) {
// console.log("All params selected");
        return true;
      } else {
// console.log("Some params not selected");
        return false;
      }
};
