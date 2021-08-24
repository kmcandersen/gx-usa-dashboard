import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  extent,
  format,
  interpolateBlues,
  max,
  min,
  scaleSequentialPow,
  select,
} from 'd3';
import DataContext from './context/DataContext';
import { ReactComponent as UsMap } from './assets/us_states_map.svg';
import './App.css';

const Map = ({ mapDimensions }) => {
  const { stateTotData } = useContext(DataContext);
  //const [svgDimensions, setSvgDimensions] = useState();

  const svgRef = useRef();

  useEffect(() => {
    if (stateTotData) {
      const metricAccessor = (d) => d.TOTINC;

      const colorScale = scaleSequentialPow(interpolateBlues)
        // low density = lighter
        .domain([0, max(stateTotData, metricAccessor)])
        // .domain(extent(stateTotData, metricAccessor))
        .range(['#00d4ff', '#090979'])
        // > 1 = flatter/less variation; < 1 = more variation in colors
        .exponent(0.3);
      // can also base color scale on min, max data values

      const svg = select(svgRef.current);
      svg
        .attr('viewBox', `0 0 618 380`)
        .attr('preserveAspectRatio', 'xMaxYMax meet')
        .attr('width', '100%')
        .attr('height', '100%');

      const usStates = svg
        .selectAll('path')
        .data(stateTotData)
        .join('path.border')
        .attr('data-value', metricAccessor)
        .attr('fill', (d) => {
          // if (d.TOTINC > 100) {
          //   return 'blue';
          // } else {
          //   return 'green';
          // }
          return colorScale(d.TOTINC);
        });

      function getBoundingBoxCenter(element) {
        var bbox = element.getBBox();
        // return the center of the bounding box
        return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
      }

      svg.on('mouseover', (e) => {
        // tooltip removed if mouse moves outside state paths
        if (e.target.tagName === 'svg') {
          svg.select('g#state-tooltip').remove();
        }
        if (e.target.tagName === 'path') {
          svg.select('g#state-tooltip').remove();
          const hoveredState = e.target;
          const bbCtr = getBoundingBoxCenter(hoveredState);
          const stateTooltip = svg.append('g').attr('id', 'state-tooltip');

          stateTooltip
            .append('rect')
            .attr('x', bbCtr[0] - 35)
            .attr('y', bbCtr[1] - 12.5)
            .attr('height', 25)
            .attr('width', 70)
            .style('opacity', 0)
            .transition()
            .duration(250)
            .style('opacity', 1);
          stateTooltip
            .append('text')
            .attr('x', bbCtr[0])
            .attr('y', bbCtr[1])
            .text(
              `${hoveredState.id}: ${Number(
                hoveredState.dataset.value
              ).toLocaleString()}`
            )
            .style('opacity', 0)
            .transition()
            .duration(250)
            .style('opacity', 1);
        }
      });
    }
  }, [mapDimensions, stateTotData]);
  if (mapDimensions && stateTotData) {
    return (
      <div
        style={{
          width: mapDimensions.width * 0.9,
          height: mapDimensions.width * 0.9 * 0.62,
        }}
      >
        <UsMap ref={svgRef} />
        <div id='legend'></div>
      </div>
    );
  }
  return null;
};

export default Map;
