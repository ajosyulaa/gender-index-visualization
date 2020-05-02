function DataLoader() {

    this.data = '';

    this.load_all_data = function(callback) { 
        var request = "/getpythondata"; 
        $.get(request, function(data) {
            
            this.data = $.parseJSON(data);
            if(typeof callback === "function") {
                callback(this.data);
            }
        });
    }
}

function FilterData(data) {
    this.data = data;
    
    this.read_overall_index = function(year, index_column) {
        if (index_column == 'OVERALL') {
            index_column = 'Gender Equality Index';
        }
        var the_year = this.data['index_data'][year];
        var min_index = 100;
        var max_index = 0;
        var overall_index = {};
        var index_obj;
        for (var i=0; i<the_year.length; i++) {
            index_obj = the_year[i][index_column];
            index_obj = Math.round(index_obj * 100) / 100;
            overall_index[the_year[i]['Country']] = index_obj;
            if (min_index > index_obj) {
                min_index = index_obj;
            }
            if (max_index < index_obj) {
                max_index = index_obj;
            }
        }
        overall_index['min_index'] = min_index;
        overall_index['max_index'] = max_index;
        return overall_index;
    }

    this.read_violence_index = function() {
        var violence = this.data['violence'];
        violence['min_index'] = 19
        violence['max_index'] = 52
        return violence;
    }

    this.read_awareness_data = function(country) {
        var awareness = this.data['awareness'];
        console.log(awareness)
        for (var idx in awareness) {
            console.log(awareness[idx])
            if (awareness[idx]['Country'] === country) {
                var dataset = awareness[idx];
                return dataset;
            }
        }
    }

    this.read_country_index_over_years = function(country, index_column) {
        var curr_obj = this;
        if (index_column == 'OVERALL') {
            index_column = 'Gender Equality Index';
        }

        //var country_output = {};
        //var eu_output = {};
        var country_output;
        var eu_output;
        var output = [];
        for (var year in curr_obj.data['index_data']) {
            var this_year = curr_obj.data['index_data'][year];
            for (var j=0; j<29; j++) {
                if (this_year[j]['Country'] === country) {
                    country_output = this_year[j][index_column];
                }
                else if(this_year[j]['Country'] === 'EU-28') {
                    eu_output = this_year[j][index_column];
                }
            }
            output.push({'year':year, 'country_output':country_output, 'eu_output':eu_output});
        }
        return output;
    }

    this.read_household_leisure_career_data = function(year) {
        console.log(this.data)
        console.log(this.data['household_data'])
        var household = [];
        var rel_data = this.data['household_data'][year]
        for (var i=0; i<rel_data.length; i++) {
            var female_tuple = {};
            var male_tuple = {};
            female_tuple['country'] = rel_data[i]['Country']
            female_tuple['career'] = rel_data[i]['Career Prospects Index (points, 0-100) W']
            female_tuple['household_duties'] = rel_data[i]['People doing cooking and/or household, every day (%) W']
            female_tuple['care'] = rel_data[i]['People caring for and educating their children or grandchildren, elderly or people with disabilities, every day (%) W']
            female_tuple['gender'] = 'Female';

            male_tuple['country'] = rel_data[i]['Country']
            male_tuple['career'] = rel_data[i]['Career Prospects Index (points, 0-100) M']
            male_tuple['household_duties'] = rel_data[i]['People doing cooking and/or household, every day (%) M']
            male_tuple['care'] = rel_data[i]['People caring for and educating their children or grandchildren, elderly or people with disabilities, every day (%) M']
            male_tuple['gender'] = 'Male';

            household.push(female_tuple)
            household.push(male_tuple)
        }
        return household;
    }

    this.read_scatterplot_data = function(year, indicator1, indicator2) {
        var scatterplot_data = [];
        console.log(this.data)
        var rel_data = this.data['year_data'][year];
        console.log(rel_data)
        var indicator_map = this.data['indicator_column_map'];
        console.log(indicator_map)
        console.log(indicator1)
        //indicator2 = this.data['indicators'][indicator1];

        //indicator2 = 'TIME';

        for (var i=0; i<rel_data.length; i++) {
            var female_tuple = {};
            var male_tuple = {};
            if (rel_data[i]['Country']) {
                female_tuple['country'] = rel_data[i]['Country']
                female_tuple[indicator1] = rel_data[i][indicator_map[indicator1][0]]
                female_tuple[indicator2] = rel_data[i][indicator_map[indicator2][0]]
                //female_tuple[indicator2] = rel_data[i][indicator2];
                female_tuple['gender'] = 'Female';

                male_tuple['country'] = rel_data[i]['Country']
                male_tuple[indicator1] = rel_data[i][indicator_map[indicator1][1]]
                male_tuple[indicator2] = rel_data[i][indicator_map[indicator2][1]]
                //male_tuple[indicator2] = rel_data[i][indicator2];
                male_tuple['gender'] = 'Male';

                scatterplot_data.push(female_tuple)
                scatterplot_data.push(male_tuple)
            }
        }
        return scatterplot_data;
    }

    this.read_diverging_data = function(year, country, domain) {

        var indicators = this.data['indicators'];
        console.log(this.data['indicators'])
        var indicator_map = this.data['indicator_column_map'];
        var ques = this.data['indicators'][domain];

        var diverging_data = [];
        var rel_data = this.data['year_data'][year];

        if (country == "") {
            country = "EU-28";
        }

        for (var i=0; i<rel_data.length; i++) {
            if (rel_data[i]['Country'] === country) {
                for (var jdx in ques) {
                    var tuple = {};
                    var str_w = indicator_map[ques[jdx]][0];
                    var str_m = indicator_map[ques[jdx]][1];
                    tuple['question'] = ques[jdx];
                    tuple[1] = rel_data[i][str_m];
                    tuple[2] = rel_data[i][str_w];
                    diverging_data.push(tuple);
                }
                break;
            }
        }
        return diverging_data;
    }
    this.read_power_data = function(year, country) {
        // console.log(this.data);
        // console.log(this.data['power_data']);
        var ques = [
            'Share of ministers',
            'Share of members of parliament',
            'Share of members of regional assemblies',      
            'Share of members of boards in largest quoted companies, supervisory board or board of directors',
            'Share of board members of research funding organisations',
            'Share of board members of central bank'
        ]
        var labels = ['Ministers', 'Parliament', 'Regional assemblies', 'Companies', 'Research', 'Central Bank']
        var power = []
        var rel_data = this.data['power_data'][year];

        if (country == "") {
            country = "EU-28";
        }

        for (var i=0; i<rel_data.length; i++) {
            // console.log(rel_data[i]['Country'])
            if (rel_data[i]['Country'] == country) {

                for(var j=0; j<6; j++){
                    tuple = {}
                    str_w = "";
                    str_m = "";
                    // console.log(ques[j]);
                    str_w = ques[j] + " (%) W"
                    // console.log(str_w);
                    str_m = ques[j] + " (%) M"
                    // console.log(str_m);
                    tuple['question'] = labels[j]
                    tuple[1] = rel_data[i][str_m]
                    tuple[2] = rel_data[i][str_w]
                    power.push(tuple);
                } break; 
            }
            
         }   
            
        return power;
    }

    this.read_sub_domains = function(year, domain){
        if(domain == 'OVERALL'){
            var sub_domains = ['WORK','HEALTH','POWER','TIME','MONEY','KNOWLEDGE'];
            return sub_domains;
        }
        var sub_domains = this.data['domains'][domain];
        return sub_domains;
    }

    this.read_sub_domain_data =  function(year, domain){
        var sub_domains = this.read_sub_domains(year, domain);

        sub_domain_data = []

        var the_year = this.data['index_data'][year];
        for(var i = 0; i<the_year.length; i++){
            for(var j = 0; j<sub_domains.length; j++){
                sub_domain_data.push({"country" : the_year[i]['Country'], "sub_domain" : sub_domains[j], "value" : the_year[i][sub_domains[j]]});
            }
        }
        return sub_domain_data;
    }
}

