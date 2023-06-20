function print_hello_world() {
  console.log("Hello World!")
}

// Set margins and dimensions for the vis
const margin = { top: 100, right: 75, bottom: 100, left: 50 }
const width = window.innerWidth - 200 - margin.left - margin.right
const height = window.innerHeight - 100 - margin.top - margin.bottom

// Create an SVG element
const svg = d3.select("#svgRoot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

let vis = null
let data = null
var filters = []
let kmeanData = null
let clusterHighlight = [false, false, false, false]

const socket = io()

socket.on("connect", () => {
  console.log("Connected to the webserver.")
})
socket.on("disconnect", () => {
  console.log("Disconnected from the webserver.")
})

//Initialize vis, starting with the bar chart
socket.on("init", (visData) => {
  vis = visData.vis
  data = visData.data
  console.log(data)
  createVis(vis, data)
})

//After pressing one button the vis get created new
socket.on("switch-vis", (visData) => {
  console.log("Switch from " + vis)
  vis = visData.vis
  data = visData.data
  console.log(data)
  createVis(vis, data)
})

//Receiving the updated filters array
socket.on("filterUpdate", (newFilter) => {
  console.log(newFilter)
  filters = newFilter
})

// Button Handler
document.getElementById("id_vis_1_designer").addEventListener("click", () => {
  socket.emit("vis_1_designer")
  document.getElementById("divCheckbox").style.display = "none"
  removeVis_3()
  console.log("Vis 1")
})

document.getElementById("id_vis_2_minage_minplaytime").addEventListener("click", () => {
  socket.emit("vis_2_minage_minplaytime")
  document.getElementById("divCheckbox").style.display = "none"
  removeVis_3()
  console.log("Vis 2")
})

document.getElementById("id_vis_3_lda").addEventListener("click", () => {
  removeVis_3()
  socket.emit("vis_3_lda")
  document.getElementById("divCheckbox").style.display = "none"
  console.log("Vis 3")
})

document.getElementById("id_vis_4_kmeans").addEventListener("click", () => {
  removeVis_3()
  socket.emit("vis_4_kmeans")
  document.getElementById("cluster1").checked = false;
  document.getElementById("cluster2").checked = false;
  document.getElementById("cluster3").checked = false;
  document.getElementById("cluster4").checked = false;
  document.getElementById("divCheckbox").style.display = "flex"
  console.log("Vis 4")
})

document.getElementById("id_vis_6_significance").addEventListener("click", () => {
  removeVis_3()
  socket.emit("vis_6_significance")
  document.getElementById("divCheckbox").style.display = "none"
  console.log("Vis 6")
})

document.getElementById("cluster1").addEventListener("change", (event) => {
  if (event.target.checked) {
    clusterHighlight[0] = true;
  } else {
    clusterHighlight[0] = false;
  }
  highlightVis_4(kmeanData, clusterHighlight)
})

document.getElementById("cluster2").addEventListener("change", (event) => {
  if (event.target.checked) {
    clusterHighlight[1] = true;
  } else {
    clusterHighlight[1] = false;
  }
  highlightVis_4(kmeanData, clusterHighlight)
})

document.getElementById("cluster3").addEventListener("change", (event) => {
  if (event.target.checked) {
    clusterHighlight[2] = true;
  } else {
    clusterHighlight[2] = false;
  }
  highlightVis_4(kmeanData, clusterHighlight)
})

document.getElementById("cluster4").addEventListener("change", (event) => {
  if (event.target.checked) {
    clusterHighlight[3] = true;
  } else {
    clusterHighlight[3] = false;
  }
  highlightVis_4(kmeanData, clusterHighlight)
})

/** 
  * Function to call the fitting function for each vis
  * @param {String} vis     Indentifier wich vis should be visible
  * @param {Array} data     Dataset of the 40 board games
*/
function createVis(vis, data) {
  // console.log(filters)
  //Filters out games according to filters in vis_6
  if (vis !== "vis_6_significance") {
    data = data.filter(game => {
      if (filters.findIndex(id => id === game.id) === -1) {
        return true
      } else {
        return false
      }
    })
  }


  if (vis === "vis_1_designer") {
    createVis_1(data)
  } else if (vis === "vis_2_minage_minplaytime") {
    createVis_2(data)
  } else if (vis === "vis_3_lda") {
    createVis_3(data)
  } else if (vis === "vis_4_kmeans") {
    createVis_4(data)
  } else if (vis === "vis_6_significance") {
    createVis_6(data)
  }

}

/** 
  * Function to create the bar chart
  * @param {Array} data     Dataset of the 40 board games
*/
function createVis_1(data) {
  //Clear the data, we only need the name and amount for vis 1
  let vis1_data = []

  data.forEach(element => {
    //Every designer...
    element.credit.designer.forEach(designer => {
      //if their name is already in an object in dataD, increase the amount
      if (vis1_data.find(date => date.name === designer.name)) {
        let d = vis1_data.find(date => date.name === designer.name)
        d.amount = d.amount + 1
      } else {
        //else add new object to dataD
        vis1_data.push({ name: designer.name, amount: 1 })
      }
    })
  })

  //Clear the svg part for the new data
  svg.selectAll("*").remove()

  //Define scales
  const x = d3.scaleBand()
    .range([0, width])
    .domain(vis1_data.map((d) => d.name))
    .padding(0.5)

  const y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(vis1_data, function (d) { return d.amount }) + 1])


  //create axes
  const xAxis = d3.axisBottom(x)

  const yAxis = d3.axisLeft(y)

  //Add x axe (without label)
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

  //make the names of designers readable
  svg.selectAll("text")
    .attr("font-size", "12px")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")

  //Add label to x axe
  svg.select("g")
    .append("text")
    .attr("fill", "#000")
    .attr("x", +width + 50)
    .attr("y", -0)
    .attr("text-anchor", "end")
    .text("Designer")

  //Add y axe (including label)
  svg.append("g")
    .call(yAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Amount published games")

  //Adding the bars to the chart
  svg.selectAll(".bar")
    .data(vis1_data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.name))
    .attr("y", (d) => y(d.amount))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.amount))

  //Adding title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Number of Games by Designer")

}

