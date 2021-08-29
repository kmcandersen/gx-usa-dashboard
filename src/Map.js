import React, { useContext, useEffect, useRef, useState } from 'react';
import { max, scaleSequentialPow, select } from 'd3';
import DataContext from './context/DataContext';
import { ReactComponent as UsMap } from './assets/us_states_map.svg';
import './App.css';

const Map = ({ mapDimensions }) => {
  const { stateTotData } = useContext(DataContext);
  const [stateTotRange, setStateTotRange] = useState();
  const { selectedState, setSelectedState } = useContext(DataContext);

  const svgRef = useRef();

  const findExtent = (arr, prop) => {
    var lowest = 0;
    var highest = 0;
    var tmp;
    arr.forEach((el) => {
      tmp = el[prop];
      if (tmp < lowest) lowest = tmp;
      if (tmp > highest) highest = tmp;
    });
    return [lowest, highest];
  };

  useEffect(() => {
    if (stateTotData) {
      setStateTotRange(findExtent(stateTotData, 'TOTINC'));
    }
  }, [stateTotData]);

  useEffect(() => {
    if (stateTotData) {
      const metricAccessor = (d) => d.TOTINC;

      const colorScale = scaleSequentialPow()
        .domain([0, max(stateTotData, metricAccessor)])
        .range(['#00d4ff', '#090979'])
        .exponent(0.3);

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
          return colorScale(d.TOTINC);
        });

      // ** SELECT state

      svg.on('click', (e) => {
        let selectedStateEl = document.querySelector(`#${selectedState}`);

        //if empty area clicked (e.target.tagName === 'svg' conflicts with click on svg check icons in Chart)
        if (e.target.id === 'us-map') {
          if (selectedState) {
            selectedStateEl.classList.remove('selected-state');
            setSelectedState(null);
          }
          // if map element clicked
        } else {
          let clickedStateName = '';

          if (e.target.tagName === 'text' || e.target.tagName === 'rect') {
            // access state name in the class name applied to tooltip rects & text els
            clickedStateName = e.target.className.baseVal;
          } else if (e.target.tagName === 'path') {
            clickedStateName = e.target.id;
          }

          let clickedStateEl = document.querySelector(`#${clickedStateName}`);

          if (selectedState) {
            selectedStateEl.classList.remove('selected-state');
            if (clickedStateName === selectedState) {
              setSelectedState(null);
            } else {
              setSelectedState(clickedStateName);
              clickedStateEl.classList.add('selected-state');
            }
          } else {
            clickedStateEl.classList.add('selected-state');
            setSelectedState(clickedStateName);
          }
        }
      });

      // ** HOVER on state

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
            .attr('class', hoveredState.id)
            .style('opacity', 0)
            .transition()
            .duration(250)
            .style('opacity', 1);
          stateTooltip
            .append('text')
            .attr('x', bbCtr[0])
            .attr('y', bbCtr[1])
            .attr('class', hoveredState.id)
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
  }, [mapDimensions, stateTotData, selectedState]);
  if (mapDimensions && stateTotData) {
    return (
      <div style={{ height: '100%' }}>
        <div>
          <h2>Collisions by state</h2>
          <p className='instructions'>
            Hover on a state to view totals; click to show details
          </p>
        </div>
        <div className='map-content'>
          <div
            style={{
              width: mapDimensions.width * 0.95,
              height: mapDimensions.width * 0.95 * 0.62,
              margin: '0 auto',
            }}
          >
            <UsMap ref={svgRef} />
          </div>
          {stateTotRange && (
            <div className='legend legend-map'>
              <p>{stateTotRange[0]}</p>
              <div id='legend-bar'></div>
              <p>{stateTotRange[1].toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default Map;