var year_mapper = {"1":"2005", "2":"2010", "3":"2012", "4":"2015"};

function get_year() {
    //var year = $("#dropdown_btn2").text();
    //return year;

    var year = $(".range input")[0].value;
    year = year_mapper[year];
    return year
}

function get_domain() {
    var domain = $("#dropdown_btn").text();
    return domain;
}

function get_country_code() {
    var country_code = $("#chosen_country").text();
    return country_code;
}

function add_dropdown_event(filter_obj) {

    $("#domain_drop a").click(function(e){
        e.preventDefault(); // cancel the link behaviour

        var selText = $(this).text();
        console.log(selText);
        $("#dropdown_btn").text(selText);
        if (selText === "Overall") {
            var caption_text = 'Gender Equality Index';
        }
        else {
            var caption_text = 'Gender Equality Index for the domain of ' + selText;
        }
        $("#caption").text(caption_text);

        if (selText === "Overall") {
            var caption3_text = 'Distribution Across Domains';
        }
        else {
            var caption3_text = 'Distribution Across Sub-Domains'
        }
        $("#caption3").text(caption3_text);

        change_vis1(filter_obj);
        change_vis2(filter_obj);
        change_vis3(filter_obj);
        change_vis4(filter_obj);
    });

}

function add_radio_event(filter_obj) {
    $("#exampleRadios1").click(function(e) {
        console.log("clicked1")
        for (var idx in [1, 2, 3, 4, 5, 6, 7]) {
            var c_num = idx;
            $("#defaultCheck"+(c_num)).attr("disabled", "true");
        }
        change_vis2(filter_obj);
    });

    $("#exampleRadios2").click(function(e) {
        for (var idx in [1, 2, 3, 4, 5, 6, 7]) {
            var c_num = idx;
            $("#defaultCheck"+(c_num)).removeAttr("disabled");
        }
        change_vis2(filter_obj);
    });
}