/** 
  * Function to ccreate the scatterplot
  * @param {Array} data     Dataset of the 40 board games
*/
function createVis_2(data) {
  let vis2_data = []
  for (let i = 0; i < data.length; i++) {
    vis2_data.push({ title: data[i].title, minage: data[i].minage, minplaytime: data[i].minplaytime })
  }

  //Clear the svg part for the new data
  svg.selectAll("*").remove()

  // Define scales for x and y axes
  const x = d3.scaleLinear()
    .domain([0, d3.max(vis2_data, function (d) { return d.minage }) + 2])
    .range([0, width])

  const y = d3.scaleLinear()
    .domain([0, d3.max(vis2_data, function (d) { return d.minplaytime }) + 30])
    .range([height, 0])

  //Add jitter to avoid overlapping
  const jitter_x = 0.3
  const jitter_y = 10
  var xJitter = d3.randomUniform(-jitter_x, jitter_x)
  var yJitter = d3.randomUniform(-jitter_y, jitter_y)


  // Create x and y axes
  const xAxis = d3.axisBottom(x)
  const yAxis = d3.axisLeft(y)

  // Add the axes to the plot (including lables)
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("x", width - 10)
    .attr("y", -10)
    .style("text-anchor", "end")
    .text("Min Age")

  svg.append("g")
    .call(yAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("x", -10)
    .attr("y", 10)
    .style("text-anchor", "end")
    .text("Min Playtime")

  // Add data points to the plot
  svg.selectAll("circle")
    .data(vis2_data)
    .enter().append("circle")
    .attr("r", 3)
    .attr("cx", function (d) { return x(d.minage) + xJitter() })
    .attr("cy", function (d) { return y(d.minplaytime) + yJitter() })

  //Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Relationship between minimum age and minimum playtime.")

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
    const reductionLDA = new druid.LDA(X, { labels: classes, d: dimensions }) //2 dimensions, can use more.
    const result = reductionLDA.transform()

    // console.log(result.to2dArray) //convenience method: https://saehm.github.io/DruidJS/Matrix.html
    return result.to2dArray
  }


  svg.selectAll("*").remove()

  var obj = data

  //Size of a scatterplot in the scatterplot matrix
  const w = 200
  const h = 200

  //Data stuff
  //remove Outlier
  obj.splice(78, 1)

  //Create list of feature ids
  var categoryIds = []
  // var solID = 2819
  obj.forEach(element => {
    element.types.mechanics.forEach(c => {
      if (!categoryIds.find(category => category === c.name)) {
        categoryIds.push(c.id)
      }
    })
  })

  //For the first 3 categories create the scatterplot matrix
  categoryIds.forEach((id, index) => {
    categoryIds.forEach((cid, cindex) => {
      if (index != cindex && index < 3 && cindex < 3) {
        // console.log("ID:" + id + " CID:" + cid)
        update(id, cid, obj, false, index, cindex)
      } else if (index < 3 && cindex < 3) {
        //If the ids are the same, we want to additionally create a dropdown for that feature
        // console.log("ID:" + id + " CID:" + cid)
        update(id, id, obj, true, index, cindex)
      }
    })
  })

  var legendW = (w + margin.left + margin.right) * 3 + 140

  var legendArea = svg.append("g")
    .attr("transform", "translate(" + legendW + "," + 0 + ")")

  legendArea.append("text")
    .attr("y", -40)
    .attr("text-anchor", "start")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Legend of Color Mappings")

  legendArea.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 6).style("fill", "#008000")
  legendArea.append("circle").attr("cx", 0).attr("cy", 30).attr("r", 6).style("fill", "#0000FF")
  legendArea.append("circle").attr("cx", 0).attr("cy", 60).attr("r", 6).style("fill", "#00FFFF")
  legendArea.append("circle").attr("cx", 0).attr("cy", 90).attr("r", 6).style("fill", "#FF0000")
  legendArea.append("text").attr("x", 20).attr("y", 3).text("Belongs to Y-axis class")
  legendArea.append("text").attr("x", 20).attr("y", 33).text("Belongs to X-axis class")
  legendArea.append("text").attr("x", 20).attr("y", 63).text("Belongs to X-axis and Y-axis class")
  legendArea.append("text").attr("x", 20).attr("y", 93).text("Belongs to neither class")

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
    var mechanics = []
    obj.forEach(e => e.types.mechanics.forEach(c => mechanics.push(c)))

    //Data Preprocessing for LDA

    var NumberData = []     //Will contain data used for LDA
    var classes = []        //Will contain classed used in LDA
    var categoryNames = []  //Will contain the name of every category

    obj.forEach(element => {
      let numbers = []

      numbers.push(element.minplayers)
      numbers.push(element.minplaytime)
      numbers.push(element.maxplayers)
      numbers.push(element.maxplaytime)
      numbers.push(element.rating.rating)
      numbers.push(element.rating.num_of_reviews)
      numbers.push(element.minage)

      //See to which class each game belongs
      /**
       * Classes:
       * a - Only belongs to the x-axis category 
       * b - Belongs to neither the x-axis nor the y-axis category
       * c - Only belongs to the y-axis category
       * d - belongs to both the x-axis and y-axis category
       */
      var categoryFound, catA, catC = false
      element.types.mechanics.forEach(c => {
        if (!categoryNames.find(category => category === c.name)) {
          categoryNames.push(c.name)
        }
        if (c.id == categoryID) {
          catA = true
          categoryFound = true
        } else if (c.id == categoryID2) {
          catC = true
          categoryFound = true
        }
      })
      if (!categoryFound) {
        classes.push("b")
      }
      else if (catC && catA) {
        classes.push("d")
      } else if (catC) {
        classes.push("c")
      } else {
        classes.push("a")
      }
      NumberData.push(numbers)
    })


    NumberData.forEach((datapoint, dataindex) => {
      let l = datapoint.length
      datapoint[l] = 0
      categoryNames.forEach((category, index) => {
        obj[dataindex].types.mechanics.forEach(c => {
          if (c.name == category) {
            datapoint[l] = datapoint[l] + index * 2
          }
        })
      })
    })

    var ldaResult = LDA(NumberData, classes, 2)

    //Take result from lda result and save it together with class information
    let vis3_data = ldaResult.map((e, i) => {
      let minage = e[0]
      let minplaytime = e[1]
      let category = classes[i]
      return { minage, minplaytime, category, rankId: i }
    })


    //SVG Stuff

    //Offsets for scatterplots in matrix
    let offsetX = matrixX * (h + margin.right / 4 + margin.left / 4) + margin.left + 140
    let offsetY = matrixY * (w + margin.bottom / 4 + margin.top / 4) + margin.top


    //Add new g with id for new scatterplot
    let svg = d3.select("#svgRoot")
      .append("g")
      .attr("transform", "translate(" + offsetX + "," + offsetY + ")")
      .attr("id", 'plot' + matrixX + matrixY)

    // Define scales for x and y axes
    const x = d3.scaleLinear()
      .domain([d3.min(vis3_data, function (f) { return f.minage }) - 1, d3.max(vis3_data, function (d) { return d.minage }) + 1])
      .range([0, w])
    // console.log("TEST")
    const y = d3.scaleLinear()
      .domain([d3.min(vis3_data, function (f) { return f.minplaytime }) - 1, d3.max(vis3_data, function (d) { return d.minplaytime }) + 1])
      .range([h, 0])

    //Add jitter to avoid overlapping
    const jitter_x = 0.3
    const jitter_y = 10
    var xJitter = d3.randomUniform(-jitter_x, jitter_x)
    var yJitter = d3.randomUniform(-jitter_y, jitter_y)

    // Create x and y axes
    const xAxis = d3.axisBottom(x).tickFormat("")
    const yAxis = d3.axisLeft(y).tickFormat("")

    // Add the axes to the plot
    svg.append("g")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis)
    svg.append("g")
      .call(yAxis)

    // Add data points to the plot
    /**
     * Color explanation
     * blue - Only belongs to the x-axis category 
     * red - Belongs to neither the x-axis nor the y-axis category
     * green - Only belongs to the y-axis category
     * pink - belongs to both the x-axis and y-axis category 
     */
    svg.selectAll("FILLER")
      .data(vis3_data)
      .enter().append("circle")
      .attr("r", 3)
      .attr("cx", function (d) { return x(d.minage) + xJitter() })
      .attr("cy", function (d) { return y(d.minplaytime) + yJitter() })
      .attr("fill", function (d) {
        if (d.category == "a") {
          return "blue"
        } else if (d.category == "b") {
          return "red"
        } else if (d.category == "c") {
          return "green"
        } else {
          return "cyan"
        }
      })
      .attr("stroke", "black")

    //Create dropdowns
    if (init) {
      d3.select(".buttons")
        .append('select')
        .attr('id', 'selectX' + matrixX)
        .selectAll('myOptions')
        .data(categoryNames)
        .enter()
        .append('option')
        .property("value", function (d) { return d; })
        .property('selected', function (d) { return d === categoryNames[matrixX] })
        .attr("height", h - 100)
        .text(function (d) { return d; })

      //ChangeListener for dropdowns to update scatterplot matrix accordingly
      d3.select('#selectX' + matrixX).on("change", function (event, d) {
        const selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        let id = obj.find(o => {
          return o.types.mechanics.find(c => c.name === selectedOption)
        }).types.mechanics.find(c => c.name === selectedOption).id
        // console.log("HIER KOMMT")
        // console.log(id)
        //Clear the svg part for the new data
        svg.selectAll("*").remove()

        for (let index = 0; index < 3; index++) {
          d3.select('#plot' + matrixX + index).remove()
          d3.select('#plot' + index + matrixY).remove()

          if (matrixX == index && matrixY == index) {
            update(id, id, obj, false, matrixX, index)
          } else {
            update(id, mechanics.find(c => c.name === d3.select('#selectX' + index).property("value")).id, obj, false, matrixX, index)
            update(mechanics.find(c => c.name === d3.select('#selectX' + index).property("value")).id, id, obj, false, index, matrixY)
          }
        }
      })
    }
    //Add x-axis title
    if (matrixY == 0) {

      //Not longer than 17 to display properly
      let string = ""
      let target = mechanics.find(c => c.id == categoryID).name
      if (target.length > 17) {
        string = target.slice(0, 14) + "..."
      } else {
        string = target
      }

      svg.append("text")
        .attr("x", w / 2)
        .attr("y", -40)
        .attr("class", "matrixText")
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text(string)
    }
    //Add Y-Axis-Title
    if (matrixX == 0) {

      //Not longer than 17 to display properly
      let string = ""
      let target = mechanics.find(c => c.id == categoryID2).name
      if (target.length > 17) {
        string = target.slice(0, 14) + "..."
      } else {
        string = target
      }

      svg.append("text")
        .attr("class", "matrixText")
        .attr("id", "sideplot" + matrixY)
        .attr("x", 0)
        .attr("dx", -100)
        .attr("y", h / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text(string)
    }
  }
}

