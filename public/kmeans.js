/* k-means implementation in 2D */

/**
 * Calculates the euclidian distance between two points in space.
 *
 * @param {{ x, y }} point1 - first point in space
 * @param {{ x, y}} point2 - second point in space
 * @returns {distance} - the distance of point1 and point2
 */
function euclid(point1, point2) {

const deltaX = point1.x - point2.x
const deltaY = point1.y - point2.y

const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2)

  return distance
}

/**
 * Assigns each data point according to the given distance function to the nearest centroid.
 *
 * @param {[{ x, y, cluster }]} datapoints - all available data points
 * @param {[{ x, y } ]} centroids - current centroids
 */
function assign_datapoints_to_centroids(datapoints,  centroids) {
  for (i=0;i<datapoints.length;i++){
    if (datapoints[i].cluster != 90){
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
}

/**
 * Calculates for each centroid it's new position according to the given measure.
 *
 * @param {[{ x, y, cluster }]} datapoints - all available data points
 * @param {[{ x, y } ]} centroids - current centroids
 * @returns {centroids_changed}  - boolean of at least one centroid position changed
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
    if (count > 1){
    avg_x = avg_x/count
    avg_y = avg_y/count
    //If there is no point assigned we calculate the centroid new
    } else {
      x_max = d3.max(datapoints, function(d) { return d.x })
      x_min = d3.min(datapoints, function(d) { return d.x })
      y_max = d3.max(datapoints, function(d) { return d.y })
      y_min = d3.min(datapoints, function(d) { return d.y }) 
      x_random = Math.random() * (x_max - x_min) + x_min;
      y_random = Math.random() * (y_max - y_min) + y_min;

      avg_x = x_random
      avg_y = y_random
    }

    if (centroids[i].x != avg_x || centroids[i].y != avg_y){

      centroids[i].x=avg_x
      centroids[i].y=avg_y
      centroids_changed = true
    }
  }

  centroids.sort((a,b) => a.x - b.x)

  return centroids_changed
}

/**
 * Generates random centroids according to the data point boundaries and the specified k.
 *
 * @param {[{ x, y, cluster}]} datapoints - all available data points
 * @param {Number} k - number of centroids to be generated as a Number
 * @returns {[{ x, y  }]} - generated centroids
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
/**
 * Exclude Outliers and then normalises the datapoints
 *
 * @param {[{ x, y, cluster}]} datapoints - all available data points
 * @returns {[{ x, y, cluster  }]} - normalised data with outliers marked as cluster 90
 */
function prePocessData (datapoints){

  excludeOutliers (datapoints, 3)

  //normalise the data between 0 and 1
  x_max = d3.max(datapoints, function(d) { return d.x })
  y_max = d3.max(datapoints, function(d) { return d.y })
  let normalized = []
  for (i=0;i<datapoints.length;i++){
    normalized.push({x: datapoints[i].x/x_max, y: datapoints[i].y/y_max, cluster: datapoints[i].cluster})
  }
  return normalized
}

/**
 * Denormalizes the data, so we can plot it as scatterplot
 *
 * @param {[{ x, y, cluster}]} datapoints - all available data points
 * @param {[{ x, y, cluster}]} normalised - all available data points in normalised form
 * @param {[{ x, y}]} centroids - all available centroids
 */
function denormalize (datapoints, normalized, centroids){
  x_max = d3.max(datapoints, function(d) { return d.x })
  y_max = d3.max(datapoints, function(d) { return d.y })

  for (i=0;i<datapoints.length;i++){
    if (normalized[i].cluster != 90){
    datapoints[i].cluster = normalized[i].cluster
  } else {
    datapoints[i].cluster = centroids.length;
    let minDist = Infinity
    for (a=centroids.length-1;a>=0;a--){
      console.log(normalized[i].x + " "+ normalized[i].y)
      console.log("Entfernung zu: "+(a+1)+" "+euclid(normalized[i], centroids[a]))
      if (euclid(normalized[i], centroids[a]) < minDist) {
        minDist = euclid(normalized[i], centroids[a])
        datapoints[i].cluster = a+1;
      }
    }
    console.log(datapoints[i].x + " "+ datapoints[i].y + " "+datapoints[i].cluster)
  }
}

for (i=0;i<centroids.length;i++){
  centroids[i].x = centroids[i].x * x_max
  centroids[i].y = centroids[i].y * y_max
}

}

/**
 * Assigns all Outliers to Cluster 90
 *
 * @param {[{ x, y, cluster}]} datapoints - all available data points
 * @param {Number} threshold - Amount of standard deviations a point is allowed to be away to not be an outlier
 */
function excludeOutliers (datapoints, threshold) {
  // Calculate the mean and standard deviation of the data
  const xValues = datapoints.map((point) => point.x);
  const yValues = datapoints.map((point) => point.y);
  const meanX = xValues.reduce((a, b) => a + b, 0) / xValues.length;
  const meanY = yValues.reduce((a, b) => a + b, 0) / yValues.length;
  const stdDevX = Math.sqrt(
    xValues.reduce((sum, value) => sum + (value - meanX) ** 2, 0) / xValues.length
  );
  const stdDevY = Math.sqrt(
    yValues.reduce((sum, value) => sum + (value - meanY) ** 2, 0) / yValues.length
  );

  // Define a function to check if a value is an outlier based on the z-score
  const isOutlier = (point) =>
    Math.abs((point.x - meanX) / stdDevX) > threshold ||
    Math.abs((point.y - meanY) / stdDevY) > threshold;

    // Mark the outliers with cluster 90
    datapoints.forEach((point) => {
      if (isOutlier(point)) {
        point.cluster = 90;
      }
    });
}

/**
 * Calculate the wcss for the elbow method
 *
 * @param {[{ x, y, cluster}]} datapoints - all available data points, preferred in normalised form
 * @param {[{ x, y}]} centroids - all available centroids
 * @returns {wcss}  - number of calculated Within-Cluster Sum of Squares
 */
function calculate_wcss(datapoints, centroids) {
  let wcss = 0;

  for (i=0;i<datapoints.length;i++) {
    if (datapoints[i].cluster != 90){
    point = datapoints[i];
    centroid = centroids[point.cluster - 1];
    distance = euclid(point, centroid);
    wcss += distance ** 2;
  }
}

  return wcss;
}

/**
 * Calls the kmean algorithm
 *
 * @param {[{ x, y, cluster}]} datapoints - all available data points
 * @param {Number} k - number of clusters
 */
function kmeans (datapoints, k) {
  //normalise data and exclude outliers
  normalizedData = prePocessData(datapoints);
  //first random centroids
  centroids = get_random_centroids(normalizedData, k)
  assign_datapoints_to_centroids(normalizedData, centroids)
  
  iteration_count = 0;
  while (calculate_new_centroids (normalizedData, centroids) && iteration_count <= 2000){
    assign_datapoints_to_centroids(normalizedData, centroids)
    iteration_count++
  } 
  denormalize(datapoints, normalizedData, centroids)
  for (i=0;i<centroids.length;i++){
    datapoints.push({x: centroids[i].x, y: centroids[i].y, cluster: 99})
  }
}
/**
 * Callsthe elbow method
 *
 * @param {[{ x, y, cluster}]} datapoints - all available data points
 * @returns {optimalK}  - number of optimal clusters
 */
function elbow (datapoints){
  let wcss = []

  //calculate the wcss for maximum 8 clusters
  for (k=1;k<=8;k++){
    copy_data = datapoints
    
    normalizedData = prePocessData(copy_data);
    //first random centroids
    centroids = get_random_centroids(normalizedData, k)
    assign_datapoints_to_centroids(normalizedData, centroids)
  
    iteration_count = 0;
    while (calculate_new_centroids (normalizedData, centroids) && iteration_count <= 2000){
      assign_datapoints_to_centroids(normalizedData, centroids)
     iteration_count++
   } 
   wcss.push(calculate_wcss (normalizedData, centroids))
  }

  //if the fall is is less 20 Gradient we found the optimal clusters
  optimalK = 1
  for (i=2;i<9;i++){
    console.log("WCSS "+ (i)+": "+ wcss[i-1])
    let currentGradient = Math.atan(Math.abs((wcss[i - 1] - wcss[i - 2]) / (i - 1)))* (180 / Math.PI);
    console.log(currentGradient)
    if (currentGradient < 20){
      optimalK = i;
      console.log((i)+ " Cluster")
      i = 20
    }
  }
  return optimalK;
}