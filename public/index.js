function print_hello_world() {
  console.log("Hello World!");
}

// Set margins and dimensions for the vis
const margin = { top: 100, right: 75, bottom: 100, left: 50 };
const width = window.innerWidth - 200 - margin.left - margin.right;
const height = window.innerHeight - 100 - margin.top - margin.bottom;

// Create an SVG element
const svg = d3
  .select("#svgRoot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let vis = null;
let data = null;
let kmeanData = null;
let clusterHighlight = [false, false, false, false];
var initialTransform = null;

const socket = io();

socket.on("connect", () => {
  console.log("Connected to the webserver.");
});
socket.on("disconnect", () => {
  console.log("Disconnected from the webserver.");
});

//Initialize vis, starting with the bar chart
socket.on("init", (visData) => {
  vis = visData.vis;
  data = visData.data;
  console.log(data);
  createVis(vis, data);
});

//After pressing one button the vis get created new
socket.on("switch-vis", (visData) => {
  console.log("Switch to " + vis);
  vis = visData.vis;
  data = visData.data;
  console.log(data);
  createVis(vis, data);
});

// Button Handler
document.getElementById("id_vis_1_designer").addEventListener("click", () => {
  clearVis5 ()
  socket.emit("vis_1_designer");
  document.getElementById("divCheckbox").style.display = "none";
  removeVis_3();
  console.log("Vis 1");
});

document
  .getElementById("id_vis_2_minage_minplaytime")
  .addEventListener("click", () => {
    clearVis5 ()
    socket.emit("vis_2_minage_minplaytime");
    document.getElementById("divCheckbox").style.display = "none";
    removeVis_3();
    console.log("Vis 2");
  });

document.getElementById("id_vis_3_lda").addEventListener("click", () => {
  removeVis_3();
  clearVis5 ()
  socket.emit("vis_3_lda");
  document.getElementById("divCheckbox").style.display = "none";
  console.log("Vis 3");
});

document.getElementById("id_vis_4_kmeans").addEventListener("click", () => {
  removeVis_3();
  clearVis5 ()
  socket.emit("vis_4_kmeans");
  document.getElementById("cluster1").checked = false;
  document.getElementById("cluster2").checked = false;
  document.getElementById("cluster3").checked = false;
  document.getElementById("cluster4").checked = false;
  document.getElementById("divCheckbox").style.display = "flex";
  console.log("Vis 4");
});

document.getElementById("id_vis_5_compare").addEventListener("click", () => {
  clearVis5 ()
  socket.emit("vis_5_compare");
  document.getElementById("divCheckbox").style.display = "none";
  removeVis_3();
  document.getElementById("node_select1").style.display = "flex";
  document.getElementById("node_select2").style.display = "flex";
  document.getElementById("node_select3").style.display = "flex";
  document.getElementById("node_select4").style.display = "flex";
  console.log("Vis 4");
});

document.getElementById("cluster1").addEventListener("change", (event) => {
  if (event.target.checked) {
    clusterHighlight[0] = true;
  } else {
    clusterHighlight[0] = false;
  }
  highlightVis_4(kmeanData, clusterHighlight);
});

document.getElementById("cluster2").addEventListener("change", (event) => {
  if (event.target.checked) {
    clusterHighlight[1] = true;
  } else {
    clusterHighlight[1] = false;
  }
  highlightVis_4(kmeanData, clusterHighlight);
});

document.getElementById("cluster3").addEventListener("change", (event) => {
  if (event.target.checked) {
    clusterHighlight[2] = true;
  } else {
    clusterHighlight[2] = false;
  }
  highlightVis_4(kmeanData, clusterHighlight);
});

document.getElementById("cluster4").addEventListener("change", (event) => {
  if (event.target.checked) {
    clusterHighlight[3] = true;
  } else {
    clusterHighlight[3] = false;
  }
  highlightVis_4(kmeanData, clusterHighlight);
});

/**
 * Function to call the fitting function for each vis
 * @param {String} vis     Indentifier wich vis should be visible
 * @param {Array} data     Dataset of the 40 board games
 */
function createVis(vis, data) {
  if (vis === "vis_1_designer") {
    createVis_1(data);
  } else if (vis === "vis_2_minage_minplaytime") {
    createVis_2(data);
  } else if (vis === "vis_3_lda") {
    createVis_3(data);
  } else if (vis === "vis_4_kmeans") {
    createVis_4(data);
  } else if (vis === "vis_5_compare") {
    createVis_5(data);
  }
}

/**
 * Function to create the bar chart
 * @param {Array} data     Dataset of the 40 board games
 */
function createVis_1(data) {
  //Clear the data, we only need the name and amount for vis 1
  let vis1_data = [];

  data.forEach((element) => {
    //Every designer...
    element.credit.designer.forEach((designer) => {
      //if their name is already in an object in dataD, increase the amount
      if (vis1_data.find((date) => date.name === designer.name)) {
        let d = vis1_data.find((date) => date.name === designer.name);
        d.amount = d.amount + 1;
      } else {
        //else add new object to dataD
        vis1_data.push({ name: designer.name, amount: 1 });
      }
    });
  });

  //Clear the svg part for the new data
  svg.selectAll("*").remove();

  //Define scales
  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(vis1_data.map((d) => d.name))
    .padding(0.5);

  const y = d3
    .scaleLinear()
    .range([height, 0])
    .domain([
      0,
      d3.max(vis1_data, function (d) {
        return d.amount;
      }) + 1,
    ]);

  //create axes
  const xAxis = d3.axisBottom(x);

  const yAxis = d3.axisLeft(y);

  //Add x axe (without label)
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  //make the names of designers readable
  svg
    .selectAll("text")
    .attr("font-size", "12px")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  //Add label to x axe
  svg
    .select("g")
    .append("text")
    .attr("fill", "#000")
    .attr("x", +width + 50)
    .attr("y", -0)
    .attr("text-anchor", "end")
    .text("Designer");

  //Add y axe (including label)
  svg
    .append("g")
    .call(yAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Amount published games");

  //Adding the bars to the chart
  svg
    .selectAll(".bar")
    .data(vis1_data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.name))
    .attr("y", (d) => y(d.amount))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.amount));

  //Adding title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Number of Games by Designer");
}

