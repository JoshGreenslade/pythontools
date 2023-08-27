function test() {
    // Declare the chart dimensions and margins.
    const width = 640;
    const height = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;
  
    // Declare the x (horizontal position) scale.
    const x = d3.scaleLinear()
        .domain([0, 100])
        .range([marginLeft, width - marginRight]);
  
    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height - marginBottom, marginTop]);
  
    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height);

    const axisStyle = [
      "color: hsl(270, 50%, 50%)",
      "stroke-width: 10px"
    ]
  
    // Add the x-axis.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x)
          .tickValues([])
          .tickSize(0))
        .attr("style", axisStyle.join(';'))
  
    // Add the y-axis.
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y)
        .tickValues([])
        .tickSize(0))
      .attr("style", axisStyle.join(';'))  

    // Return the SVG element.
    return svg.node();
}

const hello = test()
document.querySelector(".d3_test").append(hello)