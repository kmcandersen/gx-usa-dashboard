import React from 'react';
import './App.css';
import Header from './Header';
import Map from './Map';
import Chart from './Chart';
import Stats from './Stats';

const App = () => {
  if (window.innerWidth < 640) {
    return (
      <main className='app-wrapper'>
        <Header />
        <Map />
        <Chart />
        <Stats />
      </main>
    );
  } else {
    return (
      <main className='app-wrapper'>
        <div className='col-left'>
          <Header />
          <Chart />
        </div>
        <div className='col-right'>
          <Map />
          <Stats />
        </div>
      </main>
    );
  }
};

export default App;
