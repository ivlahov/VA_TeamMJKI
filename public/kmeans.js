/* k-means implementation in 2D */

/**
 * Calculates the mean for x and y of the given data points.
 *
 * @param {[{ x, y, centroid_index }, ...]} datapoints - given data points to calculate measure on, whereas the array contains the data points; centroid_index is not needed here, but is part of the default data structure
 * @returns {{x, y}} - the measure (here: mean)
 */
function mean(datapoints) {
  // TODO
  return { x: 0, y: 0 }
}


/**
 * Calculates the euclidian distance between two points in space.
 *
 * @param {{ x, y, centroid_index }} point1 - first point in space
 * @param {{ x, y, centroid_index }} point2 - second point in space
 * @returns {Number} - the distance of point1 and point2
 */
function euclid(point1, point2) {
  
//console.log("Point 1: X: "+ point1.x+" Y: "+ point1.y)
//console.log("Point 2: X: "+ point2.x+" Y: "+ point2.y)

const deltaX = point1.x - point2.x
const deltaY = point1.y - point2.y

const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2)

  //console.log(distance)
  return distance
}

/**
 * Assigns each data point according to the given distance function to the nearest centroid.
 *
 * @param {[{ x, y, centroid_index }, ...]} datapoints - all available data points
 * @param {[{ x, y }, ... ]} centroids - current centroids
 */
function assign_datapoints_to_centroids(datapoints,  centroids) {
  for (i=0;i<datapoints.length;i++){
    //the array contains the distance between the point i and each centroid
    let dist = []
    for (j=0;j<centroids.length;j++){
      dist.push(euclid(datapoints[i], centroids[j]))
    }
    /*
    *   1)    By default goes cluster 1
    *   2)    Run the array of distance to each centroid, if one distance is smaller
    *         than the distance to centroid 1, the point switches the cluster.
    */
    datapoints[i].cluster=1;
    point_dist = dist[0];
    for (j=1;j<centroids.length;j++){
      if (point_dist>dist[j]){
        datapoints[i].cluster = j+1
        point_dist = dist[j]
      }
    }
  }
}

/**
 * Calculates for each centroid it's new position according to the given measure.
 *
 * @param {[{ x, y, centroid_index }, ...]} datapoints - all available data points
 * @param {[{ x, y }, ... ]} centroids - current centroids
 * @returns {{[{ x, y }, ... ], Boolean}} - centroids with new positions, and true of at least one centroid position changed
 */
function calculate_new_centroids(datapoints, centroids) {
  let centroids_changed = false

  for (i=0;i<centroids.length;i++){
    avg_x = 0;
    avg_y = 0;
    count = 0;
    for (j=0;j<datapoints.length;j++){
      if (datapoints[j].cluster===i+1){
        avg_x += datapoints[j].x
        avg_y += datapoints[j].y
        count ++
      }
    }
    avg_x = avg_x/count
    avg_y = avg_y/count

    if (centroids[i].x != avg_x || centroids[i].y != avg_y){

      centroids[i].x=avg_x
      centroids[i].y=avg_y
      centroids_changed = true
    }
  }
  return centroids_changed
}

/**
 * Generates random centroids according to the data point boundaries and the specified k.
 *
 * @param {[{ x, y }, ...]} datapoints - all available data points
 * @param {Number} k - number of centroids to be generated as a Number
 * @returns {[{ x, y }, ...]} - generated centroids
 */
function get_random_centroids(datapoints, k) {
  let centroids = []

  //boundaries x and y
  x_max = d3.max(datapoints, function(d) { return d.x })
  x_min = d3.min(datapoints, function(d) { return d.x })

  y_max = d3.max(datapoints, function(d) { return d.y })
  y_min = d3.min(datapoints, function(d) { return d.y })  

  //generating random centroids for k
  for (i=0;i<k;i++){

    x_random = Math.random() * (x_max - x_min) + x_min;
    y_random = Math.random() * (y_max - y_min) + y_min;

    centroids.push({x: x_random, y: y_random})
  }

  centroids.sort((a,b) => a.x - b.x)

  return centroids
}

function kmeans (datapoints, k) {
  //first random centroids
  centroids = get_random_centroids(datapoints, k)
  console.log(centroids)
  assign_datapoints_to_centroids(datapoints, centroids)
  
  iteration_count = 0;
  while (calculate_new_centroids (datapoints, centroids) && iteration_count <= 2000){
    assign_datapoints_to_centroids(datapoints, centroids)
    iteration_count++
  } 
  for (i=0;i<centroids.length;i++){
    datapoints.push({x: centroids[i].x, y: centroids[i].y, cluster: 99})
  }
  console.log(datapoints)
}