import { useState, useEffect, useRef } from "react";
import { notification, Form, Input, Button, Upload, message, Divider, Space, Card, Modal, Spin, Alert } from "antd";
import { UploadOutlined, PlusOutlined, MinusOutlined, BankOutlined, FileTextOutlined, CameraOutlined, EyeOutlined, DeleteOutlined, FileOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { ToastContainer } from "react-toastify";
import Loader from "components/Common/Loader";
import { ADD_BRANCH, BRANCH_FILE } from "helpers/url_helper";
import { UPLOAD_CERTIFCATE, GET_BRANCHES, CREATE_BRANCH, DELETE,PUT } from "helpers/api_helper";
import { useParams, useNavigate } from "react-router-dom";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, NOTIFICATION_TITLES, FILE_MESSAGES } from "helpers/errorMessages";
import InputWithAddon from "components/Common/InputWithAddon";
import CameraCapture from '../../../components/Common/CameraCapture';
import '../responsive.css'

const AddBranch = () => {
  const [loader, setLoader] = useState(false);
  const [form] = Form.useForm();
  const params = useParams();
  const navigate = useNavigate();

  const [agreementFile, setAgreementFile] = useState(null);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [additionalSelectedFiles, setAdditionalSelectedFiles] = useState([]);

  // Camera states
  const [cameraVisible, setCameraVisible] = useState(false);
  const cameraFieldRef = useRef({ fieldId: null, fieldType: null });

  // Preview states
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Existing documents state
  const [existingAgreementDoc, setExistingAgreementDoc] = useState(null);
  const [existingAdditionalDocs, setExistingAdditionalDocs] = useState([]);

  const getBranchDetails = async () => {
    setLoader(true);
    const response = await GET_BRANCHES(`${ADD_BRANCH}${params.id}`);
    if (response.status === 200) {
      const { data } = response;
      
      // Store existing agreement document
      setExistingAgreementDoc(data.agreement_certificate[0] || null);
      
      // Store existing additional documents
      setExistingAdditionalDocs(data.additional_details || []);
      
      const agreementFileList = data.agreement_certificate[0]
        ? [
          {
            uid: '-1',
            name: data.agreement_certificate[0].file_name,
            status: 'done',
            url: data.agreement_certificate[0].signed_url,
          },
        ]
        : [];
      const additionalCertificateDetails = data.additional_details.map((file, index) => ({
        additional_certificate: file
          ? [
            {
              uid: `-${index + 1}`,
              name: file.file_name,
              status: 'done',
              url: file.signed_url,
            },
          ]
          : [],
        additional_certifi_description: file?.additional_certifi_description || '',
      }));
      form.setFieldsValue({
        ...data,
        agreement_certificate: agreementFileList,
        additional_certificate_details: additionalCertificateDetails,
      });

      setAgreementFile(response?.data.agreement_certificate[0] || null);
      setAdditionalFiles(response?.data.additional_details || []);
      setAdditionalSelectedFiles(new Array(response?.data.additional_details?.length || 0).fill(null));
    }
    setLoader(false);
  };
  
  useEffect(() => {
    if (params?.id) {
      getBranchDetails();
    } else {
      form.setFieldsValue({
        additional_certificate_details: [
          {
            additional_certificate: [],
            additional_certifi_description: "",
          },
        ],
      });
      setAdditionalFiles([null]);
      setAdditionalSelectedFiles([null]);
    }
  }, [params?.id]);

  // Open camera
  const openCamera = (fieldId, fieldType) => {
    console.log('=== Opening Camera ===');
    console.log('Field ID:', fieldId);
    console.log('Field Type:', fieldType);
    
    cameraFieldRef.current = { fieldId, fieldType };
    setCameraVisible(true);
  };

  // Handle camera capture - only select, don't upload
  const handleCameraCapture = (file) => {
    console.log('=== Camera Capture Received ===');
    console.log('File:', file);
    console.log('File type check:', file instanceof File);
    console.log('File properties:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      lastModified: file?.lastModified
    });
    
    const { fieldId, fieldType } = cameraFieldRef.current;
    
    // More lenient file validation - check if it has File-like properties
    if (!file || !file.name || !file.type || file.size === undefined) {
      console.error('Not a valid File object:', file);
      message.error('Invalid file received from camera');
      return;
    }

    console.log('File validation passed');
    console.log('Field type:', fieldType);
    console.log('Field ID:', fieldId);

    // Just set the file to state, don't upload yet
    if (fieldType === 'agreement') {
      setAgreementFile(file);
      message.success(`${file.name} selected successfully`);
    } else if (fieldType === 'additional') {
      const updatedSelected = [...additionalSelectedFiles];
      updatedSelected[fieldId] = file;
      setAdditionalSelectedFiles(updatedSelected);
      message.success(`${file.name} selected successfully`);
    }
    
    cameraFieldRef.current = { fieldId: null, fieldType: null };
  };

  // Manual upload function (when Upload button is clicked)
  const uploadFileManually = async (file, isAdditional = false, index = null) => {
    console.log('=== Manual Upload ===');
    console.log('File:', file);
    console.log('Is Additional:', isAdditional, 'Index:', index);
    
    // More lenient file validation
    if (!file || !file.name || !file.type || file.size === undefined) {
      message.error('Invalid file object');
      return;
    }

    const formData = new FormData();
    formData.append('file', file, file.name);
    
    try {
      message.loading({ content: 'Uploading...', key: 'upload' });
      const response = await UPLOAD_CERTIFCATE(BRANCH_FILE, formData);
      
      if (response.status === 200) {
        const { signed_url, file_name } = response.data;
        
        if (isAdditional && index !== null) {
          setAdditionalFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = { signed_url, file_name };
            return newFiles;
          });
          // Clear the selected file after successful upload
          const updatedAdditionalSelected = [...additionalSelectedFiles];
          updatedAdditionalSelected[index] = null;
          setAdditionalSelectedFiles(updatedAdditionalSelected);
        } else {
          setAgreementFile({ signed_url, file_name });
          // Clear the selected agreement file after upload
          setAgreementFile(null);
        }
        
        message.success({ content: `${file.name} ${FILE_MESSAGES.UPLOAD_SUCCESS}`, key: 'upload' });
      } else {
        throw new Error(response.statusText || ERROR_MESSAGES.BRANCH.UPLOAD_FAILED);
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error({ content: `${file.name} ${FILE_MESSAGES.UPLOAD_FAILED}`, key: 'upload' });
    }
  };

  // Upload camera captured file (auto-upload)
  const uploadCameraFile = async (file, isAdditional = false, index = null) => {
    console.log('=== Upload Camera File ===');
    console.log('File:', file);
    console.log('Is Additional:', isAdditional, 'Index:', index);
    
    const formData = new FormData();
    formData.append('file', file, file.name);
    
    try {
      message.loading({ content: 'Uploading...', key: 'camera-upload' });
      const response = await UPLOAD_CERTIFCATE(BRANCH_FILE, formData);
      
      console.log('Upload response:', response);
      
      if (response.status === 200) {
        const { signed_url, file_name } = response.data;
        
        if (isAdditional && index !== null) {
          setAdditionalFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = { signed_url, file_name };
            return newFiles;
          });
        } else {
          setAgreementFile({ signed_url, file_name });
        }
        
        message.success({ content: `${file.name} ${FILE_MESSAGES.UPLOAD_SUCCESS}`, key: 'camera-upload' });
      } else {
        throw new Error(response.statusText || ERROR_MESSAGES.BRANCH.UPLOAD_FAILED);
      }
    } catch (error) {
      console.error('Camera upload error:', error);
      message.error({ content: `${file.name} ${FILE_MESSAGES.UPLOAD_FAILED}`, key: 'camera-upload' });
    }
  };

  // Delete document handler
  const handleDeleteDocument = async (docId, fileName, isAgreement = false, index = null) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete the document: ${fileName || 'Document'}?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          // If you have a DELETE endpoint for branch documents, use it here
          // For now, we'll just remove from state
          if (isAgreement) {
            setExistingAgreementDoc(null);
            setAgreementFile(null);
            form.setFieldsValue({ agreement_certificate: [] });
          } else if (index !== null) {
            setExistingAdditionalDocs(prev => prev.filter((_, i) => i !== index));
            setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
            
            const currentDetails = form.getFieldValue("additional_certificate_details") || [];
            currentDetails.splice(index, 1);
            form.setFieldsValue({ additional_certificate_details: currentDetails });
          }
          
          notification.success({
            message: 'Deleted',
            description: `${fileName || 'Document'} deleted successfully.`,
            duration: 3,
          });
        } catch (error) {
          notification.error({
            message: 'Error',
            description: error.message || 'An error occurred during deletion.',
            duration: 3,
          });
        }
      },
    });
  };

  // View document
  const SecurePDFPreview = ({ url }) => {
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

    return (
      <div style={{ margin: 0, padding: 0 }}>
        <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
          <Button 
            type="primary" 
            size="small"
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
          >
            Open PDF in New Tab
          </Button>
        </div>
        
        <iframe
          src={googleViewerUrl}
          title="PDF Preview"
          width="100%"
          height="600px"
          style={{ 
            border: '1px solid #d9d9d9', 
            borderRadius: 4,
            display: 'block',
            margin: 0
          }}
        />
      </div>
    );
  };

  const viewDocument = (documentUrl, fileName) => {
    if (!documentUrl || typeof documentUrl !== 'string') {
      notification.error({
        message: 'Error',
        description: 'Document URL not found or invalid',
        duration: 3,
      });
      return;
    }

    let fileExtension = '';
    if (fileName && typeof fileName === 'string') {
      fileExtension = fileName.split('.').pop().toLowerCase();
    } else {
      const urlWithoutParams = documentUrl.split('?')[0];
      fileExtension = urlWithoutParams.split('.').pop().toLowerCase();
    }
    
    if (fileExtension === 'pdf') {
      setPreviewType('pdf');
      setPreviewContent(documentUrl);
      setPreviewVisible(true);
      return;
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
      setPreviewType('image');
      setPreviewContent(documentUrl);
      setPreviewVisible(true);
      setPreviewLoading(true);
      return;
    }

    try {
      window.open(documentUrl, '_blank');
    } catch (error) {
      console.error('Error opening document:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to open document',
        duration: 3,
      });
    }
  };

  // Render existing document card
  const renderExistingDocument = (doc, fileName, isAgreement = false, index = null) => {
    if (!doc) return null;

    return (
      <Card 
        size="small" 
        style={{ marginBottom: '12px', backgroundColor: '#f6ffed' }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500' }}>
                {fileName || 'Document'}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Existing Document
              </div>
            </div>
          </div>
          <Space>
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => viewDocument(doc.signed_url || doc.url, fileName)}
              size="small"
            >
              View
            </Button>
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteDocument(doc.id, fileName, isAgreement, index)}
              size="small"
            >
              Delete
            </Button>
          </Space>
        </div>
      </Card>
    );
  };

 const onFinish = async values => {
  setLoader(true);
  try {
    const payload = {
      branch_name: values.branch_name,
      branch_address: values.branch_address,
      agreement_certificate: agreementFile ? [agreementFile] : [],
      agreement_description: values.agreement_description,
      additional_details: additionalFiles.map((file, index) => ({
        ...file,
        additional_certifi_description:
          values.additional_certificate_details[index]?.additional_certifi_description,
      })),
    };

    let response;
    
    if (params.id) {
      // Edit mode - use PUT API
      response = await PUT(`${ADD_BRANCH}${params.id}/`, payload);
    } else {
      // Create mode - use POST API
      response = await CREATE_BRANCH(ADD_BRANCH, payload);
    }

    if (response.status === 200 || response.status === 201) {
      notification.success({
        message: NOTIFICATION_TITLES.BRANCH,
        description: params.id ? SUCCESS_MESSAGES.BRANCH.UPDATED : SUCCESS_MESSAGES.BRANCH.CREATED,
        duration: 2,
      });
      navigate("/branch/list");
    }
  } catch (error) {
    notification.error({
      message: ERROR_MESSAGES.BRANCH.OPERATION_FAILED,
      description: error.message,
      duration: 0,
    });
  } finally {
    setLoader(false);
  }
};

  const fileRemove = () => {
    setAgreementFile(null);
    form.setFieldsValue({ agreement_description: "" });
  };

  return (
    <>
      {loader && <Loader />}

      <div className="page-content" style={{
        marginRight: "10px",
        marginLeft: "-10px", maxWidth: "100%"
      }}>
        <div className="container-fluid" style={{
          marginTop: -100,
          padding: 0,
        }}>
          <div className="row">
            <div className="col-md-12">
               <div className="sticky-branch-header">
              <h2 className="add-branch-title" style={{ position: 'sticky',zIndex:'100' ,margin: 0, fontSize: "24px", fontWeight: 600 }}>
                {params.id ? "Edit Branch" : "Add Branch"}
              </h2>
        </div>
              <Form form={form} layout="vertical"  className="add-branch-form" onFinish={onFinish} style={{ padding: 0, marginRight: "-20px", marginBottom: "-30px" }}>
                <div className="container" style={{ padding: 0 }}>
                  {/* Branch Details */}
                  <div className="row mb-1 mt-2">
                    <div className="col-md-6">
                      <Form.Item
                        label="Branch Name"
                        name="branch_name"
                        rules={[
                          { required: true, message: ERROR_MESSAGES.BRANCH.BRANCH_NAME_REQUIRED },
                          { pattern: /^[A-Za-z\s]+$/, message: 'Branch name must contain only alphabets' }
                        ]}
                      >
                        <InputWithAddon
                          icon={<BankOutlined />}
                          placeholder="Enter branch name"
                          onKeyPress={(e) => {
                            if (!/[A-Za-z\s]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item
                        label="Branch Address"
                        name="branch_address"
                        rules={[{ required: true, message: ERROR_MESSAGES.BRANCH.BRANCH_ADDRESS_REQUIRED }]}
                      >
                        <Input.TextArea
                          placeholder="Enter branch address"
                          rows={3}
                          allowClear
                          autoSize={{ minRows: 2, maxRows: 8 }}
                          style={{ resize: "both" }}
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Agreement Certificate */}
                  <Divider style={{ borderTop: "2px solid #d9d9d9" }} />
                 <Divider 
  orientation="center"
  style={{ 
    borderTopWidth: '3px',
    borderColor: '#d9d9d9'
  }}
>Agreement</Divider>
                  
                  {/* Show existing agreement document */}
                  {existingAgreementDoc && renderExistingDocument(
                    existingAgreementDoc, 
                    existingAgreementDoc.file_name, 
                    true
                  )}
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <Form.Item
                        label="File Upload"
                      >
                        <Space.Compact style={{ width: '100%', marginBottom: agreementFile ? '8px' : '0' }}>
                          <Upload
                            maxCount={1}
                            multiple={false}
                            beforeUpload={(file) => {
                              setAgreementFile(file);
                              message.success(`${file.name} selected successfully`);
                              return false;
                            }}
                            accept=".pdf,.csv,.png,.jpeg,.jpg,.doc,.docx"
                            showUploadList={false}
                            fileList={[]}
                          >
                            <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
                              Browse
                            </Button>
                          </Upload>
                          <Button 
                            icon={<CameraOutlined />}
                            onClick={() => openCamera(null, 'agreement')}
                            title="Capture with Camera"
                          >
                            Camera
                          </Button>
                          <Button 
                            type="primary" 
                            icon={<UploadOutlined />}
                            onClick={() => {
                              if (agreementFile && agreementFile instanceof File) {
                                uploadFileManually(agreementFile, false, null);
                              } else {
                                message.error('Please select a file first');
                              }
                            }}
                            disabled={!agreementFile || !(agreementFile instanceof File)}
                          >
                            Upload
                          </Button>
                        </Space.Compact>
                        
                        {/* Show selected file with clear button - only if it's a File object (not uploaded yet) */}
                        {agreementFile && agreementFile instanceof File && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '4px 11px',
                            border: '1px solid #d9d9d9',
                            borderRadius: '6px',
                            backgroundColor: '#f6ffed'
                          }}>
                            <div 
                              style={{ 
                                fontSize: '13px', 
                                color: '#52c41a', 
                                fontWeight: '500',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: 'calc(100% - 30px)'
                              }}
                              title={agreementFile.name}
                            >
                              <FileOutlined style={{ marginRight: '5px' }} />
                              {agreementFile.name}
                            </div>
                            <Button
                              icon={<CloseCircleOutlined />} 
                              onClick={() => {
                                setAgreementFile(null);
                                message.info('File selection cleared.');
                              }}
                              danger
                              type="text"
                              size="small"
                              title="Clear selected file"
                              style={{ 
                                padding: '0', 
                                height: 'auto',
                                marginLeft: '8px'
                              }}
                            />
                          </div>
                        )}
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item
  label="File Description"
  name="agreement_description"
  rules={[
    { required: true, message: 'Please enter description' },
    { 
      pattern: /^[A-Za-z][A-Za-z0-9\s]*$/, 
      message: 'Description must start with an alphabet' 
    }
  ]}
