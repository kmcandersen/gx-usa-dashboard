import React, { useContext } from 'react';
import DataContext from './context/DataContext';
import './App.css';
import './stateface.css';
import Header from './Header';
import Map from './Map';
import Chart from './Chart';
import Stats from './Stats';

const App = () => {
  const { isSmScreen } = useContext(DataContext);

  return (
    <main className='app-wrapper'>
      {isSmScreen ? (
        <>
          <Header />
          <Map />
          <Chart />
          <Stats />
        </>
      ) : (
        <>
          <div className='col-left'>
            <Header />
            <Chart />
          </div>
          <div className='col-right'>
            <Map />
            <Stats />
          </div>
        </>
      )}
    </main>
  );
};

export default App;
