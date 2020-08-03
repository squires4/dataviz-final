const bar_chart = d3.select("#bar_chart");

// Bar chart constants
const canvasHeight = 400;
const canvasWidth = 1020;
const marginLeft = 70;
const marginTop = 25;
const marginBottom = 50;
const chartHeight = canvasHeight - marginBottom - marginTop;
const chartWidth = canvasWidth - marginLeft;
const yMax = 80000;
const yMaxJanFeb = 30;
const yMaxMarch = 30000;
const transitionDelay = 15;
const mapWidth = 700;
const mapHeight = 580;

// x and y axes
var x;
var y;
var xAxis;
var yAxis;

// Current scene
var currScene;
// Current date
var currDate;
// Max total number of cases reported
var maxTotalCases;

// Tooltip for interactive mode
var tooltip = d3.select("body")
                .append("div")
                .attr("id", "tooltip")
                .style("opacity", 0);

// Load national and state-level COVID data.
let state_data = null;
let us_data = d3.csv("us.csv").then(function (data_us) {
  state_data = d3.csv("us-states.csv").then(function (data_state) {
    d3.json("us-states.geojson").then(function(us) {
      d3.csv("state_populations.csv").then(function(pops) {
        us_data = data_us;
        state_data = data_state

        // Go to the first scene.
        setUpMap(us, pops);
        setUpAxes();
        setUpBars();
        handleScrolling();
        $(window).scroll(handleScrolling);



        function february() {
          currScene = "february";
          $(".scene_text").css("display", "none");
          $("#february_text").css("display", "block");
          bar_chart.selectAll(".annotation").remove();

          // Scale axis for Jan/Feb small numbers
          y.domain([0, yMaxJanFeb]);
          d3.select(".y_axis").transition().duration(500).delay(500).call(yAxis);

          // Scale x axis for Jan/Feb
          x.domain(us_data.map((us_data) => us_data.date)
                  .filter(function (d) {return d.split("/")[0] == "1" ||
                                         d.split("/")[0] == "2";}))
          xAxis.tickValues(x.domain().filter(function (d) {return d == "2/1/2020" ||
                                                                  d == "2/15/2020"}));
          d3.select(".x_axis").transition().duration(500).delay(500).call(xAxis);

          d3.selectAll(".april,.may,.june,.july")
            .attr("height", 0)
            .attr("y", marginTop + chartHeight);

          var numJanFeb = d3.selectAll(".january,.february").size();
          d3.selectAll(".january,.february")
            .transition()
            .duration(500)
            .delay(500)
            .attr("x", function(d) {return x(d.date) + marginLeft})
            .attr("width", chartWidth / numJanFeb - 1)
            .attr("height", function(d) {return y(0) - y(d.new_cases) })
            .attr("y", function(d) {return y(d.new_cases) + marginTop});
          d3.selectAll(".march")
          .transition()
          .delay(function (d,i){ return (31 - i) * transitionDelay;})
            .attr("height", 0)
            .attr("y", marginTop + chartHeight);

          // Add annotations
          addAnnotationText("Jan. 29: White House forms", 
                            "1/29/2020",
                            (chartWidth / numJanFeb - 1),
                            y(8));
          addAnnotationText("Coronavirus Task Force", 
                            "1/29/2020",
                            (chartWidth / numJanFeb - 1),
                            y(6.5));
          addAnnotationLine("1/29/2020", 
                            (chartWidth / numJanFeb - 1),
                            y(6),
                            y(0));

          addAnnotationText("Feb. 26: First confirmed case",
                            "2/25/2020",
                            (chartWidth / numJanFeb - 1),
                            y(24))
          addAnnotationText("of community transmission",
                            "2/25/2020",
                            (chartWidth / numJanFeb - 1),
                            y(22.5))
          addAnnotationText("(Solano County, CA)",
                            "2/25/2020",
                            (chartWidth / numJanFeb - 1),
                            y(21))
          addAnnotationLine("2/26/2020",
                            (chartWidth / numJanFeb - 1),
                            y(20.5), y(15))
          updateMap("2/29/2020");
        }

        function addAnnotationText(note, annotationDate, barWidth, y) {
          bar_chart.append("text")
            .classed("annotation", true)
            .attr("x", x(annotationDate) + marginLeft + barWidth / 2)
            .attr("y", y + marginTop)
            .attr("opacity", 0)
            .attr("text-anchor", "middle")
            .text(note)
            .transition()
            .duration(1000)
            .delay(1000)
            .style("opacity", "1");
        }

        function addAnnotationLine(annotationDate, barWidth, topY, bottomY) {
          bar_chart.append("line")
            .classed("annotation", true)
            .attr("x1", x(annotationDate) + marginLeft + barWidth / 2)
            .attr("y1", topY + marginTop)
            .attr("x2", x(annotationDate) + marginLeft + barWidth / 2)
            .attr("y2", bottomY + marginTop)
            .attr("stroke", "black")
            .attr("stroke-dasharray", "5 5")
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .delay(1000)
            .style("opacity", "1");
        }

        function march() {
          currScene = "march";
          $(".scene_text").css("display", "none");
          $("#march_text").css("display", "block");
          bar_chart.selectAll(".annotation").remove();

          // Scale axis for March small numbers
          y.domain([0, yMaxMarch]);
          d3.select(".y_axis").transition().delay(500).duration(500).call(yAxis);

          // Scale x axis for March
          x.domain(us_data.map((us_data) => us_data.date)
                  .filter(function (d) {return parseInt(d.split("/")[0]) <= 3;}))
          xAxis.tickValues(x.domain().filter(function (d) {return parseInt(d.split("/")[0]) <= 3 && 
                                                                  parseInt(d.split("/")[1]) == 1;}));
          d3.select(".x_axis").transition().duration(500).delay(500).call(xAxis);

          var numMarch = d3.selectAll(".january,.february,.march").size();
          d3.selectAll(".january,.february")
            .transition()
            .duration(500)
            .delay(500)
            .attr("height", function(d) {return y(0) - y(d.new_cases) })
            .attr("y", function(d) {return y(d.new_cases) + marginTop})
            .attr("x", function(d) {return x(d.date) + marginLeft})
            .attr("width", chartWidth / numMarch - 1);;
          d3.selectAll(".may,.june,.july")
            .attr("height", 0)
            .attr("y", marginTop + chartHeight);

          d3.selectAll(".march")
            .transition()
            .duration(500)
            .delay(500)
            .attr("x", function(d) {return x(d.date) + marginLeft})
            .attr("width", chartWidth / numMarch - 1)
            .attr("height", function(d) {return y(0) - y(d.new_cases) })
            .attr("y", function(d) {return y(d.new_cases) + marginTop});

          d3.selectAll(".april")
            .transition()
            .attr("height", 0)
            .attr("y", marginTop + chartHeight);

          addAnnotationText("March 27: US passes",
                            "3/25/2020",
                            (chartWidth / numMarch - 1),
                            y(26500))
          addAnnotationText("100K confirmed cases",
                            "3/25/2020",
                            (chartWidth / numMarch - 1),
                            y(25000))
          addAnnotationLine("3/27/2020",
                            (chartWidth / numMarch - 1),
                            y(24500), y(17500))

          addAnnotationText("March 8: US passes",
                            "3/8/2020",
                            (chartWidth / numMarch - 1),
                            y(4000))
          addAnnotationText("500 confirmed cases",
                            "3/8/2020",
                            (chartWidth / numMarch - 1),
                            y(2500))
          addAnnotationLine("3/8/2020",
                            (chartWidth / numMarch - 1),
                            y(2000), y(500))
        }

        function april() {
          currScene = "april";
          $(".scene_text").css("display", "none");
          $("#april_text").css("display", "block");
          bar_chart.selectAll(".annotation").remove();

          // Scale axis for April onward large numbers
          y.domain([0, yMax]);
          d3.select(".y_axis").transition().duration(500).call(yAxis);

          // Scale x axis for April
          x.domain(us_data.map((us_data) => us_data.date)
                  .filter(function (d) {return parseInt(d.split("/")[0]) <= 4;}))
          xAxis.tickValues(x.domain().filter(function (d) {return parseInt(d.split("/")[0]) <= 4 && 
                                                                  parseInt(d.split("/")[1]) == 1;}));
          d3.select(".x_axis").transition().duration(500).delay(500).call(xAxis);

          var numApril = d3.selectAll(".january,.february,.march,.april").size();

          d3.selectAll(".january,.february,.march")
            .transition()
            .duration(500)
            .delay(500)
            .attr("height", function(d) {return y(0) - y(d.new_cases)  })
            .attr("y", function(d) {return y(d.new_cases) + marginTop})
            .attr("x", function(d) {return x(d.date) + marginLeft})
            .attr("width", chartWidth / numApril - 1);
          d3.selectAll(".june,.july")
            .attr("height", 0)
            .attr("y", marginTop + chartHeight);

          d3.selectAll(".april")
            .transition()
            .duration(500)
            .delay(500)
            .attr("x", function(d) {return x(d.date) + marginLeft})
            .attr("width", chartWidth / numApril - 1)
          d3.selectAll(".april")
            .transition()
            .delay(function (d,i){ return 1000 + i * (500/31);})
            .attr("height", function(d) {return y(0) - y(d.new_cases) })
            .attr("y", function(d) {return y(d.new_cases) + marginTop});

          d3.selectAll(".may")
            .transition()
            .attr("height", 0)
            .attr("y", marginTop + chartHeight);

          addAnnotationText("April 4: New York reaches",
                            "4/4/2020",
                            (chartWidth / numApril - 1),
                            y(44000))
          addAnnotationText("peak of 12,274 cases",
                            "4/4/2020",
                            (chartWidth / numApril - 1),
                            y(40000))
          addAnnotationLine("4/4/2020",
                            (chartWidth / numApril - 1),
                            y(39000), y(35500))

          addAnnotationText("April 23: Trump suggests",
                            "4/20/2020",
                            (chartWidth / numApril - 1),
                            y(62000))
          addAnnotationText("injecting disinfectants could",
                            "4/20/2020",
                            (chartWidth / numApril - 1),
                            y(58000))
          addAnnotationText("cure coronavirus",
                            "4/20/2020",
                            (chartWidth / numApril - 1),
                            y(54000))
          addAnnotationLine("4/20/2020",
                            (chartWidth / numApril - 1),
                            y(53000), y(28000))
        }

        function may() {
          currScene = "may";
          $(".scene_text").css("display", "none");
          $("#may_text").css("display", "block");
          bar_chart.selectAll(".annotation").remove();

          // Scale axis for April onward large numbers
          y.domain([0, yMax]);
          d3.select(".y_axis").transition().duration(1000).call(yAxis);

          // Scale x axis for May
          // Scale x axis for April
                x.domain(us_data.map((us_data) => us_data.date)
                  .filter(function (d) {return parseInt(d.split("/")[0]) <= 5;}))
          xAxis.tickValues(x.domain().filter(function (d) {return parseInt(d.split("/")[0]) <= 5 && 
                                                                  parseInt(d.split("/")[1]) == 1;}));
          d3.select(".x_axis").transition().duration(500).delay(500).call(xAxis);

          var numMay = d3.selectAll(".january,.february,.march,.april,.may").size();

          d3.selectAll(".january,.february,.march,.april")
            .transition()
            .duration(500)
            .delay(500)
            .attr("height", function(d) {return y(0) - y(d.new_cases)  })
            .attr("y", function(d) {return y(d.new_cases) + marginTop})
            .attr("x", function(d) {return x(d.date) + marginLeft})
            .attr("width", chartWidth / numMay - 1);

          d3.selectAll(".may")
            .transition()
            .duration(500)
            .delay(500)
            .attr("x", function(d) {return x(d.date) + marginLeft})
            .attr("width", chartWidth / numMay - 1)
          d3.selectAll(".may")
            .transition()
            .delay(function (d,i){ return 1000 + i * (500/31);})
            .attr("height", function(d) {return y(0) - y(d.new_cases) })
            .attr("y", function(d) {return y(d.new_cases) + marginTop});

          d3.selectAll(".june,.july")
            .transition()
            .attr("height", 0)
            .attr("y", marginTop + chartHeight);

          addAnnotationText("May 1: Texas reopens",
                            "5/10/2020",
                            (chartWidth / numMay - 1),
                            y(75000))
          addAnnotationLine("5/1/2020",
                            (chartWidth / numMay - 1),
                            y(73000), y(35000))

          addAnnotationText("May 4: Florida reopens",
                            "5/13/2020",
                            (chartWidth / numMay - 1),
                            y(55000))
          addAnnotationLine("5/4/2020",
                            (chartWidth / numMay - 1),
                            y(53000), y(23000))
        }

        function june() {
          currScene = "june";
          $(".scene_text").css("display", "none");
          $("#june_text").css("display", "block");
          bar_chart.selectAll(".annotation").remove();

          // Scale axis for April onward large numbers
          y.domain([0, yMax]);
          d3.select(".y_axis").transition().duration(1000).call(yAxis);

          // Scale x axis for June
          // Scale x axis for April
                x.domain(us_data.map((us_data) => us_data.date)
                  .filter(function (d) {return parseInt(d.split("/")[0]) <= 6;}))
          xAxis.tickValues(x.domain().filter(function (d) {return parseInt(d.split("/")[0]) <= 6 && 
                                                                  parseInt(d.split("/")[1]) == 1;}));
          d3.select(".x_axis").transition().duration(500).delay(500).call(xAxis);

          var numJune = d3.selectAll(".january,.february,.march,.april,.may,.june").size();

          d3.selectAll(".january,.february,.march,.april,.may")
            .transition()
            .duration(500)
            .delay(500)
            .attr("height", function(d) {return y(0) - y(d.new_cases)  })
            .attr("y", function(d) {return y(d.new_cases) + marginTop})
            .attr("x", function(d) {return x(d.date) + marginLeft})
            .attr("width", chartWidth / numJune - 1);

          d3.selectAll(".june")
            .transition()
            .duration(500)
            .delay(500)
            .attr("x", function(d) {return x(d.date) + marginLeft})
            .attr("width", chartWidth / numJune - 1)
          d3.selectAll(".june")
            .transition()
            .delay(function (d,i){ return 1000 + i * (500/31);})
            .attr("height", function(d) {return y(0) - y(d.new_cases) })
            .attr("y", function(d) {return y(d.new_cases) + marginTop});
          d3.selectAll(".july")
            .transition()
            .attr("height", 0)
            .attr("y", marginTop + chartHeight);

          addAnnotationText("June 10: Confirmed cases",
                            "6/10/2020",
                            (chartWidth / numJune - 1),
                            y(55000))
          addAnnotationText("pass 2 million",
                            "6/10/2020",
                            (chartWidth / numJune - 1),
                            y(50000))
          addAnnotationLine("6/10/2020",
                            (chartWidth / numJune - 1),
                            y(49000), y(24000))
        }

        function july() {
          currScene = "july";
          $(".scene_text").css("display", "none");
          $("#july_text").css("display", "block");
          bar_chart.selectAll(".annotation").remove();

          // Scale axis for April onward large numbers
          y.domain([0, yMax]);
          d3.select(".y_axis").transition().duration(1000).call(yAxis);

          // Scale x axis for July
          // Scale x axis for April
                x.domain(us_data.map((us_data) => us_data.date)
                  .filter(function (d) {return parseInt(d.split("/")[0]) <= 7;}))
          xAxis.tickValues(x.domain().filter(function (d) {return parseInt(d.split("/")[0]) <= 7 && 
                                                                  parseInt(d.split("/")[1]) == 1;}));
          d3.select(".x_axis").transition().duration(500).delay(500).call(xAxis);

          var numJuly = d3.selectAll(".january,.february,.march,.april,.may,.june,.july").size();

          d3.selectAll(".january,.february,.march,.april,.may,.june")
            .transition()
            .duration(500)
            .delay(500)
            .attr("height", function(d) {return y(0) - y(d.new_cases)  })
            .attr("y", function(d) {return y(d.new_cases) + marginTop})
            .attr("x", function(d) {return x(d.date) + marginLeft})
            .attr("width", chartWidth / numJuly - 1);

          d3.selectAll(".july")
            .transition()
            .duration(500)
            .delay(500)
            .attr("x", function(d) {return x(d.date) + marginLeft})
            .attr("width", chartWidth / numJuly - 1)
          d3.selectAll(".july")
            .transition()
            .delay(function (d,i){ return 1000 + i * (500/31);})
            .attr("height", function(d) {return y(0) - y(d.new_cases) })
            .attr("y", function(d) {return y(d.new_cases) + marginTop});

          addAnnotationText("July 7: Confirmed cases",
                            "7/4/2020",
                            (chartWidth / numJuly - 1),
                            y(77000))
          addAnnotationText("pass 3 million",
                            "7/4/2020",
                            (chartWidth / numJuly - 1),
                            y(72000))
          addAnnotationLine("7/7/2020",
                            (chartWidth / numJuly - 1),
                            y(71000), y(55000))
        }

        function interactive() {
          $(".scene_text").css("display", "none");
          $("#interactive_text").css("display", "block");
          currScene = "interactive";
          bar_chart.selectAll(".annotation").remove();

          // Scale axis for April onward large numbers
          y.domain([0, yMax]);
          d3.select(".y_axis").transition().duration(1000).call(yAxis);

          // Scale x axis for July
          x.domain(us_data.map((us_data) => us_data.date)
                  .filter(function (d) {return parseInt(d.split("/")[0]) <= 7;}))
          xAxis.tickValues(x.domain().filter(function (d) {return parseInt(d.split("/")[0]) <= 7 && 
                                                                  parseInt(d.split("/")[1]) == 1;}));
          d3.select(".x_axis").transition().duration(500).delay(500).call(xAxis);

          var numJuly = d3.selectAll(".january,.february,.march,.april,.may,.june,.july").size();

          d3.selectAll(".january,.february,.march,.april,.may,.june")
            .transition()
            .duration(500)
            .delay(500)
            .attr("height", function(d) {return y(0) - y(d.new_cases)  })
            .attr("y", function(d) {return y(d.new_cases) + marginTop})
            .attr("x", function(d) {return x(d.date) + marginLeft})
            .attr("width", chartWidth / numJuly - 1);

          d3.selectAll(".july")
            .transition()
            .duration(500)
            .delay(500)
            .attr("x", function(d) {return x(d.date) + marginLeft})
            .attr("width", chartWidth / numJuly - 1)
          d3.selectAll(".july")
            .transition()
            .delay(function (d,i){ return 1000 + i * (500/31);})
            .attr("height", function(d) {return y(0) - y(d.new_cases) })
            .attr("y", function(d) {return y(d.new_cases) + marginTop});

          d3.selectAll(".bar")
            .on("mouseover", function(d) {
              if (currScene == "interactive") {
                d3.selectAll(".bar")
                  .classed("moused_over", false);
                d3.select(this)
                  .classed("moused_over", true);
                tooltip.transition()
                  .style("opacity", 1);
                var currData = d3.select(this).data()[0];
                tooltip.html("<p>" +
                             currData.date +
                             "</p>" +
                             "<p><strong>" +
                             currData.new_cases +
                             " new cases</strong></p>")
                tooltip.style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - 40) + "px")
              }
            }).on("click", function(d) {
              if (currScene == "interactive") {
                d3.selectAll(".bar")
                  .classed("moused_over", false);
                d3.selectAll(".bar")
                  .classed("current", false);
                d3.select(this)
                  .classed("current", true);
                newDate = d3.select(this).data()[0].date;
                updateDate(newDate);
                updateMap(newDate)
              }
            }).on("mouseout", function(d) {
              if (currScene == "interactive") {
                d3.selectAll(".bar")
                  .classed("moused_over", false);
                tooltip.transition()
                  .style("opacity", 0);
              }
            })

          d3.selectAll(".state")
            .on("mouseover", function(d) {
            if (currScene == "interactive") {
              tooltip.transition()
                  .style("opacity", 1);
              tooltip.html("<p>" + d.state + "</p>" +
                           "<p>Total cases: " + d.cases + "</p>")
              tooltip.style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY) + "px")
            }
          }).on("mouseout", function(d) {
            if (currScene == "interactive") {
                tooltip.transition()
                  .style("opacity", 0);
              }
          })
          updateMap("7/27/2020");
        }

        function setUpAxes() {
          // Set up bar chart axes.
          x = d3.scaleBand()
            .domain(us_data.map((us_data) => us_data.date))
            .range([0, chartWidth]);

          y = d3.scaleLinear().domain([0, yMax]).range([chartHeight, 0]);

          xAxis = d3.axisBottom(x).tickValues(
                x.domain().filter(function (d) {
                  return d.split("/")[1] == "1";
                }))

          bar_chart.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(" + marginLeft + "," + (marginTop + chartHeight) +")")
            .call(xAxis);

          yAxis = d3.axisLeft(y);

          bar_chart.append("g")
            .attr("class", "y_axis")
            .attr("transform", "translate(" + marginLeft + "," + marginTop + ")")
            .call(d3.axisLeft(y));
        }

        function setUpBars() {
          d3.select("#bar_chart").selectAll("rect")
            .data(us_data)
            .enter()
            .append("rect")
            .attr("width", chartWidth / us_data.length - 1)
            .attr("height", 0)
            .attr("x", function(d, i) {return x(d.date) + marginLeft})
            .attr("y", marginTop + chartHeight)
            .attr("class", 
                  function(d) {
                   let month = "january";
                   switch (d.date.split("/")[0]) {
                     case "2":
                       month = "february";
                       break;
                     case "3":
                       month = "march";
                       break;
                     case "4":
                       month = "april";
                       break;
                     case "5":
                       month = "may";
                       break;
                     case "6":
                       month = "june";
                       break;
                     case "7":
                       month = "july";
                       break;
                   }
                   return "bar " + month;
            })
            .attr("id", function(d) {return getId(d.date)});

        }




        /* Switch between scenes on scroll */
        function handleScrolling() {
          let scrollMax = (7 * $("#scroller").height()) / 8;
          let scrollCurr = $(window).scrollTop();
          if (scrollCurr < scrollMax / 7) {
            if (currScene != "february") {
              february();
              updateDate("2/29/2020");
            }
          } else if (scrollCurr < (2 * scrollMax) / 7) {
            if (currScene != "march") {
              march();
              updateDate("3/31/2020");
            }

          } else if (scrollCurr < (3 * scrollMax) / 7) {
            if (currScene != "april") {
              april();
              updateDate("4/30/2020");
            }
          } else if (scrollCurr < (4 * scrollMax) / 7) {
            if (currScene != "may") {
              may();
              updateDate("5/31/2020");
            }
          } else if (scrollCurr < (5 * scrollMax) / 7) {
            if (currScene != "june") {
              june();
              updateDate("6/30/2020");
            }
          } else if (scrollCurr < (6 * scrollMax) / 7) {
            if (currScene != "july") {
              july(); 
              updateDate("7/27/2020");
            }
          } else {
            if (currScene != "interactive") {
              interactive();
              updateDate("7/27/2020");
            }
          }
          updateMap(currDate);

          if (currScene == "interactive") {
            $("#date_container").css("display", "block");
          } else {
            $("#date_container").css("display", "none");
            d3.selectAll(".bar")
              .classed("current", false)
              .classed("moused_over", false);
          }
          tooltip.transition()
                  .style("opacity", 0);
          
           $("#text_and_viz_container").css("top", 
                                            (Math.max(0, $("#title_container").height() - scrollCurr + 60)) + "px");
        }
      });
    });
  });
});

