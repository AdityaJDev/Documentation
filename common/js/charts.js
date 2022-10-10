// Function to display hour
const displayHour = h => 'HE ' + ('0' + h).slice(-2);

// Function to build the calendar hours in left margin
const build_calendar_hours = (cellSize) => {
  // Set the margins for the graph
  let margin = ({ top: 25, right: 15, bottom: 0, left: 40 });

  // Variables related to cell size
  height = (cellSize * 24);

  // Initialize svg
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  d3.select(svg)
    .attr("id", "hours-svg");

  // Initialize the chart element inside the svg
  chart = d3.select(svg)
    .attr("width", margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(0,0)")
    .style("font", "roboto")
    // .style("background-color", "#eee");

  // Plot the hours in left margin
  const hours = chart.selectAll("text")
    .data(d3.range(1,25))
    .join("text")
      .attr("text-anchor", "end")
      .attr("x", margin.left)
      .attr("y", (d, i) => margin.top + i * cellSize + cellSize/2)
      .attr("dx", "-.5em")
      .attr("dy", ".3em")
      .text(d => displayHour(d))
      .style("font-size", cellSize);

    return chart.node();
}

// Function to build the calendar chart using given array of values and chart dimensions
const build_chart_calendar = (data, dateColumn, dataExtent, cellSize) => {
// console.log("data, dateColumn, dataExtent, cellSize", data, dateColumn, dataExtent, cellSize);
  // Set the margins for the graph
  let margin = ({ top: 25, right: 15, bottom: 0, left: 40 });

  let cssText = `
    .selected-cell {
    fill: #ff9900!important;
    }
    .selected-cells {
      fill: khaki;
    }
    #calendar-svg {
      background-color: white;
    }
  `
  // Variables related to cell size
  yearPadding = cellSize * 1.5;
  yearWidth = (cellSize * 12);
  height = (cellSize * 24);

  // Function to determine the domain to be used for rendering the cell color
  let colorDomain = (dataExtent, dataValues) => {
    if (dataExtent != undefined)
      return [dataExtent.min, dataExtent.max];
    else
      // Get the range of available data
      var dataRange = d3.extent(dataValues, d => d.value)
      // Process the ranges to come up with linear distribution
      dataRange[0] = Math.min(dataRange[0], -Math.abs(dataRange[1]))
      dataRange[1] = Math.max(dataRange[1], Math.abs(dataRange[0]))
      return dataRange;
  }

  // Use this value when painting a cell
  let color_domain = d3.scaleLinear()
    // Pass dataExtent instead of undefined to override
    .domain(colorDomain(undefined, data))
    .range([-1, +1]);
// console.log("color_domain", color_domain.domain());
  // Set color using interpolated colors
  let color = d3.scaleLinear().domain([-1, 0, 1]).range(["#ff0000", "#f8f8f8", "#00ff00"]).interpolate(d3.interpolateRgb);

  // Format value
  formatValue = d3.format("+.2");

  // Function to format the hour, making it always 2 digits
  formatHour = h => ('0' + (h+1)).slice(-2);

  // Function to get the month letter from the given date
  monthLetter = d => "JFMAMJJASOND"[d[dateColumn].getMonth()];

  // Function to format the month
  formatMonth = m => ('0' + (m+1)).slice(-2);

  // Function to provide a class for each year bucket
  yearClass = d => {
    return 'year year-' + d.key;
  }

  // Function to add classes to each cell based on its month and hour coordinates
  cellClass = d => {
    let cellYear = d[dateColumn].getFullYear();
    let cellMonth = d[dateColumn].getMonth();
    let cellHour = d[dateColumn].getHours();
    return 'cell cell-month-' + cellYear + '-' + cellMonth + ' cell-hour-' + cellHour;
  }

  // Function to handle mouseover on any cell
  handleMouseover = d => {
    // Get year
    let containerYear = d[dateColumn].getFullYear();
    let cellYear = d[dateColumn].getFullYear();
    let cellMonth = d[dateColumn].getMonth();
    let cellHour = d[dateColumn].getHours();
    // Highlight the month column for this year
    $("g.year.year-" + containerYear).find("rect.cell.cell-month-" + cellYear + "-" + cellMonth).addClass("selected-cells");
    // Highlight the hour row
    $("rect.cell.cell-hour-" + cellHour).addClass("selected-cells");
    // Highlight the intersection - the actual cell selected
    $("g.year.year-" + containerYear).find("rect.cell.cell-month-" + cellYear + "-" + cellMonth + ".cell-hour-" + cellHour).addClass("selected-cell");
  }

  // Function to remove all highlights on mouseout
  handleMouseout = d => {
// console.log(d);  
    // Reset highlight
    $("rect.cell").removeClass("selected-cell selected-cells");
  }

  // Function to generate the tooltip for any cell
  getTitle = d => {
    const value = (d.value === undefined) ? formatValue(0) : formatValue(d.value);
    const month = d[dateColumn].getFullYear() + '/' + formatMonth(d[dateColumn].getMonth());
    const hour = formatHour(d[dateColumn].getHours());
    return month + ':' + hour + ' ' + value;
  }

  // Format the data and sort it on fordate
  data = data.map(d => { return {
      fordate: new Date(d[dateColumn]),
      value: +d.value,
    };
  });

  // Get missing monthly data points from January for 1st year until available month for that year
  // And also from available last month to December of last year.
  const missingMonthPoints = data => {
// console.log("missingMonthPoints", data);
    // Initialize month points
    var monthPoints = [];
    // Get min and max dates in the provided data
    var minDate = d3.min(data, d => d[dateColumn]); // Get the min date
    var maxDate = d3.max(data, d => d[dateColumn]); // Get the max date
// console.log(minDate, maxDate);
    // Check if 1st date is beyond 1st Jan of that year
    if (new Date(minDate) > new Date(minDate.getFullYear(), 0, 1)) {
      // Build the start date; end date is the min date
      let startDate = new Date(minDate.getFullYear(), 0, 1);
      let endDate = minDate;
  // console.log("head", startDate, endDate, d3.utcMonths(startDate, endDate));
      // 1 data point per missing month
      d3.utcMonths(startDate, endDate).map(d => monthPoints.push(d));
    }
    // Check if last date is prior to Dec of that year
    if (new Date(maxDate) < new Date(maxDate.getFullYear(), 12, 1)) {
      // Build the end date; start date is the max date
      let startDate = maxDate;
      let endDate = new Date(maxDate.getFullYear(), 12, 1);
  // console.log("tail", startDate, endDate, d3.utcMonths(startDate, endDate));
      // 1 data point per missing month
      d3.utcMonths(startDate, endDate).map(d => monthPoints.push(d));
    }
    return monthPoints;
  }

  // Find missing head/tail months
  const monthPoints = missingMonthPoints(data);
// console.log(monthPoints);  
  // Get 24 hourly points for just 1 day in each month
  monthPoints.map(
    m => d3.timeHour.range(new Date(m.getFullYear(), m.getMonth(), 1), new Date(m.getFullYear(), m.getMonth(), 2))
    .map(d => data.push( { fordate: new Date(d), value: undefined } ))
  );

  // Sort data
  data.sort( (a, b) => a[dateColumn] - b[dateColumn]);
// console.log(data);

  // Create data groupings based on years
  years = d3.nest()
    .key(d => d[dateColumn].getFullYear())
    .entries(data)
// console.log("years", years);

  // Set chart width
  let width = (yearWidth + yearPadding) * years.length - yearPadding + margin.right + margin.left;

  // Initialize svg
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  d3.select(svg)
    .attr("id", "calendar-svg")
    .append("style").text(cssText);

  // Initialize the hours element inside the svg
  // This will not be shown on screen, but will show up when the chart svg is exported
  let hours_svg = d3.select(svg)
    .attr("width", margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(0,0)")
    .style("font-size", cellSize)
    // .style("background-color", "#eee");

  // Plot the hours in left margin
  const hours = hours_svg.selectAll("text")
    .data(d3.range(1,25))
    .join("text")
      .attr("text-anchor", "end")
      .attr("x", margin.left)
      .attr("y", (d, i) => margin.top + i * cellSize + cellSize/2)
      .attr("dx", "-.5em")
      .attr("dy", ".3em")
      .text(d => displayHour(d));

  // Initialize the chart element inside the svg
  chart = d3.select(svg)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(0,0)")
    // .style("background-color", "#eee");

  // Build yearly bucket
  const year = chart.selectAll("year")
    .data(years)
    .join("g")
      .attr("class", d => yearClass(d))
      .attr("transform", (d, i) => `translate(${(yearWidth + yearPadding) * i + margin.left}, ${margin.top})`)
// console.log('year', year.nodes());

  // Show year
  year.append("text")
      .attr("x", cellSize/2)
      .attr("dx", "-.2em")
      .attr("y", 0)
      .attr("dy", "-2em")
      .attr("font-weight", "bold")
      .attr("font-size", "12px")
      // .attr("text-anchor", "end")
      .text(d => d.key)
      .style("font-size", cellSize);
  
  // Show months -- use just the 0 hour to pick the month once per 24 hours
  year.append("g")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(d => d.values.filter(d => d[dateColumn].getHours() == 0))
    .join("text")
    .attr("x", d => d[dateColumn].getMonth() * cellSize + cellSize/2)
    .attr("y", 0)
    .attr("dy", "-.5em")
    .attr("font-size", cellSize)
    .text(monthLetter);

  // Draw the cells
  year.append("g")
    .selectAll("rect")
      .data(d => d.values)
    .join("rect")
      .attr("width", cellSize - 1)
      .attr("height", cellSize - 1)
      .attr("x", d => d[dateColumn].getMonth() * cellSize)
      .attr("y", d => d[dateColumn].getHours() * cellSize)
      .attr("fill", d => (d.value === undefined) ? color(color_domain(0)) :     color(color_domain(d.value))) // cells without data shown in white
      .attr("class", d => cellClass(d))
      .on("mouseover", handleMouseover)
      .on("mouseout", handleMouseout)
    .append("title")
      .text(d => getTitle(d)); // title not shown for cells without data

  return chart.node();
}

// Function to build the chart using given array of values and chart dimensions
const build_chart_streamgraph = (data, div_width, div_height, aggregate, period) => {
// console.log("build_chart", data, div_width, div_height);
  // Styles
  let cssText = `
    .line {
      fill: none;
      stroke-width: 1px;
    }
    .grid {
      stroke: lightgrey;
      stroke-opacity: .3;
      stroke-width: .3;
      shape-rendering: crispEdges;
    }
    #streamgraph-svg {
      background-color: white;
    }
  `

  // let aggregate = "sum";
  // let period = "Y";

  // Function to get time format given the period
  const getTimeFormat = p => {
    switch (p) {
      case 'H':
        return '%d-%m-%Y:%H';
        break;
      case 'D':
        return '%d-%m-%Y';
        break;
      case 'W':
        return '%d-%m-%Y';
        break;
      case 'M':
        return '%m-%Y';
        break;
      case 'Q':
        return '%m-%Y';
        break;
      case 'Y':
        return '%Y';
        break;
    }
  }

  // Get the time format
  let time_format = getTimeFormat(period);

  // Parse the date
  const parseDate = d3.timeParse(time_format);

  // Function to get the primary data array
  const getPrimary = (data) => {
    // Get primary percentile by finding the array having a 'primary' key with good percentile
    let primary_array = data.filter( d => d.hasOwnProperty("primary") && d['primary'] == "TRUE" && d['percentile'] !== undefined );
    return primary_array;
  }  

  // Get the primary data array and the corresponding percentile
  let primary_array = getPrimary(data);
  let primary_percentile = primary_array[0].percentile;
// console.log("primary array", primary_array, primary_percentile);

  // Function to get secondary arrays
  const getSecondary = (data) => {
    // Find the arrays that do not have a 'primary' key
    let secondary_arrays = data.filter( d => d.percentile != primary_percentile );
    return secondary_arrays;
  }

  // Get the secondary arrays and their corresponding percentiles
  let secondary_arrays = getSecondary(data);
  let secondary_percentiles = secondary_arrays.map( d => +d.percentile );
// console.log("secondary array", secondary_arrays, secondary_percentiles);

  // Function to process the data
  const processData = (data, percentiles) => {
// console.log("processData", data, percentiles);
    // Initialize array to hold final array of processed rows
    let processed_array = [];
    // Loop thru all data items - each row of the complex structure
    for (let i = 0; i < data.length; i++) {
      // Loop thru all entries and create 1 row per entry
      for (let [k, v] of Object.entries(data[i].data)) {
        let row = {};
        // Row attributes
        // row['name'] = data[i].name;
        row['date'] = new Date(k);
        // Loop thru all good percentile percentiles
        for (let percentile of percentiles) {
          // row['percentile'] = data[i].percentile + '%';
          row['percentile'] = data[i].percentile;
          row['value'] = v;
        }
        // Add row to array
        processed_array.push(row);
      }
    }
    return processed_array;
  }  

  // Function to aggregate data
  const rollupFunction = (v, aggregate) => {
    switch (aggregate) {
      case 'count':
        return v.length;
        break;
      case 'sum':
        return d3.sum( v, d => d.value );
        break;
      case 'min':
        return d3.min( v, d => d.value );
        break;
      case 'max':
        return d3.max( v, d => d.value );
        break;
      case 'mean':
        return d3.mean( v, d => d.value );
        break;
      case 'stdev':
        return d3.deviation( v, d => d.value );
        break;
      case 'variance':
        return d3.variance( v, d => d.value );
        break;
    }
  }
  
  // Function to generate key for grouping data, based on time format
  keyFunction = (d) => {
    return d3.timeFormat(time_format)(d.date);
  }  

  // Function to filter the data
  const getFilteredData = (data, primary_percentile, secondary_percentiles, matching) => {
// console.log("getFilteredData", data, primary_percentile, secondary_percentiles, matching);
    // Get 'distances' of all secondary percentiles from primary percentile
    let distances = secondary_percentiles.map( s => Math.abs(primary_percentile - s) );
// console.log("distances", distances);
    // Get all secondary percentiles that are equidistant from primary percentile
    // First get the counts for each distance
    let counts = distances.reduce( (r, k) => { r[k] = ++r[k] || 1; return r }, {} );
// console.log("counts", counts);
    // Now filter out those which have a count == 2
    let match = Object.keys(counts).filter( k => counts[k] == 2 ).map( k => +k );
// console.log("match", match, match.map( m => primary_percentile - m ), match.map( m => parseInt(primary_percentile) + m ));
    // Now get the corresponding secondary percentiles for matching distances from primary
    let result_percentiles = match.map( m => primary_percentile - m ).concat( match.map( m => parseInt(primary_percentile) + m ) );
// console.log("result_percentiles", result_percentiles);
    // Get non-matching set of percentiles if required
    if (!matching)
      result_percentiles = secondary_percentiles.filter(s => !result_percentiles.includes(s)).concat([+primary_percentile]);
    // Extract corresponding secondary arrays from input data
    let secondary_array = data.filter(d => result_percentiles.includes(+d.percentile) );
// console.log("secondary_array", secondary_array);
    // Process the secondary array so that there is one row per date and percentile
    // [{date: Fri Jan 02 2015 05:30:00 GMT+0530 (India Standard Time), percentile: "25", value: 215}, ...]
    let processed_data = processData(secondary_array, result_percentiles);
// console.log('processed_data', processed_data);
    // Now rollup the data (sum) on month and percentile as keys
    // This will be of the form
    // {01-2015: {25: 69840, 75: 77541, 5: 82570, 95: 75823}, 02-2015: {…},...}
    let rolledup_data = d3.nest()
      .key( d => keyFunction(d) )
      .key( d => d.percentile )
      .rollup( v => rollupFunction(v, aggregate) )
      .object( processed_data );
// console.log('rolledup_data', rolledup_data);
    // Return sorted list
    return rolledup_data;
  }

  // Function to get array which will be used for the area charts
  const getAreaData = (data, primary_percentile, secondary_percentiles) => {
    // Get rolledup data for matching secondary percentiles
    let rolledup_data = getFilteredData(data, primary_percentile, secondary_percentiles, true);
// console.log('area filtered_data', rolledup_data);
    // Now flatten the structure to get the following structure
    // [{25: 69840, 75: 77541, 5: 82570, 95: 75823, date: "01-2015"}, {}, ...]
    let flattened_data = Object.keys(rolledup_data).map( d => {
      let f = { date: d };
      Object.assign(f, Object.fromEntries(
        Object.entries(rolledup_data[d]).map( ([k, v]) => 
          [k, v])
      ));
      return f;
    });
// console.log('flat areadata', flattened_data);
    // Return the flattened data sorted on date
    return flattened_data.sort( (a, b) => a.date - b.date );
  }

  // Get the area data from input data
  let area_data = getAreaData(data, primary_percentile, secondary_percentiles);
// console.log("area_data", area_data);

  // Build the series for the stack using area data
  const series = d3.stack()
    .keys(Object.keys(area_data[0]).slice(0,-1))  // Get all elements except last (which is date)
    .offset(d3.stackOffsetWiggle)
    // .order(d3.stackOrderInsideOut)
  (area_data)
// console.log("series", series);

  // Function that actually draws the area chart
  const area = d3.area()
    .x(d => x(new Date(parseDate(d.data.date))))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]))
    
  // Function to get array which will be used for the line charts
  const getLineData = (data, primary_percentile, secondary_percentiles) => {
    // Get rolledup data for non-matching secondary percentiles
    let rolledup_data = getFilteredData(data, primary_percentile, secondary_percentiles, false);
// console.log('line filtered_data', rolledup_data);
    // Now flatten the structure to get the following structure
    // [{percentile: "50", date: 2019-10-01, value: 10}, {}, ...]
    let flattened_data = [];
    Object.keys(rolledup_data).forEach( d => {
      Object.keys(rolledup_data[d]).forEach( p => {
        let f = {
          percentile: p,
          date: d,
          value: rolledup_data[d][p]
        };
        flattened_data.push(f);    
      });
    });
    // Return the flattened data sorted on date
    return flattened_data.sort( (a, b) => a.date - b.date );
  }

  // Get the line data
  let line_data = getLineData(data, primary_percentile, secondary_percentiles);