/**
 * Function to ccreate the scatterplot
 * @param {Array} data     Dataset of the 40 board games
 */
function createVis_2(data) {
  let vis2_data = [];
  for (let i = 0; i < data.length; i++) {
    vis2_data.push({
      title: data[i].title,
      minage: data[i].minage,
      minplaytime: data[i].minplaytime,
    });
  }

  //Clear the svg part for the new data
  svg.selectAll("*").remove();

  // Define scales for x and y axes
  const x = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(vis2_data, function (d) {
        return d.minage;
      }) + 2,
    ])
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(vis2_data, function (d) {
        return d.minplaytime;
      }) + 30,
    ])
    .range([height, 0]);

  //Add jitter to avoid overlapping
  const jitter_x = 0.3;
  const jitter_y = 10;
  var xJitter = d3.randomUniform(-jitter_x, jitter_x);
  var yJitter = d3.randomUniform(-jitter_y, jitter_y);

  // Create x and y axes
  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);

  // Add the axes to the plot (including lables)
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("x", width - 10)
    .attr("y", -10)
    .style("text-anchor", "end")
    .text("Min Age");

  svg
    .append("g")
    .call(yAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("x", -10)
    .attr("y", 10)
    .style("text-anchor", "end")
    .text("Min Playtime");

  // Add data points to the plot
  svg
    .selectAll("circle")
    .data(vis2_data)
    .enter()
    .append("circle")
    .attr("r", 3)
    .attr("cx", function (d) {
      return x(d.minage) + xJitter();
    })
    .attr("cy", function (d) {
      return y(d.minplaytime) + yJitter();
    });

  //Add title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Relationship between minimum age and minimum playtime.");
}

/**
 * Function to create the scatterplot matrix with features as classes
 * Features are mechanics or categories depending on current code implementation
 * @param {Array} data     Dataset of the 100 board games
 */