function getId(datestring) {
  datePieces = datestring.split("/");
  return "_" + datePieces[0] + "_" + datePieces[1] + "_" + datePieces[2];
}

function updateDate(newDate) {
  currDate = newDate;
  d3.selectAll(".bar")
    .classed("current", false);
  d3.select("#" + getId(currDate))
    .classed("current", true);
  $("#curr_date").html("Currently Exploring: " + currDate);
}

var statePops = {};

function setUpMap(us, pops) {
  var projection = d3.geoAlbersUsa();
  var path = d3.geoPath().projection(projection);
  var svg = d3.select("#map");

  svg.selectAll("path")
    .data(us.features)
    .enter()
    .append("path")
    .attr("d", function(d) {return path(d.geometry)})
    .attr("id", function(d) {return d.properties.name.replace(" ", "")})
    .attr("class", "state")
    .attr("fill", "none")
    .attr("stroke", "black");

  for (var popInfo of pops) {
    statePops[popInfo["State"]] = parseInt(popInfo["Pop"]);
  }
  
  var totalCasesPerCapita = state_data.filter(function(d) { return d.date == "2020-07-27" &&
                                                            statePops[d.state] != null})
                          .map(function(d) {return d.cases / statePops[d.state]})
  maxTotalCases = Math.max(...totalCasesPerCapita)

}