// console.log("line_data", line_data);
  // Group the data for line charts
  lines = d3.nest()
            .key(d => d.percentile)
            .entries(line_data);
// console.log("lines", lines);
  // Curve to use for line charts
  const lineCurve = d3.curveCatmullRom;

  // Function that actually draws the line chart
  const priceline = d3.line()
    .defined(d => !isNaN(d.value))
    .x(d => x(new Date(parseDate(d.date))))
    .y(d => y(d.value))
    .curve(lineCurve);

  // Set the margins for the graph
  // margin = ({top: 5, right: 15, bottom: 50, left: 40});
  // margin = ({top: 5, right: 15, bottom: ['H','D','W','M'].includes(period) ? 30 : 10, left: 40});
  const margin = ({top: 5, right: 15, bottom: 20, left: 40}),
    width = div_width - margin.left - margin.right,
    height = div_height - margin.top - margin.bottom;
// console.log("width, height", width, height)
  // Define the X scale
  const x = d3.scaleTime()
    .domain(d3.extent(area_data, d => new Date(parseDate(d.date))))
    .range([margin.left, width + margin.left]);

  // Extend the Y domain by 10% on the positive side to accomodate the legends
  let series_min_value = d3.min(series, d => d3.min(d, d => d[0]));
  let series_max_value = d3.max(series, d => d3.max(d, d => d[1])) * 1.1;
  // Take the max of the above two values so that the y axis is evenly distributed around the 0 line
  let max_value = Math.max(Math.abs(series_min_value), Math.abs(series_max_value));
