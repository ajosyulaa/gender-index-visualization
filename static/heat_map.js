function HeatMap(svg_elem, full_data){
  this.svg_elem = svg_elem;
    this.width = $(this.svg_elem).width();
    this.height = $(this.svg_elem).height();


    var position = $(this.svg_elem).offset();
    this.left = position['left'];
    this.top = position['top'];

    this.domain_color_map = {
        "Overall":"#17a2b8",
        "Work":"#017EDA",
        "Money":"#28a745",
        "Knowledge":"#B40E00",
        "Time":"#ffc107",
        "Power":"#e83e8c",
        "Health":"#6610f2"
    };

    this.full_data = full_data;

    var margin = 0.12*this.height;
    var marginX = 0.1*this.width;

    //console.log(this.full_data["countries"])
    var num_countries = Object.keys(this.full_data["countries"]).length;
    //console.log(num_countries)

    var xScale = d3.scaleBand()
                    .domain(d3.range(num_countries+1))
                    .rangeRound([0, this.width])
                    .paddingInner(0.05);

                    //records.map(function(d) {return d.key;})

    var yScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([margin, this.height]);
    
    var svg = d3.select(this.svg_elem);

    this.remove = function(){
       svg.selectAll("g.axis").remove();
         svg.selectAll("rect").remove();
         svg.selectAll("defs").remove();
    }


    this.render_heat_map = function(domain, sub_domains, records) {
        
        var curr_obj = this;

        //console.log(records);

        svg.selectAll("g.axis").remove();
        svg.selectAll("rect").remove();
        svg.selectAll("defs").remove();


        var width = curr_obj.width/1.5, height = curr_obj.height-margin;

        
      var rows = Object.keys(curr_obj.full_data["countries"]);
      var cols = sub_domains;


      var x = d3.scaleBand()
          .range([ 0, width])
          .domain(cols)
          .padding(0.01);

      var container = svg.append("g")
                       .attr("class", "heatcontainer")
                       .style('transform', 'translate(15%, 15%)');

      container.append("g")
          .attr("class","axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))

      var y = d3.scaleBand()
          .range([height, 0 ])
          .domain(rows)
          .padding(0.05);

    
    
      container.append("g")
          .attr("class","axis")
          .attr("transform","translate("+ width + ",0)")
          .call(d3.axisRight(y));


      var myColor = d3.scaleLinear()
          .range(["white", curr_obj.domain_color_map[domain]])
          .domain([0, 100])

      var div1 = d3.select("body").append("div")   
          .attr("class", "tooltip")               
          .style("opacity", 0);

      var defs1 = svg.append("defs");

      //Filter for the outside glow
      var filter = defs1.append("filter")
          .attr("id","drop_shadow")
          .attr("height", "130%");

      filter.append("feGaussianBlur")
          .attr("in", "SourceAlpha")
          .attr("stdDeviation", "3")
          .attr("result", "blur");

      var feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode")
          .attr("in","blur");
      feMerge.append("feMergeNode")
          .attr("in","SourceGraphic");

      var defs2 = svg.append("defs");

      var filter1 = defs2.append("filter")
          .attr("id","drop_shadow1")
          .attr("height", "130%");

      filter1.append("feGaussianBlur")
          .attr("in", "SourceAlpha")
          .attr("stdDeviation", "3")
          .attr("result", "blur");

      filter1.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 5)
            .attr("dy", 1)
            .attr("result", "offsetBlur");

      var feMerge1 = filter1.append("feMerge");
      feMerge1.append("feMergeNode")
          .attr("in","offsetblur");
      feMerge1.append("feMergeNode")
          .attr("in","SourceGraphic");

      container.selectAll()
          .data(records, function(d) {return d.sub_domain+':'+d.country;})
          .enter()
          .append("rect")
          .attr("x", function(d) { return x(d.sub_domain) })
          .attr("y", function(d) { return y(d.country) })
          .attr("width", x.bandwidth() )
          .attr("height", y.bandwidth() )
          .attr("data-html", "true")
          .style("fill", function(d) { 
            $(this).tooltip({'title':'<b>'+curr_obj.full_data['countries'][d.country]+'</b>: '+ Math.round(d.value * 100) / 100});

            return myColor(d.value)} 
            )
          .on("mouseover", function(d) { 
            d3.select(this).style("stroke","black").style("stroke-width","0.2px")  
            d3.select(this).style("filter", "url(#drop_shadow)") 
            /*div1.transition()        
                .duration(200)      
                .style("opacity", .9);      
            div1.html(Math.round(d.value * 100) / 100 + " %")
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");   */ 
            $(this).tooltip();
            })                  
          .on("mouseout", function(d) {   
            d3.select(this).style("filter","none");
            d3.select(this).style("stroke","none");
            div1.transition()        
                .duration(500)      
                .style("opacity", 0);   
          });

      var defs = svg.append("defs");
      var linearGradient = defs.append("linearGradient")
          .attr("id","linear-gradient");

      linearGradient
          .attr("x1","0%")
          .attr("y1","100%")
          .attr("x2","0%")
          .attr("y2","0%");

      linearGradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", "white"); 

      //Set the color for the end (100%)
      linearGradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", curr_obj.domain_color_map[domain]); 

      var legendsvg = container.append("g")
          .attr("class", "legendWrapper");

      var legendWidth = 0.05*width, legendHeight = height/2;

      legendsvg.append("rect")
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .attr("x", width+marginX)
          .attr("y", height-legendHeight-height/4)
          .style("fill", "url(#linear-gradient)")
          .style("stroke","gray")
          .style("stroke-width","0.4px")
          .style("filter", "url(#drop_shadow1)") 


      //Set scale for x-axis
      var yScaleLegend = d3.scaleLinear()
          .range([legendHeight,0])
          .domain([0, 100]);
          //.domain([d3.min(pt.legendSOM.colorData)/100, d3.max(pt.legendSOM.colorData)/100]);

      //Define x-axis
      var yAxisLegend = d3.axisRight()
          .ticks(6)  //Set rough # of ticks
          //.tickFormat(d3.format("%"))
          .scale(yScaleLegend);   

      //Set up X axis
      legendsvg.append("g")
          .attr("class", "axis")  //Assign "axis" class
          .attr("transform", "translate(" + (width+marginX+legendWidth) + "," + (height-legendHeight-height/4) + ")")
          .call(yAxisLegend);

    }
}