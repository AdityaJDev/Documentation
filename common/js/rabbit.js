const renderDatatable = (url, getOptions) => {
  // getOptions = getBackcastDatatableOptions or getResultsDatatableOptions

  // Datatable options
  let datatableOptions = getOptions();
  datatableOptions.ajax = url;

  // Create datatable via ajax sourced data
  let table = $('#backcast-table').dataTable(datatableOptions);
  table.fnSetColumnVis(0, false);

  // Return the datatable
  return table;
};


function getBackcastDatatableOptions() {
  // columns can have properties of
  // - title: ""
  // - className: ""
  let datatableOptions;
  datatableOptions = {
    destroy: true,
    iDisplayLength: 25,
    responsive: true,
    columns: [
      {
        data: "id",
        className: "id",
        responsivePriority: 0
      },
      {
        data: "iso", title: "ISO",
        className: "iso text-nowrap",
        responsivePriority: 3
      },
      {
        data: "node", title: "Node",
        className: "location text-nowrap",
        responsivePriority: 1
      },
      {
        data: "calctype", title: "Calc Type",
        className: "calctype text-nowrap text-center",
        responsivePriority: 2
      },
      {
        data: "energy", title: "Energy",
        className: "energy text-right",
        responsivePriority: 4
      },
      {
        data: "capacity", title: "Capacity",
        className: "capacity text-right",
        responsivePriority: 5
      },
      {
        data: "refdate", title: "Ref Date",
        className: "refdate text-nowrap",
        responsivePriority: 6
      },
      {
        data: "count", title: "Count",
        className: "count text-right",
        responsivePriority: 7
      },
      {
        data: null,
        title: "",
        responsivePriority: 1,
        searchable: false,
        sortable: false,
        className: "text-right pr-2",
        render: () => {
          return `
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                  <i class="fa fa-bars"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-right" style="margin-top: 5px;">
                  <a href="#" class="dropdown-item">Option 1</a>
                  <a href="#" class="dropdown-item">Option 2</a>
                  <a href="#" class="dropdown-item">Option 3</a>
                </div>`;
        }
      }
    ],
    columnDefs: [
      // https://datatables.net/reference/option/columns.createdCell
      // This is a callback function that is executed whenever a cell is created (Ajax source, etc) or read from a
      // DOM source. It can be used as a complement to columns.render allowing modification of the cell's DOM element
      // (add background colour for example) when the element is created (cells may not be immediately created on
      // table initialisation if deferRender is enabled, or if rows are dynamically added using the API (rows.add()).
      // Example: Store the value of the hidden id column as data attribute for the row, for later use, if required
      {
        targets: 0,
        createdCell: (cell, cellData, rowData, rowIndex, colIndex) => {
          $(cell).parents("tr").data("id", rowData.id);
        }
      }
    ],
    order: [
      [2, 'desc'],
      [0, 'desc'],
      [1, 'asc']
    ],
  };

  return datatableOptions
}


function getResultsDatatableOptions() {
  // columns can have properties of
  // - title: ""
  // - className: ""
  let datatableOptions;
  datatableOptions = {
    destroy: true,
    iDisplayLength: 25,
    responsive: true,
    columns: [
      {
        data: "id",
        className: "id",
        responsivePriority: 0
      },
      {
        data: "refdate", title: "Calc Date",
        className: "refdate text-nowrap",
        responsivePriority: 2
      },
      {
        data: "fordate", title: "For Date",
        className: "fordate text-nowrap",
        responsivePriority: 2
      },
      {
        data: "rev_energy", title: "Energy",
        className: "revenue revenue-energy text-right",
        render: $.fn.dataTable.render.number(',', '.', 0, '$'),
        responsivePriority: 5
      },
      {
        data: "rev_spin", title: "Spin",
        className: "revenue revenue-spin text-right",
        render: $.fn.dataTable.render.number(',', '.', 0, '$'),
        responsivePriority: 5
      },
      {
        data: "rev_regup", title: "RegUp",
        className: "revenue revenue-regup text-right",
        render: $.fn.dataTable.render.number(',', '.', 0, '$'),
        responsivePriority: 5
      },
      {
        data: "rev_regdn", title: "RegDown",
        className: "revenue revenue-regdn text-right",
        render: $.fn.dataTable.render.number(',', '.', 0, '$'),
        responsivePriority: 5
      },
      {
        data: "revenue", title: "Revenue",
        className: "revenue revenue-total text-right",
        render: $.fn.dataTable.render.number(',', '.', 0, '$'),
        responsivePriority: 3
      },
      {
        data: "turns", title: "Turns",
        className: "turns text-right",
        responsivePriority: 4
      },
      {
        data: null,
        title: "",
        responsivePriority: 1,
        searchable: false,
        sortable: false,
        className: "text-right pr-2",
        render: () => {
          return `
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                  <i class="fa fa-bars"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-right" style="margin-top: 5px;">
                  <a href="#" class="dropdown-item">Option 1</a>
                  <a href="#" class="dropdown-item">Option 2</a>
                  <a href="#" class="dropdown-item">Option 3</a>
                </div>`;
        }
      }
    ],
    columnDefs: [
      // https://datatables.net/reference/option/columns.createdCell
      // This is a callback function that is executed whenever a cell is created (Ajax source, etc) or read from a
      // DOM source. It can be used as a complement to columns.render allowing modification of the cell's DOM element
      // (add background colour for example) when the element is created (cells may not be immediately created on
      // table initialisation if deferRender is enabled, or if rows are dynamically added using the API (rows.add()).
      // Example: Store the value of the hidden id column as data attribute for the row, for later use, if required
      {
        targets: 0,
        createdCell: (cell, cellData, rowData, rowIndex, colIndex) => {
          $(cell).parents("tr").data("id", rowData.id);
        }
      }
    ],
  };

  return datatableOptions
}