function createVis_3(data) {
  /**
   * Based on the example function given in project 2
   * @param {Array} NumberData An array of arrays of data attributes
   * @param {Array} classes an array of classes for each array in NumberData
   * @param {*} dimensions the amount of desired dimensions
   * @returns
   */
  function LDA(NumberData, classes, dimensions) {
    const X = druid.Matrix.from(NumberData); // X is the data as object of the Matrix class.

    //https://saehm.github.io/DruidJS/LDA.html
    const reductionLDA = new druid.LDA(X, { labels: classes, d: dimensions }); //2 dimensions, can use more.
    const result = reductionLDA.transform();

    // console.log(result.to2dArray) //convenience method: https://saehm.github.io/DruidJS/Matrix.html
    return result.to2dArray;
  }

  svg.selectAll("*").remove();

  var obj = data;

  //Size of a scatterplot in the scatterplot matrix
  const w = 200;
  const h = 200;

  //Data stuff
  //remove Outlier
  obj.splice(78, 1);

  //Create list of feature ids
  var categoryIds = [];
  // var solID = 2819
  obj.forEach((element) => {
    element.types.mechanics.forEach((c) => {
      if (!categoryIds.find((category) => category === c.name)) {
        categoryIds.push(c.id);
      }
    });
  });

  //For the first 3 categories create the scatterplot matrix
  categoryIds.forEach((id, index) => {
    categoryIds.forEach((cid, cindex) => {
      if (index != cindex && index < 3 && cindex < 3) {
        // console.log("ID:" + id + " CID:" + cid)
        update(id, cid, obj, false, index, cindex);
      } else if (index < 3 && cindex < 3) {
        //If the ids are the same, we want to additionally create a dropdown for that feature
        // console.log("ID:" + id + " CID:" + cid)
        update(id, id, obj, true, index, cindex);
      }
    });
  });

  var legendW = (w + margin.left + margin.right) * 3 + 140;

  var legendArea = svg
    .append("g")
    .attr("transform", "translate(" + legendW + "," + 0 + ")");

  legendArea
    .append("text")
    .attr("y", -40)
    .attr("text-anchor", "start")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Legend of Color Mappings");

  legendArea
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 6)
    .style("fill", "#008000");
  legendArea
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 30)
    .attr("r", 6)
    .style("fill", "#0000FF");
  legendArea
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 60)
    .attr("r", 6)
    .style("fill", "#00FFFF");
  legendArea
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 90)
    .attr("r", 6)
    .style("fill", "#FF0000");
  legendArea
    .append("text")
    .attr("x", 20)
    .attr("y", 3)
    .text("Belongs to Y-axis class");
  legendArea
    .append("text")
    .attr("x", 20)
    .attr("y", 33)
    .text("Belongs to X-axis class");
  legendArea
    .append("text")
    .attr("x", 20)
    .attr("y", 63)
    .text("Belongs to X-axis and Y-axis class");
  legendArea
    .append("text")
    .attr("x", 20)
    .attr("y", 93)
    .text("Belongs to neither class");

  /**
   * Draws a scatterplot in the scatterplot matri
   * @param {Number} categoryID the id of the feature on the x-axis
   * @param {Number} categoryID2 the id of the feature on the y-axis
   * @param {Array} obj Array of data to include in the scatterplot
   * @param {Boolean} init Whether or not a dropdown should be created
   * @param {Number} matrixX x-coordinate in the matrix. 0/0 is top right
   * @param {Number} matrixY y-coordinate in the matrix. 0/0 is top right
   */
  function update(categoryID, categoryID2, obj, init, matrixX, matrixY) {
    var mechanics = [];
    obj.forEach((e) => e.types.mechanics.forEach((c) => mechanics.push(c)));

    //Data Preprocessing for LDA

    var NumberData = []; //Will contain data used for LDA
    var classes = []; //Will contain classed used in LDA
    var categoryNames = []; //Will contain the name of every category

    obj.forEach((element) => {
      let numbers = [];

      numbers.push(element.minplayers);
      numbers.push(element.minplaytime);
      numbers.push(element.maxplayers);
      numbers.push(element.maxplaytime);
      numbers.push(element.rating.rating);
      numbers.push(element.rating.num_of_reviews);
      numbers.push(element.minage);

      //See to which class each game belongs
      /**
       * Classes:
       * a - Only belongs to the x-axis category
       * b - Belongs to neither the x-axis nor the y-axis category
       * c - Only belongs to the y-axis category
       * d - belongs to both the x-axis and y-axis category
       */
      var categoryFound,
        catA,
        catC = false;
      element.types.mechanics.forEach((c) => {
        if (!categoryNames.find((category) => category === c.name)) {
          categoryNames.push(c.name);
        }
        if (c.id == categoryID) {
          catA = true;
          categoryFound = true;
        } else if (c.id == categoryID2) {
          catC = true;
          categoryFound = true;
        }
      });
      if (!categoryFound) {
        classes.push("b");
      } else if (catC && catA) {
        classes.push("d");
      } else if (catC) {
        classes.push("c");
      } else {
        classes.push("a");
      }
      NumberData.push(numbers);
    });

    NumberData.forEach((datapoint, dataindex) => {
      let l = datapoint.length;
      datapoint[l] = 0;
      categoryNames.forEach((category, index) => {
        obj[dataindex].types.mechanics.forEach((c) => {
          if (c.name == category) {
            datapoint[l] = datapoint[l] + index * 2;
          }
        });
      });
    });

    var ldaResult = LDA(NumberData, classes, 2);

    //Take result from lda result and save it together with class information
    let vis3_data = ldaResult.map((e, i) => {
      let minage = e[0];
      let minplaytime = e[1];
      let category = classes[i];
      return { minage, minplaytime, category, rankId: i };
    });

    //SVG Stuff

    //Offsets for scatterplots in matrix
    let offsetX =
      matrixX * (h + margin.right / 4 + margin.left / 4) + margin.left + 140;
    let offsetY =
      matrixY * (w + margin.bottom / 4 + margin.top / 4) + margin.top;

    //Add new g with id for new scatterplot
    let svg = d3
      .select("#svgRoot")
      .append("g")
      .attr("transform", "translate(" + offsetX + "," + offsetY + ")")
      .attr("id", "plot" + matrixX + matrixY);

    // Define scales for x and y axes
    const x = d3
      .scaleLinear()
      .domain([
        d3.min(vis3_data, function (f) {
          return f.minage;
        }) - 1,
        d3.max(vis3_data, function (d) {
          return d.minage;
        }) + 1,
      ])
      .range([0, w]);
    // console.log("TEST")
    const y = d3
      .scaleLinear()
      .domain([
        d3.min(vis3_data, function (f) {
          return f.minplaytime;
        }) - 1,
        d3.max(vis3_data, function (d) {
          return d.minplaytime;
        }) + 1,
      ])
      .range([h, 0]);

    //Add jitter to avoid overlapping
    const jitter_x = 0.3;
    const jitter_y = 10;
    var xJitter = d3.randomUniform(-jitter_x, jitter_x);
    var yJitter = d3.randomUniform(-jitter_y, jitter_y);

    // Create x and y axes
    const xAxis = d3.axisBottom(x).tickFormat("");
    const yAxis = d3.axisLeft(y).tickFormat("");

    // Add the axes to the plot
    svg
      .append("g")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);
    svg.append("g").call(yAxis);

    // Add data points to the plot
    /**
     * Color explanation
     * blue - Only belongs to the x-axis category
     * red - Belongs to neither the x-axis nor the y-axis category
     * green - Only belongs to the y-axis category
     * pink - belongs to both the x-axis and y-axis category
     */
    svg
      .selectAll("FILLER")
      .data(vis3_data)
      .enter()
      .append("circle")
      .attr("r", 3)
      .attr("cx", function (d) {
        return x(d.minage) + xJitter();
      })
      .attr("cy", function (d) {
        return y(d.minplaytime) + yJitter();
      })
      .attr("fill", function (d) {
        if (d.category == "a") {
          return "blue";
        } else if (d.category == "b") {
          return "red";
        } else if (d.category == "c") {
          return "green";
        } else {
          return "cyan";
        }
      })
      .attr("stroke", "black");

    //Create dropdowns
    if (init) {
      d3.select(".buttons")
        .append("select")
        .attr("id", "selectX" + matrixX)
        .selectAll("myOptions")
        .data(categoryNames)
        .enter()
        .append("option")
        .property("value", function (d) {
          return d;
        })
        .property("selected", function (d) {
          return d === categoryNames[matrixX];
        })
        .attr("height", h - 100)
        .text(function (d) {
          return d;
        });

      //ChangeListener for dropdowns to update scatterplot matrix accordingly
      d3.select("#selectX" + matrixX).on("change", function (event, d) {
        const selectedOption = d3.select(this).property("value");
        // run the updateChart function with this selected option
        let id = obj
          .find((o) => {
            return o.types.mechanics.find((c) => c.name === selectedOption);
          })
          .types.mechanics.find((c) => c.name === selectedOption).id;
        // console.log("HIER KOMMT")
        // console.log(id)
        //Clear the svg part for the new data
        svg.selectAll("*").remove();

        for (let index = 0; index < 3; index++) {
          d3.select("#plot" + matrixX + index).remove();
          d3.select("#plot" + index + matrixY).remove();

          if (matrixX == index && matrixY == index) {
            update(id, id, obj, false, matrixX, index);
          } else {
            update(
              id,
              mechanics.find(
                (c) =>
                  c.name === d3.select("#selectX" + index).property("value")
              ).id,
              obj,
              false,
              matrixX,
              index
            );
            update(
              mechanics.find(
                (c) =>
                  c.name === d3.select("#selectX" + index).property("value")
              ).id,
              id,
              obj,
              false,
              index,
              matrixY
            );
          }
        }
      });
    }
    //Add x-axis title
    if (matrixY == 0) {
      //Not longer than 17 to display properly
      let string = "";
      let target = mechanics.find((c) => c.id == categoryID).name;
      if (target.length > 17) {
        string = target.slice(0, 14) + "...";
      } else {
        string = target;
      }

      svg
        .append("text")
        .attr("x", w / 2)
        .attr("y", -40)
        .attr("class", "matrixText")
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text(string);
    }
    //Add Y-Axis-Title
    if (matrixX == 0) {
      //Not longer than 17 to display properly
      let string = "";
      let target = mechanics.find((c) => c.id == categoryID2).name;
      if (target.length > 17) {
        string = target.slice(0, 14) + "...";
      } else {
        string = target;
      }

      svg
        .append("text")
        .attr("class", "matrixText")
        .attr("id", "sideplot" + matrixY)
        .attr("x", 0)
        .attr("dx", -100)
        .attr("y", h / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text(string);
    }
  }
}