function add_checkbox_event(filter_obj) {
    for (var idx in [1, 2, 3, 4, 5, 6, 7]) {
        var c_num = idx;
        $("#defaultCheck"+(c_num)).click(function(e) {
            change_vis2(filter_obj);
        });
    }
}

function get_selected_domains() {
    var selected_domains = [];
    for (var idx in [1, 2, 3, 4, 5, 6, 7]) {
        var c_num = idx;
        if ($("#defaultCheck"+(c_num)).is(":checked")) {
            selected_domains.push($("#defaultCheck"+(c_num)).attr("value"))
        }
    }
    return selected_domains;
}

function get_which_radio() {

    if ($("#exampleRadios1").is(":checked")) {
        return "#exampleRadios1";
    }
    else {
        return "exampleRadios2";
    }
}

function change_vis7(filter_obj) { 

    $("#vis7").empty();

    var country_code = $("#chosen_country2").text();

    if (country_code !== "") {
        var awareness_data = filter_obj.read_awareness_data(country_code)

        var pie_render = new PieChart("#vis7");
        pie_render.render_pie(awareness_data)

        $("#caption8").text('Awareness about violence against women in ' + filter_obj.data['countries'][country_code]);
    }

    else {
        var country_code = "EU-28";
        var awareness_data = filter_obj.read_awareness_data(country_code)

        var pie_render = new PieChart("#vis7");
        pie_render.render_pie(awareness_data)

        $("#caption8").text('Awareness about violence against women in ' + filter_obj.data['countries'][country_code]);
    }

    

}

