/* I used this tutorial: https://flowingdata.com/2018/10/10/how-to-make-an-animated-pyramid-chart-with-d3-js/ */

var data;
var displayYear = 2000, isPlaying = false;
var barHeight = 20, barWidth = 380, centerOffset = 20;
var femaleScale = d3.scaleLinear().domain([0, 30000000]).range([0, -barWidth]);
var maleScale = d3.scaleLinear().domain([0,  30000000]).range([0, barWidth]);

/* Event handling */
function handleYearInputChange() {
  isPlaying = false;
  displayYear = +this.value;
  updateChart();
}

function handlePlayButtonClick() {
  isPlaying = !isPlaying;
}

function initializeEventHandlers() {
  d3.select("#year-input")
    .on("input", handleYearInputChange);

  d3.select("#play-button")
    .on("click", handlePlayButtonClick);
}

/* Initialization */
function initializeAxes() {
  let tickSize = 425;

  var axis = d3.axisBottom()
    .scale(maleScale)
    .tickSize(tickSize)
    .ticks(6)
    .tickFormat(function(d) {
      return (d / 1000000) + "M";
    });

  d3.select(".male.axis")
    .call(axis);

  axis.scale(femaleScale);
  d3.select(".female.axis")
    .call(axis);
}

function initializeAnimation() {
  window.setInterval(function() { // JS built-in function which sets up to a function at regular intervals
    if(!isPlaying) { // if isPlaying is true, the function increments displayYear and calls updateChart()
      return;
    }
    displayYear += 1;
    if(displayYear > 2023) {
      displayYear = 1980;
    }
    updateChart();
  }, 200);
}


/* Data handling */

function initializeData(csv) {
  data = csv.map(function(d) {
    return {
      year: +d.Year,
      age: d.age_bracket,
      region: d.Region,
      male_pop: +d.Male,
      female_pop: +d.Female
    }
  });
 
  data = data.filter(function(d) {
    return d.region == "Europe";
  });
}

function getYearData() {
  var yearData = data.filter(function(d) {
    return d.year === displayYear;
  });
  yearData = _.sortBy(yearData, function(d) {
    // Split the age range string by '-', keep the first number, remove any '+' symbols and convert to a number
    return +(d.age.split("-")[0].replace("+", ""));
  });
  yearData.reverse();
  return yearData;
}

/* D3 code */
function initBarGroup(d) { //adds two rect elements and a single text element
  d3.select(this)
    .append("rect")
    .attr("transform", "translate(-" + centerOffset + ",0)") // each rect will be translated centerOffset to the left or right to create space for the age range label
    .attr("height", barHeight - 1)
    .classed("female", true)
    .style("fill", "#a71930");

  d3.select(this)
    .append("rect")
    .attr("transform", "translate(" + centerOffset + ",0)")
    .attr("height", barHeight - 1)
    .classed("male", true)
    .style("fill", "#30ced8");

  d3.select(this)
    .append("text")
    .attr("y", 14)
    .classed("age label", true)
    .text(function(d) {
      return d.age
    });
}

function updateBarGroup(d) { //called whenever updateChart is called -> to set/update the widths of the bars
  d3.select(this)
    .select(".female")
    .attr("x", femaleScale(d.female_pop))
    .attr("width", -femaleScale(d.female_pop));

  d3.select(this)
    .select(".male")
    .attr("width", maleScale(d.male_pop));
}

function updateChart() {
  var yearData = getYearData(); // calls getYearData for the selected year
 
  var u = d3.select(".bars") // adds a g element for each age range
    .selectAll("g.bar-group")
    .data(yearData);
 
  u.enter() 
    .append("g")
    .classed("bar-group", true) // transforms each g down the page by barHeight
    .attr("transform", function(d, i) {
      return "translate(0," + i * barHeight + ")";
    })
    .each(initBarGroup) // calling initBarGroup on each element in the selection -> each time it's called, the current datum is passed in and "this" is set to the current element
    .merge(u)
    .each(updateBarGroup);
   
  u.exit()
    .remove();

  // Update main title
  d3.select(".title")
    .text("Europe's Population by Age and Gender (" + displayYear + ")");

  // Update slider
  d3.select("#year-input")
    .node().value = displayYear;
}

d3.csv("data/third_dataset.csv", function(err, csv) {
  initializeData(csv);
  // console.log(data);
  // console.log(getYearData());
  initializeEventHandlers();
  initializeAnimation();
  initializeAxes();
  updateChart();
});