// console.log(series_min_value, series_max_value);

  // Define the Y scale
  const y = d3.scaleLinear()
    .domain([-max_value, max_value])
    .range([height - margin.bottom, margin.top]).nice();
    // .rangeRound([height + margin.top, margin.top]).nice();
// console.log("y.domain", y.domain());

  // Function for gridlines in x axis
  const make_x_gridlines = () => {		
    return d3.axisBottom(x);
  }

  // Function for gridlines in y axis
  const make_y_gridlines = () => {		
    return d3.axisLeft(y);
  }

  // Define colors for area graphs
  const getAreaColors = (count) => {
    let blues = d3.schemeBlues[count];
    // Match 1st color with last, 2nd with 2nd last, etc.
    // Loop thru half the blues
    for (let i=0; i<blues.length/2; i++) {
      blues[blues.length-i-1] = blues[i];
    }
    // Return result
    return blues;
  }

  // Get area colors
  const area_colors = getAreaColors(series.length);

  // Use the above colors to define the color scale
  const areaColor = d3.scaleOrdinal()
  .domain(series.map(d => d.key))
  .range(area_colors);  

  // Define the color scale for line graphs
  const lineColor = d3.scaleOrdinal()
  .domain(lines.map(d => d.key))
  .range(d3.schemeDark2);  

  // Function to generate quarter from given date
  const quarter = (d) => {
    // Return quarter
    return "Q" + (1 + ~~(d.getMonth() / 3)) + "-" + d.getFullYear();
  }

  // Function to generate the tick format for the x axis
  const setTickFormatX = (period) => {
    return xAxis.tickFormat(d3.timeFormat(time_format));
  }

  // Set the number of ticks based on available width
  let no_of_x_ticks = width / 80;

  // Define the x axis
  const xAxis = d3.axisBottom(x).ticks(no_of_x_ticks).tickSizeOuter(0);

  // Define the y axis
  let yAxis = d3.axisLeft(y).ticks(null, "s");
  let yTicks = y.ticks().length;
  let yShowTicks = Math.floor(height/20);
  let yFactor = Math.ceil(yTicks/yShowTicks);
  yAxis.tickValues(y.ticks().filter((_d, i) => !(i % yFactor)));

  // Initialize svg
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  d3.select(svg)
    .attr("id", "streamgraph-svg")
    // .style("background-color", "#eee")
    .append("style").text(cssText);

  // Initialize the chart element inside the svg
  chart = d3.select(svg)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(0,0)")
    // .style("background-color", "#eee");

  // Draw area graphs
  chart.append("g")
    .selectAll("path")
    .data(series)
    .join("path")
      .attr("fill", ({key}) => areaColor(key))
      .attr("d", area)
    .append("title")
      .text(({key}) => key + '%');

  // add the Y gridlines
  chart.append("g")			
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(make_y_gridlines()
      .tickSize(-width)
      .tickFormat("")
    )

  // Loop through each symbol / key
  lines.forEach(function(d,i) { 
    chart.append("path")
      .attr("class", "line")
      .style("stroke", function() { // Add the colours dynamically
        return d.color = lineColor(d.key); })
      .attr("id", 'tag'+d.key.replace(/\s+/g, '')) // assign ID
      .attr("d", priceline(d.values))
    .append("title")
      .text(d.key + '%');
  });

  // Append the X axis
  let x_axis = chart.append("g")
    .attr("id", "x-axis")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);
  
  // Set the tick format on the X axis
  // Options: H, D, W, M, Q, Y
  setTickFormatX(period);
  
  // Rotate tick labels for certain periods
  if (['H','D','W','M'].includes(period)) {
    x_axis.selectAll("text")	
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");
  }
  // console.log(x.ticks());
  // Decide how many values to show
  // Get the count of data points
  let ticks_count = x.ticks().length;
