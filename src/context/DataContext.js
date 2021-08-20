import React, { useEffect, useState } from 'react';
import { csv } from 'd3';
import usDataCsv from './../assets/inctotus_16_20.csv';

const DataContext = React.createContext();

export const DataProvider = ({ children }) => {
  const [usData, setUSData] = useState();
  const [error, setError] = useState(null);

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

  useEffect(() => getUsData(), []);

  return (
    <DataContext.Provider
      value={{
        usData,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