function updateMap(date) {
  var dateToDisplay = reformatDate(date);
  var dataToDisplay = state_data.filter(function(d) {return d.date == dateToDisplay &&
                                                     statePops[d.state] != null});
  var caseCounts = dataToDisplay.map(function(d) { return parseInt(d.cases) });
  var casesPerCapita = dataToDisplay.map(function(d) { return parseInt(d.cases) / statePops[d.state]})
  
  var colorScale = d3.scaleLinear()
    .domain([0, maxTotalCases])
    .range(["#FAFAFA", "#FF3430"]);

  d3.selectAll(".state")
    .attr("fill", "#FAFAFA")
  for (var i = 0; i < dataToDisplay.length; i++) {
    stateData = dataToDisplay[i];
    cases = casesPerCapita[i];
    fillColor = colorScale(cases);
    d3.select("#" + stateData.state.replace(" ", ""))
      .attr("fill", fillColor)
      .data([{"state": stateData.state,"cases": caseCounts[i]}]);
  }
  
}

function reformatDate(date) {
  datePieces = date.split("/")
  month = datePieces[0];
  day = datePieces[1];
  year = datePieces[2];
  if (month.length == 1) {
    month = "0" + month
  }
  if (day.length == 1) {
    day = "0" + day
  }
  return year + "-" + month + "-" + day;
}


