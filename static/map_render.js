function Color(_r, _g, _b) {
    var r, g, b;
    var setColors = function(_r, _g, _b) {
        r = _r;
        g = _g;
        b = _b;
    };

    setColors(_r, _g, _b);
    this.getColors = function() {
        var colors = {
            r: r,
            g: g,
            b: b
        };
        return colors;
    };
}

function hexToRgb (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function Interpolate(start, end, steps, count) {
    var s = start,
        e = end,
        final = s + (((e - s) / steps) * count);
    return Math.floor(final);
}

function MapRender(svg_elem) {

    this.svg_elem = svg_elem;
    this.width = $(this.svg_elem).width();
    this.height = $(this.svg_elem).height();

    var position = $(this.svg_elem).offset();
    this.left = position['left'];
    this.top = position['top'];

    this.scale_factor = 800;

    this.num_countries = 28;

    this.config = {"color1":"#d3e5ff", "color2":"#08306B"};

    this.COLOR_COUNTS = 25;

    this.COLOR_FIRST = this.config.color1
    this.COLOR_LAST = this.config.color2;

    this.setup_colors = function() {
      var curr_obj = this;

      var rgb = hexToRgb(curr_obj.COLOR_FIRST);
        
      var COLOR_START = new Color(rgb.r, rgb.g, rgb.b);
      
      rgb = hexToRgb(curr_obj.COLOR_LAST);
      var COLOR_END = new Color(rgb.r, rgb.g, rgb.b);
      

      curr_obj.startColors = COLOR_START.getColors()
      curr_obj.endColors = COLOR_END.getColors();

      var colors = [];

      for (var i = 0; i < curr_obj.COLOR_COUNTS; i++) {
        var r = Interpolate(curr_obj.startColors.r, curr_obj.endColors.r, curr_obj.COLOR_COUNTS, i);
        var g = Interpolate(curr_obj.startColors.g, curr_obj.endColors.g, curr_obj.COLOR_COUNTS, i);
        var b = Interpolate(curr_obj.startColors.b, curr_obj.endColors.b, curr_obj.COLOR_COUNTS, i);
        colors.push(new Color(r, g, b));
      }

      curr_obj.colors = colors;
    }

    this.get_index_color = function(overall_index, country_id) {
      var curr_obj = this;

      var colorScale = d3.scaleQuantile()
				.domain([overall_index['min_index'], curr_obj.COLOR_COUNTS, overall_index['max_index']])
				.range(curr_obj.colors);

	  curr_color =  colorScale(overall_index[country_id]);

	  return "rgb(" + curr_color.getColors().r + "," + curr_color.getColors().g + "," + curr_color.getColors().b + ")";
      // var quantize = d3.scaleQuantize()
      //   .domain([0, 1.0])
      //   .range(d3.range(curr_obj.COLOR_COUNTS).map(function(i) { return i }));

      // var range_diff = overall_index['max_index'] - overall_index['min_index'];
      // var scaled = (overall_index[country_id] - overall_index['min_index'])/range_diff;
      // var i = quantize(scaled);
      // var color = curr_obj.colors[i].getColors();
      // return "rgb(" + color.r + "," + color.g +
      //     "," + color.b + ")";
    }



    this.render_map = function(overall_index) {      

        var curr_obj = this;

        curr_obj.setup_colors();



        //Define map projection
        var projection = d3.geoAzimuthalEquidistant()
                               //.translate([this.width/2, this.height/2])
                               //.transform("translate(0,0)")
                               .scale([this.scale_factor]);

        //Define path generator
        var path = d3.geoPath()
                         .projection(projection);

        var svg = d3.select(svg_elem);

        console.log(overall_index)
        var dataset = d3.range(this.num_countries);
        console.log(dataset)

        console.log(curr_obj.width)
        console.log(curr_obj.height)

        var map_x = curr_obj.width/10 -300;
        var selected = null;

        //Load in GeoJSON data
        d3.json("static/europe.json", function(json) {
            //Bind data and create one path per GeoJSON feature
            svg.selectAll("path")
               .data(json.features)
               .enter()
               .append("path")
               .attr("d", path)
               .attr("data-html", "true")
               .attr("data-toggle", function(d, j) {
                  var country_id = json['features'][j]['id'];
                  var country_name = json['features'][j]['properties']['name'];

                  var country_index = Math.round(overall_index[country_id] * 100) / 100;

                  $(this).tooltip({'title': '<b>Country:</b> ' + 
                                            country_name + '<br><b>Percent: </b> ' + 
                                            country_index + '%'
                                  });
                  return "tooltip";
               })
               
               .attr("transform", "translate("+(map_x-50)+", "+(curr_obj.height*1.4)+")")
               .style("fill", function(d, j) {
                      var country_id = json['features'][j]['id'];
                      return curr_obj.get_index_color(overall_index, country_id);
                })
               .on("mouseover", function(d, j) {

                if(d3.select(this).attr("selected") != "true") {
                
                  d3.select(this)
                  .style("fill","orange");
                }

                $(this).tooltip();                

               })
               .on("mouseout", function(d, j) {
                 var country_id = json['features'][j]['id'];

                 var new_color = curr_obj.get_index_color(overall_index, country_id);
                 if(d3.select(this).attr("selected") != "true") {
                   d3.select(this)
                   .style("fill", new_color);
                 }
                 else {

                 }

               })
              .attr("selected", "false")
              .on("click", function(d, i) {
                if(d3.select(this).attr("selected") === "false"){
                  var country_id = json['features'][i]['id'];
                  if(selected) {
                    selected.style("fill", curr_obj.get_index_color(overall_index, country_id))
                              .attr("selected", "false")
                  }
                  selected = d3.select(this);
                  d3.select(this).style("fill","black")
                      .attr("selected","true");

                  
                  $("#chosen_country2").text(country_id);
                  $("#chosen_country2").change();
                }
                else {
                  var country_id = json['features'][i]['id'];
                  var new_color = curr_obj.get_index_color(overall_index, country_id);
                  d3.select(this).style("fill", new_color)
                      .attr("selected","false");
                    selected = null;
                    $("#chosen_country2").text("");
                    $("#chosen_country2").change();
                }
               });

              var margin = 0.12*curr_obj.height;
    var marginX = 0.1*curr_obj.width;

var width = curr_obj.width/1.5, height = curr_obj.height-margin;
              var defs = svg.append("defs");
      var linearGradientMap = defs.append("linearGradient")
          .attr("id","linear-gradient-map");

      linearGradientMap
          .attr("x1","0%")
          .attr("y1","100%")
          .attr("x2","0%")
          .attr("y2","0%");

       console.log()
       console.log("rgb(" + curr_obj.colors[curr_obj.COLOR_COUNTS-1].getColors().r + "," + curr_obj.colors[curr_obj.COLOR_COUNTS-1].getColors().g + "," + curr_obj.colors[curr_obj.COLOR_COUNTS-1].getColors().b + ")")

      linearGradientMap.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", "rgb(" + curr_obj.colors[0].getColors().r + "," + curr_obj.colors[0].getColors().g + "," + curr_obj.colors[0].getColors().b + ")")
      //Set the color for the end (100%)
      linearGradientMap.append("stop")
          .attr("offset", "100%")
          .attr("stop-color","rgb(" + curr_obj.colors[curr_obj.COLOR_COUNTS-1].getColors().r + "," + curr_obj.colors[curr_obj.COLOR_COUNTS-1].getColors().g + "," + curr_obj.colors[curr_obj.COLOR_COUNTS-1].getColors().b + ")")

      var legendsvgMap = svg.append("g")
          .attr("class", "legendWrapperMap");

      var legendWidth = 0.05*width, legendHeight = height/2;

      legendsvgMap.append("rect")
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .attr("x", width+2*marginX)
          .attr("y", height-1.2*legendHeight-height/4)
          .style("fill", "url(#linear-gradient-map)")
          .style("stroke","gray")
          .style("stroke-width","0.4px")
          .style("filter", "url(#drop_shadow1)") 


      //Set scale for x-axis
      var yScaleLegend = d3.scaleLinear()
          .range([legendHeight,0])
          .domain([overall_index['min_index'], overall_index['max_index']]);
          //.domain([d3.min(pt.legendSOM.colorData)/100, d3.max(pt.legendSOM.colorData)/100]);

      //Define x-axis
      var yAxisLegend = d3.axisRight()
            //Set rough # of ticks
          //.tickFormat(d3.format("%"))
          .scale(yScaleLegend);   

      //Set up X axis
      legendsvgMap.append("g")
          .attr("class", "axis")  //Assign "axis" class
          .attr("transform", "translate(" + (width+2*marginX+legendWidth) + "," + (height-1.2*legendHeight-height/4) + ")")
          .call(yAxisLegend);


        });

        
        svg.selectAll("path")



    }
}