/**
 * Removes all elements added by visualization 3
 */
function removeVis_3() {
  for (let index = 0; index < 3; index++) {
    d3.select('#plot' + 0 + index).remove()
    d3.select('#plot' + 1 + index).remove()
    d3.select('#plot' + 2 + index).remove()
    d3.select('#selectX' + index).remove()
  }
}


function createVis_4(data) {

  let vis4_data = []
  for (let i = 0; i < data.length; i++) {
    avg_playtime = (data[i].minplaytime + data[i].maxplaytime) / 2
    vis4_data.push({ x: data[i].rating.num_of_reviews, y: avg_playtime, cluster: 0 })
  }
  console.log(vis4_data);

  kmeans(vis4_data, elbow(vis4_data));

  kmeanData = vis4_data;
  clusterHighlight = [false, false, false, false]

  svg.selectAll("*").remove()

  // Define scales for x and y axes
  const x = d3.scaleLinear()
    .domain([0, d3.max(vis4_data, function (d) { return d.x }) + 1000])
    .range([0, width])

  const y = d3.scaleLinear()
    .domain([0, d3.max(vis4_data, function (d) { return d.y }) + 30])
    .range([height, 0])

  // Create x and y axes
  const xAxis = d3.axisBottom(x)
  const yAxis = d3.axisLeft(y)

  // Add the axes to the plot (including lables)
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("x", width - 10)
    .attr("y", -10)
    .style("text-anchor", "end")
    .text("Number of Reviews")

  svg.append("g")
    .call(yAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("x", -10)
    .attr("y", 10)
    .style("text-anchor", "end")
    .text("Average Playtime")

  // Color scale: give me a specie name, I return a color
  var color = d3.scaleOrdinal()
    .domain([1, 2, 3, 4, 90, 99])
    .range(["blue", "orange", "cyan", "green", "pink", "red"])

  // Add data points to the plot
  svg.selectAll("circle")
    .data(vis4_data)
    .enter().append("circle")
    .attr("r", 3)
    .attr("cx", function (d) { return x(d.x) })
    .attr("cy", function (d) { return y(d.y) })
    .style("fill", function (d) { return color(d.cluster) })

  //Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Relationship between number of reviews and average playtime.")

}

function highlightVis_4(data, clusterHighlight) {

  svg.selectAll("*").remove()

  // Define scales for x and y axes
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) { return d.x }) + 1000])
    .range([0, width])

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) { return d.y }) + 30])
    .range([height, 0])

  // Create x and y axes
  const xAxis = d3.axisBottom(x)
  const yAxis = d3.axisLeft(y)

  // Add the axes to the plot (including lables)
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("x", width - 10)
    .attr("y", -10)
    .style("text-anchor", "end")
    .text("Number of Reviews")

  svg.append("g")
    .call(yAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("x", -10)
    .attr("y", 10)
    .style("text-anchor", "end")
    .text("Average Playtime")

  //Colors depending on Highlights
  if (!(clusterHighlight[0]) && !(clusterHighlight[1]) && !(clusterHighlight[2]) && !(clusterHighlight[3])) {
    color_cluster1 = "blue"
    color_cluster2 = "orange"
    color_cluster3 = "cyan"
    color_cluster4 = "green"
  } else {
    color_cluster1 = "#e4ddd2"
    color_cluster2 = "#e4ddd2"
    color_cluster3 = "#e4ddd2"
    color_cluster4 = "#e4ddd2"

    if (clusterHighlight[0]) { color_cluster1 = "blue" }
    if (clusterHighlight[1]) { color_cluster2 = "orange" }
    if (clusterHighlight[2]) { color_cluster3 = "cyan" }
    if (clusterHighlight[3]) { color_cluster4 = "green" }
  }

  // Color scale: give me a specie name, I return a color
  var color = d3.scaleOrdinal()
    .domain([1, 2, 3, 4, 90, 99])
    .range([color_cluster1, color_cluster2, color_cluster3, color_cluster4, "pink", "red"])

  // Add data points to the plot
  svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("r", 3)
    .attr("cx", function (d) { return x(d.x) })
    .attr("cy", function (d) { return y(d.y) })
    .style("fill", function (d) { return color(d.cluster) })

  //Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Relationship between number of reviews and average playtime.")

}