// Function to build the chart using given array of values and chart dimensions
const build_chart = (data, div_width, div_height) => {
// console.log("orig data", data);
  // Setup date parser/formatter
  let parseDate = d3.timeParse("%Y-%m-%d");
  let formatDate = d3.timeFormat('%m-%Y');

  // Parse the input data -- fetch only the required data points
  data = $.map(data, d => {
    return {
      // X axis variable
      forDate: parseDate(d[4]),
      // Series
      energy: +d[8],
      spin: +d[9],
      reg: +d[10] + +d[11],
    };
  });
// console.log("parsed data", data);

  // Create data groupings based on series
  let series = d3.stack().keys(['energy', 'spin', 'reg']).offset(d3.stackOffsetDiverging)(data);
// console.log("series", series);
  // Initialize dom element with svg element to create the chart
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  // Set the dimensions and margins of the graph
  let margin = {top: 5, right: 0, bottom: 10, left: 30},
      width = div_width - margin.left - margin.right,
      height = div_height - margin.top - margin.bottom;

  // Define the color colorScale
  let color = d3.scaleOrdinal()
    .domain(series.map(d => d.key))
    .range(["chart-color-energy", "chart-color-spin", "chart-color-reg"])
    .unknown("#ccc");

  // Define X scale
  let x = d3.scaleBand()
    .domain(data.map(d => d.forDate))
    .rangeRound([margin.left, width - margin.right])
    .padding(0.2);

  // Define Y scale
  // Get min and max values across all series
  let seriesMinValue = d3.min(series, d => d3.min(d, d => d[0]));
  let seriesMaxValue = d3.max(series, d => d3.max(d, d => d[1]));
  // console.log(seriesMinValue, seriesMaxValue);
  // Extend the domain by 10%
  seriesMinValue *= -1.1;
  seriesMaxValue *= 1.1;
  // console.log(seriesMinValue, seriesMaxValue);

  // Use extended domain
  let y = d3.scaleLinear()
    .domain([seriesMinValue, seriesMaxValue])
    .rangeRound([height - margin.bottom, margin.top]).nice()

  // Define X axis
  let xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .attr("class", "x-axis")
    .call(d3.axisBottom(x)
      .tickSize(0)
      // .tickSizeOuter(5)
      .tickFormat(d => d <= d3.timeYear(d) ? formatDate(d) : null)
    )
    // .call(g => g.selectAll(".domain").remove())

  // Define Y axis
  let yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, "s"))

  // Initialize the chart element inside the svg
  let chart = d3.select(svg)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(0,0)")
    // .style("background-color", "lightgrey");

  // Append the bars
  chart.append("g")
    .selectAll("g")
    .data(series)
    .enter().append("g")
      .attr("class", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .enter().append("rect")
      .attr("width", x.bandwidth)
      .attr("x", d => x(d.data.forDate))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))

  // Define legend variables
  let legendSpace = width/series.length;  // Space for each legend
  let legendSpacing = 5;  // Space between legend and text
  let legendRectSize = 10;  // Size of legend
  // Scale for mapping series variable names to legend text
  let legendScale = d3.scaleOrdinal()
    .domain(series.map(d => d.key))
    .range(series.map(d => capitalize(d.key)))
    .unknown("Unknown");

  // Add the Legend element
  let legend = chart.selectAll('.legend')
    .data(color.domain())
    .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (_d, i) => {
        // Center the legend in its space
        let x = (i * legendSpace) + legendSpace/2;
        // Legend in top margin
        let y = margin.top;
        return `translate(${x}, ${y})`;
      });

  // Legend box
  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .attr('class', color)

  // Legend text
  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize)
    .text(d => legendScale(d));

  // Add the X axis
  chart.append("g")
      .call(xAxis);

  // Add the Y axis
  chart.append("g")
      .call(yAxis);

  // Return chart node
  return chart.node();
}


