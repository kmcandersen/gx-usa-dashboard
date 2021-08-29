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
  // const StatsRef = useRef();
  // const statsDimensions = useResizeObserver(StatsRef);

  // if (window.innerWidth < 640) {
  //   return (
  //     <main className='app-wrapper'>
  //       <Header />
  //       <Map />
  //       <Chart />
  //       <Stats />
  //     </main>
  //   );
  // } else {
  return (
    <main className='app-wrapper'>
      <div className='col-left'>
        <Header />
        <section className='chart-wrapper' ref={ChartRef}>
          {chartDimensions && <Chart chartDimensions={chartDimensions} />}
        </section>
      </div>
      <div className='col-right'>
        <section className='map-wrapper' ref={MapRef}>
          {mapDimensions && <Map mapDimensions={mapDimensions} />}
        </section>
        {/* <section className='stats-wrapper' ref={StatsRef}>
          {statsDimensions && <Stats statsDimensions={statsDimensions} />}
        </section> */}
      </div>
    </main>
  );
  //}
};

export default App;
