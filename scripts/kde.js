
// Log error if d3 is not loaded by the page
if(typeof d3 === 'undefined'){
    console.error('kmeans script requires D3');
}

// Kernels
function kernelEpanechnikov(k){
    return x => Math.abs(x /= k) <= 1 ? 0.75 * (1 - x * x) / k : 0;
}

function kernelUniform(k){
    return x => (x / k > 1 || x / k < -1) ? 0 : 0.5;
}

function kernelTriangular(k){
    return x => (x / k < 0 && x / k > -1) ? x/k+1 : (x / k > 0 && x / k < 1) ? -x/k+1 : (x/k===0) ? 1 : 0;
}

function kernelGaussian(k, mean=0, variance=50){
    let stdev = Math.sqrt(variance);
    return x => Math.exp(-Math.pow((x/k) - mean, 2) / (2 * variance)) / stdev * Math.sqrt(2 * Math.PI);

}

// Core density estimator function, maps thresholds to estimates
// given full data and kernel function
function kde(thresholds, data, kernel){
    return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))]);
}

// Main KDE method
// Takes values, target number of bins and kernel function
// Returns:
//     - thresholds from binning value
//     - extent of binned values
//     - count frequency for each bin
//     - Density line (array of points) 
function KDE(values, targetBins, kernel=kernelEpanechnikov(0.5)){

    let bins = d3.bin().thresholds(targetBins)(values),
        thresholds = bins.map(d=>d.x0),
        step = thresholds[1]-thresholds[0],
        extent = [d3.min(bins,d=>d.x0),d3.max(bins,d=>d.x1)],
        freq = bins.map(d=>d3.count(d)/d3.count(values)),
        density = kde(thresholds.map(t=>t+step/2), values, kernel);

    return {thresholds,extent,freq,density};

}

export {KDE, kernelGaussian, kernelTriangular, kernelUniform, kernelEpanechnikov};