/**
 * Removes all elements added by visualization 3
 */
function removeVis_3() {
  for (let index = 0; index < 3; index++) {
    d3.select("#plot" + 0 + index).remove();
    d3.select("#plot" + 1 + index).remove();
    d3.select("#plot" + 2 + index).remove();
    d3.select("#selectX" + index).remove();
  }
}

function createVis_4(data) {
  let vis4_data = [];
  for (let i = 0; i < data.length; i++) {
    avg_playtime = (data[i].minplaytime + data[i].maxplaytime) / 2;
    vis4_data.push({
      x: data[i].rating.num_of_reviews,
      y: avg_playtime,
      cluster: 0,
    });
  }
  console.log(vis4_data);

  kmeans(vis4_data, elbow(vis4_data));

  kmeanData = vis4_data;
  clusterHighlight = [false, false, false, false];

  svg.selectAll("*").remove();

  // Define scales for x and y axes
  const x = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(vis4_data, function (d) {
        return d.x;
      }) + 1000,
    ])
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(vis4_data, function (d) {
        return d.y;
      }) + 30,
    ])
    .range([height, 0]);

  // Create x and y axes
  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);

  // Add the axes to the plot (including lables)
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("x", width - 10)
    .attr("y", -10)
    .style("text-anchor", "end")
    .text("Number of Reviews");

  svg
    .append("g")
    .call(yAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("x", -10)
    .attr("y", 10)
    .style("text-anchor", "end")
    .text("Average Playtime");

  // Color scale: give me a specie name, I return a color
  var color = d3
    .scaleOrdinal()
    .domain([1, 2, 3, 4, 90, 99])
    .range(["blue", "orange", "cyan", "green", "pink", "red"]);

  // Add data points to the plot
  svg
    .selectAll("circle")
    .data(vis4_data)
    .enter()
    .append("circle")
    .attr("r", 3)
    .attr("cx", function (d) {
      return x(d.x);
    })
    .attr("cy", function (d) {
      return y(d.y);
    })
    .style("fill", function (d) {
      return color(d.cluster);
    });

  //Add title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Relationship between number of reviews and average playtime.");
}