// console.log("ticks_count, width", ticks_count, width);
  // Get the number of values to show
  let values_to_show = Math.floor(width/50);
  // Get the factor that needs to be applied to show the number calculated above
  let factor = Math.ceil(ticks_count/values_to_show);
// console.log("values_to_show, factor", values_to_show, factor);
  // Filter out the ticks that are to be hidden
  xAxis.tickValues(x.domain().filter((d,i) => !(i % factor)));
  // Check if number of tick marks are more than fitting the width
  // if (x.ticks().length > no_of_x_ticks) {
  //   xAxis.ticks(d3.timeWeek.every(50));
  // }
  
  // Append the Y axis
  let y_axis = chart.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .attr("id", "y-axis")
    .attr("class", "y axis")
    .call(yAxis)

  // Define legend variables
  // Space for each legend (area and line graphs)
  let legendSpace = width/(series.length + lines.length);
  let legendSpacing = 5;  // Space between legend and text
  let legendRectSize = width/100;  // Size of legend
  // Scales for mapping series variable names to legend text
  let lineLegendScale = d3.scaleOrdinal()
    .domain(lines.map(d => d.key))
    .range(lines.map(d => d.key))
    .unknown("Unknown");

  let areaLegendScale = d3.scaleOrdinal()
    .domain(series.map(d => d.key))
    // .range(series.map(d => capitalize(d.key)))
    .range(series.map(d => d.key))
    .unknown("Unknown");

  // Add the Legend element to construct line chart legends
  let line_legend = chart.selectAll('.line-legend')
    .data(lineColor.domain())
    .enter()
      .append('g')
      .attr('class', 'legend line-legend')
      .attr('transform', (_d, i) => {
        // Center the legend in its space
        let x = ((i+1) * legendSpace);
        // Legend in top margin
        let y = margin.top;
        return `translate(${x}, ${y})`;
      });

  // Legend box
  line_legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .attr('fill', lineColor);

  // Legend text
  line_legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize)
    .style("font-size", (width > 991) ? "16px" : (width/50 + "px"))
    .text(d => lineLegendScale(d));

  // Add the Legend element to construct area chart legends
  let area_legend = chart.selectAll('.area-legend')
    .data(areaColor.domain())
    .enter()
      .append('g')
      .attr('class', 'legend area-legend')
      .attr('transform', (_d, i) => {
        // Center the legend in its space
        let x = ((i+1+lines.length) * legendSpace);
        // Legend in top margin
        let y = margin.top;
        return `translate(${x}, ${y})`;
      });

  // Legend box
  area_legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .attr('fill', areaColor);

  // Legend text
  area_legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize)
    .style("font-size", (width > 991) ? "16px" : (width/50 + "px"))
    .text(d => areaLegendScale(d));

  // Return chart node
  return chart.node();
}
  
