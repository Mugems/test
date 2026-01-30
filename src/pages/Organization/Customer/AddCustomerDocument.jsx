import React, { useState, useEffect, useRef } from "react";
import { notification, Form, Input, Button, Upload, message, Divider, Space, Card, Spin, Modal } from "antd";
import { UploadOutlined, CloudUploadOutlined, FileOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, MinusOutlined, CloseCircleOutlined, CameraOutlined } from '@ant-design/icons';
import { UPLOAD, GET, DELETE } from "helpers/api_helper";
import { useNavigate } from "react-router-dom";
import CameraCapture from '../../../components/Common/CameraCapture';

const AddCustomerDocument = ({ customerId,customerName, onPrevious, onCancel }) => {
  const [form] = Form.useForm();

  // State for document fields
  const [aadhaarFields, setAadhaarFields] = useState([{ id: 0, file: null, loading: false }]);
  const [panFields, setPanFields] = useState([{ id: 0, file: null, loading: false }]);
  const [locationFields, setLocationFields] = useState([{ id: 0, file: null, loading: false }]);
  const [otherFields, setOtherFields] = useState([{ id: 0, file: null, loading: false }]);

  const [cameraVisible, setCameraVisible] = useState(false);
  const cameraFieldRef = useRef({ fieldId: null, fieldType: null });

  // State for existing documents
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // State for preview modal
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [formUpdateTrigger, setFormUpdateTrigger] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (customerId) {
      form.setFieldsValue({ customer_name: customerName });
      fetchExistingDocuments();
    }
  }, [customerId, form]);

  const openCamera = (fieldId, fieldType) => {
    cameraFieldRef.current = { fieldId, fieldType };
    setCameraVisible(true);
  };

  const handleCameraCapture = (file) => {
    const { fieldId, fieldType } = cameraFieldRef.current;
    
    if (fieldId === null || fieldId === undefined || !fieldType) {
      message.error('Camera field info missing. Please try again.');
      return;
    }
    
    if (!(file instanceof File)) {
      message.error('Invalid file received from camera');
      return;
    }
    
    let setFieldsState, fields;
    
    switch(fieldType) {
      case 'aadhaar':
        setFieldsState = setAadhaarFields;
        fields = aadhaarFields;
        break;
      case 'pan':
        setFieldsState = setPanFields;
        fields = panFields;
        break;
      case 'location_photo':
        setFieldsState = setLocationFields;
        fields = locationFields;
        break;
      case 'other':
        setFieldsState = setOtherFields;
        fields = otherFields;
        break;
      default:
        message.error('Unknown document type. Please try again.');
        return;
    }
    
    const updatedFields = fields.map(field => {
      if (field.id === fieldId) {
        return { ...field, file: file };
      }
      return field;
    });
    
    setFieldsState(updatedFields);
    
    cameraFieldRef.current = { fieldId: null, fieldType: null };
  };