function highlightVis_4(data, clusterHighlight) {
  svg.selectAll("*").remove();

  // Define scales for x and y axes
  const x = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return d.x;
      }) + 1000,
    ])
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return d.y;
      }) + 30,
    ])
    .range([height, 0]);

  // Create x and y axes
  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);

  // Add the axes to the plot (including lables)
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("x", width - 10)
    .attr("y", -10)
    .style("text-anchor", "end")
    .text("Number of Reviews");

  svg
    .append("g")
    .call(yAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("x", -10)
    .attr("y", 10)
    .style("text-anchor", "end")
    .text("Average Playtime");

  //Colors depending on Highlights
  if (
    !clusterHighlight[0] &&
    !clusterHighlight[1] &&
    !clusterHighlight[2] &&
    !clusterHighlight[3]
  ) {
    color_cluster1 = "blue";
    color_cluster2 = "orange";
    color_cluster3 = "cyan";
    color_cluster4 = "green";
  } else {
    color_cluster1 = "#e4ddd2";
    color_cluster2 = "#e4ddd2";
    color_cluster3 = "#e4ddd2";
    color_cluster4 = "#e4ddd2";

    if (clusterHighlight[0]) {
      color_cluster1 = "blue";
    }
    if (clusterHighlight[1]) {
      color_cluster2 = "orange";
    }
    if (clusterHighlight[2]) {
      color_cluster3 = "cyan";
    }
    if (clusterHighlight[3]) {
      color_cluster4 = "green";
    }
  }

  // Color scale: give me a specie name, I return a color
  var color = d3
    .scaleOrdinal()
    .domain([1, 2, 3, 4, 90, 99])
    .range([
      color_cluster1,
      color_cluster2,
      color_cluster3,
      color_cluster4,
      "pink",
      "red",
    ]);

  // Add data points to the plot
  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 3)
    .attr("cx", function (d) {
      return x(d.x);
    })
    .attr("cy", function (d) {
      return y(d.y);
    })
    .style("fill", function (d) {
      return color(d.cluster);
    });

  //Add title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Relationship between number of reviews and average playtime.");
}

