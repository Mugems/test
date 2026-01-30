import React, { useEffect, useState, useRef } from "react";
import { Modal, Form, Select, Spin, notification } from "antd";
import { GET, POST } from "helpers/api_helper";

const BranchNameModal = ({ visible, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [username, setUsername] = useState("");
  const retryTimeoutRef = useRef(null);
  const DEFAULT_LIMIT = 5;

  // Read username from localStorage
  useEffect(() => {
    const authUser = localStorage.getItem("authUser");

    if (authUser) {
      try {
        const parsed = JSON.parse(authUser);
        setUsername(parsed.username || parsed.name || "User");
      } catch {
        setUsername("User");
      }
    }
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await GET("api/branch_dd");

      if (response?.status === 200) {
        // Remove duplicates based on branch_name and id
        const uniqueBranches = response.data.filter((branch, index, self) =>
          index === self.findIndex((b) => b.id === branch.id)
        );
        setBranchList(uniqueBranches);
      } else {
        notification.error({
          message: "Failed to Load Branches",
          description: "Could not fetch branch list.",
        });
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch branches only when modal opens
  useEffect(() => {
    if (!visible) {
      // Clear any pending retry timeout when modal closes
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      return;
    }

    form.resetFields();

    const token = localStorage.getItem("access_token");

    if (token) {
      fetchBranches();
    } else {
      // Retry logic with cleanup
      retryTimeoutRef.current = setTimeout(() => {
        const retryToken = localStorage.getItem("access_token");
        if (retryToken) {
          fetchBranches();
        }
        retryTimeoutRef.current = null;
      }, 300);
    }

    // Cleanup function to clear timeout if component unmounts
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [visible]);

  const updateBranchSession = async (branchId) => {
    setUpdating(true);
    try {
      const response = await POST("/api/users/session-change-branch/", {
        branch_id: branchId,
      });

      if (response?.status === 200 || response?.status === 201) {
        notification.success({
          message: "Branch Updated",
          description: "Your branch has been successfully changed.",
        });
        return true;
      } else {
        notification.error({
          message: "Update Failed",
          description: response?.message || "Could not update branch session.",
        });
        return false;
      }
    } catch (err) {
      console.error("Error updating branch session:", err);
      notification.error({
        message: "Update Failed",
        description: err?.message || "An error occurred while updating branch.",
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Find branch by id
      const selectedBranch = branchList.find(b => b.id === values.branchId);
      
      if (selectedBranch) {
        // Call API to update branch session
        const success = await updateBranchSession(selectedBranch.id);
        
        if (success) {
          // Call parent callback with branch name and id
          onSave(selectedBranch.branch_name, selectedBranch.id);
        }
      }
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: "center", fontSize: 18, fontWeight: 600 }}>
          Branch Selection
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Continue"
      cancelText="Cancel"
      width={480}
      centered
      confirmLoading={updating}
    >
      {/* Logged in user */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 15, fontWeight: 500 }}>
          Currently Logged-In as:
        </span>{" "}
        <span style={{ color: "#1890ff", fontWeight: 600 }}>
          {username}
        </span>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="branchId"
          label={
            <span style={{ fontWeight: 600 }}>
              Select the branch to proceed:
            </span>
          }
          rules={[{ required: true, message: "Please select your branch" }]}
        >
          {loading ? (
            <Spin />
          ) : (
            <Select
              placeholder="Select your branch"
              showSearch
              options={branchList.map((b) => ({
                label: b.branch_name,
                value: b.id,
              }))}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              listHeight={32 * 5}
              allowClear
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BranchNameModal;