function createVis_6(data) {

  //Sort by significance score
  data.sort((a, b) => b.significance - a.significance)
  // console.log(data)

  //Normalize significance
  data.forEach(game => {
    game.normSig = (game.significance - data[0].significance) / (data[0].significance - data[data.length - 1].significance)
  })

  var links = []
  data.forEach(d => {
    d.recommendations.fans_liked.forEach(rec => {
      links.push({ source: d.id, target: rec, value: 1 })
    })
  })

  var nodes = []
  data.forEach((d, index) => {
    let color = "blue"
    if (filters.includes(d.id)) {
      color = "red"
    }
    nodes.push({ id: d.id, group: 1, value: (d.normSig + 2) * 7, color: color, rank: d.rank, significance: d.significance, sigRank: index +1, title: d.title })
  })

  // console.log(links)
  // console.log(nodes)

  svg.selectAll("*").remove()

  var smaller = 0
  if (width > height) {
    smaller = height
  } else {
    smaller = width
  }

  const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) { return d.id; }))
    .force("charge", d3.forceManyBody()
      .strength(-150)
      .theta(0.8)
      .distanceMax(smaller / 1.6)

    )
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(function (d) {
      return d.radius
    }))

  const link = svg.append("g")
    .attr("stroke", "#999")
    // .attr("#stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke-width", d => Math.sqrt(d.value))

  var selectedNode = { title: "None", rank: 0, significance: 0, sigRank: 0 };

  const node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", d => d.value)
    .attr("fill", function (d) { return d.color })
    .on("click", function (e, d) {
      if (d.color === "blue") {
        let filterCopy = filters
        filterCopy.push(d.id)
        socket.emit("filterUpdate", filterCopy)
        // console.log("ADD " + d.id)
        d.color = "red"
      } else {

        let filterCopy = filters
        filterCopy.splice(filterCopy.findIndex(element => element === d.id), 1)
        socket.emit("filterUpdate", filterCopy)
        // console.log("REMOVE" + d.id)
        d.color = "blue"
      }
      selectedNode = d
      update()
    })

  // node.call(d3.drag()
  //   .on("start", dragstarted)
  //   .on("drag", dragged)
  //   .on("end", dragended));

  function ticked() {
    link
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });

    node
      .attr("cx", function (d) { return d.x + 5; })
      .attr("cy", function (d) { return d.y - 3; });
  }

  // //From https://observablehq.com/@d3/force-directed-graph/2?intent=fork
  // // Reheat the simulation when drag starts, and fix the subject position.
  // function dragstarted(event) {
  //   if (!event.active) simulation.alphaTarget(0.3).restart();
  //   event.subject.fx = event.subject.x;
  //   event.subject.fy = event.subject.y;
  // }
  // //From https://observablehq.com/@d3/force-directed-graph/2?intent=fork
  // // Update the subject (dragged node) position during drag.
  // function dragged(event) {
  //   event.subject.fx = event.x;
  //   event.subject.fy = event.y;
  // }
  // //From https://observablehq.com/@d3/force-directed-graph/2?intent=fork
  // // Restore the target alpha so the simulation cools after dragging ends.
  // // Unfix the subject position now that it’s no longer being dragged.
  // function dragended(event) {
  //   if (!event.active) simulation.alphaTarget(0);
  //   event.subject.fx = null;
  //   event.subject.fy = null;
  // }


  // invalidation.then(() => simulation.stop());

  simulation
    .nodes(nodes)
    .on("tick", ticked)

  simulation.force("link").links(links)

  var legendW = (width - (margin.right) * 3)

  var legendArea = svg.append("g")
    .attr("transform", "translate(" + legendW + "," + 0 + ")")

  legendArea.append("text")
    .attr("y", -40)
    .attr("text-anchor", "start")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Legend of Color Mappings")

  legendArea.append("rect").attr("transform", "translate(" + 0 + ", " + -7 + ")").attr("width", 9).attr("height", 9).style("fill", "blue")
  legendArea.append("rect").attr("transform", "translate(" + 0 + ", " + 23 + ")").attr("width", 9).attr("height", 9).style("fill", "red")
  legendArea.append("text").attr("x", 20).attr("y", 3).text("Considered for analysis tasks")
  legendArea.append("text").attr("x", 20).attr("y", 33).text("Not considered for analysis tasks")


  const selectedNodeArea = svg.append("g")
    .attr("transform", "translate(" + legendW + ", " + 150 + ")")

  selectedNodeArea.append("text")
    .attr("y", -40)
    .attr("text-anchor", "start")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Last clicked on board game")

  selectedNodeArea.append("text").attr("x", 0).attr("y", -5).text("Title: " + selectedNode.title)
  selectedNodeArea.append("text").attr("x", 0).attr("y", 25).text("Rank: " + selectedNode.rank)
  selectedNodeArea.append("text").attr("x", 0).attr("y", 55).text("Significance Score Rank: " + selectedNode.sigRank)
  selectedNodeArea.append("text").attr("x", 0).attr("y", 85).text("Significance Score: " + selectedNode.significance)


  function update() {
    // console.log("Update")
    node.data(nodes)

    svg.selectAll("circle")
      .attr("fill", function (d) { return d.color })

    selectedNodeArea.selectAll('*').remove()
    selectedNodeArea.append("text")
      .attr("y", -40)
      .attr("text-anchor", "start")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .text("Last clicked on board game")

    selectedNodeArea.append("text").attr("x", 0).attr("y", -5).text("Title: " + selectedNode.title)
    selectedNodeArea.append("text").attr("x", 0).attr("y", 25).text("Rank: " + selectedNode.rank)
    selectedNodeArea.append("text").attr("x", 0).attr("y", 55).text("Significance Score Rank: " + selectedNode.sigRank)
    selectedNodeArea.append("text").attr("x", 0).attr("y", 85).text("Significance Score: " + selectedNode.significance)
  }

}