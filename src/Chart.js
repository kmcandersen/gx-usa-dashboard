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
import { ReactComponent as EmptySquare } from './assets/square.svg';
import { ReactComponent as CheckedSquare } from './assets/check-square.svg';
import statesList from './assets/state_names.js';
import DataContext from './context/DataContext';
import './App.css';

const Chart = ({ chartDimensions }) => {
  const { usData, stateYrData, selectedState } = useContext(DataContext);
  const [svgDimensions, setSvgDimensions] = useState();
  const [fullSelectedState, setFullSelectedState] = useState();
  const [showUSData, setShowUSData] = useState(true);
  const [isFirstStateSelected, setIsFirstStateSelected] = useState(true);

  const svgRef = useRef();

  const findMax = (arr, prop) => {
    var highest = 0;
    var tmp;
    arr.forEach((el) => {
      tmp = el[prop];
      if (tmp > highest) highest = tmp;
    });
    return highest;
  };

  useEffect(() => {
    if (selectedState) {
      statesList.forEach((el) => {
        for (let key in el) {
          if (key === selectedState) {
            setFullSelectedState(el[selectedState]);
          }
        }
      });
      // hides US line the first time user selects a state; if user turns on the US line & keeps selecting states, US line stays on.
      if (isFirstStateSelected) {
        setShowUSData(false);
        setIsFirstStateSelected(false);
      }
      // always shows US line when no state is selected
    } else {
      setShowUSData(true);
      setIsFirstStateSelected(true);
    }
  }, [selectedState]);

  useEffect(() => {
    if (chartDimensions) {
      setSvgDimensions({
        width: chartDimensions.width * 0.9,
        height: chartDimensions.height * 0.8,
        margin: {
          left: 35,
          right: 50,
          top: 75,
          bottom: 30,
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

      const datasetForYScale =
        selectedState && showUSData
          ? usData
          : selectedState
          ? stateYrData
          : usData;

      const maxTotInc = findMax(datasetForYScale, 'TOTINC');
      const yTicksQty = maxTotInc > 15 ? 6 : maxTotInc > 5 ? 7 : 4;
      const calcAddToYDomain = () => {
        switch (true) {
          case maxTotInc > 1500:
            return 100;
          case maxTotInc > 150:
            return 30;
          case maxTotInc > 100:
            return 20;
          case maxTotInc > 30:
            return 5;
          case maxTotInc > 5:
            return 1;
          case maxTotInc === 0:
            return 0;
          default:
            return 0.5;
        }
      };
      const addToYDomain = calcAddToYDomain();

      let xScale = scaleLinear()
        .domain(extent(usData, xAccessor))
        .range([10, boundedDimensions.width + 10])
        .nice();
      let yScale = scaleLinear()
        // + space so line not at top of chart
        .domain([0, max(datasetForYScale, yAccessor) + addToYDomain])
        .range([boundedDimensions.height - 10, 20])
        .nice();

      const xAxisGenerator = axisBottom()
        .scale(xScale)
        .ticks(usData.length)
        .tickSizeInner(-boundedDimensions.height + 10)
        .tickSizeOuter(0)
        .tickPadding(10)
        .tickFormat(format('d'));
      select('.x-axis')
        .call(xAxisGenerator)
        .style(
          'transform',
          `translate(${svgDimensions.margin.left}px, ${boundedDimensions.height}px`
        );

      const yAxisGenerator = axisLeft()
        .scale(yScale)
        .ticks(yTicksQty)
        .tickSizeInner(-boundedDimensions.width - 10)
        .tickSizeOuter(0)
        .tickPadding(10);
      select('.y-axis')
        .call(yAxisGenerator)
        .style('transform', `translate(${svgDimensions.margin.left}px, -10px)`);

      const pathGenerator = line()
        .x((d) => xScale(xAccessor(d)))
        .y((d) => yScale(yAccessor(d)));

      // US - added/removed based on showUSData
      if (showUSData) {
        svg
          .selectAll('path.us-line')
          .data([usData])
          .join('path')
          .attr('d', pathGenerator)
          .attr('class', 'us-line')
          .attr('data-id', (d) => yAccessor(d))
          .style(
            'transform',
            `translate(${svgDimensions.margin.left}px, -10px`
          );

        svg.selectAll('.us-year').remove();
        const usYears = svg
          .selectAll('g.us-year')
          .data(usData)
          .join('g')
          .attr('class', 'us-year')
          .style(
            'transform',
            `translate(${svgDimensions.margin.left}px, -10px`
          );

        usYears
          .append('circle')
          .attr('cx', (d) => xScale(xAccessor(d)))
          .attr('cy', (d) => yScale(yAccessor(d)))
          .attr('r', 0)
          .transition()
          .attr('r', 5);

        usYears
          .append('rect')
          .attr('x', (d) => xScale(xAccessor(d)) - 30)
          .attr('y', (d) => yScale(yAccessor(d)) - 35)
          .attr('width', 60)
          .attr('height', 25)
          .attr('fill', 'blue');

        usYears
          .append('text')
          .attr('x', (d) => xScale(xAccessor(d)))
          .attr('y', (d) => yScale(yAccessor(d)) - 25 / 2 - 5)
          .text((d) => d.TOTINC.toLocaleString());
      } else {
        svg.selectAll('path.us-line').remove();
        svg.selectAll('.us-year').remove();
      }

      // STATE - added/removed based on selectedState
      if (selectedState && stateYrData) {
        svg.selectAll('path.state-line').remove();
        svg.selectAll('g.state-year').remove();

        svg
          .selectAll('path.state-line')
          .data([stateYrData])
          .join('path')
          .attr('d', pathGenerator)
          .attr('class', 'state-line')
          .attr('data-id', (d) => yAccessor(d))
          .style('transform', `translate(${svgDimensions.margin.left}px, -10px`)
          .style('opacity', 0)
          .transition()
          .duration(500)
          .style('opacity', 1);

        const stateYear = svg
          .selectAll('g.state-year')
          .data(stateYrData)
          .join('g')
          .attr('class', 'state-year')
          .style(
            'transform',
            `translate(${svgDimensions.margin.left}px, -10px`
          );

        stateYear
          .append('circle')
          .attr('cx', (d) => xScale(xAccessor(d)))
          .attr('cy', (d) => yScale(yAccessor(d)))
          .attr('r', 0)
          .transition()
          .attr('r', 5);

        stateYear
          .append('rect')
          .attr('x', (d) => xScale(xAccessor(d)) - 30)
          .attr('y', (d) => yScale(yAccessor(d)) - 35)
          .attr('width', 60)
          .attr('height', 25)
          .attr('fill', 'orange');

        stateYear
          .append('text')
          .attr('x', (d) => xScale(xAccessor(d)))
          .attr('y', (d) => yScale(yAccessor(d)) - 25 / 2 - 5)
          .text((d) => d.TOTINC.toLocaleString());
      } else {
        svg.selectAll('path.state-line').remove();
        svg.selectAll('g.state-year').remove();
      }
    }
  }, [chartDimensions, usData, stateYrData, selectedState, showUSData]);

  return (
    <div style={{ height: '100%' }}>
      <h2>Incidents by year</h2>
      <div className='legend legend-chart'>
        <div className='legend-us'>
          <p>United States</p>
        </div>
        <div className='legend-state'>
          {selectedState ? (
            <p className='chart-selected'>{fullSelectedState}</p>
          ) : (
            <p className='instructions'>Select a state on map</p>
          )}
        </div>
      </div>

      <div
        id='show-us-line-toggle'
        style={{ visibility: `${!selectedState ? `hidden` : `visible`}` }}
      >
        {selectedState && !showUSData ? (
          <>
            <EmptySquare onClick={() => setShowUSData(true)} />
            <p>Show US data</p>
          </>
        ) : selectedState && showUSData ? (
          <>
            <CheckedSquare onClick={() => setShowUSData(false)} />
            <p>Hide US data</p>
          </>
        ) : null}
      </div>

      <p className='instructions'>Hover on a point to view totals</p>
      <svg ref={svgRef}>
        <g className='x-axis' />
        <g className='y-axis' />
      </svg>
    </div>
  );
};

export default Chart;
