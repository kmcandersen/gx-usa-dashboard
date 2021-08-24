import React, { useEffect, useState } from 'react';
import { csv } from 'd3';
import usDataCsv from './../assets/inctotus_16_20.csv';
import stDataCsv from './../assets/incbystate_16_20.csv';
import stTotIncCsv from './../assets/inctotbystate_16_20.csv';
//import usStateGeo from './../assets/gz_2010_us_040_00_20m.json';

const DataContext = React.createContext();

export const DataProvider = ({ children }) => {
  const [usData, setUSData] = useState();
  const [stateYrData, setStateYrData] = useState();
  const [stateTotData, setStateTotData] = useState();
  // const [stateGeo, setStateGeo] = useState();
  const [error, setError] = useState(null);

  // console.log('StateCsv', usDataCsv);
  // console.log('usStateGeo', usStateGeo);

  const getUsData = async () => {
    try {
      setError(null);
      const dataset = await csv(usDataCsv);
      dataset.forEach((d) => {
        for (const item in d) {
          d[item] = +d[item];
        }
      });
      setUSData(dataset);
    } catch (error) {
      setError(error.toString());
    }
  };

  const getStateYrData = async () => {
    try {
      setError(null);
      const dataset = await csv(stDataCsv);
      dataset.forEach((d) => {
        d.YEAR = +d.YEAR;
        d.EQFREIGHT = +d.EQFREIGHT;
        d.EQPSGR = +d.EQPSGR;
        d.EQYDMAINT = +d.EQYDMAINT;
        d.EQOTHER = +d.EQOTHER;
        d.VEHAUTO = +d.VEHAUTO;
        d.VEHPED = +d.VEHPED;
        d.VEHTRUCK = +d.VEHTRUCK;
        d.VEHOTHER = +d.VEHOTHER;
        d.TOTINC = +d.TOTINC;
        d.TOTINJ = +d.TOTINJ;
        d.TOTKLD = +d.TOTKLD;
      });
      setStateYrData(dataset);
    } catch (error) {
      setError(error.toString());
    }
  };

  const getStateTotData = async () => {
    try {
      setError(null);
      const dataset = await csv(stTotIncCsv);

      dataset.forEach((d) => {
        d.TOTINC = +d.TOTINC;
      });
      setStateTotData(dataset);
    } catch (error) {
      setError(error.toString());
    }
  };

  // const getStateGeo = async () => {
  //   setStateGeo(usStateGeo);
  // };

  useEffect(() => {
    getUsData();
    getStateYrData();
    getStateTotData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        usData,
        stateYrData,
        stateTotData,
        // stateGeo,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