function change_vis5(filter_obj){
    $('#vis5').empty();

    var year = get_year();

    var domain = get_domain();

    //var household_data = filter_obj.read_household_leisure_career_data(year);

    //var render_plot = new HouseholdScatterPlot("#vis5", filter_obj.data);
    //render_plot.render_household_plot(household_data);

    var indicator1 = get_indicator1();
    var indicator2 = get_indicator2();

    if (indicator1 !== "Select indicator" && indicator2 !== "Select Indicator") {
        var scatterplot_data = filter_obj.read_scatterplot_data(year, indicator1, indicator2);
        console.log(scatterplot_data)
        var render_plot = new ScatterPlot("#vis5", filter_obj.data);
        render_plot.render_plot(scatterplot_data, indicator1, indicator2);
    }

}

function change_vis4(filter_obj){

    console.log("changing vis4")

    $("#vis4").empty();
    var year = get_year();

    var country_code = get_country_code();

    var domain = get_domain();

    if (domain !== "Overall") {

        var diverging_data = filter_obj.read_diverging_data(year, country_code, domain.toUpperCase());

        var power_data = filter_obj.read_power_data(year, country_code);

        var render_diverging_bar = new DivergingBar("#vis4", filter_obj.data)
        //render_diverging_bar.render_diverging_bar(power_data, "Power");
        render_diverging_bar.render_diverging_bar(diverging_data, domain);

        console.log(filter_obj.data)
        var country_name = '';
        if (country_code === "EU-28" || country_code === "") {
            country_name = "EU-28";
        }
        else {
            country_name = filter_obj.data['countries'][country_code];
        }
        $("#caption4").text(domain + ' Indicators for ' + country_name)
    }
    else {
        $("#caption4").text('')
    }
}

function change_vis3(filter_obj){

    $("#vis3").empty();
    var year = get_year();

    var domain = get_domain();

    
    var sub_domains = filter_obj.read_sub_domains(year, domain.toUpperCase());
    var sub_domain_data = filter_obj.read_sub_domain_data(year, domain.toUpperCase());

    var render_map = new HeatMap("#vis3", filter_obj.data);
    render_map.render_heat_map(domain, sub_domains, sub_domain_data);    

}

function change_vis2(filter_obj) {
    var country_code = get_country_code();
    $("#vis2").empty();
    if (country_code === "EU-28" || country_code === "") {
        var domain = $("#dropdown_btn").text();
        var per_country = filter_obj.read_country_index_over_years("", domain.toUpperCase());
        var render_chart = new LineChart2("#vis2", filter_obj.data);
        render_chart.render_chart("", domain, per_country);

        $("#caption2").text("EU-28's trends for "+domain+"");
    }
    else {
        if (get_which_radio() === "#exampleRadios1") {
            var domain = get_domain();

            var per_country = filter_obj.read_country_index_over_years(country_code, domain.toUpperCase());
            console.log(per_country);

            var country_name = filter_obj.data['countries'][country_code];

            var render_chart = new LineChart2("#vis2", filter_obj.data);
            render_chart.render_chart(country_name, domain, per_country);

            $("#caption2").text("Comparison of trends for " + country_name + "'s "+domain+" index with EU-28");
        }
        else {
            var country_name = filter_obj.data['countries'][country_code];
            var selected_domains = get_selected_domains();
            var data_list = [];
            for (var idx in selected_domains) {
                var domain = selected_domains[idx];
                var domain_data = filter_obj.read_country_index_over_years(country_code, domain.toUpperCase());
                data_list.push(domain_data);
            }
            var render_chart = new LineChart2("#vis2", filter_obj.data);
            render_chart.render_charts(country_name, selected_domains, data_list);

            $("#caption2").text(country_name + "'s trends for selected domains");
        }
    }

    

}

function change_vis1(filter_obj) {

    //$("#vis1").empty();
    var year = get_year();

    var domain = get_domain();

    var overall_index = filter_obj.read_overall_index(year, domain.toUpperCase());
    console.log(overall_index);

    var render_bar = new IndexBar("#vis1", filter_obj.data);
    render_bar.render_bar(domain, overall_index);

}

