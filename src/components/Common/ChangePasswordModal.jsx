import React, { useState, useEffect, useRef } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { LockOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { POST } from "../../helpers/api_helper";

const ChangePasswordModal = ({ visible, onSave, onCancel, userId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const currentPasswordRef = useRef(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const endpoint = `/api/users/change-password/`;

      const response = await POST(endpoint, {
        old_password: values.currentPassword,
        new_password: values.newPassword,
      });

      console.log("FULL RESPONSE:", response);
      console.log("RESPONSE DATA:", response.data);

      // If backend returned an error inside a 200 response
      if (response.data?.error) {
        // If it's specifically about the old password, highlight and clear that field
        const backendErr = response.data?.error;
        const isOldPwdError =
          Boolean(response.data?.old_password) ||
          /old|current|incorrect|wrong/i.test(backendErr);

        if (isOldPwdError) {
          // Clear the current password value and set a field error
          form.setFieldsValue({ currentPassword: "" });
          form.setFields([{ name: "currentPassword", errors: [backendErr] }]);
          // Try focusing the input (may or may not have effect depending on Input.Password forwarding)
          currentPasswordRef.current?.focus?.();
        }

        message.error(backendErr);
        return; // Don't reset form or close modal
      }

      // Success
      if (response.data?.message) {
        message.success(response.data.message);
      } else {
        message.success("Password changed successfully");
      }

      // Clear any field errors (especially currentPassword) on success
      form.setFields([{ name: "currentPassword", errors: [] }]);
      form.resetFields();
      onSave();
    } catch (error) {
      console.log("CAUGHT ERROR:", error);
      console.log("ERROR MESSAGE:", error.message);
      console.log("ERROR DATA:", error.data);
      console.log("ERROR STATUS:", error.status);

      const backendErr =
        error.data?.error ||
        error.data?.message ||
        error.data?.detail ||
        error.data?.old_password?.[0] ||
        error.data?.new_password?.[0] ||
        error.data?.non_field_errors?.[0] ||
        error.message ||
        "Failed to change password";

      console.log("EXTRACTED ERROR:", backendErr);

      // Detect old password specific errors to clear + highlight the current password field
      const isOldPwdError =
        Boolean(error.data?.old_password) || /old|current|incorrect|wrong/i.test(backendErr);

      if (isOldPwdError) {
        form.setFieldsValue({ currentPassword: "" });
        form.setFields([{ name: "currentPassword", errors: [backendErr] }]);
        currentPasswordRef.current?.focus?.();
      }

      message.error(backendErr);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <LockOutlined style={{ marginRight: "8px", fontSize: "18px" }} />
          Change Password
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={450}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[
            { required: true, message: "Please enter your current password" }
          ]}
        >
          <Input.Password
            ref={currentPasswordRef}
            prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Enter current password"
            iconRender={(visible) =>
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: "Please enter a new password" },
            { min: 4, message: "Password must be at least 4 characters" }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Enter new password (min 4 characters)"
            iconRender={(visible) =>
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("The two passwords do not match"));
              }
            })
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Confirm new password"
            iconRender={(visible) =>
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Change Password
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
