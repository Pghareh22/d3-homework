// Section 1: 

// Grab the width of the containing box
let width = parseInt(d3.select("#scatter").style("width"));

// Designate the height of the graph nad margins
let height = width - width / 3.9;
let margin = 20;
let labelArea = 110;
let tPadBot = 40;
let tPadLeft = 40;

// svg area
let svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// Set the radius for each dot that will appear in the graph.

let circRadius;
function crGet() {
  if (width <= 530) {
    circRadius = 5;
  }
  else {
    circRadius = 10;
  }
}
crGet();

// The Labels for our Axes

// A) Bottom Axis

// create a group element to nest our bottom axes labels.
svg.append("g").attr("class", "xText");
// xText will allows us to select the group without excess code.
let xText = d3.select(".xText");

// give xText a transform property that places it at the bottom of the chart.
// By nesting this attribute in a function, we can easily change the location of the label group
// whenever the width of the window changes.
function xTextRefresh() {
  xText.attr(
    "transform","translate(" +((width - labelArea) / 2 + labelArea) +", " +(height - margin - tPadBot) +")"
  );
}
xTextRefresh();

// append the text.
// 1. Poverty
xText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");
// 2. Age
xText
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");
// 3. Income
xText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");

// B) Left Axis

let leftTextX = margin + tPadLeft;
let leftTextY = (height + labelArea) / 2 - labelArea;

// We add a second label group, this time for the axis left of the chart.
svg.append("g").attr("class", "yText");

// yText will allows us to select the group without excess code.
let yText = d3.select(".yText");

// nest the group's transform attr in a function to make changing it on window change an easy operation.
function yTextRefresh() {
  yText.attr("transform","translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)");
}
yTextRefresh();

// append the text.
// 1. Obesity
yText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");

// 2. Smokes
yText
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

// 3. Lacks Healthcare
yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

// 2. Import our .csv file.

d3.csv("assets/data/data.csv").then(function(data) {
  // Visualize the data
  visualize(data);
});

// 3. Create our visualization function

