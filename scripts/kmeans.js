// Log error if d3 is not loaded by the page
if(typeof d3 === 'undefined'){
    console.error('kmeans script requires D3');
}

// function calculating the Euclidean distance between points
// a and b are arrays of coordinates (in n-dimensions)
// returns distance between a and b
function euclideanDistance(a, b){
    return Math.sqrt(d3.sum(a.map((v,i)=>(v-b[i])**2)));
}

// function calculating a cluster id for each point in the data
// based on their proximity to centroid points
// data and centroids are arrays of points
// returns an array of cluster ids (index of centroid), one per data point
function cluster(data, centroids) {
    const clusters = [];
    for (let p of data) {
        const i = d3.minIndex(centroids.map(c=>euclideanDistance(c,p)));
        clusters.push(i);
    }
    return clusters;
}

// function computing the centroid for a subset of points
// points is an array of points
// returns a single centroid point
function pointsCentroid(points){
    const dim = points[0].length,
        means = [];
    for(let i of d3.range(dim)){
        means[i] = d3.mean(points, p=>p[i]);
    }
    return means;
}

// function getting new centroids for each cluster
// data is the array of data points, clusters is an array of clusters ids, one per data point
// returns an array of centroid points
function recalculateCentroids(data, clusters){
    const newCentroids = [];
    for(let c of d3.range(d3.max(clusters)+1)){
        const indices = clusters.map((d,i)=>d===c?i:null).filter(i=>i!==null);
        const points = data.filter((d,i)=>indices.includes(i));
        const newCentroid = points.length > 0 ? pointsCentroid(points) : initCentroids(data, 1)[0];
        newCentroids.push(newCentroid);
    }
    return newCentroids;
}

// function initialising centroids at random from the set of data points
// data is an array of data points to sample from, k the number of centroids to initialise
// returns an array of centroid points
function initCentroids(data, k){
    const indices = new Set();
    while(indices.size < k){
        indices.add(d3.randomInt(0,data.length)());
    }
    return d3.map(indices, i=>data[i]);
}

// function evaluating if the clustering process should halt
// oldCentroids and newCentroids are arrays of centroid points
// threshold is minimum distance between old and new centroid required to halt
// maxIter is a flag indidcating if the maximum number of iterations has been reached
// returns true if the algorithm should stop
function shouldStop(oldCentroids, newCentroids, threshold, maxIter) {
    if (maxIter) return true;
    if (!oldCentroids || !oldCentroids.length) return false;
    for(let i in oldCentroids){
        if(euclideanDistance(oldCentroids[i],newCentroids[i]) > threshold) return false;
    }
    return true;
}

// function to scale every dimension within the range [0,1]
// data is an array of data points
// returns the same points scaled 
function scaleData(data){
    const scales = [];
    for(let i in data[0]){
        scales[i] = d3.scaleLinear(d3.extent(data,d=>d[i]), [0,1]);
    }
    return data.map(p => p.map((v,i)=>scales[i](v)));
}

// function running k-means on a set of numerical data, in any number of dimensions
// data: the data points to cluster
// k: the number of clusters
// maxIterations: maximum number of iterations allowed
// convergenceThreshold: minimum distance required between centroids to declare convergence
// returns an array of cluster ids (index of centroid), one per data point
function kmeans(data, k, maxIterations = 100, convergenceThreshold=0.0001){
    let centroids, clusters, oldCentroids;
    let iterations = 0;
    const scaledData = scaleData(data);
    centroids = initCentroids(scaledData, k);
    while(!shouldStop(oldCentroids, centroids, convergenceThreshold, iterations>maxIterations)){
        oldCentroids = [...centroids];
        iterations++;
        clusters = cluster(scaledData, centroids);
        centroids = recalculateCentroids(scaledData, clusters);
    }
    return clusters;
}

export {kmeans}