import React, { useEffect, useState } from 'react';
import { csv } from 'd3';
import yrDataCsv from './../assets/incbystate_00_20.csv';
import stTotIncCsv from './../assets/inctotbystate_00_20.csv';
import gxCountCsv from './../assets/gxsumstateus.csv';

const DataContext = React.createContext();

export const DataProvider = ({ children }) => {
  const [yrDataAll, setYrDataAll] = useState();
  const [usData, setUSData] = useState();
  const [stateYrData, setStateYrData] = useState();
  const [stateTotIncData, setStateTotIncData] = useState();
  const [selectedState, setSelectedState] = useState();
  const [gxCount, setGxCount] = useState();
  const [isSmScreen, setIsSmScreen] = useState();
  const [error, setError] = useState(null);

  // data for all categories, for indiv years, by state + 'US'
  const getYrDataAll = async () => {
    try {
      setError(null);
      const dataset = await csv(yrDataCsv);
      dataset.forEach((d) => {
        // d.YEAR = +d.YEAR;
        d.VEHAUTO = +d.VEHAUTO;
        d.VEHPED = +d.VEHPED;
        d.VEHTRUCK = +d.VEHTRUCK;
        d.VEHOTHER = +d.VEHOTHER;
        d.TOTINC = +d.TOTINC;
        d.TOTINJ = +d.TOTINJ;
        d.TOTKLD = +d.TOTKLD;
      });
      setYrDataAll(dataset);
    } catch (error) {
      setError(error.toString());
    }
  };

  // put data for US only, for indiv years, in global state
  const getUsData = () => {
    const datasetUS = yrDataAll.filter((el) => el.STATE === 'US');
    setUSData(datasetUS);
  };

  // put data for selected state only, for indiv years, in global state
  const getStateYrData = (selectedState = 'US') => {
    const singleStateData = yrDataAll.filter(
      (el) => el.STATE === selectedState
    );
    setStateYrData(singleStateData);
  };

  // incidents aggregated by state for all years, for Map
  const getStateTotIncData = async () => {
    try {
      setError(null);
      const dataset = await csv(stTotIncCsv);

      dataset.forEach((d) => {
        d.TOTINC = +d.TOTINC;
      });
      setStateTotIncData(dataset);
    } catch (error) {
      setError(error.toString());
    }
  };

  // gx count by state, for Stats
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
    getYrDataAll();
    getStateTotIncData();
    getGxData();
    window.innerWidth < 1110 ? setIsSmScreen(true) : setIsSmScreen(false);
    window.addEventListener('resize', () => {
      window.innerWidth < 1110 ? setIsSmScreen(true) : setIsSmScreen(false);
    });
  }, []);

  useEffect(() => {
    if (yrDataAll) {
      getUsData();
    }
  }, [yrDataAll]);

  useEffect(() => {
    if (yrDataAll) {
      if (selectedState) {
        getStateYrData(selectedState);
      } else {
        setStateYrData(null);
      }
    }
  }, [selectedState]);

  return (
    <DataContext.Provider
      value={{
        usData,
        stateYrData,
        stateTotIncData,
        selectedState,
        gxCount,
        setSelectedState,
        isSmScreen,
        setIsSmScreen,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