const getDescriptionValidation = (fieldId, descriptionFieldPrefix, file) => {
  const description = form.getFieldValue(`${descriptionFieldPrefix}_${fieldId}`);
  if (file && (!description || description.trim() === '')) {
    return {
      validateStatus: 'error',
      help: 'Enter description to upload the document'
    };
  }
  return {
    validateStatus: '',
    help: ''
  };
};
const initializeFieldsFromDocuments = (documents) => {
  const docsByType = {
    aadhaar: documents.filter(d => d.document_type === 'aadhaar'),
    pan: documents.filter(d => d.document_type === 'pan'),
    location_photo: documents.filter(d => d.document_type === 'location_photo'),
    other: documents.filter(d => d.document_type === 'other')
  };

  // Initialize aadhaar fields - only for existing documents
  if (docsByType.aadhaar.length > 0) {
    const aadhaarFieldsArray = docsByType.aadhaar.map((_, index) => ({
      id: index,
      file: null,
      loading: false
    }));
    setAadhaarFields(aadhaarFieldsArray);
  }

  // Initialize pan fields
  if (docsByType.pan.length > 0) {
    const panFieldsArray = docsByType.pan.map((_, index) => ({
      id: index,
      file: null,
      loading: false
    }));
    setPanFields(panFieldsArray);
  }

  // Initialize location fields
  if (docsByType.location_photo.length > 0) {
    const locationFieldsArray = docsByType.location_photo.map((_, index) => ({
      id: index,
      file: null,
      loading: false
    }));
    setLocationFields(locationFieldsArray);
  }

  // Initialize other fields
  if (docsByType.other.length > 0) {
    const otherFieldsArray = docsByType.other.map((_, index) => ({
      id: index,
      file: null,
      loading: false
    }));
    setOtherFields(otherFieldsArray);
  }
};
const fetchExistingDocuments = async () => {
  setLoadingDocuments(true);
  try {
    const response = await GET(`/api/customer-documents/customer/${customerId}/documents/`);
    
    if (response && response.error) {
      setExistingDocuments([]);
      return;
    }
    
    let documents = [];
    if (response && Array.isArray(response.data)) {
      documents = response.data;
    } else if (response && Array.isArray(response)) {
      documents = response;
    }
    
    setExistingDocuments(documents);
    
    // Initialize fields based on existing documents
    if (documents.length > 0) {
      initializeFieldsFromDocuments(documents);
      
      // Pre-populate descriptions after fields are initialized
      setTimeout(() => {
        const formValues = {};
        
        const docsByType = {
          aadhaar: documents.filter(d => d.document_type === 'aadhaar'),
          pan: documents.filter(d => d.document_type === 'pan'),
          location_photo: documents.filter(d => d.document_type === 'location_photo'),
          other: documents.filter(d => d.document_type === 'other')
        };
        
        // Populate descriptions using index as field id
        docsByType.aadhaar.forEach((doc, index) => {
          if (doc.document_description) {
            formValues[`aadhaar_description_${index}`] = doc.document_description;
          }
        });
        
        docsByType.pan.forEach((doc, index) => {
          if (doc.document_description) {
            formValues[`pan_description_${index}`] = doc.document_description;
          }
        });
        
        docsByType.location_photo.forEach((doc, index) => {
          if (doc.document_description) {
            formValues[`location_description_${index}`] = doc.document_description;
          }
        });
        
        docsByType.other.forEach((doc, index) => {
          if (doc.document_description) {
            formValues[`other_description_${index}`] = doc.document_description;
          }
        });
        
        form.setFieldsValue(formValues);
      }, 100);
    }
  } catch (error) {
    setExistingDocuments([]);
    if (!error.message?.includes('Customer not found')) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch existing documents',
        duration: 3,
      });
    }
  } finally {
    setLoadingDocuments(false);
  }
};
const handleDeleteDocument = async (docId, fileName) => {
  Modal.confirm({
    title: 'Confirm Delete',
    content: `Are you sure you want to delete the document: ${fileName || 'Document'}?`,
    okText: 'Delete',
    okType: 'danger',
    onOk: async () => {
      setLoadingDocuments(true);
      try {
        const response = await DELETE(`/api/customer-documents/${docId}/`);

        if (response?.status === 204 || response?.status === 200) {
          notification.success({
            message: 'Deleted',
            description: `${fileName || 'Document'} deleted successfully.`,
            duration: 3,
          });
          
          // Update existing documents list
          const updatedDocs = existingDocuments.filter(doc => doc.id !== docId);
          setExistingDocuments(updatedDocs);
          
          // Re-initialize fields and descriptions based on remaining documents
          if (updatedDocs.length > 0) {
            initializeFieldsFromDocuments(updatedDocs);
            
            // Re-populate descriptions after a short delay
            setTimeout(() => {
              const formValues = {};
              
              const docsByType = {
                aadhaar: updatedDocs.filter(d => d.document_type === 'aadhaar'),
                pan: updatedDocs.filter(d => d.document_type === 'pan'),
                location_photo: updatedDocs.filter(d => d.document_type === 'location_photo'),
                other: updatedDocs.filter(d => d.document_type === 'other')
              };
              
              docsByType.aadhaar.forEach((doc, index) => {
                if (doc.document_description) {
                  formValues[`aadhaar_description_${index}`] = doc.document_description;
                }
              });
              
              docsByType.pan.forEach((doc, index) => {
                if (doc.document_description) {
                  formValues[`pan_description_${index}`] = doc.document_description;
                }
              });
              
              docsByType.location_photo.forEach((doc, index) => {
                if (doc.document_description) {
                  formValues[`location_description_${index}`] = doc.document_description;
                }
              });
              
              docsByType.other.forEach((doc, index) => {
                if (doc.document_description) {
                  formValues[`other_description_${index}`] = doc.document_description;
                }
              });
              
              form.setFieldsValue(formValues);
              setFormUpdateTrigger(prev => prev + 1);
            }, 100);
          } else {
            // If no documents left, reset to initial state
            setAadhaarFields([{ id: 0, file: null, loading: false }]);
            setPanFields([{ id: 0, file: null, loading: false }]);
            setLocationFields([{ id: 0, file: null, loading: false }]);
            setOtherFields([{ id: 0, file: null, loading: false }]);
            form.resetFields();
          }
          
        } else {
          notification.error({
            message: 'Deletion Failed',
            description: response?.data?.error || 'Failed to delete the document.',
            duration: 3,
          });
        }
      } catch (error) {
        notification.error({
          message: 'Error',
          description: error.response?.data?.error || error.message || 'An error occurred during deletion.',
          duration: 3,
        });
      } finally {
        setLoadingDocuments(false);
      }
    },
  });
};

  const getDocumentsByType = (type) => {
    if (!Array.isArray(existingDocuments)) {
      return [];
    }
    return existingDocuments.filter(doc => doc.document_type === type);
  };

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

  const viewDocument = async (documentData, fileName) => {
    let documentUrl = documentData;
    let actualFileName = fileName;
    
    if (typeof documentData === 'object' && documentData !== null) {
      if (documentData.file_url) {
        documentUrl = documentData.file_url;
      } else if (documentData.signed_url) {
        documentUrl = documentData.signed_url;
      } else if (documentData.url) {
        documentUrl = documentData.url;
      }
      
      if (!actualFileName && documentData.document_file && documentData.document_file.original_name) {
        actualFileName = documentData.document_file.original_name;
      } else if (!actualFileName && documentData.document_file_name) {
        actualFileName = documentData.document_file_name;
      }
    }
    
    if (!documentUrl || typeof documentUrl !== 'string') {
      notification.error({
        message: 'Error',
        description: 'Document URL not found or invalid',
        duration: 3,
      });
      return;
    }

    let fileExtension = '';
    if (actualFileName && typeof actualFileName === 'string') {
      fileExtension = actualFileName.split('.').pop().toLowerCase();
    } else if (typeof documentUrl === 'string') {
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
      notification.error({
        message: 'Error',
        description: 'Failed to open document',
        duration: 3,
      });
    }
  };

  const addAadhaarField = () => {
  const existingAadhaarDocs = getDocumentsByType('aadhaar');
  const totalCount = existingAadhaarDocs.length + aadhaarFields.filter(f => !getDocumentsByType('aadhaar')[f.id]).length;
  
  if (totalCount < 2) {
    const newId = Date.now(); // Use timestamp for unique ID
    setAadhaarFields([...aadhaarFields, { id: newId, file: null, loading: false }]);
  }
};

