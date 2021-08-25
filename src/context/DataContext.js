import React, { useEffect, useState } from 'react';
import { csv } from 'd3';
import usDataCsv from './../assets/inctotus_16_20.csv';
import stDataCsv from './../assets/incbystate_16_20.csv';
import stTotIncCsv from './../assets/inctotbystate_16_20.csv';

const DataContext = React.createContext();

export const DataProvider = ({ children }) => {
  const [usData, setUSData] = useState();
  const [stateYrDataAll, setStateYrDataAll] = useState();
  const [stateYrData, setStateYrData] = useState();
  const [stateTotData, setStateTotData] = useState();
  const [selectedState, setSelectedState] = useState();
  const [error, setError] = useState(null);

  // for Chart
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

  const getStateYrDataAll = async () => {
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

      setStateYrDataAll(dataset);
    } catch (error) {
      setError(error.toString());
    }
  };

  const getStateYrData = (selectedState = 'AL') => {
    const singleStateData = stateYrDataAll.filter(
      (el) => el.STATE === selectedState
    );
    setStateYrData(singleStateData);
  };

  // for Map
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

  useEffect(() => {
    getUsData();
    getStateTotData();
    getStateYrDataAll();
  }, []);

  useEffect(() => {
    if (stateYrDataAll) {
      getStateYrData(selectedState);
    }
  }, [selectedState]);

  return (
    <DataContext.Provider
      value={{
        usData,
        stateYrData,
        stateTotData,
        selectedState,
        setSelectedState,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
