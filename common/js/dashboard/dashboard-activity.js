function calendarHeatmap() {
  // defaults
  let width = 720;
  let height = 120;
  let margin = {top: 20, right: 40, bottom: 20, left: 20};
  let legendWidth = 150;
  let selector = 'body';
  let SQUARE_LENGTH = 11;
  let SQUARE_PADDING = 2;
  let MONTH_LABEL_PADDING = 6;
  let now = moment().endOf('day').toDate();
  let yearAgo = null;
  let startDate = null;
  let counterMap = {};
  let data = [];
  let max = null;
  let colorRange = ['#D8E6E7', '#218380'];
  let tooltipEnabled = true;
  let tooltipUnit = 'calculation';
  let legendEnabled = true;
  let onClick = null;
  let weekStart = 0; //0 for Sunday, 1 for Monday
  let locale = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    No: 'No',
    on: 'on',
    Less: 'Less',
    More: 'More'
  };
  let v = Number(d3.version.split('.')[0]);

  function getYearAgo() {
    let day_sub={
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6
    }
    yearAgo = moment().startOf('day').subtract(1, 'year')
    // Subtract the days to start on a sunday
    yearAgo = moment(yearAgo).subtract(day_sub[yearAgo.format('ddd')], 'days');
    return yearAgo;
  }

  // setters and getters
  chart.data = function (value) {
    if (!arguments.length) {
      return data;
    }
    data = value;

    counterMap = {};

    data.forEach(function (element) {
      let key = moment(element.date).format('YYYY-MM-DD');
      let counter = counterMap[key] || 0;
      counterMap[key] = counter + element.count;
    });

    return chart;
  };

  chart.max = function (value) {
    if (!arguments.length) {
      return max;
    }
    max = value;
    return chart;
  };

  chart.selector = function (value) {
    if (!arguments.length) {
      return selector;
    }
    selector = value;
    return chart;
  };

  chart.startDate = function (value) {
    if (!arguments.length) {
      return startDate;
    }
    yearAgo = value;
    now = moment(value).endOf('day').add(1, 'year').toDate();
    print('startDate', now)
    return chart;
  };

  chart.colorRange = function (value) {
    if (!arguments.length) {
      return colorRange;
    }
    colorRange = value;
    return chart;
  };

  chart.tooltipEnabled = function (value) {
    if (!arguments.length) {
      return tooltipEnabled;
    }
    tooltipEnabled = value;
    return chart;
  };

  chart.tooltipUnit = function (value) {
    if (!arguments.length) {
      return tooltipUnit;
    }
    tooltipUnit = value;
    return chart;
  };

  chart.legendEnabled = function (value) {
    if (!arguments.length) {
      return legendEnabled;
    }
    legendEnabled = value;
    return chart;
  };

  chart.onClick = function (value) {
    if (!arguments.length) {
      return onClick();
    }
    onClick = value;
    return chart;
  };

  chart.locale = function (value) {
    if (!arguments.length) {
      return locale;
    }
    locale = value;
    return chart;
  };

  function chart() {

    d3.select(chart.selector()).selectAll('svg.calendar-heatmap').remove(); // remove the existing chart, if it exists

    yearAgo = getYearAgo();

    let dateRange = ((d3.time && d3.time.days) || d3.timeDays)(yearAgo, now);
    let monthRange = ((d3.time && d3.time.months) || d3.timeMonths)(moment(yearAgo).startOf('month').toDate(), now);
    let firstDate = moment(dateRange[0]);
    if (chart.data().length === 0) {
      max = 0;
    } else if (max === null) {
      max = d3.max(chart.data(), function (d) {
        return d.count;
      }); // max data value
    }

    if (max === 0) {
      max = 3;
    }

    // color range
    let color = ((d3.scale && d3.scale.linear) || d3.scaleLinear)()
    .range(chart.colorRange())
    .domain([0, max]);

    let tooltip;
    let dayRects;

    drawChart();

    function drawChart() {
      let svg = d3.select(chart.selector())
      .append('svg')
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("background-color", "#dddddd")
      .attr("viewBox", `-20 -20 ${width} ${height + margin.bottom}`)

      dayRects = svg.selectAll('.day-cell')
      .data(dateRange);  //  array of days for the last yr

      let enterSelection = dayRects.enter().append('rect')
      .attr('class', 'day-cell')
      .attr('width', SQUARE_LENGTH)
      .attr('height', SQUARE_LENGTH)
      .attr('rx', 2)
      .attr('fill', function (d) {
        return color(countForDate(d));
      })
      .attr('x', function (d) {
        let cellDate = moment(d);
        let result = cellDate.week() - firstDate.week() + (firstDate.weeksInYear() * (cellDate.weekYear() - firstDate.weekYear()));
        return result * (SQUARE_LENGTH + SQUARE_PADDING);
      })
      .attr('y', function (d) {
        return MONTH_LABEL_PADDING + formatWeekday(d.getDay()) * (SQUARE_LENGTH + SQUARE_PADDING);
      });

      if (typeof onClick === 'function') {
        (v === 3 ? enterSelection : enterSelection.merge(dayRects)).on('click', function (d) {
          let count = countForDate(d);
          onClick({date: d, count: count});
        });
      }

      if (chart.tooltipEnabled()) {
        (v === 3 ? enterSelection : enterSelection.merge(dayRects)).on('mouseover', function (d, i) {
          tooltip = d3.select(chart.selector())
          .append('div')
          .attr('class', 'day-cell-tooltip')
          .html(tooltipHTMLForDate(d))
          .style('left', function () {
            return Math.floor(i / 7) * SQUARE_LENGTH + 'px';
          })
          .style('top', function () {
            return formatWeekday(d.getDay()) * (SQUARE_LENGTH + SQUARE_PADDING) + MONTH_LABEL_PADDING * 0.5 + 'px';
          })
          .style('transition', 'all 0.4s ease-in')
        })
        .on('mouseout', function () {
          tooltip.remove();
        });
      }

      if (chart.legendEnabled()) {
        let colorRange = [color(0)];
        for (let i = 3; i > 0; i--) {
          colorRange.push(color(max / i));
        }

        let legendGroup = svg.append('g');
        legendGroup.selectAll('.calendar-heatmap-legend')
        .data(colorRange)
        .enter()
        .append('rect')
        .attr('class', 'calendar-heatmap-legend')
        .attr('width', SQUARE_LENGTH)
        .attr('height', SQUARE_LENGTH)
        .attr('rx', 2)
        .attr('x', function (d, i) {
          return (width - legendWidth) + (i + 1) * 13;
        })
        .attr('y', height - SQUARE_LENGTH)
        .attr('fill', function (d) {
          return d;
        });

        legendGroup.append('text')
        .attr('class', 'calendar-heatmap-legend-text calendar-heatmap-legend-text-less')
        .attr('x', width - legendWidth - 13)
        .attr('y', height)
        .text(locale.Less);

        legendGroup.append('text')
        .attr('class', 'calendar-heatmap-legend-text calendar-heatmap-legend-text-more')
        .attr('x', (width - legendWidth + SQUARE_PADDING) + (colorRange.length + 1) * 13)
        .attr('y', height)
        .text(locale.More);
      }

      dayRects.exit().remove();

      let monthLabels = svg.selectAll('.month')
        .data(monthRange.slice(1))
        .enter().append('text')
        .attr('class', 'month-name')
        .text(function (d) {
          return locale.months[d.getMonth()];
        })
        .attr('x', function (d, i) {
          let matchIndex = 0;
          dateRange.find(function (element, index) {
            matchIndex = index;
            return moment(d).isSame(element, 'month') && moment(d).isSame(element, 'year');
          });
          return Math.floor(matchIndex / 7) * (SQUARE_LENGTH + SQUARE_PADDING) + 12;
        })
        .attr('y', 0);  // fix these to the top

      locale.days.forEach(function (day, index) {
        index = formatWeekday(index);
        if (index >= 0) {
          svg.append('text')
          .attr('class', 'day-initial')
          .attr('transform', 'translate(-16,' + (SQUARE_LENGTH + SQUARE_PADDING) * (index + 1) + ')')
          .style('text-anchor', 'middle')
          .attr('dy', '2')
          .text(day);
        }
      });
    }

    function pluralizedTooltipUnit(count) {
      if ('string' === typeof tooltipUnit) {
        return (tooltipUnit + (count === 1 ? '' : 's'));
      }
      for (let i in tooltipUnit) {
        let _rule = tooltipUnit[i];
        let _min = _rule.min;
        let _max = _rule.max || _rule.min;
        _max = _max === 'Infinity' ? Infinity : _max;
        if (count >= _min && count <= _max) {
          return _rule.unit;
        }
      }
    }

    function tooltipHTMLForDate(d) {
      let dateStr = moment(d).format('Do MMM,YYYY');
      let count = countForDate(d);
      return '<span><strong>' + (count ? count : locale.No) + ' ' + pluralizedTooltipUnit(count) + '</strong> ' + locale.on + ' ' + dateStr + '</span>';
    }

    function countForDate(d) {
      let key = moment(d).format('YYYY-MM-DD');
      return counterMap[key] || 0;
    }

    function formatWeekday(weekDay) {
      if (weekStart === 1) {
        if (weekDay === 0) {
          return 6;
        } else {
          return weekDay - 1;
        }
      }
      return weekDay;
    }

    // let daysOfChart = chart.data().map(function (day) {
    //   return day.date.toDateString();
    // });
  }

  return chart;
}

function getProcessedData() {
  return JSON.parse($('#heatmap_data').val());
}
