import React, { useContext, useEffect, useRef, useState } from 'react';
import { arc, csv, pie, select } from 'd3';
import gxCountCsv from './assets/gxsumstateus.csv';
import DataContext from './context/DataContext';
import './App.css';

const Stats = ({ statsDimensions }) => {
  const { usData, stateYrData, selectedState } = useContext(DataContext);
  const [svgDimensions, setSvgDimensions] = useState();
  const [fullSelectedState, setFullSelectedState] = useState();
  const [usDataByCategory, setUsDataByCategory] = useState();
  const [stateDataByCategory, setStateDataByCategory] = useState();
  const [gxCount, setGxCount] = useState();
  const [error, setError] = useState(null);

  const svgRef = useRef();
  const topElementsHeight = 84.719;

  const colors = [
    'var(--auto)',
    'var(--truck)',
    'var(--ped-bike)',
    'var(--other)',
  ];

  const sumDataByYear = (arr) => {
    let result = {
      TOTINC: 0,
      TOTCAS: 0,
      VEHAUTO: 0,
      VEHTRUCK: 0,
      VEHPED: 0,
      VEHOTHER: 0,
    };
    arr.forEach((el) => {
      for (let key in el) {
        if (key === 'TOTINC') {
          result.TOTINC += el[key];
        } else if (key === 'TOTKLD') {
          result.TOTCAS += el[key];
        } else if (key === 'TOTINJ') {
          result.TOTCAS += el[key];
        } else if (key === 'VEHAUTO') {
          result.VEHAUTO += el[key];
        } else if (key === 'VEHTRUCK') {
          result.VEHTRUCK += el[key];
        } else if (key === 'VEHPED') {
          result.VEHPED += el[key];
        } else if (key === 'VEHOTHER') {
          result.VEHOTHER += el[key];
        }
      }
    });
    return result;
  };

  const getPieChartData = (obj) => {
    return [obj.VEHAUTO, obj.VEHTRUCK, obj.VEHPED, obj.VEHOTHER];
  };

  const getGxData = async () => {
    try {
      setError(null);
      const dataset = await csv(gxCountCsv);
      dataset.forEach((d) => {
        d.GXCOUNT = +d.GXCOUNT;
      });

      setGxCount(dataset);
    } catch (error) {
      setError(error.toString());
    }
  };

  useEffect(() => {
    if (usData) {
      setUsDataByCategory(sumDataByYear(usData));
    }
  }, [usData]);

  useEffect(() => {
    if (stateYrData) {
      setStateDataByCategory(sumDataByYear(stateYrData));
    }
  }, [selectedState]);

  useEffect(() => {
    getGxData();
  }, []);

  // calc us or selected state veh data

  useEffect(() => {
    const svg = select(svgRef.current);

    if (statsDimensions) {
      setSvgDimensions({
        width: statsDimensions.width * 0.5,
        // stats height - top elements
        height: statsDimensions.height - topElementsHeight,
      });
    }

    if (svgDimensions) {
      svg
        .attr('viewBox', `0 0 225 225`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      const pieGenerator = pie();
      // us or selectedState
      if (usDataByCategory) {
        const usPieChartData = getPieChartData(usDataByCategory);
        const arcData = pieGenerator(usPieChartData);
        const arcGenerator = arc().innerRadius(50).outerRadius(100);

        const pieGroup = svg.select('.pie-group');
        pieGroup
          .selectAll('path')
          .data(arcData)
          .join('path')
          .attr('d', arcGenerator)
          .style('fill', (d, i) => colors[i])
          .style(
            'transform',
            `translate(${svgDimensions.width / 2}px, ${
              svgDimensions.height / 2 + 20
            }px`
          );
      }
    }
  }, [statsDimensions, usDataByCategory, stateDataByCategory]);

  return (
    <div
      style={{
        width: '100%',
      }}
    >
      <div className='stats-title'>
        <h3 className={`${selectedState ? null : `stats-selected-us`}`}>
          United States
        </h3>
        <h3 className={`${selectedState ? `stats-selected-state` : null}`}>
          State Name
        </h3>
      </div>
      <div className='stats-range'>
        <p className='subtitle'>2016-2020</p>
      </div>
      {usDataByCategory && (
        <div className='stats-content'>
          <div className='stats-text'>
            <div>
              <p>Collisions:</p>
              <p>{usDataByCategory.TOTINC.toLocaleString()}</p>
            </div>
            <div>
              <p>Casualties:</p>
              <p>{usDataByCategory.TOTCAS.toLocaleString()}</p>
            </div>
            {gxCount && (
              <div>
                <p>Grade crossings:</p>
                <p>{gxCount[50].GXCOUNT.toLocaleString()}</p>
              </div>
            )}
          </div>
          <div
            className='stats-pie'
            style={
              {
                // border: '1px solid red',
              }
            }
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                // border: '1px solid red',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <svg
                ref={svgRef}
                style={
                  {
                    // border: '1px solid red',
                  }
                }
              >
                <g className='pie-group'></g>
              </svg>
            </div>
          </div>
          {/* use data calc for map for totinc over time by state */}
          <div className='stats-pie-legend'>
            <p className='stats-pie-legend-title'>Collisions by Vehicle Type</p>
            <div className='stats-pie-legend-text'>
              <div class='auto'>
                <span></span> Auto
              </div>
              <div class='truck'>
                <span></span> Truck
              </div>
              <div class='ped-bike'>
                <span></span> Pedestrian<span className='sm-sp'>&#8198;</span>/
                <span className='sm-sp'>&#8198;</span>
                Bike
              </div>
              <div class='other'>
                <span></span> Other
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;
