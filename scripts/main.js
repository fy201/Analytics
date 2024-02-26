import { KDE, kernelEpanechnikov, kernelGaussian } from './kde.js'
import { kmeans } from './kmeans.js';
import { linearRegression } from './linreg.js';

// Function that draws an histogram of values
// along with the density estimation calculated using KDE
function histogramKDE(values, targetBins, kernel=kernelGaussian(0.5)){

    let {thresholds,extent,freq,density} = KDE(values, targetBins, kernel)

    let X = thresholds, Y = freq;

    let width = 600,
        height = 400,
        padding = 30;

    let xScale = d3.scaleLinear(extent, [0,width-padding*2]),
        yScale = d3.scaleLinear([0, d3.max(Y)], [height-padding*2, 0]).nice(),
        xBandwidth = xScale(X[1])-xScale(X[0]);
    
    let svg = d3.select('body').append('svg').attr('width', width).attr('height', height),
        chart = svg.append('g').attr('transform', `translate(${padding},${padding})`),
        xAxis = svg.append('g').attr('transform', `translate(${padding},${height-padding})`),
        yAxis = svg.append('g').attr('transform', `translate(${padding},${padding})`);
    console.log(d3.transpose([X,Y]))
    let bars = chart.selectAll('rect')
        .data(d3.transpose([X,Y]), d=>d[0])
        .join('rect')
        .attr('x', d=>xScale(d[0]))
        .attr('width', xBandwidth)
        .attr('y', d=>yScale(d[1]))
        .attr('height', d=>yScale(0)-yScale(d[1]))
        .style('fill', '#bbb')
        .style('stroke', '#eee')
        .style('stroke-width', '1px');
    let lineGen = d3.line()
        .x(d=>xScale(d[0]))
        .y(d=>yScale(d[1]))
        .curve(d3.curveBasis)
    let kdeLine = chart.append('path')
        .datum(density)
        .attr('d',lineGen)
        .style('fill','none')
        .style('stroke', '#e34017')
        .style('stroke-width', '2px');
    
    
    xAxis.call(d3.axisBottom(xScale))
    yAxis.call(d3.axisLeft(yScale).tickFormat(d3.format('.0%')))


}

// Function that draws a scatter plot of points
// Each point should have two coordinates + an optional cluster label
// By default, the function will also calculate and display the linear regression 
function scatterPlotReg(values, showReg=true){
    const hasZ = typeof values[0][2] !== 'undefined';

    let X = values.map(d=>d[0]),
        x1 = d3.min(X),
        x2 = d3.max(X),
        Y = values.map(d=>d[1]),
        y1 = d3.min(Y),
        y2 = d3.max(Y),
        Z = hasZ ? values.map(d=>d[2]) : new Array(X.length).fill(0),
        zRange = Array.from(new Set(Z));

    let width = 600,
        height = 400,
        padding = 30;

    let xScale = d3.scaleLinear([x1, x2], [0,width-padding*2]).nice(),
        yScale = d3.scaleLinear([y1, y2], [height-padding*2, 0]).nice(),
        zScaleSymbol = d3.scaleOrdinal(zRange, d3.symbolsFill),
        zScaleColor = d3.scaleOrdinal(zRange, d3.schemeTableau10);
    
    let svg = d3.select('body').append('svg').attr('width', width).attr('height', height),
        chart = svg.append('g').attr('transform', `translate(${padding},${padding})`),
        xAxis = svg.append('g').attr('transform', `translate(${padding},${height-padding})`),
        yAxis = svg.append('g').attr('transform', `translate(${padding},${padding})`);
    
    let points = chart.selectAll('path')
        .data(d3.transpose([X,Y,Z]))
        .join('path')
        .attr('transform', d=>`translate(${xScale(d[0])},${yScale(d[1])})`)
        .attr('d', d=>d3.symbol(zScaleSymbol(d[2]),60)())
        .style('fill', d=>zScaleColor(d[2]))
        .style('stroke', '#222')
        .style('stroke-width', '1px');    

    if(showReg) {
        let reg = linearRegression(X, Y);
        let line = chart.append('line')
            .attr('x1', xScale(x1))
            .attr('x2', xScale(x2))
            .attr('y1', yScale(reg(x1)))
            .attr('y2', yScale(reg(x2)))
            .style('stroke', '#e34017')
            .style('stroke-width', '2px')
            .style('stroke-dasharray', '5 5');
    }
    
    
    xAxis.call(d3.axisBottom(xScale).tickFormat(d3.format('.0f')))
    yAxis.call(d3.axisLeft(yScale).tickFormat(d3.format('.2')))
    
}