// Function to build the multiline chart using given array of values and chart dimensions
const build_chart_multiline = (data, div_width, div_height, date_column) => {
  let cssText = `
  .line {
    fill: none;
    stroke-width: 2px;
  }
  .grid {
    stroke: black;
    stroke-opacity: 0.3;
    stroke-width: 0.3;
    shape-rendering: crispEdges;
  }
  .grid path {
    stroke-width: 0;
  }
  .legend {
    font-weight: bold;
    text-anchor: middle;
    cursor: pointer;
  }
  .x-axis-label {
    text-anchor: middle;
    font-size: 16px;
    font-weight: bold;
    font-weight: bold;
  }
  `

  // Setup date parser/formatter
  // const parseDate = d3.timeParse("%Y-%m-%d");
  // const parseDate = d3.isoParse();
  let formatDate = d3.timeFormat('%m-%Y');
  const lineCurve = d3.curveCatmullRom;

  // Format the data and sort it on fordate
  data = data.map(d => { return {
      shape: d.shape,
      // fordate: parseDate(formatDate(new Date(d[date_column]))),
      fordate: d3.isoParse(d[date_column]),
      value: +d.value
    };
  }).sort( (a, b) => a[date_column] - b[date_column]);

// console.log(data);

  // Create data groupings based on shape
  dataNest = d3.nest()
    .key(d => d.shape)
    .entries(data);
// console.log("dataNest", dataNest);

  // Function to find the time interval between consecutive dates in give data
  const timeInterval = (data) => {
    // Assume intervals are same
    let isSame = true;
    let lastInterval = 0;
    let interval = 0;
    // Loop thru all the dates to check whether interval is same
    for (i = 0; i < data.length-1; i++) {
      // Get 1st and 2nd dates
      let date0 = data[i][date_column];
      let date1 = data[i+1][date_column];
      // Find difference between the two
      interval = date1-date0;
// console.log("inside timeInterval", date0, date1, i, lastInterval, interval);
      // Break out if any interval is not the same -- skip for 1st iteration
      if (i > 0) {
        if (interval != lastInterval) {
          isSame = false;
          break;
        }
      }
      lastInterval = interval;
    }

    // Return -1 if all intervals are not same; else return the time interval
    return isSame ? interval : -1;
  }

  // Get the time interval
  let interval = timeInterval(dataNest[0].values);
// console.log("interval", interval);
  // Set number of milliseconds for various periods
  let second = 1000;
  let minute = 60 * second;
  let hour = 60 * minute;
  let day = 24 * hour;
  let week = 7 * day;
  let month = 30 * day; // approximate - will not be used
  let year = 12 * month; // approximate - will not be used

  // X-axis label based on time format
  let x_axis_label = 'Months in a year';
  // Set the time format based on the interval
  formatDate = d3.timeFormat("%m-%Y");  // default format for monthly and yearly data
  // Consistent interval
  if (interval != -1) {
    let start = dataNest[0].values[0][date_column];
    let end = dataNest[0].values[1][date_column];
// console.log(start, end, d3.timeSecond.count(start, end), interval)
    if (d3.timeYear.count(start, end) > 0) {
      formatDate = d3.timeFormat("%Y");
      x_axis_label = 'Years';
    } else if (d3.timeMonth.count(start, end) > 0) {
      formatDate = d3.timeFormat("%m-%Y");
      x_axis_label = 'Months in a year';
    } else if (d3.timeWeek.count(start, end) > 0 && interval >= week) {
      formatDate = d3.timeFormat("%b %d");
      x_axis_label = 'Weeks';
    } else if (d3.timeDay.count(start, end) > 0 && interval >= day) {
      formatDate = d3.timeFormat("%b %d");
      x_axis_label = 'Days in a month';
    } else if (d3.timeHour.count(start, end) > 0 && interval >= hour) {
      formatDate = d3.timeFormat("%I %p");
      x_axis_label = 'Hours in a day';
    } else if (d3.timeMinute.count(start, end) > 0 && interval >= minute) {
      formatDate = d3.timeFormat("%H:%M");
      x_axis_label = 'Minutes in an hour';
    } else if (d3.timeSecond.count(start, end) > 0 && interval >= second) {
      formatDate = d3.timeFormat(":%S");
      x_axis_label = 'Seconds in an minute';
    } else {
      formatDate = d3.timeFormat(".%L");
      x_axis_label = 'Milliseconds in a second';
    }
  } else {
    // Interval not consistent, use default format
  }
// console.log("formatDate", formatDate);

  // Initialize dom element with svg element to create the chart
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  d3.select(svg)
    .attr("id", "multiline-svg")
    .append("style").text(cssText);

  // Set the dimensions and margins of the graph
  let margin = {top: 5, right: 15, bottom: 20, left: 40},
      width = div_width - margin.left - margin.right,
      height = div_height - margin.top - margin.bottom;

  // Calculate space for each legend based on width and number of series
  const legendSpace = width/dataNest.length;

  // Define the color scale
  let colorScale = d3.scaleOrdinal()
    .domain(["5x16", "2x16", "7x8"])
    .range(["#214a8a", "#6d9eeb", "#f6b703"]);

  // Define X scale
  x = d3.scaleBand()
    .domain(data.map(d => d[date_column]))
    .rangeRound([margin.left, width + margin.left])
    .align(0.5) // Distribute equal before 1st and after last bars
// console.log("x.domain", x.domain());
  // Extend the domain by 10% on the positive side to accomodate the legends
  let series_min_value = d3.min(data, d => d.value);
  let series_max_value = d3.max(data, d => d.value) * 1.1;
// console.log(series_min_value, series_max_value);

  // Define Y scale
  // Use extended domain
  let y = d3.scaleLinear()
  .domain([series_min_value, series_max_value])
  .rangeRound([height - margin.bottom, margin.top]).nice();
// console.log("y.domain", y.domain());

  // Function to produce gridlines in x-axis and y-axis
  const make_x_gridlines = () => d3.axisBottom(x);
  const make_y_gridlines = () => d3.axisLeft(y);

  // Define X axis
  let xAxis = d3.axisBottom(x)//.tickSizeOuter(0);
  // Apply format to X axis if calculated above
  if (formatDate != "") {
    xAxis.tickFormat(formatDate);
    // Decide how many values to show
    // Get the count of data points
    let band_count = dataNest[0].values.length;
// console.log("band_count, width", band_count, width);
    // Get the number of values to show
    let values_to_show = Math.floor(width/50);
    // Get the factor that needs to be applied to show the number calculated above
    let factor = Math.ceil(band_count/values_to_show);
// console.log("values_to_show, factor", values_to_show, factor);
    // Filter out the ticks that are to be hidden
    xAxis.tickValues(x.domain().filter((d,i) => !(i % factor)));
  }

  // Define X axis
  // let xAxis = g => g
  //   .attr("transform", `translate(0,${height + margin.top})`)
  //   .call(d3.axisBottom(x).ticks(d3.timeYear).tickSizeOuter(0).tickFormat(d3.timeFormat("%Y-%m-%d")));

  // Define Y axis
  let yAxis = d3.axisLeft(y);
  let yTicks = y.ticks().length;
  let yShowTicks = Math.floor(height/20);
  let yFactor = Math.ceil(yTicks/yShowTicks);
  yAxis.tickValues(y.ticks().filter((_d, i) => !(i % yFactor)));
// console.log("y ticks", y.ticks());

  // Function to draw line
  const priceline = d3.line()
    .defined(d => !isNaN(d.value))
    .x(d => x(d[date_column]))
    .y(d => y(d.value))
    .curve(lineCurve);

  // Initialize the chart element inside the svg
  chart = d3.select(svg)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(0,0)")
    // .style("background-color", "#eee");

  // Loop through each symbol / key
  dataNest.forEach(function(d,i) { 
    // Add the line chart
    chart.append("path")
      .attr("class", "line")
      .style("stroke", function() { // Add the colours dynamically
        return d.color = colorScale(d.key); })
      .attr("id", 'tag'+d.key.replace(/\s+/g, '')) // assign ID
      .attr("d", priceline(d.values));

    // Add the Legend
    chart.append("text")
      .attr("x", (legendSpace/1.25) + i*legendSpace)  // space legend
      .attr("y", margin.top + 20)
      .attr("class", "legend")    // style the legend
      .style("fill", function() { // Add the colours dynamically
        return d.color = colorScale(d.key); })
      .on("click", function() {
        // Determine if current line is visible 
        var active   = d.active ? false : true,
            newOpacity = active ? 0 : 1; 
        // Hide or show the elements based on the ID
        d3.select("#tag"+d.key.replace(/\s+/g, ''))
          .transition().duration(750) 
          .style("opacity", newOpacity); 
        // Update whether or not the elements are active
        d.active = active;
      })  
      .text(d.key)
      .style("text-anchor", "start")
      .style("font-size", (width > 991) ? "20px" : (width/20 + "px"))
  });

  // add the X gridlines
  chart.append("g")			
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(make_x_gridlines()
          .tickSize(-height + 50) // Stop just below the legends
          .tickFormat("")
  )

  // add the Y gridlines
  // chart.append("g")			
  //     .attr("class", "grid")
  //     .attr("transform", `translate(${margin.left},0)`)
  //     .call(make_y_gridlines()
  //         .tickSize(-width)
  //         .tickFormat("")
  // )

  // Add the X axis
  chart.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .attr("id", "x-axis")
    .attr("class", "x axis")
    .call(xAxis)

  // Append the Y-axis
  let y_axis = chart.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .attr("id", "y-axis")
    .attr("class", "y axis")
    .call(yAxis)

  // Append X-axis label
  chart.append("text")
    .attr("class", "x-axis-label")
    .attr("transform", `translate(${width/2}, ${height + margin.bottom/2})`)
    .style("text-anchor", "start")
    .text(x_axis_label)
    .style("font-size", (width > 991) ? "12px" : (width/50 + "px"))

  // Return chart node
  return chart.node();
}

