/**
 * User: h4rrydog
 * Date: 28/01/13
 * Time: 19:34
 */

// Place.Me proof-of-concept
// Quick and dirty conversion of infographics to D3-based visualisation

// SVG dimensions & colours
var     WIDTH = 600,
        HEIGHT = 250,
        RADIUS = Math.min(WIDTH, HEIGHT) / 2,
        MARGIN = 20,
        SPACING = 10,
        ORANGE_DK = "#ffbb33",
        ORANGE_LT = "#ff8800",
        PURPLE_DK = "#9933cc",
        PURPLE_LT = "#ba9bc9",
        GREEN_DK = "#669900",
        GREEN_LT = "#99cc00",
        GRAY_DK = "#777777",
        GRAY_LT = "#a9a9a9";

// ***** CRIME infographic *****
// Mock incoming JSON dataset
var crimeJSON = {
    overview: {
        "london": 100,
        "southwark": 25
    },
    breakdown: {
        "burglary": 45,
        "violent": 35,
        "domestic": 10,
        "rape": 3
    }
};

var     crimeOverview = crimeJSON.overview,
        crimeCity = Object.keys(crimeOverview)[0],
        crimeNeighborhood = Object.keys(crimeOverview)[1],
        crimeBreakdown = crimeJSON.breakdown;


// Generate overview statistics
var crimePercentage = crimeOverview[crimeNeighborhood] / crimeOverview[crimeCity];
var crimeRadiusCity = RADIUS - 20;
var crimeRadiusNeighborhood = crimeRadiusCity * Math.sqrt(crimePercentage);
var crimeCircleRadii = [crimeRadiusCity, crimeRadiusNeighborhood];


// Generate breakdown statistics
var     crimeBreakdownArray = [],
        crimeLegendData = [],
        other,                  // data only lists top 4, catch others
        total = 0;              // total of breakdown stats <= 100

for (var key in crimeBreakdown) {
    if (crimeBreakdown.hasOwnProperty(key)) {
        total += crimeBreakdown[key];
        crimeBreakdownArray.push(crimeBreakdown[key]);
        crimeLegendData.push(key + " " + crimeBreakdown[key] + "%");
    }
}

other = 100 - total;
crimeBreakdownArray.push(other);
crimeLegendData.push("other " + other + "%");


// Choose colors from palette
var crimePalette = [ORANGE_LT, ORANGE_DK];
var crimeColor = d3.scale.ordinal()
        .range(crimePalette);


// Create overview graph
var crimeSVG = d3.select(".infoGFX--crime").append("svg")
        .attr("class", "crimeSVG")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .append("g")
        .attr("transform", "translate(" + (crimeRadiusCity + MARGIN) + "," + HEIGHT / 2 + ")");

var crimeCircles = crimeSVG.selectAll("circle")
        .data(crimeCircleRadii)
    .enter().append("circle")
        .attr("cx", 0)
        .attr("cy", function(d, i) {return crimeRadiusCity - d})
        .attr("fill", function(d, i) {return crimeColor(i);})
        .attr("stroke", function(d, i) {return crimeColor(i);})
        .attr("r", 0)
        .transition()
        .duration(500)
        .delay(function(d, i) {return i*250;})
        .attr("r", function(d) {return d;});

crimeSVG.append("text")
        .attr("class", "citySVG")
        .attr("y", - crimeRadiusCity * 2/3)
        .attr("dy", ".3em")
        .text(crimeCity);

crimeSVG.append("text")
        .attr("class", "percentageSVG")
        .attr("y", crimeRadiusCity / 2)
        .attr("dy", "0.4em")
        .text(Math.floor(crimePercentage * 100) + "%");


// Create blowup lines
var crimeLines = d3.select("svg").append("g")
        .attr("transform", "translate(" + (crimeRadiusCity + MARGIN) + "," + HEIGHT / 2 + ")");