function createVis_5(data) {
  vis5_data = [];
  for (let i = 0; i < data.length; i++) {
    vis5_data.push({
      title: data[i].title,
      id: data[i].id,
      recommendations: data[i].recommendations.fans_liked,
    });
  }

  svg.selectAll("*").remove();

  const select1 = d3.select("#node_select1")
  const select2 = d3.select("#node_select2")
  const select3 = d3.select("#node_select3")
  const select4 = d3.select("#node_select4")

  dropdown_data = [...vis5_data]
  dropdown_data.unshift({title: "placeholder", id: 0, recommendations: []})

  select1.append("option").attr("value", "default").text("---choose a game---");

  select1
    .selectAll("option")
    .data(dropdown_data)
    .enter()
    .append("option")
    .attr("value", (d) => d.id)
    .text((d) => d.title)
    .sort((a, b) => d3.ascending(a.title, b.title));

  select2.append("option").attr("value", "default").text("---choose a game---");

  select2
    .selectAll("option")
    .data(dropdown_data)
    .enter()
    .append("option")
    .attr("value", (d) => d.id)
    .text((d) => d.title)
    .sort((a, b) => d3.ascending(a.title, b.title));

  select3.append("option").attr("value", "default").text("---choose a game---");

  select3
    .selectAll("option")
    .data(dropdown_data)
    .enter()
    .append("option")
    .attr("value", (d) => d.id)
    .text((d) => d.title)
    .sort((a, b) => d3.ascending(a.title, b.title));

  select4.append("option").attr("value", "default").text("---choose a game---");

  select4
    .selectAll("option")
    .data(dropdown_data)
    .enter()
    .append("option")
    .attr("value", (d) => d.id)
    .text((d) => d.title)
    .sort((a, b) => d3.ascending(a.title, b.title));

  select1.on("change", handleNodeSelect);
  select2.on("change", handleNodeSelect);
  select3.on("change", handleNodeSelect);
  select4.on("change", handleNodeSelect);

  const linksData = [];
  vis5_data.forEach((node) => {
    const source = node.id;
    const recommendations = node.recommendations;
    if (recommendations) {
      recommendations.forEach((target) => {
        linksData.push({ source, target });
      });
    }
  });

  // Function to handle the node selection
  function handleNodeSelect() {
    const selectedNodeId1 = select1.property("value");
    const selectedNodeId2 = select2.property("value");
    const selectedNodeId3 = select3.property("value");
    const selectedNodeId4 = select4.property("value");

    // Define tooltip constants
    const tooltipWidth = 300
    const tooltipHeight = 30
    const tooltipPadding = 5

    // Create a tooltip element
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
     .style("opacity", 0)
      .style("position", "absolute")
     .style("pointer-events", "none")
     .style("background-color", "rgba(0, 0, 0, 0.8)")
     .style("color", "#fff")
      .style("padding", `${tooltipPadding}px`)
     .style("width", `${tooltipWidth}px`)
     .style("height", `${tooltipHeight}px`)
     .style("text-align", "center");

    if (
      selectedNodeId1 == "default" &&
      selectedNodeId2 == "default" &&
      selectedNodeId3 == "default" &&
      selectedNodeId4 == "default"
    ) {
      filteredLinksData = linksData;
      filteredNodesData = vis5_data;
    } else {
      // Filter the links to include only the ones connected to the selected node
      filteredLinksData = linksData.filter(
        (link) =>
          link.source.id == selectedNodeId1 ||
          link.source.id == selectedNodeId2 ||
          link.source.id == selectedNodeId3 ||
          link.source.id == selectedNodeId4 ||
          (link.target.id == selectedNodeId1 && link.target.recommendations.find(root => root == link.source.id)) ||
          (link.target.id == selectedNodeId2 && link.target.recommendations.find(root => root == link.source.id)) ||
          (link.target.id == selectedNodeId3 && link.target.recommendations.find(root => root == link.source.id)) ||
          (link.target.id == selectedNodeId4 && link.target.recommendations.find(root => root == link.source.id))
      )


      // Filter the nodes to include the selected node and its connected nodes
      filteredNodesData = vis5_data.filter(
        (node) =>
          node.id == selectedNodeId1 ||
          node.id == selectedNodeId2 ||
          node.id == selectedNodeId3 ||
          node.id == selectedNodeId4 ||
          filteredLinksData.some((link) => link.target.id == node.id)
      )
    }

    select1.selectAll("option")
    .attr("disabled", (d) => d.id == selectedNodeId2 || d.id == selectedNodeId3 || d.id == selectedNodeId4 ? "disabled" : null)
    select2.selectAll("option")
    .attr("disabled", (d) => d.id == selectedNodeId1 || d.id == selectedNodeId3 || d.id == selectedNodeId4 ? "disabled" : null)
    select3.selectAll("option")
    .attr("disabled", (d) => d.id == selectedNodeId1 || d.id == selectedNodeId2 || d.id == selectedNodeId4 ? "disabled" : null)
    select4.selectAll("option")
    .attr("disabled", (d) => d.id == selectedNodeId1 || d.id == selectedNodeId2 || d.id == selectedNodeId3 ? "disabled" : null)

    function getNodeColor(nodeId) {
      // Define color mapping
      if (nodeId == selectedNodeId1){
        return "#b2df8a"
      } else if (nodeId == selectedNodeId2) {
        return "#a6cee3"
      } else if (nodeId == selectedNodeId3) {
        return "#33a02c"
      } else if (nodeId == selectedNodeId4) {
        return "#fb9a99"
      } else {
        return "#1f78b4"
      }
    }

    // Remove the previous graph
    svg.selectAll("*").remove();

    const link = svg
      .selectAll(".link")
      .data(filteredLinksData)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("marker-end", "url(#arrow)");

    svg
      .append("svg:defs")
      .selectAll("marker")
      .data(["arrow"])
      .enter()
      .append("svg:marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("fill", "black")
      .attr("d", "M0,-5L10,0L0,5");

    // Create the node elements
    const node = svg
      .selectAll(".node")
      .data(filteredNodesData)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .attr("fill", (d) => getNodeColor(d.id))
      .call(
        d3
          .drag()
          .on("start", dragStarted)
          .on("drag", dragged)
      )
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("dblclick", handleDoubleClick)
      .on("click", handleClick)

    // Create the simulation with scaled dimensions
    const simulation = d3
      .forceSimulation(filteredNodesData)
      .force(
        "link",
        d3
          .forceLink(filteredLinksData)
          .id((d) => d.id)
          .distance(180)
      )
      .force("charge", d3.forceManyBody().strength(-50))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", tick);

    function tick() {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node
        .attr("cx", (d, i) => (d.x = Math.max(5, Math.min(width - 5, d.x))))
        .attr("cy", (d, i) => (d.y = Math.max(5, Math.min(height - 5, d.y))));
    }

    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function handleMouseOver(event, d) {
      // Show the tooltip and position it next to the node
      tooltip
        .text(d.title)
        .style("left", `${event.pageX + tooltipPadding}px`)
        .style("top", `${event.pageY + tooltipPadding}px`)
        .style("opacity", 1)
    }

    function handleMouseOut() {
       // Hide the tooltip
       tooltip.style("opacity", 0)
    }

    function handleDoubleClick(event, d) {
      handleMouseOut()
       // Update the value of the dropdown menu to the double-clicked node's id
      if (selectedNodeId1 != d.id && selectedNodeId2 != d.id && selectedNodeId3 != d.id && selectedNodeId4 != d.id)
      if (selectedNodeId1 == "default") {
        select1.property("value", d.id)
      } else if (selectedNodeId2 == "default") {
        select2.property("value", d.id)
      } else if (selectedNodeId3 == "default") {
        select3.property("value", d.id)
      } else if (selectedNodeId4 == "default") {
        select4.property("value", d.id)
      }
      handleNodeSelect()
    }

    function handleClick(event, d) {
      ClickedNode = d.id
      CompareNodes = []
      if (selectedNodeId1 != "default" && selectedNodeId1 != ClickedNode){
        CompareNodes.push(parseInt(selectedNodeId1))
      }
      if (selectedNodeId2 != "default" && selectedNodeId2 != ClickedNode){
        CompareNodes.push(parseInt(selectedNodeId2))
      }
      if (selectedNodeId3 != "default" && selectedNodeId3 != ClickedNode){
        CompareNodes.push(parseInt(selectedNodeId3))
      }
      if (selectedNodeId4 != "default" && selectedNodeId4 != ClickedNode){
        CompareNodes.push(parseInt(selectedNodeId4))
      }
      AllNodes = [ClickedNode].concat(CompareNodes)
      AllNodesData = AllNodes.map(id => data.find(obj => obj.id == id))

      if (AllNodesData.length == 1){
        mechanics = []
        for (i=0; i<AllNodesData[0].types.mechanics.length; i++){
          mechanics.push(AllNodesData[0].types.mechanics[i].name)
        }
        categories = []
        for (i=0; i<AllNodesData[0].types.categories.length; i++){
          categories.push(AllNodesData[0].types.categories[i].name)
        }
        //If you want to make the text into less lines you need to ass line breaks \n
        text = `\nData for ${AllNodesData[0].title}:
        Min players: ${AllNodesData[0].minplayers}
        Max. players: ${AllNodesData[0].maxplayers}
        Min. time: ${AllNodesData[0].minplaytime}
        Max. time: ${AllNodesData[0].maxplaytime}
        Min. age: ${AllNodesData[0].minage}
        Game mechanics:\n ${mechanics.join("\n")}
        Game categories:\n ${categories.join("\n")}`
      } else {
        allTexts = [``, ``, ``, ``]
        mechanicsNode = []
        for (i=0; i<AllNodesData[0].types.mechanics.length; i++){
          mechanicsNode.push(AllNodesData[0].types.mechanics[i].name)
        }
        categoriesNode = []
        for (i=0; i<AllNodesData[0].types.categories.length; i++){
          categoriesNode.push(AllNodesData[0].types.categories[i].name)
        }
        for (i=1;i<AllNodesData.length;i++){
          percentMachtingMechanic = 0
          percentMachtingCategories = 0

          machtingMechanics = []
          machtingCategories = []

          mechnicsMenuNode = []
          categoriesMenuNode = []

          for (j=0; j<AllNodesData[i].types.mechanics.length; j++){
            mechnicsMenuNode.push(AllNodesData[i].types.mechanics[j].name)
          }

          for (j=0; j<AllNodesData[i].types.categories.length; j++){
            categoriesMenuNode.push(AllNodesData[i].types.categories[j].name)
          }

          for (j=0; j < mechanicsNode.length; j++){
            if (mechnicsMenuNode.includes(mechanicsNode[j])) {
              machtingMechanics.push(mechanicsNode[j])
            }
          }
          for (j=0; j < categoriesNode.length; j++){
            if (categoriesMenuNode.includes(categoriesNode[j])) {
              machtingCategories.push(categoriesNode[j])
            }
          }
          combinedUniqueElementsMechanics = [...new Set([...mechanicsNode, ...mechnicsMenuNode])]
          percentMachtingMechanic = Math.round((machtingMechanics.length / combinedUniqueElementsMechanics.length) * 100)

          combinedUniqueElementsCategories = [...new Set([...categoriesNode, ...categoriesMenuNode])]
          percentMachtingCategories = Math.round((machtingCategories.length / combinedUniqueElementsCategories.length) * 100)

          nodeMinplayers = AllNodesData[0].minplayers-AllNodesData[i].minplayers
          if (nodeMinplayers == 0){
            nodeMinplayers = `same (${AllNodesData[0].minplayers})`
          } else if (nodeMinplayers > 0) {
            nodeMinplayers = "+"+nodeMinplayers+" ("+AllNodesData[0].minplayers+")"
          } else {
            nodeMinplayers = nodeMinplayers+" ("+AllNodesData[0].minplayers+")"
          }

          nodeMaxplayers = AllNodesData[0].maxplayers-AllNodesData[i].maxplayers
          if (nodeMaxplayers == 0){
            nodeMaxplayers = `same (${AllNodesData[0].maxplayers})`
          } else if (nodeMaxplayers > 0) {
            nodeMaxplayers = "+"+nodeMaxplayers+" ("+AllNodesData[0].maxplayers+")"
          } else {
            nodeMaxplayers = nodeMaxplayers+" ("+AllNodesData[0].maxplayers+")"
          }

          nodeMinplaytime = AllNodesData[0].minplaytime-AllNodesData[i].minplaytime
          if (nodeMinplaytime == 0){
            nodeMinplaytime = `same (${AllNodesData[0].minplaytime})`
          } else if (nodeMinplaytime > 0) {
            nodeMinplaytime = "+"+nodeMinplaytime+" ("+AllNodesData[0].minplaytime+")"
          } else {
            nodeMinplaytime = nodeMinplaytime+" ("+AllNodesData[0].minplaytime+")"
          }

          nodeMaxplaytime = AllNodesData[0].maxplaytime-AllNodesData[i].maxplaytime
          if (nodeMaxplaytime == 0){
            nodeMaxplaytime = `same (${AllNodesData[0].maxplaytime})`
          } else if (nodeMaxplaytime > 0) {
            nodeMaxplaytime = "+"+nodeMaxplaytime+" ("+AllNodesData[0].maxplaytime+")"
          } else {
            nodeMaxplaytime = nodeMaxplaytime+" ("+AllNodesData[0].maxplaytime+")"
          }

          nodeMinage = AllNodesData[0].minage-AllNodesData[i].minage
          if (nodeMinage == 0){
            nodeMinage = `same (${AllNodesData[0].minage})`
          } else if (nodeMinage > 0) {
            nodeMinage = "+"+nodeMinage+" ("+AllNodesData[0].minage+")"
          } else {
            nodeMinage = nodeMinage+" ("+AllNodesData[0].minage+")"
          }

          console.log(AllNodesData[0])
          console.log(AllNodesData[i])

          allTexts[i-1] = `Comparison ${AllNodesData[0].title} to ${AllNodesData[i].title}\n
          Min players: ${nodeMinplayers}
          Max. players: ${nodeMaxplayers}
          Min. time: ${nodeMinplaytime}
          Max. time: ${nodeMaxplaytime}
          Min. age: ${nodeMinage}\n
          Matching mechanics (${percentMachtingMechanic}%):
          ${machtingMechanics.join("\n")}\n
          Matching categories (${percentMachtingCategories}%):
          ${machtingCategories.join("\n")}\n\n`
        }
        text = `Choosen Game for Comparison:
        ${AllNodesData[0].title}\n\n` + allTexts[0] + allTexts [1] + allTexts [2] + allTexts [3]
      }

      d3.select("#analytics")
         .style("max-height", (window.innerHeight-200) + "px")
        .text(text)
    }
  }
  handleNodeSelect()
}

function clearVis5 () {
  svg.selectAll("*").remove()

  document.getElementById("node_select1").style.display = "none";
  document.getElementById("node_select2").style.display = "none";
  document.getElementById("node_select3").style.display = "none";
  document.getElementById("node_select4").style.display = "none";

  text = ""

  d3.select("#analytics")
  .style("max-height", Number.MAX_SAFE_INTEGER + "px")
  .text(text)

  const select1 = d3.select("#node_select1")
  const select2 = d3.select("#node_select2")
  const select3 = d3.select("#node_select3")
  const select4 = d3.select("#node_select4")

  select1.selectAll("option").remove()
  select2.selectAll("option").remove()
  select3.selectAll("option").remove()
  select4.selectAll("option").remove()
}