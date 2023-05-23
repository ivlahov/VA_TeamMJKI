const fs = require("fs")

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

  /*
  * Issues for switching the visulatisations:
  *   The code does not recognize which visualization is already shown, 
  *     so the code "Switch" although it stay at the same visualization
  */

  //socket.on("get_example_data", get_example_data)
})