import { useState, useEffect, useMemo } from "react";

export const useOrganizationFilters = (
  loans,
  branchList,
  lineList,
  areaList
) => {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);

  const getFilteredLoans = () => {
    let filtered = [...loans];

    if (selectedBranch) {
      filtered = filtered.filter(
        (loan) => loan.LOAN_DSBRSMNT_BRNCH_NM === selectedBranch
      );
    }
    if (selectedLine) {
      filtered = filtered.filter(
        (loan) => loan.LOAN_DSBRSMNT_LINE_NM === selectedLine
      );
    }
    if (selectedArea) {
      filtered = filtered.filter(
        (loan) => loan.LOAN_DSBRSMNT_AREA_NM === selectedArea
      );
    }

    return filtered;
  };

  const availableBranches = useMemo(() => {
    return branchList;
  }, [branchList]);

  const availableLines = useMemo(() => {
    if (!selectedBranch) return [];
    const selectedBranchObj = branchList.find(
      (branch) => branch.branch_name === selectedBranch
    );
    if (!selectedBranchObj) return [];
    return lineList.filter((line) => {
      const lineBranchId = line?.branch;
      return lineBranchId === selectedBranchObj.id;
    });
  }, [selectedBranch, lineList, branchList]);

  const availableAreas = useMemo(() => {
    if (!selectedBranch || !selectedLine) return [];

    const selectedLineObj = lineList.find((line) => {
      const lineName = line.line_name || line.lineName;
      return lineName === selectedLine;
    });
    if (!selectedLineObj) return [];

    return areaList.filter((area) => {
      const areaLineId = area?.line_id || area?.line;
      return areaLineId === selectedLineObj.id;
    });
  }, [selectedBranch, selectedLine, areaList, lineList]);

  const availableCustomers = useMemo(() => {
    if (!selectedBranch || !selectedLine || !selectedArea) return [];

    const filteredLoans = loans.filter(
      (loan) =>
        loan.LOAN_DSBRSMNT_BRNCH_NM === selectedBranch &&
        loan.LOAN_DSBRSMNT_LINE_NM === selectedLine &&
        loan.LOAN_DSBRSMNT_AREA_NM === selectedArea
    );

    const customerMap = new Map();
    filteredLoans.forEach((loan) => {
      const key = loan.LOAN_DSBRSMNT_CUST_CD;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: loan.LOAN_DSBRSMNT_CUST_CD,
          name: loan.LOAN_DSBRSMNT_CUST_NM,
          branch: loan.LOAN_DSBRSMNT_BRNCH_NM,
          line: loan.LOAN_DSBRSMNT_LINE_NM,
          area: loan.LOAN_DSBRSMNT_AREA_NM,
        });
      }
    });

    return Array.from(customerMap.values());
  }, [selectedBranch, selectedLine, selectedArea, loans]);

  const handleBranchChange = (value) => {
    setSelectedBranch(value);
    setSelectedLine(null);
    setSelectedArea(null);
  };

  useEffect(() => {
    if (selectedBranch && availableLines.length === 0 && selectedLine) {
      setSelectedLine(null);
    }
    if (
      selectedLine &&
      availableLines.length > 0 &&
      !availableLines.find((l) => (l.lineName || l.line_name) === selectedLine)
    ) {
      setSelectedLine(null);
    }
  }, [selectedBranch, availableLines, selectedLine]);

  useEffect(() => {
    if (selectedLine && availableAreas.length === 0 && selectedArea) {
      setSelectedArea(null);
    }
    if (
      selectedArea &&
      availableAreas.length > 0 &&
      !availableAreas.find((a) => a.areaName === selectedArea)
    ) {
      setSelectedArea(null);
    }
  }, [selectedLine, availableAreas, selectedArea]);

  const handleLineChange = (value) => {
    setSelectedLine(value);
    setSelectedArea(null);
  };

  const handleAreaChange = (value) => {
    setSelectedArea(value);
  };

  const resetAll = () => {
    setSelectedBranch(null);
    setSelectedLine(null);
    setSelectedArea(null);
  };

  return {
    selectedBranch,
    selectedLine,
    selectedArea,
    availableBranches,
    availableLines,
    availableAreas,
    availableCustomers,
    handleBranchChange,
    handleLineChange,
    handleAreaChange,
    resetAll,
    getFilteredLoans,
  };
};