// "visualize" function handles the visual manipulation of all elements dependent on the data.
function visualize(theData) {
  
  // defaults axis
  let currentX = "poverty";
  let currentY = "obesity";

  // save empty variables for the min and max values of x and y.
  
  let xMin;
  let xMax;
  let yMin;
  let yMax;

  //  tooltip 
  let toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {
      console.log(d)
      // x key

      let theX;
      let theState = "<div>" + d.state + "</div>";
      let theY = "<div>" + currentY + ": " + d[currentY] + "%</div>";
      
      if (currentX === "poverty") {
        theX = "<div>" + currentX + ": " + d[currentX] + "%</div>";
      }
      else {
        
        theX = "<div>" + currentX + ": " + parseFloat(d[currentX]) + "</div>";
      }
      
      return theState + theX + theY;
    });
  // Call the toolTip function.
  svg.call(toolTip);

  // PART 2
  

  // a. change the min and max for x
  function xMinMax() {
    xMin = d3.min(theData, function(d) {
      return parseFloat(d[currentX]) * 0.90;
    });

    xMax = d3.max(theData, function(d) {
      return parseFloat(d[currentX]) * 1.10;
    });
  }

  // b. change the min and max for y
  function yMinMax() {
    yMin = d3.min(theData, function(d) {
      return parseFloat(d[currentY]) * 0.90;
    });

    yMax = d3.max(theData, function(d) {
      return parseFloat(d[currentY]) * 1.10;
    });
  }

  // c. change the classes (and appearance) of label text when clicked.
  function labelChange(axis, clickedText) {
    // Switch the currently active to inactive.
    d3
      .selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    // Switch the text just clicked to active.
    clickedText.classed("inactive", false).classed("active", true);
  }

  // Part 3: Instantiate the Scatter Plot
  
  //Grab the min and max values of x and y.
  xMinMax();
  yMinMax();

  // Define x and y scales.
  
  let xScale = d3.scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]);
  let yScale = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height - margin - labelArea, margin]);

  // create the axes.
  
  let xAxis = d3.axisBottom(xScale);
  let yAxis = d3.axisLeft(yScale);

  // Determine x and y tick counts based on page width
  function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    }
    else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }
  tickCount();

  // Append the axes in group elements.
  
  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  // Create the circlesGroup
  let circlesGroup = svg.selectAll("g ")
  .data(theData)
  .enter();

  
  circlesGroup
    .append("circle")
    .attr("cx", function(d) {
      return xScale(d[currentX]);
    })
    .attr("cy", function(d) {
      return yScale(d[currentY]);
    })
    .attr("r", circRadius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    

  // Place the state abbreviations in the center of dots.
  circlesGroup
    .append("text")
    .text(function(d) {
      return d.abbr;
    })
    
    .attr("dx", function(d) {
      return xScale(d[currentX]);
    })
    .attr("dy", function(d) {
      return yScale(d[currentY]) + circRadius / 2.5;
    })
    .attr("font-size", circRadius)
    .attr("class", "stateText")
    // Hover Rules
    .on("mouseover", function(d) {
      toolTip.show(d, this);
      // Highlight the state circle's border
      d3.select(this).style("stroke", "black");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select(this).style("stroke", "none");
    });

  // Part 4: Make the Graph Dynamic

  // Select all axis text and add this d3 click event.
  d3.selectAll(".aText").on("click", function() {
    let self = d3.select(this);

    if (self.classed("inactive")) {
      // Grab the name and axis saved in label.
      let axis = self.attr("data-axis");
      let name = self.attr("data-name");

      // When x is the saved axis, execute this:
      if (axis === "x") {
        currentX = name;
        // Change the min and max of the x-axis
        xMinMax();

        // Update the domain of x.
        xScale.domain([xMin, xMax]);

        // update the xAxis.
        svg.select(".xAxis").transition().duration(400).call(xAxis);

        // update the location of the state circles.
        d3.selectAll("circle").each(function() {
          
          d3.select(this)
            .transition().attr("cx", function(d) {return xScale(d[currentX]); })
            .duration(300);
        });

        // change the location of the state texts, too.
        d3.selectAll(".stateText").each(function() {
          
          d3.select(this).transition().attr("dx", function(d) {
              return xScale(d[currentX]);
            })
            .duration(300);
        });

        // change the classes of the last active label and the clicked label.
        labelChange(axis, self);
      }
      else {
        // When y is the saved axis, execute this:
        // Make currentY the same as the data name.
        currentY = name;

        // Change the min and max of the y-axis.
        yMinMax();

        // Update the domain of y.
        yScale.domain([yMin, yMax]);

        // Update Y Axis
        svg.select(".yAxis").transition().duration(300).call(yAxis);

        // update the location of the state circles.
        d3.selectAll("circle").each(function() {
          // Each state circle gets a transition for it's new attribute.

          d3 .select(this).transition().attr("cy", function(d) {
              return yScale(d[currentY]);
            })
            .duration(400);
        });

        // change the location of the state texts
        d3.selectAll(".stateText").each(function() {
          //give each state text the same motion tween as the matching circle.
          d3.select(this).transition().attr("dy", function(d) {
              return yScale(d[currentY]) + circRadius / 3;
            })
            .duration(400);
        });

        // change the classes of the last active label and the clicked label.
        labelChange(axis, self);
      }
    }
  });

  // Part 5: Mobile Responsive
  d3.select(window).on("resize", resize);

  function resize() {
    // Redefine the width, height and leftTextY 
    width = parseInt(d3.select("#scatter").style("width"));
    height = width - width / 3.9;
    leftTextY = (height + labelArea) / 2 - labelArea;

    // Apply the width and height to the svg canvas.
    svg.attr("width", width).attr("height", height);

    // Change the xScale and yScale ranges
    xScale.range([margin + labelArea, width - margin]);
    yScale.range([height - margin - labelArea, margin]);

    // update the axes (and the height of the x-axis)
    svg
      .select(".xAxis")
      .call(xAxis)
      .attr("transform", "translate(0," + (height - margin - labelArea) + ")");

    svg.select(".yAxis").call(yAxis);

    // Update the ticks on each axis.
    tickCount();

    // Update the labels.
    xTextRefresh();
    yTextRefresh();

    // Update the radius of each dot.
    crGet();

    // update the location and radius of the state circles.
    d3
      .selectAll("circle")
      .attr("cy", function(d) {
        return yScale(d[currentY]);
      })
      .attr("cx", function(d) {
        return xScale(d[currentX]);
      })
      .attr("r", function() {
        return circRadius;
      });

    // change the location and size of the state texts
    d3
      .selectAll(".stateText")
      .attr("dy", function(d) {
        return yScale(d[currentY]) + circRadius / 3;
      })
      .attr("dx", function(d) {
        return xScale(d[currentX]);
      })
      .attr("r", circRadius / 3);
  }
}