// Function to build the chart using given array of values and chart dimensions
const build_chart_histogram = (data, div_width, div_height, selected_value) => {
  let cssText = `
  .bar { fill: skyblue; }
  .bar-selected { fill: royalblue; }
  `
// console.log(data);

  // Set the dimensions and margins of the graph
  let margin = {top: 5, right: 15, bottom: 20, left: 40},
      width = div_width - margin.left - margin.right,
      height = div_height - margin.top - margin.bottom;

  // Initialize bar width and size of each bin
  const barWidth = 20;
  const binSize = Math.floor(width/barWidth)

  // Define X scale
  const x = d3.scaleLinear()
    .domain(d3.extent(data)).nice()
    .range([margin.left, width + margin.left]);
// console.log("x.domain", x.domain());

  // Group the data in bins
  const bins = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(binSize))
  (data);

  // Define Y scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)]).nice()
    .range([height - margin.bottom, margin.top])
// console.log("y.domain", y.domain());

  // Define X axis
  // Number of ticks to show
  let no_of_x_ticks = width/50;
  let xAxis = d3.axisBottom(x).ticks(no_of_x_ticks).tickSizeOuter(0);

  let yAxis = d3.axisLeft(y).ticks(null, "s");
  let yTicks = y.ticks().length;
  let yShowTicks = Math.floor(height/20);
  let yFactor = Math.ceil(yTicks/yShowTicks);
  yAxis.tickValues(y.ticks().filter((_d, i) => !(i % yFactor)));

  // Initialize dom element with svg element to create the chart
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  d3.select(svg)
    .attr("id", "histogram-svg")
    .append("style").text(cssText);

  // Initialize the chart element inside the svg
  chart = d3.select(svg)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(0,0)")
    // .style("background-color", "#eee");

  chart.append("g")
    .selectAll("rect")
    .data(bins)
    .join("rect")
      .attr("x", d => x(d.x0) + 1)
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("class", d => d.includes(selected_value) ? "bar-selected" : "bar")
      .attr("y", d => y(d.length))
      .attr("height", d => y(0) - y(d.length));

  // Add the X axis
  chart.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .attr("id", "x-axis")
    .attr("class", "x axis")
    .call(xAxis)
  
  // Append the Y axis
  chart.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .attr("id", "y-axis")
    .attr("class", "y axis")
    .call(yAxis);

  // Return chart node
  return chart.node();
}