function add_time_slider_event(filter_obj) {
    var $rangeInput = $('.range input');

    $rangeInput.on('input', function () {
        change_vis1(filter_obj);
        change_vis3(filter_obj);
        change_vis4(filter_obj);
        //change_vis5(filter_obj);
    });

    // Change input value on label click
    $('.range-labels li').on('click', function () {
      var index = $(this).index();
      
      $rangeInput.val(index + 1).trigger('input');
      
    });
    $rangeInput.val(4).trigger('input');

}

function add_country_selection_event(filter_obj) {
    $("#chosen_country").change(function() {
        change_vis2(filter_obj);
        change_vis4(filter_obj);
    });
}

function add_country_selection_event2(filter_obj) {
    $("#chosen_country2").change(function() {
        change_vis7(filter_obj);
    });
}

function add_indicators(filter_obj) {
    var indicator_menus = ["#domain_drop_indicator1", "#domain_drop_indicator2"];
    for (var jdx in indicator_menus) {
        for (var domain in filter_obj.data['indicators']) {
            $(indicator_menus[jdx]).append('<a class="dropdown-item disabled" href="#">'+domain+'</a>');
            for (var idx in filter_obj.data['indicators'][domain]) {
                $(indicator_menus[jdx]).append('<a class="dropdown-item" href="#">'+filter_obj.data['indicators'][domain][idx]+'</a>');
            }
            $(indicator_menus[jdx]).append('<div class="dropdown-divider"></div></a>');
        }
    }
}

function get_indicator1() {
    var indicator1 = $("#dropdown_btn_indicator1").text();
    return indicator1;
}

function get_indicator2() {
    var indicator2 = $("#dropdown_btn_indicator2").text();
    return indicator2;
}
function add_indicator_events(filter_obj) {

    $("#domain_drop_indicator1 a").click(function(e){
        e.preventDefault(); // cancel the link behaviour

        var selText = $(this).text();
        console.log(selText);
        $("#dropdown_btn_indicator1").text(selText);

        change_vis5(filter_obj);
    });

    $("#domain_drop_indicator2 a").click(function(e){
        e.preventDefault(); // cancel the link behaviour

        var selText = $(this).text();
        console.log(selText);
        $("#dropdown_btn_indicator2").text(selText);
        
        change_vis5(filter_obj);

    });
}

function data_callback(data) {
    console.log('Data was loaded.');
    console.log(data);
    var filter_obj = new FilterData(data);

    var overall_index = filter_obj.read_overall_index('2015', 'OVERALL');
    console.log(overall_index);

    var render_bar = new IndexBar("#vis1", filter_obj.data);
    render_bar.render_bar("Overall", overall_index);

    //var power_data = filter_obj.read_power_data('2015', "");

    //var render_diverging_bar = new DivergingBar("#vis4", filter_obj.data)
    //render_diverging_bar.render_diverging_bar(power_data);

    

    change_vis3(filter_obj);
    change_vis2(filter_obj);

    //change_vis5(filter_obj);

    add_dropdown_event(filter_obj);

    add_time_slider_event(filter_obj);

    add_country_selection_event(filter_obj);

    //add_indicators(filter_obj);

    //add_indicator_events(filter_obj);

    add_radio_event(filter_obj);

    add_checkbox_event(filter_obj);

    

    //var diverging_data = filter_obj.read_diverging_data('2015', 'SE', 'TIME');
    //console.log(diverging_data)
    //render_diverging_bar.render_diverging_bar(diverging_data);

    var violence_percent = filter_obj.read_violence_index();
    var map_render = new MapRender("#vis6");
    map_render.render_map(violence_percent);

    //var awareness_data = filter_obj.read_awareness_data("SE")

    //var pie_render = new PieChart("#vis7");
    //pie_render.render_pie("Sweden" , awareness_data)

    add_country_selection_event2(filter_obj);

    change_vis7(filter_obj);
}




var dloader = new DataLoader();
dloader.load_all_data(data_callback);