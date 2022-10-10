function sortSecurities(itemA, itemB) {
  var inputstring = $(document.activeElement).val();

  var symbolA = itemA.symbol_name;
  var symbolB = itemB.symbol_name;

  var r0 = new RegExp('^' + inputstring + '$', 'gi');
  var r1 = new RegExp('^' + inputstring + '', 'gi');
// console.log(inputstring, symbolA, symbolB, r0, r1);

  var result = matchAB(symbolA, symbolB, r0, true);
  if (result !== 0) {
    return result;
  }

  var result = matchAB(symbolA, symbolB, r1, true);
  if (result !== 0) {
    return result;
  }
  return 0;
}

// a, b = items to compare
// r = regexp
// l = boolean -- should length of a and b be a comparison factor
function matchAB(a, b, r, l) {
// console.log(a,b,r,l);
  var ma = a.match(r) !== null;
  var mb = b.match(r) !== null;

  if (ma) {
    if (mb) {
      if (a.length < b.length && l) {
        return -1;
      } else if (a.length > b.length && l) {
        return 1;
      } else if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    } else {
      return -1;
    }
  } else if (mb) {
    return 1;
  } else {
    return 0;
  }
}

// Symbol lookup
var symbols = new Bloodhound({
  datumTokenizer: function (datum) {
    return Bloodhound.tokenizers.whitespace(datum.symbol_name);
  },
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  identify: function(datum) { return datum.symbol_name; },
  sorter : function(itemA, itemB) {
    return sortSecurities(itemA, itemB);
  },
  prefetch: {
    url: "/api/curve/symbols",
    ttl: 80,
    filter: function(datums) {
      // Map the remote source JSON array to a JavaScript object array
      return $.map(datums.data, function(datum) {
        return {
          symbol_name: datum.symbol,
          symbol_id: datum.id
        };
      });
    } 
  }
});

function symbolsWithDefaults(q, sync) {
  if (q === '' || q === 'Choose symbol') {
    sync(symbols.all());
  }
  else {
    symbols.search(q, sync);
  }
};

// Symbol search for statically added typeahead box
$('.symbol-search .typeahead').typeahead({
  minLength: 1,
  hint: false,
  highlight: true,
  autoselect: true
},
{
  displayKey: 'symbol_name',
  source: symbolsWithDefaults,
  limit: 200,
  templates: {
    empty: '<div class="tt-no-items">No symbols found</div>'
  }
});

symbols.initialize();
