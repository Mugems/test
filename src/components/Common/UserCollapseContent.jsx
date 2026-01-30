import React from "react";
import { Descriptions, Tag } from "antd";

const UserCollapseContent = ({ user }) => {
  if (!user) return null;

  // Tag colors for odd/even pattern
  const oddColor = 'purple';
  const evenColor = 'green';

  // Helper function to group line allocations by branch
  const getLineAllocationsByBranch = (allocations) => {
    if (!allocations || allocations.length === 0) {
      return {};
    }
    
    const branchMap = {};
    
    allocations.forEach(allocation => {
      const branchName = allocation.branch_name || "Unknown Branch";
      const lineName = allocation.line_name || "Unknown Line";
      
      if (!branchMap[branchName]) {
        branchMap[branchName] = new Set();
      }
      branchMap[branchName].add(lineName);
    });
    
    // Convert Sets to Arrays
    Object.keys(branchMap).forEach(branch => {
      branchMap[branch] = Array.from(branchMap[branch]);
    });
    
    return branchMap;
  };

  // Helper function to get expense mappings with their actual branch and line
  const getExpenseMappings = (expenses) => {
    if (!expenses || expenses.length === 0) {
      return [];
    }
    
    // Map expenses using their own branch and line data
    return expenses.map(expense => {
      return {
        expenseId: expense.expense,
        expenseName: expense.expense_name || `Expense ID: ${expense.expense}`,
        branch: expense.expense_branch_name || "N/A",
        line: expense.expense_line_name || "N/A"
      };
    });
  };

  const lineAllocationsByBranch = getLineAllocationsByBranch(user.line_allocations);
  const expenseMappings = getExpenseMappings(user.user_expenses);

  // Get base branch and line
  const baseBranch = user.line_allocations?.[0]?.base_branch_name;
  const baseLine = user.line_allocations?.[0]?.base_line_name;

  // Helper function to extract unique areas
  const getAreas = (allocations) => {
    if (!allocations || allocations.length === 0) return [];
    return [...new Set(allocations.map(a => a.area_name).filter(Boolean))];
  };

  const areas = getAreas(user.line_allocations);

  // Organize line mappings with base first
  const getOrganizedLineMappings = () => {
    const entries = Object.entries(lineAllocationsByBranch);
    
    if (entries.length === 0) return [];
    
    // If there's a base branch, prioritize it
    if (baseBranch && baseLine) {
      const baseEntry = entries.find(([branch, lines]) => 
        branch === baseBranch && lines.includes(baseLine)
      );
      
      if (baseEntry) {
        // Put base first, then others
        const otherEntries = entries.filter(([branch]) => branch !== baseBranch);
        return [baseEntry, ...otherEntries];
      }
    }
    
    return entries;
  };

  const organizedLineMappings = getOrganizedLineMappings();

  return (
    <div style={{ background: "#fff", padding: "0px 0px" }}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2, md: 3 }}
        labelStyle={{
          fontSize: '18px',
          fontWeight: 600,
          background: "#e5e4e4ff",
          width: "140px",
        }}
        contentStyle={{
          fontSize: '18px',
          fontWeight: 600
        }}
      >
        <Descriptions.Item label="User ID:">
          {user.id || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Username:">
          {user.username || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Full Name:">
          {user.full_name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Email:">
          {user.email || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Mobile:">
          {user.mobile_number || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Role:">
          {user.role?.toUpperCase() || "N/A"}
        </Descriptions.Item>
        
        <Descriptions.Item label="Base Branch:">
          {baseBranch || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Base Line:" span={2}>
          {baseLine || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Address:" span={2}>
          {user.address || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Pin Code:">
          {user.pin_code || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Line Mapping:" span={3}>
          {organizedLineMappings.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              maxWidth: '100%',
              overflow: 'hidden'
            }}>
              {organizedLineMappings.map(([branch, lines], index) => {
                const isBase = index === 0 && branch === baseBranch;
                const color = organizedLineMappings.length > 1 
                  ? (index % 2 === 0 ? oddColor : evenColor)
                  : 'blue';
                
                return (
                  <div key={branch} style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: '4px',
                    wordBreak: 'break-word'
                  }}>
                    <Tag 
                      color={color}
                      style={{ 
                        marginRight: '0px',
                        maxWidth: '100%',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'clip',
                        lineHeight: '1.5',
                        fontSize: '18px',
                        fontWeight: isBase ? 700 : 600
                      }}
                    >
                      <span style={{ wordBreak: 'break-word' }}>
                        {isBase && "(Base) "}
                        {branch} : {lines.join(", ")}
                      </span>
                    </Tag>
                  </div>
                );
              })}
            </div>
          ) : (
            "N/A"
          )}
        </Descriptions.Item>

        {/* <Descriptions.Item label="Area(s)" span={3}>
          {areas.length > 0 ? areas.join(", ") : "N/A"}
        </Descriptions.Item> */}

        
        <Descriptions.Item label="Expense Mapping:" span={3}>
          {expenseMappings.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px',
              maxWidth: '100%',
              overflow: 'hidden'
            }}>
              {expenseMappings.map((mapping, index) => {
                const color = expenseMappings.length > 1 
                  ? (index % 2 === 0 ? oddColor : evenColor)
                  : 'blue';
                
                return (
                  <div 
                    key={index} 
                    style={{ 
                      fontSize: '13px',
                      wordBreak: 'break-word',
                      overflow: 'hidden'
                    }}
                  >
                    <Tag 
                      color={color}
                      style={{ 
                        marginRight: '0px',
                        maxWidth: '100%',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'clip',
                        lineHeight: '1.5',
                        fontSize: '18px'
                      }}
                    >
                      <span style={{ wordBreak: 'break-word' }}>
                        {mapping.branch} : {mapping.line} : {mapping.expenseName}
                      </span>
                    </Tag>
                  </div>
                );
              })}
            </div>
          ) : (
            "N/A"
          )}
        </Descriptions.Item>

        
        <Descriptions.Item label="Allow Old Transaction:">
          {user.allow_old_transaction ? "Yes" : "No"}
        </Descriptions.Item>
        <Descriptions.Item label="Created By:" span={2}>
          {user.created_by_details ? new Date(user.created_ts).toLocaleString() : "N/A"}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default UserCollapseContent;