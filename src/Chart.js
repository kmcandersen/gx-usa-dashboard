import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  axisBottom,
  axisLeft,
  extent,
  format,
  line,
  max,
  scaleLinear,
  select,
} from 'd3';
import DataContext from './context/DataContext';
import './App.css';

const Chart = ({ chartDimensions }) => {
  const { usData } = useContext(DataContext);
  const [svgDimensions, setSvgDimensions] = useState();

  const svgRef = useRef();

  useEffect(() => {
    if (chartDimensions) {
      setSvgDimensions({
        width: chartDimensions.width * 0.9,
        height: chartDimensions.height * 0.8,
        margin: {
          left: 35,
          right: 30,
          top: 20,
          bottom: 20,
        },
      });
    }

    if (usData && svgDimensions) {
      let boundedDimensions = {
        height:
          svgDimensions.height -
          svgDimensions.margin.top -
          svgDimensions.margin.bottom,
        width:
          svgDimensions.width -
          svgDimensions.margin.left -
          svgDimensions.margin.right,
      };

      const svg = select(svgRef.current);
      svg
        .attr('width', svgDimensions.width)
        .attr('height', svgDimensions.height);

      const xAccessor = (d) => d.YEAR;
      const yAccessor = (d) => d.TOTINC;

      let xScale = scaleLinear()
        .domain(extent(usData, xAccessor))
        .range([10, boundedDimensions.width + 10])
        .nice();
      let yScale = scaleLinear()
        // US always > state
        .domain([0, max(usData, yAccessor)])
        .range([boundedDimensions.height - 10, 20])
        .nice();

      const xAxisGenerator = axisBottom()
        .scale(xScale)
        .ticks(usData.length)
        // .tickSizeInner(-boundedDimensions.height + 10)
        // .tickSizeOuter(0)
        // .tickPadding(10)
        .tickFormat(format('d'));
      select('.x-axis')
        .call(xAxisGenerator)
        .style(
          'transform',
          `translate(${svgDimensions.margin.left}px, ${boundedDimensions.height}px`
        );

      const yAxisGenerator = axisLeft().scale(yScale).ticks(8);
      // .tickSizeInner(-boundedDimensions.width - 10)
      // .tickSizeOuter(0)
      // .tickPadding(10);
      select('.y-axis')
        .call(yAxisGenerator)
        .style('transform', `translate(${svgDimensions.margin.left}px, -10px)`);

      const usPathGenerator = line()
        .x((d) => xScale(xAccessor(d)))
        .y((d) => yScale(yAccessor(d)));
      svg
        .selectAll('path.us-line')
        .data([usData])
        .join('path')
        .attr('d', usPathGenerator)
        .attr('class', 'us-line')
        .attr('data-id', (d) => yAccessor(d))
        .style(
          'transform',
          `translate(${svgDimensions.margin.left}px, ${svgDimensions.margin.top}px`
        )
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .style('opacity', 1);

      const usYears = svg
        .selectAll('g.us-year')
        .data(usData)
        .join('g')
        .attr('class', 'us-year')
        .style(
          'transform',
          `translate(${svgDimensions.margin.left}px, ${svgDimensions.margin.top}px`
        );
      usYears.selectAll('circle').remove();

      usYears
        .append('circle')
        .attr('cx', (d) => xScale(xAccessor(d)))
        .attr('cy', (d) => yScale(yAccessor(d)))
        .attr('r', 0)
        .transition()
        .attr('r', 5)
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .style('opacity', 1);

      usYears.selectAll('rect').remove();
      usYears
        .append('rect')
        .attr('x', (d) => xScale(xAccessor(d)) - 30)
        .attr('y', (d) => yScale(yAccessor(d)) - 35)
        .attr('width', 60)
        .attr('height', 25)
        .attr('fill', 'blue');

      usYears.selectAll('text').remove();
      usYears
        .append('text')
        .attr('x', (d) => xScale(xAccessor(d)))
        .attr('y', (d) => yScale(yAccessor(d)) - 25 / 2 - 5)
        .attr('fill', 'red')
        .attr('text-anchor', 'middle')
        .text((d) => d.TOTINC.toLocaleString());

      svg
        .selectAll('g.us-year')
        .transition()
        .duration(500)
        .style(
          'transform',
          `translate(${svgDimensions.margin.left}px, ${svgDimensions.margin.top}px`
        );
    }
  }, [usData, chartDimensions]);

  return (
    <svg ref={svgRef}>
      <g className='x-axis' />
      <g className='y-axis' />
    </svg>
  );
};

export default Chart;
