import * as d3 from "d3";

const margin = { left: 32, right: 16, top: 12, bottom: 28 };

export default class Chart {
  public canvas: any;
  private width: number;
  constructor(props: any) {
    this.width = props.clientWidth - margin.left - margin.right;

    this.canvas = d3
      .select(props)
      .append("svg")
      .attr(
        "viewBox",
        `0 0 ${this.width + margin.left + margin.right} ${
          this.width / 3.5 + margin.top + margin.bottom
        }`
      )
      .attr("width", "100%")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    this.render();
  }

  render() {
    const { canvas, width } = this;

    canvas
      .append("defs")
      .append("linearGradient")
      .attr("id", "gradient")
      .attr("x1", width)
      .attr("y1", 0)
      .attr("x2", width)
      .attr("y2", width / 3.5)
      .attr("gradientUnits", "userSpaceOnUse")
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#87BBFF88" },
        { offset: "100%", color: "#87BBFF00" },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);
  }

  update(points) {
    const { canvas, width } = this;
    const x = d3
      .scaleTime()
      .domain(d3.extent(points, (d) => +d.xpoint))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(points, (d) => +d.ypoint)])
      .range([width / 3.5, 0])
      .nice();

    canvas
      .append("g")
      .attr("class", "xAxis chart-legend")
      .call(
        d3
          .axisLeft(y)
          .tickFormat(d3.format("~s"))
          .tickSize(-width * 1.3)
          .ticks(5)
      )
      .select(".domain")
      .remove();

    canvas
      .append("g")
      .attr("class", "yAxis chart-legend")
      .attr("transform", "translate(0," + width / 3.5 + ")")
      .call(
        d3
          .axisBottom(x)
          .tickFormat(d3.timeFormat("%d.%m"))
          .tickSize((-width / 3.5) * 1.3)
          .ticks(7)
      )
      .select(".domain")
      .remove();

    canvas.selectAll(".xAxis line").attr("x2", width);

    canvas.selectAll(".tick line").attr("stroke", "#cccccc88");

    canvas.selectAll(".xAxis .tick text").attr("x", -5);

    canvas.selectAll(".yAxis .tick text").attr("y", 12);

    const area = canvas.selectAll(".area").data([points], (d) => d.xpoint);

    const areaGenerator = d3
      .area()
      .x((d) => x(d.xpoint))
      .y0(y(0))
      .y1((d) => y(d.ypoint))
      .curve(d3.curveCardinal);

    const interpolator = d3.interpolate(
      points.map((point) => ({ ...point, ypoint: 0 })),
      points
    );

    area
      .enter()
      .append("path")
      .attr("class", "area")
      .merge(area)
      .attr("stroke-width", 1.5)
      .attr("fill", "url(#gradient)")
      .attr("d", areaGenerator)
      .transition()
      .duration(3000)
      .attrTween("d", () => (t) => areaGenerator(interpolator(t)));

    const u = canvas.selectAll(".line").data([points], (d) => d.xpoint);
    const lineGenerator = d3
      .line()
      .x((d) => x(d.xpoint))
      .y((d) => y(d.ypoint))
      .curve(d3.curveCardinal);

    u.enter()
      .append("path")
      .attr("class", "line")
      .merge(u)
      .attr("stroke", "#87BBFF")
      .attr("stroke-width", 1.5)
      .attr("fill", "none")
      .attr("d", lineGenerator)
      .transition()
      .duration(3000)
      .attrTween("d", () => (t) => lineGenerator(interpolator(t)));

    const circle = canvas.selectAll(".circle").data(points);

    circle
      .enter()
      .append("circle")
      .merge(circle)
      .attr("class", "circle")
      .attr("fill", "#87BBFF")
      .attr("cx", (d) => x(d.xpoint))
      .attr("cy", (d) => y(d.ypoint))
      .attr("r", 6)
      .transition()
      .duration(3000)
      .attrTween("cy", (_, i) => (t) => y(interpolator(t)[i].ypoint));
  }
}