crimeLines.append("line")
        .transition()
        .duration(250)
        .delay(2250)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 2 * crimeRadiusCity + SPACING)
        .attr("y2", -crimeRadiusCity)
        .style("stroke", "#ffbb33");

crimeLines.append("line")
        .transition()
        .duration(250)
        .delay(2250)
        .attr("x1", 0)
        .attr("y1", 2 * crimeRadiusNeighborhood)
        .attr("x2", 2 * crimeRadiusCity + SPACING)
        .attr("y2", 2 * crimeRadiusNeighborhood)
        .style("stroke", "#ffbb33");


// Create breakdown graph
var crimeArc = d3.svg.arc()
        .outerRadius(crimeRadiusCity)
        .innerRadius(0);

var crimePie = d3.layout.pie()
        .sort(null)
        .value(function(d) {return d;});

var crimePieChart = d3.select("svg").append("g")
        .attr("transform", "translate(" + (3 * crimeRadiusCity + MARGIN + 10) +
                "," + HEIGHT / 2 + ")")
    .selectAll("crimeArc")
        .data(crimePie(crimeBreakdownArray));

crimePieChart.enter().append("g")
        .attr("class", "crimeArc")
        .append("path")
        .style("fill", "#ffbb33")
        .style("stroke", "#ffffff")
        .style("stroke-width", 2)
        .transition()
        .duration(500)
        .delay(function(d, i) {return i * 250 + 1000})
        .attr("d", crimeArc);

crimePieChart.append("text")
        .transition()
        .delay(2250)
        .attr("class", "regionSVG")
        .attr("y", crimeRadiusCity + 2*SPACING)
        .text(crimeNeighborhood);

// Create breakdown legend
var crimeLegend = d3.select(".infoGFX--crime").append("div")
        .attr("class", "legend");

crimeLegend.selectAll("div")
        .data(crimeLegendData)
    .enter().append("div")
        .attr("class", "legendItem")
        .transition()
        .duration(500)
        .delay(function(d, i) {return i * 250 + 1000})
        .text(function(d) {return d});


// ***** RELATIONSHIP infographic *****
// Mock JSON relationship dataset

var relationshipJSON = {
    "partner": {
        "MF": 37000,
        "FF": 20000,
        "MM": 13000
    },
    "single": {
        "M": 27000,
        "F": 13000
    }
}

// Generate statistics
var     relationshipPartners,   // total numbers of partners
        relationshipSingles,    // total number of singles
        relationshipTotal,      // total number of people
        relationshipStatusData, // data array for donut graph (single v partner)
        genderStatusData,       // data array for gender ring (male v female)
        singleData,             // data array for singles pictogram
        partnerData;            // data array for partners pictogram

relationshipPartners = relationshipJSON["partner"]["MF"] +
        relationshipJSON["partner"]["FF"] +
        relationshipJSON["partner"]["MM"];

relationshipSingles = relationshipJSON["single"]["M"] +
        relationshipJSON["single"]["F"];

relationshipTotal = relationshipPartners + relationshipSingles;

relationshipStatusData = [relationshipSingles, relationshipPartners];

genderStatusData = [
                relationshipJSON["single"]["M"],
                relationshipJSON["single"]["F"],
                relationshipPartners
];

singleData = genderStatusData.slice(0, 2);
partnerData = [
        relationshipJSON["partner"]["MF"],
        relationshipJSON["partner"]["FF"],
        relationshipJSON["partner"]["MM"]
];

// Massage the data for pictogram, e.g.
// 37,000 -> 3.7 -> [1, 1, 1, 0.7]
// 20,000 -> 2.0 -> [1, 1]
// 13,000 -> 1.3 -> [1, 0.3]
var makePictoData = function(d, i, array) {
    var     number = d / 10000,
            remainder,
            myArray = [];

    if (d <= 0) {
        myArray.push(0);
    }
    else {
        remainder = number - Math.floor(number);
        number = Math.floor(number);

        while (number) {
            myArray.push(1);
            --number;
        }

        if (remainder > 1e-6) myArray.push(remainder);
    }
    array[i] = myArray;
    return;
}

