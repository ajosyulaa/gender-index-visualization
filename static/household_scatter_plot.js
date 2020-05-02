function HouseholdScatterPlot(svg_elem, full_data){
	this.svg_elem = svg_elem;
    this.width = $(this.svg_elem).width();
    this.height = $(this.svg_elem).height();


    var position = $(this.svg_elem).offset();
    this.left = position['left'];
    this.top = position['top'];

    this.gender_color_map = {
        "Female":"purple",
        "Male":"green"
    };

    this.full_data = full_data;

    this.margin = 0.1*this.height;
    this.marginX = 0.03*this.width;


    console.log(this.full_data["countries"])
    var num_countries = Object.keys(this.full_data["countries"]).length;
    console.log(num_countries)

    var xScale = d3.scaleBand()
                    .domain(d3.range(num_countries+1))
                    .rangeRound([0, this.width])
                    .paddingInner(0.05);

                    //records.map(function(d) {return d.key;})

    var yScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([this.margin, this.height]);
    
    var svg = d3.select(this.svg_elem);

    this.render_household_plot = function(records) {
        
        var curr_obj = this;

        var width = curr_obj.width-curr_obj.marginX, height = curr_obj.height-curr_obj.margin;

        console.log(records);


        var xScale = d3.scaleLinear()
				.domain([0, 100])
				.range([0, width-curr_obj.marginX]);

		var yScale = d3.scaleLinear()
				.domain([0, 100])
				.range([height-curr_obj.margin,0]);

			//Define X axis
		var xAxis = d3.axisBottom()
				.scale(xScale)
				.ticks(10);

			//Define Y axis
		var yAxis = d3.axisLeft()
				.scale(yScale)
				.ticks(10);

		svg.selectAll("circle")
			   .data(records)
			   .enter()
			   .append("circle")
			   .attr("cx", function(d) {
			   		return xScale(d.care);
			   })
			   .attr("cy", function(d) {
			   		return yScale(d.household_duties);
			   })
			   .attr("r", 4)
			   .style("stroke", function(d) { return curr_obj.gender_color_map[d.gender]})
       		   .style("stroke-width", 2)
        	   .style("fill", "white")
        	   .attr("data-html", "true")
        	   .attr("data-toggle", function(d, i) {
        	   		var country_name = curr_obj.full_data['countries'][d.country];
                	$(this).tooltip({'title': '<b>Country:</b> ' + 
                                          country_name + '<br><b>x:</b> ' + 
                                          Math.round(d.care * 100) / 100 + " %" + '<br><b>y: </b>' + Math.round(d.household_duties * 100) / 100 + "%"
                                });
                	return "tooltip";
            	})
        	   .on("mouseover", function(d){
        	   		d3.select(this).style("stroke","black")
        	   					   .attr("r", 8)
        	   					   .style("stroke-width", 3)
                	//$(this).tooltip({'title': '<b>Country:</b> ' + 
                    //                      d.country + '<br><b>x:</b> ' + 
                    //                      Math.round(d.care * 100) / 100 + " %" + '<br><b>y:</b>' + Math.round(d.household_duties * 100) / 100 + "%"
                    //});
                    $(this).tooltip();
        	   })
        	   .on("mouseout", function(d){
        	   		d3.select(this).style("stroke", function(d) { return curr_obj.gender_color_map[d.gender]})
        	   					   .attr("r", 4)
        	   					   .style("stroke-width", 2)
        	   })

		svg.append("g")
				.attr("class", "axis")
				.attr("transform", "translate("+ curr_obj.marginX + "," + height  + ")")
				.call(xAxis)
			.append("text")
		      	.attr("class", "label")
		      	.attr("x", width-curr_obj.marginX)
		      	.attr("y", -6)
		      	.style("text-anchor", "end")
		      	.style("stroke","black")
		      	.text("Caring and Educating");
					
			//Create Y axis
		svg.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(" + curr_obj.marginX + ", " + curr_obj.margin+ ")")
				.call(yAxis)
			.append("text")
		      	.attr("class", "label")
		      	.attr("transform", "rotate(-90)")
		      	.attr("y", 6)
		      	.attr("dy", ".71em")
		      	.style("text-anchor", "end")
		      	.style("stroke","black")
		      	.text("Cooking/ Doing Household Work");

		var legend = svg.selectAll(".legend")
	      		.data(Object.keys(curr_obj.gender_color_map))
	    		.enter().append("g")
	      		.attr("class", "legend")
	      		.attr("transform", function(d, i) { return "translate(0," + (curr_obj.margin + i * 20) + ")"; });

  		// draw legend colored rectangles
  		legend.append("rect")
	      		.attr("x", width - curr_obj.marginX)
	      		.attr("width", 10)
	      		.attr("height", 10)
	      		.style("fill", function(d){ return curr_obj.gender_color_map[d]});

	  	// draw legend text
	  	legend.append("text")
		      	.attr("x", width - curr_obj.marginX - 6)
		      	.attr("y", 5)
		      	.attr("dy", ".35em")
		      	.style("text-anchor", "end")
		      	.text(function(d){ return d})
        
  		

  	}
}