// Log error if d3 is not loaded by the page
if(typeof d3 === 'undefined'){
    console.error('kmeans script requires D3');
}

// Calculates the linear regression function between
// values of X and corresponding values of Y
function linearRegression(X, Y){
   let sumX = d3.sum(X),
        sumY = d3.sum(Y),
       sumXY = d3.sum(d3.transpose([X,Y]), d=>d[0]*d[1]),
        sumX2 = d3.sum(X, d=>d*d),
        n = X.length,
       slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX),
       intercept = (sumY - slope * sumX) / n;
   return (x) => slope * x + intercept;
}

  

export {linearRegression}