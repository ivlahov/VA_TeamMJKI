const fs = require("fs")
var graph = require('pagerank.js')
const port = 6789

const express = require("express")
const http = require('http')
const app = express()
const server = http.Server(app)
app.use(express.static("public"))

server.listen(port, () => {
  console.log(`Webserver is running on port ${port}.`)
})

const socket = require("socket.io")
const io = socket(server)

//vis_data is our data we want to send to the client to work with
let vis_data = []

//Reading the json data
fs.readFile("./data/boardgames_100.json", "utf8", (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  let json_data = JSON.parse(data)
  vis_data = json_data
})

io.sockets.on("connection", (socket) => {
  console.log(`Client ${socket.id} connected.`)

  let disconnect = () => {
    console.log(`Client ${socket.id} disconnected.`)
  }

  /*
  let get_example_data = (parameters) => {
      console.log(`Received data request with these parameters: ${ parameters }`)
      fs.readFile("./data/boardgames_40.json", "utf8", (err, data) => {
          if (err) {
              console.error(err)
              return
          }
          let json_data = JSON.parse(data)
          socket.emit("example_data", json_data)
      })
      
  }
*/
  socket.on("disconnect", disconnect)

  //Create Graph and calculate significance score as well remove all recommendations to game outside of dataset
  vis_data = removeDeadEnds()
  createGraph()

  //Bar chart shoukd be shown by default
  socket.emit("init", {
    vis: "vis_1_designer",
    data: vis_data,
  })

  //After pressing the first button the bar chat will be created new
  socket.on("vis_1_designer", () => {
    socket.emit("switch-vis", {
      vis: "vis_1_designer",
      data: vis_data,
    })
  })

  //After pressing the second button the bar chat will be created new
  socket.on("vis_2_minage_minplaytime", () => {
    socket.emit("switch-vis", {
      vis: "vis_2_minage_minplaytime",
      data: vis_data,
    })
  })

  //After pressing the third button the scatterplot matrix will be created anew
  socket.on("vis_3_lda", () => {
    socket.emit("switch-vis", {
      vis: "vis_3_lda",
      data: vis_data,
    })
  })

  //After pressing the second button the bar chat will be created new
  socket.on("vis_4_kmeans", () => {
    socket.emit("switch-vis", {
      vis: "vis_4_kmeans",
      data: vis_data,
    })
  })

  socket.on("vis_6_significance", () => {
    socket.emit("switch-vis", {
      vis: "vis_6_significance",
      data: vis_data,
    })
  })

  /*
  * Issues for switching the visulatisations:
  *   The code does not recognize which visualization is already shown, 
  *     so the code "Switch" although it stay at the same visualization
  */

  socket.on("updateFilters", (newFilters) => {
    console.log(newFilters)
    socket.emit("filterUpdate", newFilters)
  })

  //socket.on("get_example_data", get_example_data)
})

/**
 * This function creates a graph datastructure from Pagerank.js library and calculates
 * pagerank significance store for every board game in the dataset.
 */
function createGraph() {
  vis_data.forEach((game, gameIndex) => {
    game.recommendations.fans_liked.forEach(rec => {
      graph.link(gameIndex, getArrayIndexFromID(rec), 1.0)
    })
  })

  let sig_data = vis_data.map(e => {
    let { credit, id, maxplayers, minplayers, minage, maxplaytime, minplaytime, rank, rating, recommendations, title, types, year } = e
    significance = 0
    return { credit, id, maxplayers, maxplaytime, minage, minplayers, minplaytime, rank, recommendations, rating, title, types, year, significance }
  })

  graph.rank(0.85, 0.000001, function (node, rank) {
    // console.log("Node " + node + " has a rank of " + rank);
    sig_data[node].significance = rank
  });

  vis_data = sig_data
}

/**
 * Returns the index of the given board game id
 * @param {Number} id board game id
 * @returns 
 */
function getArrayIndexFromID(id) {
  return vis_data.findIndex(element => element.id === id)
}

/**
 * Removes all recommendations to game outside the data set
 * @returns the modified array
 */
function removeDeadEnds() {
  vis_data.forEach(game => {
    let removeIDs = []
    game.recommendations.fans_liked.forEach((rec, index) => {
      if (vis_data.findIndex(element => element.id === rec) === -1) {
        removeIDs.push(index)
      }
    })
    removeIDs.sort((a, b) => b - a)
    removeIDs.forEach(index => {
      game.recommendations.fans_liked.splice(index, 1)
    })
  })

  return vis_data
}