// loading data
let data = await d3.csv ('../data/MappingMuseumsData.csv', (d)=>{
    return{
        museum_name: d.museum_name,
        museum_id: d.museum_id,
        address_line_1: d.address_line_1,
        address_line_2: d.address_line_2,
        city: d.city,
        postcode: d.postcode,
        latitude: parseFloat(d.latitude),
        longitude: parseFloat(d.longitude),
        admin_area_full: d.admin_area_full,
        admin_area_1: d.admin_area_1,
        admin_area_2: d.admin_area_2,
        admin_area_2_type: d.admin_area_2_type,
        admin_area_3: d.admin_area_3,
        admin_area_3_type: d.admin_area_3_type,
        admin_area_4: d.admin_area_4,
        admin_area_4_type: d.admin_area_4_type,
        accreditation: d.accreditation,
        governance_type: d.governance_type,
        size: d.size,
        governance_subtype: d.governance_subtype,
        size_provenance: d.size_provenance,
        subject_matter_full: d.subject_matter_full,
        subject_matter: d.subject_matter,
        subject_matter_subtype_1: d.subject_matter_subtype_1,
        subject_matter_subtype_2: d.subject_matter_subtype_2,
        year_opened_low: +d.year_opened_low,
        year_opened_high: +d.year_opened_high,
        year_closed_low: +d.year_closed_low,
        year_closed_high: +d.year_closed_high,
        data_primary_provenance: d.data_primary_provenance,
        area_deprivation_index: +d.area_deprivation_index,
        area_deprivation_index_crime: +d.area_deprivation_index_crime,
        area_deprivation_index_education: +d.area_deprivation_index_education,
        area_deprivation_index_employment: +d.area_deprivation_index_employment,
        area_deprivation_index_health: +d.area_deprivation_index_health,
        area_deprivation_index_housing: +d.area_deprivation_index_housing,
        area_deprivation_index_income: +d.area_deprivation_index_income,
        area_deprivation_index_services: +d.area_deprivation_index_services,
        area_geodemographic_supergroup: d.area_geodemographic_supergroup,
        area_geodemographic_group: d.area_geodemographic_group,
        area_geodemographic_subgroup: d.area_geodemographic_subgroup,
    
    
    }
    
    });
    //grouping Data
   
   let region= new Set(data.map(d=>d.admin_area_1));
   console.log(region);
   let governance= new Set(data.map(d=>d.governance_type));
    console.log(governance);
    let Accreditation= new Set(data.map(d=>d.accreditation));
    console.log(Accreditation);
    let Unaccredited= data.filter(d=>d.accreditation==='Unaccredited')
    console.log(Unaccredited);
    let sortedSize = d3.sort(data, d=>d.size);
    console.log(sortedSize);

   

   
   //aggregations
   let subregion = d3.group(data, d=>d.admin_area_2);
    console.log(subregion);
    let grpRegionSubRegion = d3.group(data, d=>d.admin_area_1, d=>d.admin_area_2);
    console.log(grpRegionSubRegion);
// Extracting x and y values
let X = data.map(d=>d.latitude),
    Y = data.map(d=>d.longitude);

// Render density plot
histogramKDE(X, 10, kernelGaussian(0.5));

// Render linear regression
scatterPlotReg(d3.transpose([X,Y]));

// Estimate clusters
let C = kmeans(d3.transpose([X,Y]), 2, 100);

// Render scatterplot with clusters
scatterPlotReg(d3.transpose([X,Y,C]), false);