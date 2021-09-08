import React, { useContext, useEffect, useRef, useState } from 'react';
import { max, scaleSequentialPow, select } from 'd3';
import DataContext from './context/DataContext';
import { ReactComponent as UsMap } from './assets/us_states_map.svg';
import { ReactComponent as MagPlus } from './assets/mag-plus.svg';
import { ReactComponent as MagMinus } from './assets/mag-minus.svg';

const Map = () => {
  const { stateTotIncData } = useContext(DataContext);
  const [stateTotRange, setStateTotRange] = useState();
  const [isZoomed, setIsZoomed] = useState(false);
  const { selectedState, setSelectedState } = useContext(DataContext);

  const svgRef = useRef();

  const wrapperWidth = 454.5;
  const mapMargins = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  };

  let boundedDimensions = {
    height: 278.58 - 39 - mapMargins.top - mapMargins.bottom,
    width: wrapperWidth - mapMargins.left - mapMargins.right,
  };

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
    if (stateTotIncData) {
      setStateTotRange(findExtent(stateTotIncData, 'TOTINC'));
    }
  }, [stateTotIncData]);

  useEffect(() => {
    if (stateTotIncData) {
      const metricAccessor = (d) => d.TOTINC;

      const colorScale = scaleSequentialPow()
        .domain([0, max(stateTotIncData, metricAccessor)])
        .range(['#00d4ff', '#090979'])
        .exponent(0.3);

      const svg = select(svgRef.current);
      const zoomArea = svg.select('#zoom-area');

      if (!isZoomed) {
        // viewBox="-56.485 -10 760.375 384.265"
        svg.attr(
          'viewBox',
          `-${boundedDimensions.width * 0.13} -10 ${
            boundedDimensions.width * 1.75
          } ${boundedDimensions.height * 1.75}`
        );
        zoomArea
          .attr('x', 330)
          .attr('y', 8)
          .attr('width', 290)
          .attr('height', 170)
          .classed('zoomed-out', true);
      } else {
        // svg same w, h dimensions as orig (454.5 x 229.67); orig/2.341 = zoom
        // outline only shows when zoomed out
        svg.attr('viewBox', `325 15 324.86 164.172`);
        zoomArea.classed('zoomed-out', false);
      }

      const usStates = svg
        .selectAll('path')
        .data(stateTotIncData)
        .join('path.border')
        .attr('data-value', metricAccessor)
        .attr('fill', (d) => {
          return colorScale(d.TOTINC);
        });

      // ** SELECT state

      svg.on('click', (e) => {
        let selectedStateEl = document.querySelector(`#${selectedState}`);

        //if empty area clicked (e.target.tagName === 'svg' conflicts with click on svg check icons in Chart)
        if (e.target.id === 'us-map' || e.target.id === 'zoom-area') {
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

          const stateTooltipRect = stateTooltip
            .append('rect')
            // needed in click handler
            .attr('class', hoveredState.id);

          const stateTooltipText = stateTooltip
            .append('text')
            // needed in click handler
            .attr('class', hoveredState.id)
            .attr('x', bbCtr[0])
            .text(
              `${hoveredState.id}: ${Number(
                hoveredState.dataset.value
              ).toLocaleString()}`
            );

          if (!isZoomed) {
            // 2 sizes here so zoomed tooltips aren't huge
            // tooltip transitions specified here to avoid rendering issue
            stateTooltipRect
              .attr('x', bbCtr[0] - 38)
              .attr('y', bbCtr[1] - 12.5)
              // same h as pie tooltip; + 1 for stroke
              .attr('width', 76)
              .attr('height', 26)
              .style('opacity', 0)
              .transition()
              .duration(250)
              .style('opacity', 1);
            stateTooltipText
              .attr('y', bbCtr[1] + 2)
              .style('opacity', 0)
              .transition()
              .duration(250)
              .style('opacity', 1);
          } else {
            // orig/2.341 = zoom (same as viewBox)
            stateTooltipRect
              .attr('x', bbCtr[0] - 16.235)
              .attr('y', bbCtr[1] - 5.554)
              .attr('width', 32.467)
              .attr('height', 11.108)
              .style('opacity', 0)
              .transition()
              .duration(250)
              .style('opacity', 1);

            stateTooltipText
              .attr('y', bbCtr[1] + 1)
              .attr('font-size', '0.427rem')
              .style('opacity', 0)
              .transition()
              .duration(250)
              .style('opacity', 1);
          }
        }
      });
    }
  }, [stateTotIncData, selectedState, isZoomed]);

  if (stateTotIncData) {
    return (
      <section className='map-wrapper'>
        <div>
          <h2>Collisions by state</h2>
          <p className='instructions small-text'>
            Hover on a state to view 2000-2020 totals; click to show details
          </p>
        </div>

        <div className='map-content'>
          <UsMap ref={svgRef} />

          {stateTotRange && (
            <div className='legend legend-map'>
              <p>{stateTotRange[0]}</p>
              <div id='legend-bar'></div>
              <p>{stateTotRange[1].toLocaleString()}</p>
            </div>
          )}
          {!isZoomed ? (
            <div
              id='zoom-control'
              className='zoom-control-plus'
              style={{ position: 'absolute', top: 82, right: 53 }}
            >
              <MagPlus onClick={() => setIsZoomed(true)} />
            </div>
          ) : (
            <div
              id='zoom-control'
              style={{ position: 'absolute', top: 205, right: 60 }}
            >
              <MagMinus onClick={() => setIsZoomed(false)} />
            </div>
          )}
        </div>
      </section>
    );
  }
  return null;
};

export default Map;
