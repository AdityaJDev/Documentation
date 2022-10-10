// Function to test for JSON data (python dictionary)
function get_json_data(data) {
  // Try parsing the data into JSON format
  try {
    return JSON.parse(data);
  }
  // Return data as is if cannot be parsed to JSON
  catch(e) {
    return data;
  }
}

// Function to flash message at bottom of screen
function flash(type, message) {
  // Build the alert message html using template
  var template = $.trim($('#alert-message-template').html());
  var html = template
              .replace(/<%alert_type%>/ig, type)
              .replace(/<%alert_message%>/ig, message);

  // Show flash at bottom of screen
// console.log(html);
  $("#alert-message").html("").html(html).fadeIn(500);
  setTimeout(function() {
    // Hide it after a few secs
    $("#alert-message").fadeOut(1500);
  }, 3000);
}

// Function to return number with thousands separator
function addThousandsSeparator(n) {
  //remove commas
  // m = n ? parseFloat(n.replace(/,/g, '')) : 0;
  m = n ? n : "0";

  //apply formatting
  // return retVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // var parts = m.toString().split(".");
  var parts = m.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

// Function to capitalize string
function capitalize(s) {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
