import React, { useRef } from 'react';
import './App.css';
import Header from './Header';
import Map from './Map';
import Chart from './Chart';
import Stats from './Stats';
import useResizeObserver from './hooks/useResizeObserver';

const App = () => {
  const MapRef = useRef();
  const mapDimensions = useResizeObserver(MapRef);
  const ChartRef = useRef();
  const chartDimensions = useResizeObserver(ChartRef);
  const StatsRef = useRef();
  const statsDimensions = useResizeObserver(StatsRef);

  if (window.innerWidth < 640) {
    return (
      <main className='app-wrapper'>
        <Header />

        {/* <Chart /> */}
        <Stats />
      </main>
    );
  } else {
    return (
      <main className='app-wrapper'>
        <div className='col-left'>
          <Header />
          <div className='chart-wrapper' ref={ChartRef}>
            {chartDimensions && <Chart chartDimensions={chartDimensions} />}
          </div>
        </div>
        <div className='col-right'>
          <div className='map-wrapper' ref={MapRef}>
            {mapDimensions && <Map mapDimensions={mapDimensions} />}
          </div>
          <div className='stats-wrapper' ref={StatsRef}>
            {statsDimensions && <Stats statsDimensions={statsDimensions} />}
          </div>
        </div>
      </main>
    );
  }
};

export default App;
