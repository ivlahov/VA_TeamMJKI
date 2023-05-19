function print_hello_world() {
  console.log("Hello World!")
}

  // Set margins and dimensions for the vis
  const margin = {top: 100, right: 75, bottom: 100, left: 50}
  const width = 1600 - margin.left - margin.right
  const height = 700 - margin.top - margin.bottom

 // Create an SVG element
const svg = d3.select("#svgRoot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

let vis = null
let data = null

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
  createVis(vis, data)
})

//After pressing one button the vis get created new
socket.on("switch-vis", (visData) => {
  vis = visData.vis
  data = visData.data
  createVis(vis, data)
} )

// Button Handler
document.getElementById("id_vis_1_designer").addEventListener("click", () => {
  socket.emit("vis_1_designer")
  console.log("Vis 1")
})

document.getElementById("id_vis_2_minage_minplaytime").addEventListener("click", () => {
  socket.emit("vis_2_minage_minplaytime")
  console.log("Vis 2")
})

document.getElementById("id_vis_4_kmeans").addEventListener("click", () => {
  socket.emit("vis_4_kmeans")
  console.log("Vis 4")
})

/** 
  * Function to call the fitting function for each vis
  * @param {String} vis     Indentifier wich vis should be visible
  * @param {Array} data     Dataset of the 40 board games
*/
function createVis (vis, data) {
  console.log(data)
  if (vis === "vis_1_designer"){
    createVis_1(data)
  } else if (vis === "vis_2_minage_minplaytime"){
    createVis_2(data)
  } else if (vis === "vis_4_kmeans")
  createVis_4(data)
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
        if(vis1_data.find(date => date.name === designer.name)){
            let d = vis1_data.find(date => date.name === designer.name)
            d.amount = d.amount +1
        } else {
            //else add new object to dataD
            vis1_data.push({name: designer.name, amount: 1})
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
  .domain([0, d3.max(vis1_data, function(d) { return d.amount})+1])


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
    .attr("x", +width+50)
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
  for (let i = 0; i < data.length; i++){
    vis2_data.push({title: data[i].title, minage: data[i].minage, minplaytime: data[i].minplaytime})
  }

  //Clear the svg part for the new data
  svg.selectAll("*").remove()

  // Define scales for x and y axes
  const x = d3.scaleLinear()
 .domain([0, d3.max(vis2_data, function(d) { return d.minage })+2])
 .range([0, width])

  const y = d3.scaleLinear()
 .domain([0, d3.max(vis2_data, function(d) { return d.minplaytime })+30])
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
     .attr("cx", function(d) { return x(d.minage) + xJitter() })
     .attr("cy", function(d) { return y(d.minplaytime) + yJitter() })

     //Add title
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Relationship between minimum age and minimum playtime.")

    }

function createVis_4 (data) {

  let vis4_data = []
  for (let i = 0; i < data.length; i++){
    avg_playtime = (data[i].minplaytime+data[i].maxplaytime)/2
    vis4_data.push({x: data[i].rating.num_of_reviews, y: avg_playtime, cluster:0})
  }
  console.log(vis4_data);

  kmeans(vis4_data, 4);

  svg.selectAll("*").remove()

  // Define scales for x and y axes
  const x = d3.scaleLinear()
 .domain([0, d3.max(vis4_data, function(d) { return d.x })+1000])
 .range([0, width])

  const y = d3.scaleLinear()
 .domain([0, d3.max(vis4_data, function(d) { return d.y })+30])
 .range([height, 0])

 //Add jitter to avoid overlapping
 const jitter_x = 10
 const jitter_y = 1
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
    .domain([1,2,3,4,5,99])
    .range([ "green", "orange", "blue", "cyan", "pink", "red"])

 // Add data points to the plot
 svg.selectAll("circle")
     .data(vis4_data)
     .enter().append("circle")
     .attr("r", 3)
     .attr("cx", function(d) { return x(d.x) + xJitter() })
     .attr("cy", function(d) { return y(d.y) + yJitter() })
     .style("fill", function (d) { return color(d.cluster) } )

     //Add title
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Relationship between number of reviews and average playtime.")

    }