// Function to build the chart using given array of values and chart dimensions
const build_chart_dispatch = (data, div_width, div_height, date_column) => {
// console.log("build_chart_dispatch", data, div_width, div_height, date_column);
  // Styles
  let cssText = `
    .grid {
      stroke: lightgrey;
      stroke-width: 0.4;
      stroke-opacity: .3;
      shape-rendering: crispEdges;
    }
    .grid {
      z-index: 3;
    }
    .grid path {
      stroke-width: 0;
    }
    .x-axis-label, .y-axis-label {
      font-size: 16px;
      font-weight: bold;
      text-anchor: middle;
    }
    .legend-text {
      // font-size: 12px!important;
    }
    .zero-line {
      stroke: #212529;
      stroke-width: .5;
      z-index: 4;
    }
    .line-chart {
      fill: none;
      stroke: orange;
      stroke-width: 1.5;
      z-index: 2;
    }
    .bar-chart {
      z-index: 1;
    }
  `

  let parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S");
  let parseDate = d3.isoParse
  let formatNumber = d3.format("(.0f");

  // Function to find the time interval between consecutive dates in give data
  const timeInterval = (data) => {
    // Assume intervals are same
    let isSame = true;
    let lastInterval = 0;
    let interval = 0;
    // Loop thru all the dates to check whether interval is same
    for (i = 0; i < data.length-1; i++) {
      // Get 1st and 2nd dates
      let date0 = parseDate(data[i][date_column]);
      let date1 = parseDate(data[i+1][date_column]);
      // Find difference between the two
      interval = date1-date0;
// console.log("inside timeInterval", date0, date1, i, lastInterval, interval);
      // Break out if any interval is not the same -- skip for 1st iteration
      if (i > 0) {
        if (interval != lastInterval) {
          isSame = false;
          break;
        }
      }
      lastInterval = interval;
    }

    // Return -1 if all intervals are not same; else return the time interval
    return isSame ? interval : -1;
  }

  // Get the time interval
  let interval = timeInterval(data);
  // Set number of milliseconds for various periods
  let second = 1000;
  let minute = 60 * second;
  let hour = 60 * minute;
  let day = 24 * hour;
  let week = 7 * day;
  let month = 30 * day; // approximate - will not be used
  let year = 12 * month; // approximate - will not be used

  // X-axis label based on time format
  let x_axis_label = 'Months in a year';
  // Set the time format based on the interval
  formatDate = d3.timeFormat("%m-%Y");  // default format for monthly and yearly data
  // Consistent interval
  if (interval != -1) {
    let start = parseDate(data[0][date_column]);
    let end = parseDate(data[1][date_column]);
    // console.log(d3.timeMonth.count(start, end), interval)
    if (d3.timeYear.count(start, end) > 0) {
      formatDate = d3.timeFormat("%Y");
      x_axis_label = 'Years';
    } else if (d3.timeMonth.count(start, end) > 0) {
      formatDate = d3.timeFormat("%m-%Y");
      x_axis_label = 'Months in a year';
    } else if (d3.timeWeek.count(start, end) > 0 && interval >= week) {
      formatDate = d3.timeFormat("%b %d");
      x_axis_label = 'Weeks';
    } else if (d3.timeDay.count(start, end) > 0 && interval >= day) {
      formatDate = d3.timeFormat("%b %d");
      x_axis_label = 'Days in a month';
    } else if (d3.timeHour.count(start, end) > 0 && interval >= hour) {
      formatDate = d3.timeFormat("%I %p");
      x_axis_label = 'Hours in a day';
    } else if (d3.timeMinute.count(start, end) > 0 && interval >= minute) {
      formatDate = d3.timeFormat("%H:%M");
      x_axis_label = 'Minutes in an hour';
    } else if (d3.timeSecond.count(start, end) > 0 && interval >= second) {
      formatDate = d3.timeFormat(":%S");
      x_axis_label = 'Seconds in an minute';
    } else {
      formatDate = d3.timeFormat(".%L");
      x_axis_label = 'Milliseconds in a second';
    }
  } else {
    // Interval not consistent, use default format
  }
// console.log("formatDate", formatDate);
  // Create data groupings based on series
  series = d3.stack().keys(['Charge', 'Discharge', 'RegUp', 'RegDown', 'Spinning']).offset(d3.stackOffsetDiverging)(data);
// console.log("series", series);

  // Create data for line chart
  line_series = data.map( d => { return { hour: d[date_column], SOC: d.SOC }; } );
// console.log("line_series", series);

  // Initialize dom element with svg element to create the chart
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  d3.select(svg)
    .attr("id", "dispatch-svg")
    .append("style").text(cssText);

  // Function to produce gridlines in y-axis
  const make_x_gridlines = () => d3.axisBottom(x);

  // Set the dimensions and margins of the graph
  let margin = {top: 5, right: 15, bottom: 20, left: 40},
      width = div_width - margin.left - margin.right,
      height = div_height - margin.top - margin.bottom;

  // Set width of each bar based on window width - 2 px for gap between bars
  let bar_width = width/data.length - 2;

  // Define the color colorScale
  let bar_colors = d3.schemePuBu[5];
  let color = d3.scaleOrdinal()
    .domain(series.map(d => d.key))
    .range(bar_colors)
    .unknown("#ccc");

  // Define X scale
  // x = d3.scaleTime()
  //   .domain(d3.extent(data, d => parseTime(d[date_column])))
  //   .range([margin.left, width - margin.right]).nice();
  x = d3.scaleBand()
    .domain(data.map(d => parseDate(d[date_column])))
    .rangeRound([margin.left, width + margin.left])
    .align(0.5) // Distribute equal before 1st and after last bars
    .padding(0.1);
// console.log("x.domain", x.domain());
  // Extend the domain by 10% on the positive side to accomodate the legends
  let series_min_value = d3.min(series, d => d3.min(d, d => d[0]));
  let series_max_value = d3.max(series, d => d3.max(d, d => d[1])) * 1.1;
  // Take the max of the above two values so that the y axis is evenly distributed around the 0 line
  let max_value = Math.max(Math.abs(series_min_value), Math.abs(series_max_value));
// console.log(series_min_value, series_max_value);

  // Define Y scale
  // Use extended domain
  let y = d3.scaleLinear()
  .domain([-max_value, max_value])
  .rangeRound([height - margin.bottom, margin.top]).nice();

  // Define X axis
  let xAxis = d3.axisBottom(x);//.tickSize(6);
  // Apply format to X axis if calculated above
  if (formatDate != "") {
    xAxis.tickFormat(formatDate);
    // Decide how many values to show
    // Get the band count
    let band_count = Math.floor(width/x.bandwidth());
// console.log("band_count", band_count);
    // Get the number of values to show
    let values_to_show = Math.floor(width/Math.max(50, x.bandwidth()));
    // Get the factor that needs to be applied to show the number calculated above
    let factor = Math.floor(band_count/values_to_show);
// console.log("values_to_show, factor", values_to_show, factor);
    // Filter out the ticks that are to be hidden
    xAxis.tickValues(x.domain().filter((d,i) => !(i % factor)));
  }

  // Define Y axis
  let yAxis = d3.axisLeft(y)
    .ticks(null, "s")
    .tickFormat(formatNumber);

  // Initialize the chart element inside the svg
  chart = d3.select(svg)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(0,0)")
    .style("background-color", "#fff");
  
  // Append the grid lines on Y axis
  chart.append("g")			
    .attr("class", "grid")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(make_x_gridlines()
      .tickSize(-height + margin.top + margin.bottom) // Stop just below the legends
      .tickFormat("")
    );

  // Append the bars
  chart.append("g")
    .selectAll("g")
    .data(series)
    .enter().append("g")
      .attr("fill", d => color(d.key))
      // .attr("data-legend", d => d.key)
    .selectAll("rect")
    .data(d => d)
    .enter().append("rect")
      // .attr("width", bar_width)
      .attr("class", "bar-chart")
      .attr("width", x.bandwidth())
      .attr("x", d => x(parseDate(d.data[date_column])))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]));

  // Function to draw line
  const line = d3.line()
    .defined(d => !isNaN(d.SOC))
    .x(d => x(parseDate(d[date_column])) + x.bandwidth()/2)
    .y(d => y(d.SOC));

  // Append line chart for SOC
  chart.append("path")
      .datum(line_series)
      .attr("class", "line-chart")
      .attr("d", line);

  // Add the X axis
  chart.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .attr("id", "x-axis")
    .attr("class", "x axis")
    .call(xAxis)
    // .call(g => g.selectAll(".domain").remove());

  // Draw the 0 line
	chart.append("g")
		.attr("class", "zero-line")
	  .append("line")
	  .attr("x1", margin.left)
	  .attr("y1", y(0))
	  .attr("x2", width + margin.left)
	  .attr("y2", y(0));
  
  // Append X-axis label
  chart.append("text")
    .attr("class", "x-axis-label")
    // .attr("transform", `translate(${width/2}, ${height + margin.bottom})`)
    .attr("transform", `translate(${margin.left + width/2}, ${height + margin.bottom/2})`)
    .style("text-anchor", "middle")
    .style("font-size", (width > 991) ? "16px" : (width/50 + "px"))
    .text(x_axis_label);

  // Append the Y-axis
  let y_axis = chart.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .attr("id", "y-axis")
    .attr("class", "y axis")
    .call(yAxis)

  // Replace 0 tick on y-axis with -
  y_axis.selectAll("g.tick")
    .filter( d => d == 0)
    .select("text")
    .attr("dy", "0.25em")
    .style("text-anchor", "end")
    .text("-");
  
  // Y label
  chart.append("g")
    .attr("transform", `translate(${margin.left/2}, ${(height-margin.bottom)/2})`)
    .attr("class", "y-axis-label")
    .append("text")
    .attr("transform", "rotate(-90)")
    .style("font-size", (width > 991) ? "16px" : (width/50 + "px"))
    .text("mW");

  // Define legend variables
  let legendSpace = width/(series.length + 1);  // Space for each legend (add 1 for line chart legend)
  let legendSpacing = 5;  // Space between legend and text
  let legendRectSize = width/100;  // Size of legend
  // Scale for mapping series variable names to legend text
  let legendScale = d3.scaleOrdinal()
    .domain(series.map(d => d.key))
    // .range(series.map(d => capitalize(d.key)))
    .range(series.map(d => d.key))
    .unknown("Unknown");

  // Line chart legend - standalone
  chart.append('rect')
    .attr('x', margin.left + legendSpace/2)
    .attr('y', margin.top)
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', 'orange')
    .style('stroke', 'orange');

  chart.append('text')
    .attr("class", "legend-text")
    .attr('x', margin.left + legendSpace/2 + legendRectSize + legendSpacing)
    .attr('y', margin.top + legendRectSize)
    .style("font-size", (width > 991) ? "16px" : (width/50 + "px"))
    .text('SOC');  

  // Add the Legend element to construct bar chart legends from 2nd position onwards
  let legend = chart.selectAll('.legend')
    .data(color.domain())
    .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (_d, i) => {
        // Center the legend in its space
        let x = (margin.left + ((i+1) * legendSpace) + legendSpace/2);
        // Legend in top margin
        let y = margin.top;
        return `translate(${x}, ${y})`;
      });

  // Legend box
  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .attr('fill', color);

  // Legend text
  legend.append('text')
    .attr("class", "legend-text")
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize)
    .style("font-size", (width > 991) ? "16px" : (width/50 + "px"))
    .text(d => legendScale(d));

  // Return chart node
  return chart.node();
}
