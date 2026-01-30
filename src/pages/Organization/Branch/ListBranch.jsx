/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { Button, notification, FloatButton, Form, Input, Modal, Image, Menu, Dropdown, Popconfirm, Tag } from "antd";
import { PlusOutlined, ReloadOutlined, SearchOutlined, ExclamationCircleOutlined, DeleteFilled, EllipsisOutlined } from "@ant-design/icons";
import { DELETE, GET } from "helpers/api_helper";
import { ADD_BRANCH } from "helpers/url_helper";
import Loader from "components/Common/Loader";
import BranchCollapseContent from "components/Common/BranchCollapseContent";
import "./ListBranch.css";
import { useNavigate } from "react-router-dom";
import branchIcon from "../../../assets/icons/bank.png";
import SwipeablePanel from "components/Common/SwipeablePanel";
import BranchNameModal from "components/Common/BranchNameModal";
import "../fontsize.css"

const ListBranch = () => {
  const [loading, setLoading] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [branchDetails, setBranchDetails] = useState(null);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [openSwipeId, setOpenSwipeId] = useState(null);
  const navigate = useNavigate();
  
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [selectedBranchName, setSelectedBranchName] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasBranchSelected, setHasBranchSelected] = useState(false);

  useEffect(() => {
    const savedBranch = localStorage.getItem("selected_branch_name");
    const savedBranchId = localStorage.getItem("selected_branch_id");
    
    if (savedBranch && savedBranchId) {
      setSelectedBranchName(savedBranch);
      setSelectedBranchId(savedBranchId);
      setHasBranchSelected(true);
      setIsInitialized(true);
    } else {
      const checkToken = () => {
        const token = localStorage.getItem("access_token");
        if (token) {
          setIsInitialized(true);
          setBranchModalVisible(true);
        } else {
          setTimeout(checkToken, 300);
        }
      };
      checkToken();
    }
  }, []);

  const handleSaveBranchName = (name, id) => {
    localStorage.setItem("selected_branch_name", name);
    localStorage.setItem("selected_branch_id", id);
    setSelectedBranchName(name);
    setSelectedBranchId(id);
    setHasBranchSelected(true);
    setBranchModalVisible(false);
    window.location.reload();
  };

  const handleCancelBranchModal = () => {
    notification.warning({
      message: "Branch Name Required",
      description: "Please select a branch name to continue",
    });
  };

  const onDelete = async (record) => {
    try {
      setDeleteLoader(true);
      const response = await DELETE(`${ADD_BRANCH}${record.id}/`);

      if (response?.status === 200) {
        // If the deleted branch is the currently selected one, clear selection
        if (record.id === selectedBranchId) {
          localStorage.removeItem("selected_branch_name");
          localStorage.removeItem("selected_branch_id");
          setSelectedBranchName("");
          setSelectedBranchId(null);
          setHasBranchSelected(false);
          setBranchDetails(null);
          setBranchModalVisible(true);
        }
        
        notification.success({
          message: `${record.branch_name?.toUpperCase()} Branch Deleted!`,
          description: "The branch has been deleted successfully.",
          duration: 2,
        });
      } else {
        notification.error({
          message: "Delete Failed",
          description: "The branch could not be deleted.",
        });
      }
    } catch (error) {
      console.error("Error deleting branch:", error);
      notification.error({
        message: "Error",
        description: "An error occurred while deleting the branch.",
      });
    } finally {
      setDeleteLoader(false);
      setOpenSwipeId(null);
    }
  };

  const fetchBranchDetails = useCallback(async () => {
    if (!selectedBranchId) {
      return;
    }

    setLoading(true);
    try {
      const response = await GET(`/api/branch/${selectedBranchId}/`);
      if (response?.status === 200) {
        setBranchDetails(response.data);
      } else {
        // Branch might have been deleted
        notification.warning({
          message: "Branch Not Found",
          description: "The selected branch no longer exists. Please select a new branch.",
        });
        localStorage.removeItem("selected_branch_name");
        localStorage.removeItem("selected_branch_id");
        setHasBranchSelected(false);
        setBranchModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching branch details:", error);
      notification.error({
        message: "Error",
        description: "Failed to load branch details.",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && hasBranchSelected && selectedBranchId) {
      fetchBranchDetails();
    }
  }, [fetchBranchDetails, hasBranchSelected, selectedBranchId]);

  const handleSwipeStateChange = (isOpen) => {
    if (isOpen) {
      setOpenSwipeId(selectedBranchId);
    } else if (openSwipeId === selectedBranchId) {
      setOpenSwipeId(null);
    }
  };

  const renderMenu = () => (
    <Menu>
      <Menu.Item
        key="edit"
        onClick={(e) => {
          e.domEvent.stopPropagation();
          navigate(`/branch/edit/${selectedBranchId}`);
        }}
      >
        <div className="d-flex align-items-center gap-1">
          <span className="mdi mdi-pencil text-secondary mb-0"></span>
          <span>Edit</span>
        </div>
      </Menu.Item>

      <Menu.Item key="delete">
        <Popconfirm
          title={`Delete branch ${selectedBranchName}?`}
          description="Are you sure you want to delete?"
          icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          onConfirm={(e) => {
            e.stopPropagation();
            onDelete({ id: selectedBranchId, branch_name: selectedBranchName });
          }}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true, type: "primary" }}
          cancelButtonProps={{ type: "default" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="d-flex align-items-center gap-1" style={{ color: "red" }}>
            <DeleteFilled style={{ color: "red" }} />
            <span>Delete</span>
          </div>
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleEditBranch = () => {
    setOpenSwipeId(null);
    navigate(`/branch/edit/${selectedBranchId}`);
  };

  const handleDeleteBranch = () => {
    setOpenSwipeId(null);
    onDelete({ id: selectedBranchId, branch_name: selectedBranchName });
  };

  if (!hasBranchSelected) {
    return (
      <div className="list-branch-page-content">
        {isInitialized && (
          <BranchNameModal
            visible={branchModalVisible}
            onSave={handleSaveBranchName}
            onCancel={handleCancelBranchModal}
          />
        )}
      </div>
    );
  }

  return (
    <div className="list-branch-page-content">
      {loading && <Loader />}

      <div className="list-branch-header">
        <h2 className="list-branch-title">Branch Details</h2>
      </div>

      <div className="list-branch-scrollable-div">
        {!branchDetails ? (
          <div className="list-branch-no-data">
            <p style={{ fontSize: "16px", marginBottom: "8px" }}>Loading branch details...</p>
          </div>
        ) : (
          <div className="list-branch-item-wrapper">
            {isMobile ? (
              <div>
                <SwipeablePanel
                  item={{ id: selectedBranchId, branch_name: selectedBranchName }}
                  icon={branchIcon}
                  index={0}
                  titleKey="branch_name"
                  name="branch"
                  showIndex={false}
                  onSwipeRight={handleEditBranch}
                  onSwipeLeft={handleDeleteBranch}
                  isExpanded={false}
                  isSwipeOpen={openSwipeId === selectedBranchId}
                  onSwipeStateChange={handleSwipeStateChange}
                />
                <div>
                  <BranchCollapseContent 
                    branch={branchDetails} 
                    details={branchDetails} 
                  />
                </div>
              </div>
            ) : (
              <div className="list-branch-accordion-container">
                <div className="list-branch-accordion-header list-branch-accordion-header-expanded">
                  <div className="list-branch-accordion-title-container">
                    <Image src={branchIcon} width={30} height={30} preview={false} />
                    <span className="list-branch-accordion-title">{selectedBranchName}</span>
                  </div>
                  <div className="list-branch-accordion-actions">
                    <Dropdown overlay={renderMenu()} trigger={["click"]}>
                      <EllipsisOutlined
                        className="list-branch-ellipsis-icon"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  </div>
                </div>

                <div className="list-branch-accordion-content">
                  <BranchCollapseContent 
                    branch={branchDetails} 
                    details={branchDetails} 
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        className="list-branch-float-button"
        onClick={() => (window.location.href = "/branch/add")}
      />

      {isInitialized && (
        <BranchNameModal
          visible={branchModalVisible}
          onSave={handleSaveBranchName}
          onCancel={handleCancelBranchModal}
        />
      )}
    </div>
  );
};

export default ListBranch;