// --- Boxplot using snow_state data ---
d3.csv("snow_state.csv").then(function(data) {
  data.forEach(function(d) {
    d.Likes = +d.Likes;
  });
  
  const width = 600, height = 400;
  const margin = {top: 60, bottom: 60, left: 50, right: 50};
  const container = d3.select("#boxplot");
  if (container.empty()) { console.error("Container #boxplot not found."); return; }
  
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "#e9f7f2");
  
  const xScale = d3.scaleBand()
    .domain([...new Set(data.map(d => d.Platform))])
    .range([margin.left, width - margin.right])
    .padding(0.5);
  
  const yScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.Likes), d3.max(data, d => d.Likes)])
    .range([height - margin.bottom, margin.top]);
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));
  
  const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));
  
  const yAxis = svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));
  
  xAxis.append("text")
    .attr("x", width - margin.left - 10)
    .attr("y", -10)
    .style("stroke", "black")
    .text("Platform Name");
  
  yAxis.append("text")
    .attr("y", 25)
    .attr("x", 50)
    .style("stroke", "black")
    .text("Number of Likes");
  
  svg.append("text")
    .attr("x", width / 3)
    .attr("y", margin.top / 2)
    .style("font-weight", "bold")
    .text("Distribution of Like Counts across Platforms");
  
  const rollupFunction = function(groupData) {
    const values = groupData.map(d => d.Likes).sort(d3.ascending);
    return {
      q1: d3.quantile(values, 0.25),
      median: d3.quantile(values, 0.5),
      q3: d3.quantile(values, 0.75),
      min: d3.min(values),
      max: d3.max(values)
    };
  };
  
  const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);
  quantilesByGroups.forEach((quantiles, Platform) => {
    const x = xScale(Platform);
    const boxWidth = xScale.bandwidth();
    
    svg.append("line")
      .attr("x1", x + boxWidth/2)
      .attr("x2", x + boxWidth/2)
      .attr("y1", yScale(quantiles.min))
      .attr("y2", yScale(quantiles.max))
      .attr("stroke", "black");
    
    svg.append("rect")
      .attr("x", x)
      .attr("y", yScale(quantiles.q3))
      .attr("width", boxWidth)
      .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
      .attr("fill", "lightblue")
      .attr("stroke", "black");
    
    svg.append("line")
      .attr("x1", x)
      .attr("y1", yScale(quantiles.median))
      .attr("x2", x + boxWidth)
      .attr("y2", yScale(quantiles.median))
      .attr("stroke", "black");
  });
});

// --- Barplot using socialMediaAvg data ---
d3.csv("socialMediaAvg.csv").then(function(data) {
  data.forEach(function(d) {
    d.AvgLikes = +d.AvgLikes;
  });
  
  const width = 600, height = 400;
  const margin = {top: 60, bottom: 60, left: 50, right: 50};
  const container = d3.select("#barplot");
  if (container.empty()) { console.error("Container #barplot not found."); return; }
  
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "#e9f7f2");
  
  const x0 = d3.scaleBand()
    .domain([...new Set(data.map(d => d.Platform))])
    .range([margin.left, width - margin.right])
    .padding(0.2);
  
  const x1 = d3.scaleBand()
    .domain([...new Set(data.map(d => d.PostType))])
    .range([0, x0.bandwidth()])
    .padding(0.05);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.AvgLikes) + 150])
    .range([height - margin.bottom, margin.top]);
  
  const color = d3.scaleOrdinal()
    .domain([...new Set(data.map(d => d.PostType))])
    .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);
  
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x0))
    .selectAll("text")
    .style("text-anchor", "middle");
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .style("font-size", "12px");
  
  const barGroups = svg.selectAll("bar")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${x0(d.Platform)},0)`);
  
  barGroups.append("rect")
    .attr("x", d => x1(d.PostType))
    .attr("y", d => y(d.AvgLikes))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - margin.bottom - y(d.AvgLikes))
    .attr("fill", d => color(d.PostType));
  
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 150}, ${margin.top})`);
  
  const types = [...new Set(data.map(d => d.PostType))];
  types.forEach((type, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * 20)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(type));
    
    legend.append("text")
      .attr("x", 20)
      .attr("y", i * 20 + 12)
      .text(type)
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  });
  
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.top + 15)
    .style("text-anchor", "middle")
    .text("Platform");
  
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height / 2))
    .attr("y", margin.left/3)
    .style("text-anchor", "middle")
    .text("Likes");
});

// --- Lineplot using SocialMediaTime data ---
d3.csv("SocialMediaTime.csv").then(function(data) {
  data.forEach(function(d) {
    d.AvgLikes = +d.AvgLikes;
  });
  
  const width = 800, height = 500;
  const margin = {top: 60, bottom: 60, left: 50, right: 50};
  const container = d3.select("#lineplot");
  if (container.empty()) { console.error("Container #lineplot not found."); return; }
  
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "#e9f7f2");
  
  const yScale = d3.scaleLinear() 
    .domain([400, 600]) 
    .range([height - margin.bottom, margin.top]);
  
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.Date))
    .range([margin.left, width - margin.right])
    .padding(0.5);
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));
  
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-25)");
  
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.top + 15)
    .style("text-anchor", "middle")
    .text("Time");
  
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height / 2))
    .attr("y", margin.left/3)
    .style("text-anchor", "middle")
    .text("Likes");
  
  const line = d3.line()
    .x(d => xScale(d.Date) + xScale.bandwidth()/2)
    .y(d => yScale(d.AvgLikes))
    .curve(d3.curveNatural);
  
  svg.append("path")
    .datum(data)
    .attr("d", line)
    .attr("stroke", "black")
    .attr("fill", "none");
});