>
  <InputWithAddon
    icon={<FileTextOutlined />}
    placeholder="Enter file description"
    onValueFilter={(value) => {
      if (value.length === 0) return '';
      
      // First character must be alphabet
      let filtered = '';
      for (let i = 0; i < value.length; i++) {
        if (i === 0) {
          if (/[A-Za-z]/.test(value[i])) {
            filtered += value[i];
          }
        } else {
          if (/[A-Za-z0-9\s]/.test(value[i])) {
            filtered += value[i];
          }
        }
      }
      return filtered;
    }}
  />
</Form.Item>
                    </div>
                  </div>
                  <Divider style={{ borderTop: "2px solid #d9d9d9" }} />

                  {/* Certificates Section */}
                 <Divider 
  orientation="center"
  style={{ 
    borderTopWidth: '3px',
    borderColor: '#d9d9d9'
  }}
>Certificates</Divider>
                  <Form.List name="additional_certificate_details">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }, index) => (
                          <div key={key} className="row mb-4">
                            {fields.length > 1 && (
                             <Divider 
  orientation="center"
  style={{ 
    borderTopWidth: '3px',
    borderColor: '#d9d9d9'
  }}
 >
                                {`Additional Certificate ${index + 1}`}
                              </Divider>
                            )}

                            {/* Show existing additional document */}
                            {existingAdditionalDocs[index] && renderExistingDocument(
                              existingAdditionalDocs[index], 
                              existingAdditionalDocs[index].file_name,
                              false,
                              index
                            )}

                            {/* File Upload */}
                            <div className="col-md-6">
                              <Form.Item
                                label="File Upload"
                              >
                                <Space.Compact style={{ width: '100%', marginBottom: additionalSelectedFiles[index] ? '8px' : '0' }}>
                                  <Upload
                                    maxCount={1}
                                    beforeUpload={(file) => {
                                      const updatedSelected = [...additionalSelectedFiles];
                                      updatedSelected[index] = file;
                                      setAdditionalSelectedFiles(updatedSelected);
                                      message.success(`${file.name} selected successfully`);
                                      return false;
                                    }}
                                    accept=".pdf,.csv,.png,.jpeg,.jpg,.doc,.docx"
                                    showUploadList={false}
                                    fileList={[]}
                                  >
                                    <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
                                      Browse
                                    </Button>
                                  </Upload>
                                  <Button 
                                    icon={<CameraOutlined />}
                                    onClick={() => openCamera(index, 'additional')}
                                    title="Capture with Camera"
                                  >
                                    Camera
                                  </Button>
                                  <Button 
                                    type="primary" 
                                    icon={<UploadOutlined />}
                                    onClick={() => {
                                      if (additionalSelectedFiles[index] && additionalSelectedFiles[index] instanceof File) {
                                        uploadFileManually(additionalSelectedFiles[index], true, index);
                                      } else {
                                        message.error('Please select a file first');
                                      }
                                    }}
                                    disabled={!additionalSelectedFiles[index] || !(additionalSelectedFiles[index] instanceof File)}
                                  >
                                    Upload
                                  </Button>
                                </Space.Compact>
                                
                                {/* Show selected file with clear button - only if it's a File object (not uploaded yet) */}
                                {additionalSelectedFiles[index] && additionalSelectedFiles[index] instanceof File && (
                                  <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    padding: '4px 11px',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: '6px',
                                    backgroundColor: '#f6ffed'
                                  }}>
                                    <div 
                                      style={{ 
                                        fontSize: '13px', 
                                        color: '#52c41a', 
                                        fontWeight: '500',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: 'calc(100% - 30px)'
                                      }}
                                      title={additionalSelectedFiles[index].name}
                                    >
                                      <FileOutlined style={{ marginRight: '5px' }} />
                                      {additionalSelectedFiles[index].name}
                                    </div>
                                    <Button
                                      icon={<CloseCircleOutlined />} 
                                      onClick={() => {
                                        const updatedSelected = [...additionalSelectedFiles];
                                        updatedSelected[index] = null;
                                        setAdditionalSelectedFiles(updatedSelected);
                                        message.info('File selection cleared.');
                                      }}
                                      danger
                                      type="text"
                                      size="small"
                                      title="Clear selected file"
                                      style={{ 
                                        padding: '0', 
                                        height: 'auto',
                                        marginLeft: '8px'
                                      }}
                                    />
                                  </div>
                                )}
                              </Form.Item>
                            </div>

                            {/* File Description + Buttons */}
                            <div className="col-md-6">
                              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "additional_certifi_description"]}
                                  rules={[
                                    { required: true, message: ERROR_MESSAGES.BRANCH.FILE_DESCRIPTION_REQUIRED },
                                    { 
                                      pattern: /^[A-Za-z][A-Za-z0-9\s]*$/, 
                                      message: 'Description must start with an alphabet and contain only alphabets and numbers' 
                                    }
                                  ]}
                                  label="File Description"
                                  style={{ flexGrow: 1 }}
                                >
                                  <InputWithAddon
                                    icon={<FileTextOutlined />}
                                    placeholder="Enter file description"
                                     onValueFilter={(value) => {
      if (value.length === 0) return '';
      
      // First character must be alphabet
      let filtered = '';
      for (let i = 0; i < value.length; i++) {
        if (i === 0) {
          if (/[A-Za-z]/.test(value[i])) {
            filtered += value[i];
          }
        } else {
          if (/[A-Za-z0-9\s]/.test(value[i])) {
            filtered += value[i];
          }
        }
      }
      return filtered;
    }}
                                  />
                                </Form.Item>
                                {/* Minus Button */}
                                {index > 0 && (
                                  <Button
                                    type="primary"
                                    danger
                                    shape="circle"
                                    icon={<MinusOutlined />}
                                    onClick={() => {
                                      remove(name);
                                      setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
                                      setExistingAdditionalDocs(prev => prev.filter((_, i) => i !== index));
                                      setAdditionalSelectedFiles(prev => prev.filter((_, i) => i !== index));
                                    }}
                                    style={{
                                      width: 33,
                                      height: 33,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      backgroundColor: "#ff4d4f",
                                      borderColor: "#ff4d4f",
                                      color: "#fff",
                                      marginTop: "25px",
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add button */}
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button
                            type="primary"
                            shape="circle"
                            icon={<PlusOutlined />}
                            onClick={() => {
                              add();
                              setAdditionalFiles(prev => [...prev, null]);
                              setAdditionalSelectedFiles(prev => [...prev, null]);
                            }}
                            style={{
                              width: 35,
                              height: 35,
                              backgroundColor: "#28a745",
                              borderColor: "#28a745",
                              color: "#fff",
                              marginTop: "-15px"
                            }}
                          />
                        </div>
                      </>
                    )}
                  </Form.List>

                  {/* Submit & Cancel Buttons */}
                  <div className="text-center mt-4">
                    <Space size="large">
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                      >
                        {params.id ? "Update Branch" : "Add Branch"}
                      </Button>
                      <Button
                        size="large"
                        onClick={() => navigate("/branch/list")}
                      >
                        Cancel
                      </Button>
                    </Space>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>

      {/* Camera Capture Modal */}
      <CameraCapture
        visible={cameraVisible}
        onClose={() => {
          console.log('Camera modal closing');
          setCameraVisible(false);
          cameraFieldRef.current = { fieldId: null, fieldType: null };
        }}
        onCapture={handleCameraCapture}
      />

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title="Document Preview"
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
          <Button 
            key="download" 
            type="primary"
            onClick={() => window.open(previewContent, '_blank')}
          >
            Open in New Tab
          </Button>
        ]}
        onCancel={() => setPreviewVisible(false)}
        width={900}
        centered
        destroyOnClose
        bodyStyle={{ padding: '16px', margin: 0 }}
        style={{ top: 20 }}
      >
        <Spin spinning={previewLoading && previewType === 'image'}>
          {previewType === 'pdf' && previewContent && (
            <SecurePDFPreview url={previewContent} />
          )}
          
          {previewType === 'image' && previewContent && (
            <div style={{ textAlign: 'center' }}>
              <img 
                src={previewContent} 
                alt="Document Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
                onLoad={() => setPreviewLoading(false)}
                onError={(e) => {
                  console.error('Image load error:', e);
                  setPreviewLoading(false);
                  notification.error({
                    message: 'Error',
                    description: 'Failed to load image',
                    duration: 3,
                  });
                }}
              />
            </div>
          )}
        </Spin>
      </Modal>
    </>
  );
};

export default AddBranch;