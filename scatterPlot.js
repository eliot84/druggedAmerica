var fullwidth = 700;
			var fullheight = 600;
			var margin = { top: 20, right: 10, bottom: 50, left: 50 };
			var width = fullwidth - margin.left - margin.right;
			var height = fullheight - margin.top - margin.bottom;
			// redo this with an object for the margin settings: var margin = {top...}
			var dotRadius = 4; // fix this to a nice value.
			// fill in the margin values here.  Also, we set domain to 0 to 100 since it's percents,
			// plus some padding room!
			var xScale = d3.scale.linear()
								.range([ 0, width ])
								.domain([-2,100]);
			// top to bottom, padding just in case
			var yScale = d3.scale.linear()
								.range([ height, 0 ])
								.domain([-2,100]);
			//  Custom tick count if you want it.
			// Create your axes here.
			var xAxis = d3.svg.axis()
							.scale(xScale)
							.orient("bottom")
							.ticks(10);  // fix this to a good number of ticks for your scale later.
			var yAxis = d3.svg.axis()
							.scale(yScale)
							.orient("left");
			var svg = d3.select("#scatter")
						.append("svg")
						.attr("width", fullwidth)
						.attr("height", fullheight)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			d3.csv("data/elections.csv", draw);
		function draw(error, data) {
			if (error) {
				console.log("error reading data");
			}
				var circles = svg.selectAll("circle")
							.data(data)
							.enter()
							.append("circle");
				// Circles in SVG have cx, cy, and r attributes. x location, y location, radius.
				circles.attr("cx", function(d) {
						return xScale(+d.rep2012);
						// return the value to use for your x scale here
					})
					.attr("cy", function(d) {
						return yScale(+d.dem2012);
					})
					.attr("class", function(d){
						// highlighting some interesting outliers
						if (d.state === "West Virginia") {
							return "highlighted";
						}
						else {
							return "dots";
						}
					})
					.append("title")
					.text(function(d) {
						return d.state + " Republican: " + d.rep2012 + "% Democrat:" + d.dem2012 + "%";
					});
					// adding a silly intro animation to catch the eye -- using transition:
					circles.sort(function(a, b) {
							return d3.ascending(+a.urban, +b.urban);
						})
						.transition()
						.delay(function(d, i) {
							return i * 10;
						})
						.duration(500)  // milliseconds, so this is 1 second.
						.attr("r", dotRadius);
				// fix these translates so they use your margin and height width as needed
				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis);
				svg.append("g")
					.attr("class", "y axis")
					.call(yAxis);
			svg.append("text")
					.attr("class", "xlabel")
					.attr("transform", "translate(" + (width / 2) + " ," +
								(height + 20) + ")")
					.style("text-anchor", "middle")
					.attr("dy", "12")
					.text("Republican");
				svg.append("text")
					.attr("class", "ylabel")
					.attr("transform","rotate(-90) translate(" + (-height/2) + ",0)")
					.style("text-anchor", "middle")
					.attr("dy", -25)
					.text("Democrat");
					// make the default data button look selected
				d3.select("button#oeight").classed("selected", true);
				// handle the click events on the 2 buttons:
				d3.selectAll("button").on("click", function() {
					// we use the id attr on each to see which data set to use.
					var whichbutton = d3.select(this).attr("id");
					// style the buttons to show which one was clicked:
					d3.select(this).classed("selected", true);
					if (whichbutton === "twelve") {
						d3.select("button #oeight").classed("selected", false);
					} else {
						d3.select("button #twelve").classed("selected", false);
					}
					// The id is either toys or books.  We just check which
					// one and return the right data and text below:
						circles
							.transition()
							.duration(2000)
							.attr("cx", function(d) {
								if (whichbutton === "twelve") {
									return xScale(+d.rep2012);
								}
								else { // then it's books:
									return xScale(+d.rep2008);
								}
								// return the value to use for your x scale here
							})
							.attr("cy", function(d) {
								if (whichbutton === "twelve") {
									return yScale(+d.dem2012);
								} else {
									return yScale(+d.dem2008);
								}
							});
							// We can't transition the new title text -- must remove and rewrite.
						circles.selectAll("title").remove();
						circles
							.append("title")
							.text(function(d) {
								if (whichbutton === "twelve") {
									return d.state + " Republican: " + d.rep2012 + "% Democrat: " + d.dem2012 + "%";
								} else {
									return d.state + " Republican: " + d.rep2008 + "% Democrat: " + d.dem2008 + "%";
								}
							});
							// change the visible title!
					if (whichbutton === "twelve") {
						d3.select("p.chart-title").text("2012 Presidential Election");
					} else {
						d3.select("p.chart-title").text("2008 Presidential Election");
					}
				}); // end clicker function
			};
