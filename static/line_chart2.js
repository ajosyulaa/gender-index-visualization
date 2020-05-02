function LineChart2(svg_elem, full_data) {
    this.svg_elem = svg_elem;
    this.width = $(this.svg_elem).width();
    this.height = $(this.svg_elem).height();
    
    this.domain_color_map = {
        "Overall":"#17a2b8",
        "Work":"#017EDA",
        "Money":"#28a745",
        "Knowledge":"#B40E00",
        "Time":"#ffc107",
        "Power":"#e83e8c",
        "Health":"#6610f2"
    };

    var margin = 0.1*this.height;
    var marginX = 0.04*this.width;

    var within_margin = 0.02*this.height;

    this.full_data = full_data;

    var num_years = 4;

    var years = ['2005', '2010', '2012', '2015']
    //var years = [2005, 2010,];

    var xScale = d3.scaleLinear()
                    .domain([0, 4])
                    .rangeRound([0, this.width]);
                    //.paddingInner(0.05);

                    //records.map(function(d) {return d.key;})

    var yScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([margin, this.height]);

    this.render_chart = function(country, domain, data) {

        var curr_obj = this;
        var width = curr_obj.width;
        var height = curr_obj.height;

        //console.log(data)
          
        var dataset_1 = [];
        var dataset_2 = [];
        var dataset_eu = [];
        for (var idx in data) {
            dataset_eu.push({"y":Math.round(data[idx]['eu_output'] * 100) / 100})
            if(country){
                dataset_1.push({"y":Math.round(data[idx]['country_output'] * 100) / 100});
                dataset_2.push({"y":Math.round((data[idx]['country_output'] - 10) * 100) / 100});
            }
            
            //dataset_2.push({"y":Math.round((data[idx]['country_output'] - 10) * 100) / 100})
        }

        //console.log(dataset_1)
        var country_names = [country];

        var dataset_countries = [dataset_1];

        // 7. d3's line generator
        var line = d3.line()
            .x(function(d, i) { return marginX + xScale(i); }) // set the x values for the line generator
            .y(function(d) { return curr_obj.height - (yScale(d.y)) + within_margin; }) // set the y values for the line generator 
            .curve(d3.curveMonotoneX) // apply smoothing to the line

        // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number

        var dataset = dataset_1;

        var svg = d3.select(curr_obj.svg_elem);

        // 3. Call the x axis in a group tag

        var xAxis = d3.axisBottom().scale(xScale)
                                   .tickValues(d3.range(num_years))
                                   .tickFormat(function(d, i) {
                                    return years[i];
                                   });

        var yAxis = d3.axisLeft().scale(yScale)
                                 .ticks(10)
                                 .tickFormat(function(d, i){
                                    return (10 - i)*10;
                                 });

        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate("+marginX+"," + (curr_obj.height - margin + within_margin) + ")")
           .call(xAxis);

        // 4. Call the y axis in a group tag
        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(" + marginX + ","+(0 - margin + within_margin)+")")
           .call(yAxis);

        // 9. Append the path, bind the data, and call the line generator 
        for (var idx in dataset_countries) {

            var dataset = dataset_countries[idx];
        
            svg.append("path")
                .datum(dataset) // 10. Binds data to the line 
                .attr("class", "line") // Assign a class for styling 
                .attr("d", line) // 11. Calls the line generator 
                .style("stroke", curr_obj.domain_color_map[domain]);
        }

        svg.append("path")
            .datum(dataset_eu) // 10. Binds data to the line 
            .attr("class", "line2") // Assign a class for styling 
            .attr("d", line) // 11. Calls the line generator 
            .style("stroke", "gray")
            .style("stroke-dasharray", "5");

        var focus2 = svg.append("g").attr("class", "focus").style("display", "none");
        focus2.append("line").attr("class", "focus line")
                             .attr("x1", 0).attr("x2", 0)
                             .attr("y1", 0).attr("y2", height - margin + within_margin).style("stroke", "black");

        // 12. Appends a circle for each datapoint 
        for (var idx in dataset_countries) {
            var dataset = dataset_countries[idx];
            svg.selectAll(".dotn" + idx)
                .data(dataset)
                .enter().append("circle") // Uses the enter().append() method
                .attr("class", "dotn" + idx) // Assign a class for styling
                .attr("cx", function(d, i) { return xScale(i) + marginX })
                .attr("cy", function(d) { return curr_obj.height - (yScale(d.y)) + within_margin})
                .attr("r", 5)
                .style("fill", curr_obj.domain_color_map[domain]);
        }

        

        svg.selectAll(".dot2")
            .data(dataset_eu)
            .enter().append("circle") // Uses the enter().append() method
            .attr("class", "dot2") // Assign a class for styling
            .attr("cx", function(d, i) { return xScale(i) + marginX})
            .attr("cy", function(d) { return curr_obj.height - yScale(d.y) + within_margin })
            .attr("r", 5)
            .attr("fill", "gray");

        for (var idx in dataset_countries) {

            svg.append("text")
                .attr("class", "legend")    // style the legend
                .style("fill", curr_obj.domain_color_map[domain])
                .style("text-anchor", "middle")
                .style("font-weight", "bold")
                .style("font-size", "16px")
                .attr("x", curr_obj.width - xScale(1)/2)
                .attr("y", curr_obj.height/2 + margin)
                .text(function(d, i) {
                    return country_names[idx];
                });
        }


        svg.append("text")
            .attr("class", "legend")    // style the legend
            .style("fill", "gray")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", "16px")
            .attr("x", curr_obj.width - xScale(1)/2)
            .attr("y", curr_obj.height/2)
            .text("EU-28"); 

        
        for (var idx in dataset_countries) {

            svg.selectAll(".dotn" + idx)
                .attr("data-html", "true")
                .attr("data-toggle", function(d, i) {
                    console.log(i)
                    $(this).tooltip({'title': '<b>'+country_names[idx]+' Index:</b> ' + 
                                              d.y
                                    });
                    return "tooltip";
                })
                .on("mouseover", function(d, j) {

                    d3.select(this)
                    .style("fill", "orange");

                    d3.selectAll(".dot2")
                    .style("fill", function(dn, i) {
                        if (i === j) {
                            $(this).mouseover();
                            return "orange";
                        }
                        else {
                            return "gray";
                        }
                        
                    });

                    $(this).tooltip();

                    
                    var x0 = xScale.invert(d3.mouse(this)[0]);
                    var y0 = yScale.invert(d3.mouse(this)[1]);
                    var yThis = dataset[j]["y"];
                    var yOther = dataset_eu[j]["y"];
                    var chosenY = Math.max(yThis, yOther);
                    var endY = Math.min(yThis, yOther);
                    //console.log(chosenY)
                    chosenY = yScale.invert(chosenY) - margin;
                    endY = yScale.invert(endY);
                    focus2.select(".focus.line").attr("transform", "translate(" + xScale(x0) + ")").attr("y1", yScale(chosenY));
                    focus2.style("display", null);

                })
                .on("mouseout", function(d, i) {
                    d3.select(this)
                    .style("fill", curr_obj.domain_color_map[domain]);

                    d3.selectAll(".dot2")
                    .style("fill", function(dn, j) {
                        if (i === j) {
                            $(this).mouseout();
                            return "gray";
                        }
                        else {
                            return "gray";
                        }
                        
                    });

                    focus2.style("display", "none");
                });

        }

        

        svg.selectAll(".dot2")
            .attr("data-html", "true")
            .attr("data-toggle", function(d, i) {

                $(this).tooltip({'title': '<b>EU-28 Index:</b> ' + 
                                          d.y
                                });
                return "tooltip";
            })
            .on("mouseover", function(d, j) {

                d3.select(this)
                .style("fill", "orange");

                d3.selectAll(".dot")
                .style("fill", function(dn, i) {
                    if (i === j) {
                        $(this).mouseover();
                        return "orange";
                    }
                    else {
                        return curr_obj.domain_color_map[domain];
                    }
                    
                });

                //var country = curr_obj.full_data['countries'][d['key']];
                $(this).tooltip();

                
                var x0 = xScale.invert(d3.mouse(this)[0]);
                var y0 = yScale.invert(d3.mouse(this)[1]);
                var yThis = dataset_eu[j]["y"];
                var yOther = dataset[j]["y"];
                var chosenY = Math.max(yThis, yOther);
                var endY = Math.min(yThis, yOther);
                //console.log(chosenY)
                chosenY = yScale.invert(chosenY) - margin;
                endY = yScale.invert(endY);
                focus2.select(".focus.line").attr("transform", "translate(" + xScale(x0) + ")").attr("y1", yScale(chosenY));
                focus2.style("display", null);

            })
            .on("mouseout", function(d, i) {
                d3.select(this)
                .style("fill", "gray");

                d3.selectAll(".dot")
                .style("fill", function(dn, j) {
                    if (i === j) {
                        $(this).mouseout();
                        return curr_obj.domain_color_map[domain];
                    }
                    else {
                        return curr_obj.domain_color_map[domain];
                    }
                    
                });

                focus2.style("display", "none");
            });

    }

    this.render_charts = function(country, domain_names, data_list) {

        var curr_obj = this;
        var width = curr_obj.width;
        var height = curr_obj.height;


        var datasets = [];
        console.log(data_list)

        for (var idx in data_list) {
            datasets.push([]);
            for (var jdx in data_list[idx]) {
                if(country){
                    
                    datasets[idx].push({"y":Math.round(data_list[idx][jdx]['country_output'] * 100) / 100});
                }
            }
        }

        console.log(datasets)

        // 7. d3's line generator
        var line = d3.line()
            .x(function(d, i) { return marginX + xScale(i); }) // set the x values for the line generator
            .y(function(d) { return curr_obj.height - (yScale(d.y)) + within_margin; }) // set the y values for the line generator 
            .curve(d3.curveMonotoneX) // apply smoothing to the line

        // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number

        var svg = d3.select(curr_obj.svg_elem);

        // 3. Call the x axis in a group tag

        var xAxis = d3.axisBottom().scale(xScale)
                                   .tickValues(d3.range(num_years))
                                   .tickFormat(function(d, i) {
                                    return years[i];
                                   });

        var yAxis = d3.axisLeft().scale(yScale)
                                 .ticks(10)
                                 .tickFormat(function(d, i){
                                    return (10 - i)*10;
                                 });

        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate("+marginX+"," + (curr_obj.height - margin + within_margin) + ")")
           .call(xAxis);

        // 4. Call the y axis in a group tag
        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(" + marginX + ","+(0 - margin + within_margin)+")")
           .call(yAxis);

        // 9. Append the path, bind the data, and call the line generator 
        for (var idx in datasets) {

            var dataset = datasets[idx];
        
            svg.append("path")
                .datum(dataset) // 10. Binds data to the line 
                .attr("class", "line") // Assign a class for styling 
                .attr("d", line) // 11. Calls the line generator 
                .style("stroke", curr_obj.domain_color_map[domain_names[idx]]);
        }

        var focus2 = svg.append("g").attr("class", "focus").style("display", "none");
        focus2.append("line").attr("class", "focus line")
                             .attr("x1", 0).attr("x2", 0)
                             .attr("y1", 0).attr("y2", height - margin + within_margin).style("stroke", "black");

        // 12. Appends a circle for each datapoint 
        for (var idx in datasets) {
            var dataset = datasets[idx];
            svg.selectAll(".dotn" + idx)
                .data(dataset)
                .enter().append("circle") // Uses the enter().append() method
                .attr("class", "dotn" + idx) // Assign a class for styling
                .attr("cx", function(d, i) { return xScale(i) + marginX })
                .attr("cy", function(d) { return curr_obj.height - (yScale(d.y)) + within_margin})
                .attr("r", 5)
                .style("fill", curr_obj.domain_color_map[domain_names[idx]]);
        }

        var legend_box = svg.append("g")
                            .attr("class", "border")
                            //.attr("height", curr_obj.height)
                            .attr("transform", "translate("+"0"+", "+"0"+")");

        var indiv_height = (curr_obj.height - margin)/datasets.length;

        for (var idx in datasets) {

            legend_box.append("text")
                .attr("class", "legend")    // style the legend
                .style("fill", curr_obj.domain_color_map[domain_names[idx]])
                .style("text-anchor", "middle")
                .style("font-weight", "bold")
                .style("font-size", "12px")
                .attr("x", curr_obj.width - xScale(1/2))
                //.attr("y", curr_obj.height/2 + margin)
                .attr("y", function(d, i) {
                    return idx*indiv_height + margin;
                })
                .text(function(d, i) {
                    return domain_names[idx];
                });
        }

        
        for (var idx in datasets) {

            console.log(idx)
            console.log(domain_names)

            svg.selectAll(".dotn" + idx)
                .attr("data-html", "true")
                .attr("data-toggle", function(d, i) {
                    $(this).tooltip({'title': '<b>'+domain_names[idx]+' Index:</b> ' + 
                                              d.y
                                    });
                    return "tooltip";
                })
                .on("mouseover", function(d, j) {

                    d3.select(this)
                    .style("fill", "orange");

                    $(this).tooltip();

                })
                .on("mouseout", function(d, i) {
                    console.log(domain_names[idx])
                    d3.select(this)
                    .style("fill", curr_obj.domain_color_map[domain_names[idx]]);
                });

        }

    }
}