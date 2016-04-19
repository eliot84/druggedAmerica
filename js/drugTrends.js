var explain = {
    "Eighth":"Eighth Graders are seen with the lowest levels of drug exposure with the exception of Inhalants which has the highest percentage of users from the 3 grade groups.",
    "Tenth": "Tenth Graders factor higher percentages of drug exposure than eigth graders, but lower than twelfth graders. They are the second highest group of inhalant users.",
    "Twelfth" : "Twelfth Graders show a significantly higher percentage of drug exposure across all drugs listed. They show the least exposure to Methamphetamine and a decline in Marijuana use. This group shows the most trends that are inclining."   
};

var drugs = [];

var margin = {top: 30, right: 15, bottom: 20, left: 45},
    width = 250 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

var parseDate = d3.time.format("Year %Y").parse;
var outputDate = d3.time.format("%Y");

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var yAxis = d3.svg.axis()
      .orient("left")
      .ticks(2)
      .outerTickSize(0)
      .innerTickSize(0)
      .tickFormat(d3.format("s"));

var current = "Eighth";

var area = d3.svg.area()
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d[current]); });

var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d[current]); });

d3.select("#explain h3").text(current);
d3.select("#explain p").html(explain[current]);

d3.csv("data/drugTrends.csv", typeFix, function(error, data) {

  //typeFix is a function that parses the dates and sets the strings to numeric. See below!
//  console.log("data after load", data);

  // Nest data by symbol.
  drugs = d3.nest()
      .key(function(d) { return d.Drug; })
      .sortKeys(d3.ascending)
      .sortValues(function(a,b) {return a.date - b.date;})
      .entries(data);

  // Compute the minimum and maximum date across symbols.
  // We assume values are sorted by date.
  x.domain([
    d3.min(drugs, function(s) { return s.values[0].date; }),
    d3.max(drugs, function(s) { return s.values[s.values.length - 1].date; })
  ]);

  // Add an SVG element for each country, with the desired dimensions and margin.
  var svg = d3.select("#vis").selectAll("svg")
      .data(drugs)
    .enter().append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .each(multiple); // uses each to call the multiple code for each country

  function multiple(Drug) {

    var localsvg = d3.select(this);

    // domain set per chart in this example:
    y.domain([0, d3.max(Drug.values, function(v) { return +v[current];})
      ]);
    yAxis.scale(y);

    // Add the area path elements. Note: the y-domain is set per element.
    localsvg.append("path")
        .attr("class", "area")
        .attr("d", function(d) { return area(d.values); });

    // Add the line path elements. Note: the y-domain is set per element.
    localsvg.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); });

     localsvg.append("text")
      .attr("class", "axislabel")
      .attr("x", 0)
      .attr("y", height + margin.bottom/2)
      .style("text-anchor", "start")
      .text(function(d) { return outputDate(d.values[0].date); });

    // Add a small label for the symbol name.

    localsvg.append("text")
      .attr("class", "label")
      .attr("x", width/2)
      .attr("y", -8)
      .style("text-anchor", "middle")
      .text(function(d) { return d.key; });

    localsvg.append("text")
      .attr("class", "axislabel")
      .attr("x", width)
      .attr("y", height + margin.bottom/2)
      .style("text-anchor", "end")
      .text(function(d) { return outputDate(d.values[d.values.length - 1].date);});

      // put a dot on last point
    localsvg.append("circle")
      .attr("class", "endpoint")
      .attr("cx", function(d) {return x(d.values[d.values.length - 1].date);})
      .attr("cy", function(d) {return y(d.values[d.values.length - 1][current]);})
      .attr("r", 2);

      // label the value on the last point
    localsvg.append("text")
     .attr("class", "endpoint")
      .attr("x", width)
      .attr("y", function(d) {return y(d.values[d.values.length - 1][current]);})
      .attr("dy", -5)
      .style("text-anchor", "end")
      .text(function(d) { return d.values[d.values.length - 1][current]; });

    localsvg.append("g").attr("class", "y axis").call(yAxis);

  } // end multiple

  // ui click stuff
  d3.selectAll("#filters a").on("click", function() {
      d3.selectAll("#filters a").classed("current", false);
      d3.select(this).classed("current", true);

      var label = d3.select(this).attr("text");
      var selection = d3.select(this).attr("id");
      current = selection;

      d3.select("#explain h3").text(current);
      d3.select("#explain p").html(explain[current]);

      transition(current);
  });

  function transition(current) {

      // current is the clicked on button's id, so the illness.

    console.log("in trans", y.domain());

    // svg is each of the charts, with country as the data - from when we created them.

    svg.each(function(country) {

      y.domain([0, d3.max(country.values, function(v) { return +v[current];})]
      );
      yAxis.scale(y);
      var chartTrans = d3.select(this).transition();
      chartTrans.select(".y.axis").call(yAxis);
      chartTrans.select("path.area")
        .attr("d", function(d) { return area(d.values); });
      chartTrans.select("path.line")
      .attr("d", function(d) { return line(d.values); });

      chartTrans.select("circle.endpoint")
      .attr("cy", function(d) {return y(d.values[d.values.length - 1][current]);});

        // label the value on the last point
      chartTrans.select("text.endpoint")
        .attr("y", function(d) {return y(d.values[d.values.length - 1][current]);})
        .text(function(d) { return d.values[d.values.length - 1][current]; });
      }); // end each
  } // end transition

});

// this function is applied to all the data values on load!

function typeFix(d) {
  d.Eighth = +d.Eighth;
  d.Tenth = +d.Tenth;
  d.Twelfth = +d.Twelfth;
  d.date = parseDate(d.Year);
  return d;
}