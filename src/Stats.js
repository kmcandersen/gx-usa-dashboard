import React, { useContext, useEffect, useRef, useState } from 'react';
import { arc, csv, pie, select } from 'd3';
import gxCountCsv from './assets/gxsumstateus.csv';
import DataContext from './context/DataContext';
import './App.css';

const Stats = () => {
  const { usData, stateYrData, selectedState } = useContext(DataContext);
  const [fullSelectedState, setFullSelectedState] = useState();
  const [usDataByCategory, setUsDataByCategory] = useState();
  const [stateDataByCategory, setStateDataByCategory] = useState();
  const [gxCount, setGxCount] = useState();
  const [error, setError] = useState(null);

  const svgRef = useRef();

  // statsTitle 44.72 + statsRange 19
  const topElementsHeight = 63.72;
  const subSectionWidths = {
    statsText: '30%',
    pieChart: '46%',
    pieChartDec: 0.46,
    pieLegend: '24%',
  };
  const svgDimensions = {
    // initial w/h from stats-wrapper
    width: 454.5 * subSectionWidths.pieChartDec,
    height: 227.5 - topElementsHeight,
    margin: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
    },
  };

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
    console.log(result);
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

  // want US to always be available, in addition to any selected state
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
    if (usData) {
      const svg = select(svgRef.current);

      svg
        .attr('viewBox', `0 0 200 200`)
        .attr('height', svgDimensions.height)
        .attr('width', svgDimensions.width);

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
            `translate(${svgDimensions.width / 2 + 15}px, ${
              svgDimensions.height / 2 + 18
            }px`
          );
      }
    }
  }, [usDataByCategory, stateDataByCategory]);

  return (
    <section className='stats-wrapper'>
      <div>
        <div className='stats-title'>
          <h3 className={`${selectedState ? null : `stats-selected-us`}`}>
            United States
          </h3>
          <h3 className={`${selectedState ? `stats-selected-state` : null}`}>
            State Name
          </h3>
        </div>
        <div className='stats-range'>
          <p className='subtitle'>Total 2016-2020</p>
        </div>
      </div>
      {usDataByCategory && (
        <div
          className='stats-content'
          style={{
            height: svgDimensions.height,
          }}
        >
          <div
            className='stats-text'
            style={{
              width: subSectionWidths.statsText,
            }}
          >
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
            style={{
              width: subSectionWidths.pieChart,
            }}
          >
            <svg ref={svgRef}>
              <g className='pie-group'></g>
            </svg>
          </div>

          {/* use data calc for map for totinc over time by state */}
          <div
            className='stats-pie-legend'
            style={{
              width: subSectionWidths.pieLegend,
            }}
          >
            <p className='stats-pie-legend-title'>Collisions by Vehicle Type</p>
            <div className='stats-pie-legend-text'>
              <div className='auto'>
                <span></span> Auto
              </div>
              <div className='truck'>
                <span></span> Truck
              </div>
              <div className='ped-bike'>
                <span></span> Ped
                <span className='sm-sp'>&#8198;</span>/
                <span className='sm-sp'>&#8198;</span>
                Bicycle
              </div>
              <div className='other'>
                <span></span> Other
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Stats;