// Function to place the chart in the given location
const draw_chart = (location_id, data) => {
  // Get window width available for the chart
  let width = $("#backtest-chart").width();
  // Set height based on width with aspect ratio 16:9
  let height = width * 9 / 16;
  // Build the chart
  let chart = build_chart(data, width, height);
  // Cleanup the chart div
  document.getElementById(location_id).innerHTML = '';
  // Place new chart in chart div
  document.getElementById(location_id).append(chart);
}


// Function to build the histogram
const build_histogram = (data, div_width, div_height) => {
// console.log(data, div_width, div_height);
  // var data = getData(5000);
  let selectedValue = data[35];

  let margin = ({top: 5, right: 0, bottom: 10, left: 30})
  let width = div_width - margin.left - margin.right;
  let height = div_height - margin.top - margin.bottom;

  // var barWidth = 25;
  // var binSize = Math.floor( width / barWidth );
  let binSize = 25;

  let x = d3.scaleLinear()
    .domain(d3.extent(data))
    .range([margin.left, width - margin.right]).nice();

  let bins = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(binSize))
    (data);

  let y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .range([height - margin.bottom, margin.top]).nice();

  let xAxis = g => g
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x)
        // .tickSizeOuter(5)
        .ticks(5, "s"))
    .call(g => g.append("text")
        .attr("x", width - margin.right)
        .attr("y", 0)
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "end")
        .text(data.x))

  let yAxis = g => g
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y))
    // .call(g => g.select(".domain").remove())
    // .call(g => g.select(".tick:last-of-type text").clone()
    //     .attr("x", 4)
    //     .attr("text-anchor", "start")
    //     .attr("font-weight", "bold")
    //     .text(data.y))

  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  let chart = d3.select(svg)
    .attr("width", div_width)
    .attr("height", div_height)
    .attr("transform", "translate(0, 0)")

  chart.append("g")
    .selectAll("rect")
    .data(bins)
    .join("rect")
      .attr("x", d => x(d.x0) + 1)
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2))
      .attr("y", d => y(d.length))
      .attr("height", d => y(0) - y(d.length))
      .attr("class", d => d.includes(selectedValue) ? "chart-color-75" : "chart-color-25")

  chart.append("g").call(xAxis);

  chart.append("g").call(yAxis);

  return chart.node();
}


// Global variable to cache the histogram data
histogram_data = [];


// Function to draw histogram with given data in given location
const draw_histogram = (location_id) => {
  // If histogram data is available in cache, use it
  if (histogram_data.length > 0) {
    // console.log("Using cached data");
    // Get available space for histogram
    let size = getchartsize("#" + location_id);
    // Build the histogram with given data and available size
    let chart = build_histogram(histogram_data, size["width"], size["height"]);
    // Empty the chart location
    document.getElementById(location_id).innerHTML = '';
    // And insert the created chart in given location
    document.getElementById(location_id).append(chart);
  } else {
    // console.log("Fetching data from server");
    // Get the data for given ISO from server via ajax
    $.getJSON('https://energy.finmachines.com/api/rabbit/backtest/list/?iso=ERCOT', (response) => {
      // console.log("CORS data", response);
      // Check for success
      if (response.success) {
        // Construct the data for histogram using revenue totals
        $.each(response.data, (_i, d) => {
          /**
           * @param d.sum_revenue
           */
          histogram_data.push(d.sum_revenue);
        });
        // Get available space for histogram
        let size = getchartsize("#" + location_id);
        // Build the histogram with given data and available size
        let chart = build_histogram(histogram_data, size["width"], size["height"]);
        // Empty the chart location
        document.getElementById(location_id).innerHTML = '';
        // And insert the created chart in given location
        document.getElementById(location_id).append(chart);
      }
    });
  }
}


// Function to get size of location element where the chart will be drawn
const getchartsize = (location_id) => {
  let w = $(location_id).width();
  let h = w * 9 / 16;
  return { "width": w, "height": h };
}


// Function to enable execute button
const enable_execute = () => {
  $('.btn-execute').removeClass("btn-secondary disabled").addClass("btn-primary");
};


// Function to disable execute button
const disable_execute = () => {
  $('.btn-execute').removeClass("btn-primary").addClass("btn-secondary disabled");
};


// Form: /storage/backcast/run/
function activateButton() {
    let allInputs =
        ($('input#dart-da').is(':checked') || $('input#dart-rt').is(':checked')) &&
        ($("input#node").val().trim()) !== "" &&
        // ($("input#startdate").val().trim()) !== "" &&
        // ($("input#enddate").val().trim()) !== "" &&
        ($("input#energy").val().trim()) !== "" &&
        ($("input#capacity").val().trim() !== "");

    if (allInputs) {
        enable_execute();
    } else {
        disable_execute();
    }
}
