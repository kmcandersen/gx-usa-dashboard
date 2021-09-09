import React, { useContext, useEffect, useRef, useState } from 'react';
import { arc, format, pie, select } from 'd3';
import statesList from './assets/state_names.js';
import yearOptions from './assets/year_options.js';
import Select from 'react-select';
import DataContext from './context/DataContext';

const Stats = () => {
  const { usData, stateYrData, selectedState, gxCount } =
    useContext(DataContext);
  const [selectedYear, setSelectedYear] = useState('total');
  const [fullSelectedState, setFullSelectedState] = useState();
  // single year OR total for US/state
  const [usDataByCategory, setUsDataByCategory] = useState();
  const [stateDataByCategory, setStateDataByCategory] = useState();

  const [showUSData, setShowUSData] = useState(true);

  const svgRef = useRef();

  // statsTitle 44.72 + statsRange 19
  const topElementsHeight = 63.72;
  const subSectionWidths = {
    dropdown: '35%',
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

  const getSelectedData = (state, year = 'total') => {
    if (state === 'US') {
      if (year === 'total') {
        setUsDataByCategory(sumDataByYear(usData));
      } else {
        let result = usData.find((el) => el.YEAR === year);
        let resultCalc = {
          ...result,
          TOTCAS: result.TOTKLD + result.TOTINJ,
        };
        setUsDataByCategory(resultCalc);
      }
    } else if (state !== 'US') {
      if (year === 'total') {
        setStateDataByCategory(sumDataByYear(stateYrData));
      } else {
        let result = stateYrData.find((el) => el.YEAR === year);
        let resultCalc = {
          ...result,
          TOTCAS: result.TOTKLD + result.TOTINJ,
        };
        setStateDataByCategory(resultCalc);
      }
    }
  };

  const getPieChartData = (obj) => {
    return {
      Auto: obj.VEHAUTO / obj.TOTINC,
      Truck: obj.VEHTRUCK / obj.TOTINC,
      Ped: obj.VEHPED / obj.TOTINC,
      TotInc: obj.VEHOTHER / obj.TOTINC,
    };
  };

  useEffect(() => {
    if (usData) {
      if (selectedYear !== 'total') {
        getSelectedData('US', selectedYear);
      } else {
        setUsDataByCategory(sumDataByYear(usData));
      }
    }
  }, [usData, selectedYear]);

  useEffect(() => {
    if (stateYrData) {
      if (selectedYear !== 'total') {
        getSelectedData(selectedState, selectedYear);
      } else if (selectedYear === 'total') {
        setStateDataByCategory(sumDataByYear(stateYrData));
      }
    } else {
      setStateDataByCategory(null);
    }
  }, [stateYrData, selectedState, selectedYear]);

  useEffect(() => {
    if (selectedState) {
      statesList.forEach((el) => {
        for (let key in el) {
          if (key === selectedState) {
            setFullSelectedState(el[selectedState]);
          }
        }
      });
      setShowUSData(false);
    } else {
      setShowUSData(true);
      setFullSelectedState(null);
    }
  }, [selectedState]);

  useEffect(() => {
    const svg = select(svgRef.current);
    svg
      .attr('viewBox', `0 0 200 200`)
      .attr('height', svgDimensions.height)
      .attr('width', svgDimensions.width);

    const pieGenerator = pie();

    // use US OR selectedState data for pie chart
    if (usData && usDataByCategory) {
      const usPieChartData = getPieChartData(usDataByCategory);
      const statePieChartData = stateDataByCategory
        ? getPieChartData(stateDataByCategory)
        : {};
      const pieChartDataset = showUSData ? usPieChartData : statePieChartData;

      // same vehTypes for us & state data
      const vehTypes = Object.keys(usPieChartData);
      const arcData = pieGenerator(Object.values(pieChartDataset));
      const arcGenerator = arc().innerRadius(50).outerRadius(100);

      const colors = [
        'var(--auto)',
        'var(--truck)',
        'var(--ped-bike)',
        'var(--other)',
      ];

      const pieGroup = svg.select('.pie-group');
      pieGroup
        .selectAll('path')
        .data(arcData)
        .join('path')
        .attr('d', arcGenerator)
        .attr('data-value', (d) => d.value)
        // if desired for tooltip label
        .attr('id', (d, i) => vehTypes[i])
        .style('fill', (d, i) => colors[i])
        .style(
          'transform',
          `translate(${svgDimensions.width / 2 + 15}px, ${
            svgDimensions.height / 2 + 18
          }px`
        );

      // ** HOVER on pie

      function getBoundingBoxCenter(element) {
        var bbox = element.getBBox();
        // return the center of the bounding box
        return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
      }

      svg.on('mouseover', (e) => {
        // tooltip removed if mouse moves outside pie
        if (e.target.tagName === 'svg') {
          svg.select('g#pie-tooltip').remove();
        }
        if (e.target.tagName === 'path') {
          svg.select('g#pie-tooltip').remove();
          const hoveredPie = e.target;
          const bbCtr = getBoundingBoxCenter(hoveredPie);
          const pieTooltip = svg.append('g').attr('id', 'pie-tooltip');

          pieTooltip
            .append('rect')
            .attr('x', bbCtr[0] - 25)
            .attr('y', bbCtr[1] - 12.5)
            .attr('height', 25)
            .attr('width', 50)
            .style(
              'transform',
              `translate(${svgDimensions.width / 2 + 15}px, ${
                svgDimensions.height / 2 + 18
              }px`
            )
            .style('opacity', 0)
            .transition()
            .duration(250)
            .style('opacity', 1);
          pieTooltip
            .append('text')
            .attr('x', bbCtr[0])
            .attr('y', bbCtr[1])
            .text(`${format('.0%')(hoveredPie.dataset.value)}`)
            .style(
              'transform',
              `translate(${svgDimensions.width / 2 + 15}px, ${
                svgDimensions.height / 2 + 19
              }px`
            )
            .style('opacity', 0)
            .transition()
            .duration(250)
            .style('opacity', 1);
        }
      });
    }
  }, [
    usData,
    usDataByCategory,
    stateDataByCategory,
    showUSData,
    selectedState,
  ]);

  return (
    <section className='stats-wrapper'>
      <div>
        <div className='title-labels'>
          <h3
            className={`${showUSData && selectedState && `label-selected-us`} ${
              !showUSData && `inactive-label`
            } ${!selectedState && `no-pointer`} stateface stateface-us`}
            onClick={() => {
              selectedState && setShowUSData(!showUSData);
            }}
          >
            United States
          </h3>
          <h3
            className={`${!showUSData && `label-selected-state`} ${
              showUSData && `inactive-label`
            } ${
              selectedState &&
              `stateface stateface-${selectedState.toLowerCase()}`
            }`}
            onClick={() => setShowUSData(!showUSData)}
          >
            {fullSelectedState}
          </h3>
        </div>
        <div
          className='stats-dropdown'
          style={{
            width: subSectionWidths.dropdown,
          }}
        >
          <Select
            defaultValue={selectedYear}
            onChange={(e) => setSelectedYear(e.value)}
            options={yearOptions}
            placeholder='2000-2020'
            isSearchable={false}
          />
        </div>
      </div>
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
          {usDataByCategory && showUSData ? (
            <>
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
                  <p>
                    {gxCount[51].GXCOUNT.toLocaleString()}
                    <span id='footnote' className='small-text'>
                      {' '}
                      (2020)
                    </span>
                  </p>
                </div>
              )}
            </>
          ) : null}

          {selectedState && stateDataByCategory && !showUSData ? (
            <>
              <div>
                <p>Collisions:</p>
                <p>{stateDataByCategory.TOTINC.toLocaleString()}</p>
              </div>
              <div>
                <p>Casualties:</p>
                <p>{stateDataByCategory.TOTCAS.toLocaleString()}</p>
              </div>
              <div>
                <p>Grade crossings:</p>
                <p>
                  {gxCount
                    .find((el) => el.STATE === selectedState)
                    .GXCOUNT.toLocaleString()}
                  <span id='footnote' className='small-text'>
                    {' '}
                    (2020)
                  </span>
                </p>
              </div>
            </>
          ) : null}
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
    </section>
  );
};

export default Stats;
