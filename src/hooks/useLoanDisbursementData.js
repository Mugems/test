import { useState, useEffect, useCallback } from 'react';
import { getList } from 'helpers/getters';
import { ADD_BRANCH, LINE, AREA } from 'helpers/url_helper';

const SETUP_STORAGE_KEY = 'loanDisbursementSetup';
const SETUP_EXPIRY_HOURS = 24;

export const useLoanDisbursementData = (initialCustomerData = null, existingData = null) => {
  const [setupData, setSetupData] = useState(null);
  const [isSetupValid, setIsSetupValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use existing data if available (from list component) or fetch if needed
  const [branchList, setBranchList] = useState(existingData?.branches || []);
  const [lineList, setLineList] = useState(existingData?.lines || []);
  const [areaList, setAreaList] = useState(existingData?.areas || []);
  const [dataLoaded, setDataLoaded] = useState({
    branches: Boolean(existingData?.branches?.length),
    lines: Boolean(existingData?.lines?.length),
    areas: Boolean(existingData?.areas?.length),
  });

  useEffect(() => {
    loadSetupData();
  }, []);

  const loadSetupData = useCallback(() => {
    try {
      const savedSetup = localStorage.getItem(SETUP_STORAGE_KEY);
      if (savedSetup) {
        const setup = JSON.parse(savedSetup);
        const isRecent = isSetupRecent(setup.timestamp);

        setSetupData(setup);
        setIsSetupValid(isRecent);

        return { setup, isValid: isRecent };
      }
    } catch (error) {
      console.error('Error loading setup data:', error);
    }

    return { setup: null, isValid: false };
  }, []);

  const isSetupRecent = useCallback((timestamp) => {
    const setupTime = new Date(timestamp);
    const now = new Date();
    const hoursDiff = (now - setupTime) / (1000 * 60 * 60);
    return hoursDiff <= SETUP_EXPIRY_HOURS;
  }, []);

  const loadDataIfNeeded = useCallback(async () => {
    // Only load data if we don't have it already
    const needsData = !dataLoaded.branches || !dataLoaded.lines || !dataLoaded.areas;

    if (!needsData) {
      console.log('Using existing data - skipping API calls');
      return;
    }

    setLoading(true);
    try {
      const promises = [];

      if (!dataLoaded.branches) {
        promises.push(
          getList(ADD_BRANCH).then((res) => {
            setBranchList(res || []);
            setDataLoaded((prev) => ({ ...prev, branches: true }));
            return { type: 'branches', data: res };
          })
        );
      }

      if (!dataLoaded.lines) {
        promises.push(
          getList(LINE).then((res) => {
            setLineList(res || []);
            setDataLoaded((prev) => ({ ...prev, lines: true }));
            return { type: 'lines', data: res };
          })
        );
      }

      if (!dataLoaded.areas) {
        promises.push(
          getList(AREA).then((res) => {
            setAreaList(res || []);
            setDataLoaded((prev) => ({ ...prev, areas: true }));
            return { type: 'areas', data: res };
          })
        );
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises);
        console.log('Loaded missing data via API');
      }
    } catch (error) {
      console.error('Error loading setup data:', error);
    } finally {
      setLoading(false);
    }
  }, [dataLoaded]);

  const saveSetupData = useCallback((setup) => {
    try {
      const setupWithTimestamp = {
        ...setup,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(setupWithTimestamp));
      setSetupData(setupWithTimestamp);
      setIsSetupValid(true);

      return true;
    } catch (error) {
      console.error('Error saving setup data:', error);
      return false;
    }
  }, []);

  const clearSetupData = useCallback(() => {
    localStorage.removeItem(SETUP_STORAGE_KEY);
    setSetupData(null);
    setIsSetupValid(false);
  }, []);

  const getPrefilledData = useCallback(
    (customerData = null) => {
      const dataToUse = customerData || initialCustomerData;

      if (!dataToUse) return null;

      // Find matching records by name/label
      const matchingBranch = branchList.find((b) => b.branch_name === dataToUse.branch);
      const matchingLine = lineList.find((l) => (l.lineName || l.line_name) === dataToUse.line);
      const matchingArea = areaList.find((a) => a.areaName === dataToUse.area);

      if (matchingBranch && matchingLine && matchingArea) {
        return {
          loan_dsbrsmnt_brnch_id: matchingBranch.id,
          loan_dsbrsmnt_line_id: matchingLine.id,
          loan_dsbrsmnt_area_id: [matchingArea.id], // Array for multi-select
          // Also include the customer data for additional prefilling
          ...(dataToUse.customerId && {
            loan_dsbrsmnt_cust_id: dataToUse.customerId,
            loan_dsbrsmnt_cust_nm: dataToUse.customerName,
          }),
        };
      }

      return null;
    },
    [branchList, lineList, areaList, initialCustomerData]
  );

  const isDataReady = dataLoaded.branches && dataLoaded.lines && dataLoaded.areas;

  return {
    setupData,
    isSetupValid,
    loading,
    branchList,
    lineList,
    areaList,
    isDataReady,
    loadSetupData,
    saveSetupData,
    clearSetupData,
    getPrefilledData,
    loadDataIfNeeded,
  };
};

export default useLoanDisbursementData;