const addPanField = () => {
  const existingPanDocs = getDocumentsByType('pan');
  const totalCount = existingPanDocs.length + panFields.filter(f => !getDocumentsByType('pan')[f.id]).length;
  
  if (totalCount < 2) {
    const newId = Date.now();
    setPanFields([...panFields, { id: newId, file: null, loading: false }]);
  }
};

const addLocationField = () => {
  const existingLocationDocs = getDocumentsByType('location_photo');
  const totalCount = existingLocationDocs.length + locationFields.filter(f => !getDocumentsByType('location_photo')[f.id]).length;
  
  if (totalCount < 4) {
    const newId = Date.now();
    setLocationFields([...locationFields, { id: newId, file: null, loading: false }]);
  }
};

const addOtherField = () => {
  const existingOtherDocs = getDocumentsByType('other');
  const totalCount = existingOtherDocs.length + otherFields.filter(f => !getDocumentsByType('other')[f.id]).length;
  
  if (totalCount < 4) {
    const newId = Date.now();
    setOtherFields([...otherFields, { id: newId, file: null, loading: false }]);
  }
};

  const removeAadhaarField = (id) => {
    if (aadhaarFields.length > 1) {
      setAadhaarFields(aadhaarFields.filter(field => field.id !== id));
    }
  };

  const removePanField = (id) => {
    if (panFields.length > 1) {
      setPanFields(panFields.filter(field => field.id !== id));
    }
  };

  const removeLocationField = (id) => {
    if (locationFields.length > 1) {
      setLocationFields(locationFields.filter(field => field.id !== id));
    }
  };

  const removeOtherField = (id) => {
    if (otherFields.length > 1) {
      setOtherFields(otherFields.filter(field => field.id !== id));
    }
  };

  const handleFileSelect = (file, fieldId, setFieldsState, fields) => {
    const originalFile = file.originFileObj || file;
    
    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, file: originalFile } : field
    );
    
    setFieldsState(updatedFields);
    message.success(`${originalFile.name} selected successfully`);
    return false;
  };

  const handleClearFile = (fieldId, setFieldsState, fields) => {
    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, file: null } : field
    );
    setFieldsState(updatedFields);
    message.info('File selection cleared.');
  };

  const uploadDocument = async (fieldId, file, type, descriptionField, setFieldsState, fields) => {
    const description = form.getFieldValue(`${descriptionField}_${fieldId}`);

    if (!customerId) {
      notification.error({
        message: 'Error',
        description: 'Customer ID is missing. Please complete personal information first.',
        duration: 3,
      });
      return;
    }

    if (!file) {
      notification.error({
        message: 'Error',
        description: 'Please select a file first',
        duration: 2,
      });
      return;
    }

    if (!description || description.trim() === '') {
      form.setFields([{
        name: `${descriptionField}_${fieldId}`,
        errors: ['Please enter description to upload the document']
      }]);
      return;
    }

    if (!(file instanceof File)) {
      notification.error({
        message: 'Error',
        description: 'Invalid file object. Please select the file again.',
        duration: 3,
      });
      return;
    }

    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, loading: true } : field
    );
    setFieldsState(updatedFields);

    try {
      const formData = new FormData();
      formData.append('customer_id', String(customerId));
      formData.append('document_type', type);
      formData.append('document_description', description);
      formData.append('document_file', file, file.name);

      const response = await UPLOAD('/api/customer-documents/', formData);

      const resetFields = fields.map(field => 
        field.id === fieldId ? { ...field, loading: false } : field
      );
      setFieldsState(resetFields);

      if (response.status === 400) {
        const errorMessage = response?.data?.document_file?.[0] 
          || response?.data?.error 
          || response?.data?.message 
          || 'Failed to upload document';
        
        notification.error({
          message: 'Upload Failed',
          description: errorMessage,
          duration: 3,
        });
        return;
      }

      if (response.status === 201 || response.status === 200) {
        notification.success({
          message: 'Success',
          description: `${type} document uploaded successfully`,
          duration: 3,
        });
        
        const clearedFields = fields.map(field => 
          field.id === fieldId ? { ...field, file: null } : field
        );
        setFieldsState(clearedFields);
        
        form.setFieldValue(`${descriptionField}_${fieldId}`, '');
        
        fetchExistingDocuments();
      }
    } catch (error) {
      const resetFields = fields.map(field => 
        field.id === fieldId ? { ...field, loading: false } : field
      );
      setFieldsState(resetFields);
      
      notification.error({
        message: 'Upload Failed',
        description: error.response?.data?.error || error.message || 'An error occurred during upload',
        duration: 3,
      });
    }
  };

  const handleReset = () => {
    form.resetFields();
    setAadhaarFields([{ id: 0, file: null, loading: false }]);
    setPanFields([{ id: 0, file: null, loading: false }]);
    setLocationFields([{ id: 0, file: null, loading: false }]);
    setOtherFields([{ id: 0, file: null, loading: false }]);
  };

  const renderExistingDocuments = (type, title, fields, fieldId) => {
    const documents = getDocumentsByType(type);
    
    if (documents.length === 0) return null;

    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: '500', 
          marginBottom: '8px',
          color: '#666'
        }}>
          Existing {title}:
        </div>
        {documents.map((doc, index) => (
          <Card 
            key={doc.id || index}
            size="small" 
            style={{ marginBottom: '8px' }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                <div>
                  {doc.document_description && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {doc.document_description}
                    </div>
                  )}
                </div>
              </div>
              <Space>
                <Button 
                  type="link" 
                  icon={<EyeOutlined />}
                  onClick={() => viewDocument(doc, doc.document_file?.original_name)}
                  size="small"
                >
                  View
                </Button>
                <Button 
                  type="link" 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteDocument(doc.id, doc.document_file_name)}
                  size="small"
                >
                  Delete
                </Button>
              </Space>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderDocumentFields = (fields, setFieldsState, type, descriptionFieldPrefix, addHandler, removeHandler, maxFields) => {
    const existingDocs = getDocumentsByType(type);
    
    return (
      <>
        {fields.map((field, index) => {
          const fileName = field.file?.name || '';
          const truncatedFileName = fileName.length > 30
            ? fileName.substring(0, 30) + '...' 
            : fileName;

          const hasExistingDoc = existingDocs.length > index;
          const existingDoc = hasExistingDoc ? existingDocs[index] : null;
          const description = form.getFieldValue(`${descriptionFieldPrefix}_${field.id}`);
          // Get fresh description value on each render
const currentDescription = form.getFieldValue(`${descriptionFieldPrefix}_${field.id}`);
const isUploadDisabled = !field.file || !currentDescription || currentDescription.trim() === '';

          return (
            <div key={field.id} className="mb-3">
              {/* Existing Document Display */}
              {hasExistingDoc && existingDoc && (
                <div style={{ marginBottom: '16px' }}>
                  <Card size="small">
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '500' }}>
                            {existingDoc.document_file?.original_name || 'Document'}
                          </div>
                          {existingDoc.document_description && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {existingDoc.document_description}
                            </div>
                          )}
                        </div>
                      </div>
                      <Space>
                        <Button 
                          type="link" 
                          icon={<EyeOutlined />}
                          onClick={() => viewDocument(existingDoc, existingDoc.document_file?.original_name)}
                          size="small"
                        >
                          View
                        </Button>
                        <Button 
                          type="link" 
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteDocument(existingDoc.id, existingDoc.document_file_name)}
                          size="small"
                        >
                          Delete
                        </Button>
                      </Space>
                    </div>
                  </Card>
                </div>
              )}

              {/* File Upload Section - Row Layout */}
              <div className="row">
                {/* File Upload Column */}
                <div className="col-md-6">
                  <Form.Item 
                    label="File Upload" 
                    style={{ marginBottom: '8px' }}
                  >
                    <Space.Compact style={{ width: '100%', marginBottom: field.file ? '8px' : '0' }}>
                      <Upload
                        maxCount={1}
                        multiple={false}
                        beforeUpload={(file) => handleFileSelect(file, field.id, setFieldsState, fields)}
                        accept=".pdf,.png,.jpeg,.jpg"
                        fileList={field.file ? [{
                          uid: field.id, 
                          name: field.file.name,
                          status: 'done',
                        }] : []}
                        showUploadList={false}
                        disabled={hasExistingDoc}
                      >
                        <Button 
                          icon={<UploadOutlined />} 
                          disabled={hasExistingDoc}
                          style={{ 
                            width: '100%', 
                            textAlign: 'left', 
                            paddingLeft: '12px' 
                          }}
                        >
                          Browse
                        </Button>
                      </Upload>
                      
                      <Button 
                        icon={<CameraOutlined />}
                        onClick={() => openCamera(field.id, type)}
                        title="Capture with Camera"
                        disabled={hasExistingDoc}
                      >
                        Camera
                      </Button>
                    </Space.Compact>
                    
                    {field.file && (
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
                          title={fileName}
                        >
                          <FileOutlined style={{ marginRight: '5px' }} />
                          {truncatedFileName}
                        </div>
                        <Button
                          icon={<CloseCircleOutlined />} 
                          onClick={() => handleClearFile(field.id, setFieldsState, fields)}
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

                {/* Description Column */}
                <div className="col-md-6">
                 <Form.Item
  label="Description"
  name={`${descriptionFieldPrefix}_${field.id}`}
  validateStatus={getDescriptionValidation(field.id, descriptionFieldPrefix, field.file).validateStatus}
  help={getDescriptionValidation(field.id, descriptionFieldPrefix, field.file).help}
  style={{ marginBottom: '8px' }}
  rules={[
    {
      validator: (_, value) => {
        if (field.file && (!value || value.trim() === '')) {
          return Promise.reject('Enter description to upload the document');
        }
        return Promise.resolve();
      }
    },{
      pattern: /^[a-zA-Z].*$/,
      message: 'Description must start with an alphabet character',
    }

  ]}
>
 <Input.TextArea
  placeholder={`Enter ${type} description`}
  autoSize={{ minRows: 1, maxRows: 6 }}
  allowClear
  disabled={hasExistingDoc}
    onKeyDown={(e) => {
      const value = e.currentTarget.value;
      // If empty and trying to type, only allow alphabets
      if (value.length === 0 && e.key.length === 1) {
        if (!/[a-zA-Z]/.test(e.key)) {
          e.preventDefault();
        }
      }
    }}
    onChange={(e) => {
      const value = e.target.value;
      // If user somehow enters non-alphabet as first char, remove it
      if (value.length > 0 && !/^[a-zA-Z]/.test(value)) {
        e.target.value = value.replace(/^[^a-zA-Z]+/, '');
      }
      
      // Validate the field
      form.validateFields([`${descriptionFieldPrefix}_${field.id}`]);
      // Force re-render to update button state
      setFormUpdateTrigger(prev => prev + 1);
    }}
/>
</Form.Item>
                </div>
              </div>

              {/* Buttons Row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <Button 
                  type="primary" 
                  icon={<CloudUploadOutlined />}
                  onClick={() => uploadDocument(field.id, field.file, type, descriptionFieldPrefix, setFieldsState, fields)}
                  loading={field.loading}
                  disabled={isUploadDisabled || hasExistingDoc}
                >
                  Upload
                </Button>

               {/* Only show minus button if: more than 1 field AND no existing doc for this field */}
{index === fields.length - 1 && fields.length < maxFields && (
  <Button
    type="primary"
    shape="circle"
    icon={<PlusOutlined />}
    onClick={addHandler}
    style={{
      width: 35,
      height: 35,
      backgroundColor: '#28a745',
      borderColor: '#28a745',
      color: '#fff',
    }}
  />
)}

               {fields.length > 1 && !hasExistingDoc && (
  <Button
    type="primary"
    danger
    shape="circle"
    icon={<MinusOutlined />}
    onClick={() => removeHandler(field.id)}
    style={{
      width: 35,
      height: 35,
      backgroundColor: 'red',
      borderColor: 'red',
    }}
  />
)}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="page-content" style={{
      marginRight: "10px",
      marginLeft: "-10px",
      maxWidth: "100%"
    }}>
      <div className="container-fluid" style={{
        marginTop: -100,
        padding: 0,
      }}>
        <div className="row">
          <div className="col-md-12">
            <Spin spinning={loadingDocuments} tip="Loading documents...">
              <Form 
                form={form} 
                layout="vertical"
                style={{ padding: 0, marginRight: "-20px", marginBottom: "-30px", marginTop: "20px" }}
              >
                <div className="container" style={{ padding: 0 }}>
                  
                  <div className="row mb-1 mt-2">
                    <div className="col-md-12">
                      <Form.Item
                        label="Customer Name"
                        name="customer_name"
                      >
                        <Input 
                          placeholder="Customer Name" 
                          size="large" 
                          disabled 
                          style={{ 
                            backgroundColor: '#f5f5f5',
                            color: '#000',
                            fontWeight: '600'
                          }}
                        />
                      </Form.Item>
                    </div>
                  </div>

                  <Divider style={{ borderTop: "2px solid #d9d9d9" }} />
                 <Divider 
  orientation="center"
  style={{ 
    borderTopWidth: '3px',
    borderColor: '#d9d9d9'
  }}
>Aadhaar Document</Divider>
                  
                  {renderDocumentFields(
                    aadhaarFields,
                    setAadhaarFields,
                    'aadhaar',
                    'aadhaar_description',
                    addAadhaarField,
                    removeAadhaarField,
                    2
                  )}

                  <Divider style={{ borderTop: "2px solid #d9d9d9" }} />
                 <Divider 
  orientation="center"
  style={{ 
    borderTopWidth: '3px',
    borderColor: '#d9d9d9'
  }}
>PAN Document </Divider>
                  
                  {renderDocumentFields(
                    panFields,
                    setPanFields,
                    'pan',
                    'pan_description',
                    addPanField,
                    removePanField,
                    2
                  )}

                  <Divider style={{ borderTop: "2px solid #d9d9d9" }} />
                 <Divider 
  orientation="center"
  style={{ 
    borderTopWidth: '3px',
    borderColor: '#d9d9d9'
  }}
>Location Document </Divider>
                  
                  {renderDocumentFields(
                    locationFields,
                    setLocationFields,
                    'location_photo',
                    'location_description',
                    addLocationField,
                    removeLocationField,
                    4
                  )}

                  <Divider style={{ borderTop: "2px solid #d9d9d9" }} />
                 <Divider 
  orientation="center"
  style={{ 
    borderTopWidth: '3px',
    borderColor: '#d9d9d9'
  }}
>Other Document </Divider>
                  
                  {renderDocumentFields(
                    otherFields,
                    setOtherFields,
                    'other',
                    'other_description',
                    addOtherField,
                    removeOtherField,
                    4
                  )}

                  <div className="text-center mt-4" style={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    gap: '10px' 
                  }}>
                    <Button
                      type="primary"
                      size="large"
                      onClick={onPrevious}
                    >
                      Previous
                    </Button>
                    <Button size="large" 
                      onClick={() => {
                        navigate("/view-customer");
                      }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Form>
            </Spin>

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
          </div>
        </div>
      </div>
      <CameraCapture
        visible={cameraVisible}
        onClose={() => {
          setCameraVisible(false);
          cameraFieldRef.current = { fieldId: null, fieldType: null };
        }}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};

export default AddCustomerDocument;