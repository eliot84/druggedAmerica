	(function() {

		var fullwidth = 600;
			var fullheight = 500;
			var margin = { top: 20, right: 10, bottom: 40, left: 100};


			var width = fullwidth - margin.left - margin.right;
			var height = fullheight - margin.top - margin.bottom;

			//Set up date formatting and years
			var dateFormat = d3.time.format("%Y");


			var xScale = d3.time.scale()
								.range([0, (width)]);

			var yScale = d3.scale.linear()
								.range([0, height]);


		//Configure axis generators
			var xAxis = d3.svg.axis()
							.scale(xScale)
							.orient("bottom")
							.ticks(10)
							.tickFormat(function(d) {
								return dateFormat(d);
							})
							.innerTickSize([0]);

			var yAxis = d3.svg.axis()
							.scale(yScale)
							.orient("left")
							.innerTickSize([0]);



			//Configure line generator
			// each line dataset must have a d.year and a d.amount for this to work.
			var line = d3.svg.line()
				.x(function(d) {
					return xScale(dateFormat.parse(d.year));
				})
				.y(function(d) {
					return yScale(+d.amount);
				});


			// add a tooltip to the page - not to the svg itself!
			var tooltip = d3.select("body")
      	.append("div")
      	.attr("class", "tooltip");

			//Create the empty SVG image
			var svg = d3.select("#overdose")
						.append("svg")
						.attr("width", fullwidth + 200)
						.attr("height", fullheight)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


			//Load data
			d3.csv("data/overdoseData.csv", function(data) {


			var years = d3.keys(data[0]).slice(1, 54-4); //

				//Create a new, empty array to hold our restructured dataset
				var dataset = [];
				//console.log('theyears: ' + years);
				//Loop once for each row in data
				data.forEach(function (d, i) {

					var overdosesList = [];

					//Loop through all the years - and get the emissions for this data element
					years.forEach(function (y) {

						// If value is not empty
						if (d[y]) {
							//console.log(d[y]);
							//Add a new object to the new emissions data array - for year, amount
							overdosesList.push({
								drug: d.Drug,
								year: y,
								amount: d[y]  // this is the value for, for example, d["2004"]
 							});
						}

					});

					//Create new object with this country's name and empty array
					// d is the current data row... from data.forEach above.
					dataset.push( {
						drug: d.Drug,
						overdoses: overdosesList  // we just built this!
						} );

				}); // end of the data.forEach loop

			

				//Set scale domains - max and min of the years
				xScale.domain(
					d3.extent(years, function(d) {
						return dateFormat.parse(d);
					}));

				// max of emissions to 0 (reversed, remember) - [max, 0] for y scale
				yScale.domain([
					d3.max(dataset, function(d) {
						return d3.max(d.overdoses, function(d) {
							return +d.amount;
						});
					}),
					0
				]);


	
				var groups = svg.selectAll("g.lines")
					.data(dataset)
					.enter()
					.append("g")
					.attr("class", "lines");


			
				groups.selectAll("path")
					.data(function(d) { // because there's a group with data per country already...
						return [ d.overdoses ]; // it has to be an array for the line function
					})
					.enter()
					.append("path")
					.attr("class", "line")
					.attr("d", line); // calls the line function you defined above, using that array
		


				//Axes
				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis);
		
				svg.append("g")
					.attr("class", "y axis")
					.call(yAxis);
				svg.append("text")
					.attr("class", "ylabel")
					.attr("transform","rotate(-90) translate(" + (-height/2) + ",0)")
					.style("text-anchor", "middle")
					.attr("dy", -55)
					.text("National Drug Overdoses per Thousands");








				d3.selectAll("g.lines")
					.on("mouseover", mouseoverFunc)
					.on("mouseout", mouseoutFunc)
					.on("mousemove", mousemoveFunc);  // this version calls a named function.

				

			}); // end of data csv

	function mouseoverFunc(d) {


		d3.selectAll("path.line").classed("unfocused", true);
		// now undo the unfocus on the current line and set to focused.
		d3.select(this).select("path.line").classed("unfocused", false).classed("focused", true);
		tooltip
			.style("display", null) // this removes the display none setting from it
			.html("<p>" + d.drug+ "</p>");
	}

	function mouseoutFunc() {
			// this removes special classes for focusing from all lines. Back to default.
			d3.selectAll("path.line").classed("unfocused", false).classed("focused", false);
			tooltip.style("display", "none");  // this sets it to invisible!
	}

	function mousemoveFunc(d) {
		//console.log("events", window.event, d3.event);
		tooltip
			.style("top", (d3.event.pageY - 10) + "px" )
			.style("left", (d3.event.pageX + 10) + "px");
	}
})();