singleData.forEach(makePictoData);
partnerData.forEach(makePictoData);


// Generate ordinal colormap functions
var relationshipPalette = [PURPLE_LT, PURPLE_DK];
var relationshipColors = d3.scale.ordinal()
        .range(relationshipPalette);

var genderPalette = [GRAY_LT, GRAY_DK, "#ffffff"];
var genderColors = d3.scale.ordinal()
        .range(genderPalette);


// Generate donut graphs
var relationshipArc = d3.svg.arc()
        .outerRadius(RADIUS - 10)
        .innerRadius(RADIUS - 70);

var relationshipPie = d3.layout.pie()
        .sort(null)
        .value(function(d) {return d;});

var relationshipSVG = d3.select(".infoGFX--relationship").append("svg")
        .attr("class", "relationshipSVG")
        .attr("width", 300)
        .attr("height", HEIGHT);

var relationshipPieChart = relationshipSVG.append("g")
        .attr("transform", "translate(" + (RADIUS + MARGIN) + "," + HEIGHT / 1.7 + ")")
    .selectAll("relationshipArc")
        .data(relationshipPie(relationshipStatusData));

relationshipPieChart.enter()
        .append("g")
        .attr("class", "relationshipArc")
        .append("path")
        .style("fill", function(d, i) {return relationshipColors(i);})
        .style("stroke", "#ffffff")
        .style("stroke-width", 5)
        .attr("d", relationshipArc);

var genderArc = d3.svg.arc()
        .outerRadius(RADIUS - 5)
        .innerRadius(RADIUS - 20);

var genderPie = d3.layout.pie()
        .sort(null)
        .value(function(d) {return d;});

var genderPieChart = relationshipPieChart.selectAll("genderArc")
        .data(genderPie(genderStatusData));

genderPieChart.enter()
        .append("g")
        .attr("class", "genderArc")
        .append("path")
        .style("fill", function(d, i) {return genderColors(i);})
        .style("stroke", "#ffffff")
        .style("stroke-width", 5)
        .attr("d", genderArc);

relationshipSVG.append("text")
        .attr("class", "peopleSVG")
        .attr("x", (RADIUS + MARGIN))
        .attr("y", HEIGHT / 1.7)
        .attr("dy", "0.3em")
        .text(relationshipTotal / 1000 + "k");


// Generate pictograms
var partnerPictogram = d3.select(".infoGFX--relationship").append("div")
        .attr("class", "partnerPictogram");

partnerPictogram.append("div")
        .attr("class", "partnersLabel")
        .text(relationshipPartners / 1000 + "k partners");

var partnerMFgraph = partnerPictogram.append("div")
        .attr("class", "pictogramRow");

partnerMFgraph.selectAll(".partnerGraph--MF")
        .data(partnerData[0])
    .enter()
        .append("div")
        .attr("class", "partnerGraph partnerGraph--MF")
        .style("width", function(d) {return (d * 30) + "px";})

var partnerFFgraph = partnerPictogram.append("div")
        .attr("class", "pictogramRow");

partnerFFgraph.selectAll(".partnerGraph--FF")
        .data(partnerData[1])
    .enter()
        .append("div")
        .attr("class", "partnerGraph partnerGraph--FF")
        .style("width", function(d) {return (d * 30) + "px";});

var partnerMMgraph = partnerPictogram.append("div")
        .attr("class", "pictogramRow");

partnerMMgraph.selectAll(".partnerGraph--MM")
        .data(partnerData[2])
    .enter()
        .append("div")
        .attr("class", "partnerGraph partnerGraph--MM")
        .style("width", function(d) {return (d * 30) + "px";});

partnerPictogram.append("div")
        .attr("class", "singlesLabel")
        .text(relationshipSingles / 1000 + "k singles");

var singleMgraph = partnerPictogram.append("div")
        .attr("class", "pictogramRow");

