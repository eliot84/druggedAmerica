(function() {

var currentMode = "bycount";

var fullwidth = 980, fullheight = 500;

var margin = {top: 20, right: 150, bottom: 50, left: 40},
    width = fullwidth - margin.left - margin.right,
    height = fullheight - margin.top - margin.bottom;

var xScale = d3.scale.ordinal()
    .rangeRoundBands([0, width], .3);

var yScale = d3.scale.linear()
    .rangeRound([height, 0]);

//var color = d3.scale.category20b();

var color = d3.scale.ordinal()
  .domain(["NSDUH", "MTF", "YRBS"])
  .range(["#231200", "#703800" , "#BC6C1C"]);



var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .innerTickSize([0]);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .tickFormat(d3.format(".2s")); // for the stacked totals version

var stack = d3.layout
    .stack(); // default view is "zero" for the count display.

var svg = d3.select("#lifetimeprev").append("svg")
    .attr("width", fullwidth)
    .attr("height", fullheight)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select("body").append("div").attr("class", "tooltip");

d3.csv("data/olympicMedals.csv", function(error, data) {

  if (error) {
    console.log(error);
  }

  data.sort(function(a, b) {return d3.ascending(a.Drug,b.Drug);});
  // how would we sort by largest total bar?  what would we have to calculate?

  var medals = ["NSDUH","MTF","YRBS"];

  color.domain(medals);

  xScale.domain(data.map(function(d) { return d.Drug; }));

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
        .attr("dy", ".5em")
        .attr("transform", "rotate(-30)")
        .style("text-anchor", "end");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Lifetime Prevalence");

  transitionCount(); // this will use the by-count stack, and make the data, and draw.

  drawLegend();

  d3.selectAll("input").on("change", handleFormClick);

  // All the functions for stuff above!

  function handleFormClick() {
    if (this.value === "bypercent") {
      currentMode = "bypercent";
      transitionPercent();
    } else {
      currentMode = "bycount";
      transitionCount();
    }
  }


  function makeData(medals, data) {
    return medals.map(function(medal) {
        return data.map(function(d) {
          return {x: d.Drug, y: +d[medal], medal: medal};
        })
      });
  }


  function transitionPercent() {

    yAxis.tickFormat(d3.format("%"));
    stack.offset("expand");  // use this to get it to be relative/normalized!
    var stacked = stack(makeData(medals, data));
    // call function to do the bars, which is same across both formats.
    transitionRects(stacked);
  }

  function transitionCount() {

    yAxis.tickFormat(d3.format(".2s")); // for the stacked totals version
    stack.offset("zero");
    var stacked = stack(makeData(medals, data));
    transitionRects(stacked);

    }

  function transitionRects(stacked) {

    // this domain is using the last of the stacked arrays, which is the last medal, and getting the max height.
    yScale.domain([0, d3.max(stacked[stacked.length-1], function(d) { return d.y0 + d.y; })]);


     var medal = svg.selectAll("g.medal")
      .data(stacked);

    medal.enter().append("g")
      .attr("class", "medal")
      .style("fill", function(d, i) { return color(d[0].medal); });

  // then data for each, plus mouseovers - a nested selection/enter here
   medal.selectAll("rect")
      .data(function(d) {
        console.log("array for a rectangle", d);
        return d; })  // this just gets the array for bar segment.
    .enter().append("rect")
      .attr("width", xScale.rangeBand())
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout);

    // the thing that needs to transition is the rectangles themselves, not the g parent.
    medal.selectAll("rect")
      .transition()
      .duration(250)
      .attr("x", function(d) {
        return xScale(d.x); })
      .attr("y", function(d) {
        return yScale(d.y0 + d.y); }) //
      .attr("height", function(d) {
        return yScale(d.y0) - yScale(d.y0 + d.y); });  // height is base - tallness

    medal.exit().remove(); // there's actually nothing removed here - we just transition.

    svg.selectAll(".y.axis").transition().call(yAxis);
  }

  // Building a legend by hand, based on http://bl.ocks.org/mbostock/3886208
  function drawLegend() {

    // reverse to get the same order as the bar color layers
    var medals_reversed = medals.slice().reverse();

    var legend = svg.selectAll(".legend")
        .data(medals_reversed) // make sure your labels are in the right order -- if not, use .reverse() here.
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) {return color(d)});

    legend.append("text")
        .attr("x", width + 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d, i) { return medals_reversed[i].replace(/_/g, " "); });
  }

  function mouseover(d) {
  // this will highlight both a dot and its line.

  var number;

  d3.select(this)
    .transition()
    .style("stroke", "black");

  if (currentMode == "bypercent") {
    number = d3.format(".1%")(d.y);
  } else {
    number = d.y;
  }

  tooltip
    .style("display", null) // this removes the display none setting from it
    .html("<p>Survey: " + d.medal.replace(/_/g, " ") +
          "<br>Prevalence : " + number +
          "<br>Drug: " + d.x + " </p>");
  }

  function mousemove(d) {
    tooltip
      .style("top", (d3.event.pageY - 10) + "px" )
      .style("left", (d3.event.pageX + 10) + "px");
    }

  function mouseout(d) {
    d3.select(this)
      .transition()
      .style("stroke", "none");

    tooltip.style("display", "none");  // this sets it to invisible!
  }

});

})();