// --- Sankey diagram using sankey_data.csv with tooltip interactivity ---
d3.csv("sankey_data.csv").then(function(data) {
  const width = 960, height = 500;
  const container = d3.select("#sankey");
  if (container.empty()) { console.error("Container #sankey not found."); return; }
  
  const svg = container
    .attr("width", width)
    .attr("height", height);
  
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#f4f4f4")
    .style("padding", "8px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0);
  
  const nodeColor = d3.scaleOrdinal(d3.schemeCategory10);
  const linkColor = d3.scaleOrdinal(d3.schemeSet2);
  
  const sankeyGen = d3.sankey()
    .nodeWidth(20)
    .nodePadding(10)
    .extent([[1, 1], [width - 1, height - 6]]);
  
  const graph = { nodes: [], links: [] };
  const nodeSet = new Set();
  
  data.forEach(d => {
    nodeSet.add(d.Resort);
    nodeSet.add(d.snowfall_group);
    graph.links.push({
      source: d.Resort,
      target: d.snowfall_group,
      value: +d.count
    });
  });
  
  graph.nodes = Array.from(nodeSet).map(name => ({ name }));
  const nodeMap = new Map(graph.nodes.map((d, i) => [d.name, i]));
  graph.links.forEach(d => {
    d.source = nodeMap.get(d.source);
    d.target = nodeMap.get(d.target);
  });
  
  sankeyGen(graph);
  
  svg.append("g")
    .attr("fill", "none")
    .selectAll("path")
    .data(graph.links)
    .join("path")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke", "#000")
    .attr("stroke-opacity", 0.2)
    .attr("stroke-width", d => Math.max(1, d.width))
    .on("mouseover", function(event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html("Source: " + d.source.name + "<br/>Target: " + d.target.name + "<br/>Value: " + d.value)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      d3.select(this)
        .attr("stroke", linkColor(d.source.name))
        .attr("stroke-opacity", 0.8);
    })
    .on("mouseout", function(event, d) {
      tooltip.transition().duration(500).style("opacity", 0);
      d3.select(this)
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.2);
    });
  
  const node = svg.append("g")
    .selectAll("g")
    .data(graph.nodes)
    .join("g")
    .on("mouseover", function(event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html("Name: " + d.name)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      d3.select(this)
        .select("rect")
        .attr("fill", d3.rgb(nodeColor(d.name)).brighter(0.5));
    })
    .on("mouseout", function(event, d) {
      tooltip.transition().duration(500).style("opacity", 0);
      d3.select(this)
        .select("rect")
        .attr("fill", nodeColor(d.name));
    });
  
  node.append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", d => nodeColor(d.name));
  
  node.append("text")
    .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
    .attr("y", d => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
    .text(d => d.name);
});

// --- Interactive Pie Charts for Slope Type Distribution using slopes_comparison_long.csv ---
d3.csv("slopes_comparison_long.csv").then(function(data) {
  const width = 300, height = 300, radius = Math.min(width, height) / 2;
  const containerEast = d3.select("#eastPie");
  const containerWest = d3.select("#westPie");
  if (containerEast.empty()) { console.error("Container #eastPie not found."); return; }
  if (containerWest.empty()) { console.error("Container #westPie not found."); return; }
  
  const svgEast = containerEast.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width/2}, ${height/2})`);
  
  const svgWest = containerWest.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width/2}, ${height/2})`);
  
  const color = d3.scaleOrdinal()
    .domain(data.map(d => d["Slope Type"]))
    .range(d3.schemeCategory10);
  
  const tooltipPie = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#f4f4f4")
    .style("padding", "8px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0);
  
  function createPieChart(svgContainer, region) {
    const regionData = data.filter(d => d.Region === region);
    const pie = d3.pie().value(d => +d.Percentage);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    const arcs = svgContainer.selectAll("arc")
      .data(pie(regionData))
      .enter()
      .append("g");
    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data["Slope Type"]))
      .on("mouseover", function(event, d) {
         tooltipPie.transition().duration(200).style("opacity", 0.9);
         tooltipPie.html("Slope Type: " + d.data["Slope Type"] + "<br/>Percentage: " + d.data.Percentage + "%")
           .style("left", (event.pageX + 10) + "px")
           .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
         tooltipPie.transition().duration(500).style("opacity", 0);
      });
    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text(d => d.data["Slope Type"]);
  }
  
  createPieChart(svgEast, "East Coast");
  createPieChart(svgWest, "West Coast");
});

// --- Dashboard Chart using JSON and Plotly with Filter Controls ---
let dashboardData;
d3.json("static/dashboard.json").then(function(data) {
  dashboardData = data;
  // Assuming dashboardData is an array of objects with 'category' and 'value' properties
  const x = dashboardData.map(d => d.category);
  const y = dashboardData.map(d => d.value);
  
  const trace = {
    x: x,
    y: y,
    type: 'bar'
  };
  
  const layout = {
    title: 'Dashboard Chart'
  };
  
  Plotly.newPlot('plotlyChart', [trace], layout);
});

document.getElementById('filterSelect').addEventListener('change', function() {
  if (!dashboardData) return;
  const selectedCategory = this.value;
  const filteredData = selectedCategory === 'all' ? dashboardData : dashboardData.filter(d => d.category === selectedCategory);
  const x = filteredData.map(d => d.category);
  const y = filteredData.map(d => d.value);
  
  Plotly.restyle('plotlyChart', {
    x: [x],
    y: [y]
  });
});