singleMgraph.selectAll(".singleGraph--M")
        .data(singleData[0])
    .enter()
        .append("div")
        .attr("class", "singleGraph singleGraph--M")
        .style("width", function(d) {return (d * 20) + "px";});

var singleFgraph = partnerPictogram.append("div")
        .attr("class", "pictogramRow");

singleFgraph.selectAll(".singleGraph--F")
        .data(singleData[1])
    .enter()
        .append("div")
        .attr("class", "singleGraph singleGraph--F")
        .style("width", function(d) {return (d * 20) + "px";});


// ***** PAY infographic *****
// Mock JSON relationship dataset

var payJSON = {
    "leaderboard": {
        "croydon": 6000,
        "lambeth": 5500,
        "southwark": 5000,
        "camden": 4500,
        "chelsea": 2000
    },
    "pay": {
        "men": 45000,
        "women": 30000
    }
}

var     payLeaderboard = payJSON["leaderboard"],
        payBreakdown =  payJSON["pay"],
        payMen = payBreakdown["men"],
        payWomen = payBreakdown["women"],
        totalPay, averagePay, diffPay,
        payData = [],
        leaderboardKeys,
        payLeaderboardData = [];

// Generate stats
totalPay = payMen + payWomen;
averagePay = totalPay / 2;
diffPay = payMen - averagePay;  // positive when payMen > payWomen

var makePayData = function(pay, averagePay) {
    var myArray = [];

    if (pay < averagePay) {
        myArray = [pay];
    } else {
        myArray = [averagePay, (pay - averagePay)];
    }

    return myArray;
}

payData.push(makePayData(payMen, averagePay));
payData.push(makePayData(payWomen, averagePay));

leaderboardKeys = Object.keys(payLeaderboard);

for (var i = 0; i < leaderboardKeys.length; i++) {
    payLeaderboardData.push([leaderboardKeys[i], payLeaderboard[leaderboardKeys[i]]]);
}


// Generate graph
var payGraph = d3.select(".infoGFX--pay").append("div")
        .attr("class", "payGraph");

payGraph.append("div")
        .attr("class", "payBorder payBorder--left");
payGraph.append("div")
        .attr("class", "payBorder payBorder--right");

var menGraph = payGraph.append("div")
        .attr("class", "menGraph")
        .style("width", function(d) {return (payMen / totalPay * 100) + "%"});

menGraph.selectAll(".menGraph--parts")
        .data(payData[0])
    .enter()
        .append("div")
        .attr("class", "menGraph--parts")
        .style("width", function(d) {return (d / payMen * 100) + "%"});

menGraph.append("div")
        .attr("class", "menText")
        .text(function(d) {return "£" + (payMen / 1000) + "k";});

var womenGraph = payGraph.append("div")
        .attr("class", "womenGraph")
//        .text("£" + Math.floor(payWomen / 1000) + "k")
        .style("width", function(d) {return (payWomen / totalPay * 100) + "%"});

womenGraph.selectAll(".womenGraph--parts")
        .data(payData[1])
    .enter()
        .append("div")
        .attr("class", "womenGraph--parts")
        .style("width", function(d) {return (d / payWomen * 100) + "%"});

payGraph.append("div")
        .attr("class", "payBorder payBorder--left");
payGraph.append("div")
        .attr("class", "payBorder payBorder--right");

womenGraph.append("div")
        .attr("class", "womenText")
        .text(function(d) {return "£" + (payWomen / 1000) + "k";});

payGraph.append("div")
        .attr("class", "payGap")
        .text("£" + (diffPay * 2) + " gap average");

var payLeaderboardGraph = payGraph.append("div")
        .attr("class", "leaderboard");

for (var i = 0; i < payLeaderboardData.length; i++) {
    payLeaderboardGraph.append("div")
            .attr("class", "leaderboardLeft")
            .text(payLeaderboardData[i][0]);
    payLeaderboardGraph.append("div")
            .attr("class", "leaderboardRight")
            .text(payLeaderboardData[i][1]);
}


