import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Row, Col, Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Accordion, AccordionTab } from 'primereact/accordion';
import Breadcrumb from 'components/Common/Breadcrumb';
import { GET } from '../../helpers/api_helper';
import { SETTINGS } from 'helpers/url_helper';
import Loader from 'components/Common/Loader';
import { Link } from 'react-router-dom';
import './org-settings.scss'; // Add custom styles here for more creativity
import { Badge } from 'reactstrap';

const OrgView = () => {
    const [data, setData] = useState({});
    const [loader, setLoader] = useState(false);
    const [modal, setModal] = useState(false);
    const [document, previewDoc] = useState();
    const getSettings = async () => {
        setLoader(true);
        const response = await GET(SETTINGS);
      
        setLoader(false);
        setData(response.data);
        
    };

    useEffect(() => {
        getSettings();
    }, []);
    const renderPartnerCard = (index, partner) => {
        return (
            <Card key={index} className="mb-4 shadow-sm rounded border-0 partner-card" style={{ backgroundColor: '#fffaf0' }}>
                <CardHeader className="text-center" style={{ backgroundColor: '#f7d794', color: '#333' }}>
                    <h5>{`Partner ${index + 1}`}</h5>
                </CardHeader>
                <CardBody>
                    <Row className="align-items-center">
                        <Col xs={12} className="text-center mb-3">
                            <i className="fas fa-user-circle fa-3x" style={{ color: '#ffbe76' }}></i>
                        </Col>
                        <Col xs={12} className="text-left">
                            <p>
                                <strong style={{ color: '#333' }}>Name: </strong>
                                <span style={{ color: '#555' }}>{partner.member_name || 'N/A'}</span>
                            </p>
                            <p>
                                <strong style={{ color: '#333' }}>Mobile Number: </strong>
                                <span style={{ color: '#555' }}>{partner.member_mobile_number || 'N/A'}</span>
                            </p>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        );
    };
    const renderCard = (label, value) => {
        return (
            <Card className="mb-3 shadow-sm border-0 rounded p-0" style={{ backgroundColor: '#f9f9f9' }}>
                <CardBody>
                    <Row className="align-items-center">
                        <Col xs={6} className="text-left fw-bold" style={{ fontSize: '14px', color: '#333' }}>
                            {label}
                        </Col>
                        <Col xs={6} className="text-right " style={{ fontSize: '14PX', color: '#555' }}>
                            {value || 'N/A'}
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        );
    };
    const toggleModal = (url = "") => {
        previewDoc(url);
        setModal(!modal)
    }
    return (
        <>
            {loader && <Loader />}
            <div className='page-content'>
                <div className='container-fluid'>
                    <Breadcrumb title="Edit" parentPath='/settings' currentPath="/view" breadcrumbItem="Org-View" />
                    <div className='row'>
                        <div className='col-md-12'>
                            <div className=' p-3'>
                                <div className='d-flex'>


                                    <Link to='/settings' className='ms-auto'>
                                        <Button className='mb-3 d-flex align-items-center gap-2' >
                                            <span className='mdi mdi-pencil fs-5'></span>Edit</Button>
                                    </Link>


                                </div>
                                <Accordion className="mb-4">
                                    <AccordionTab header="Firm Details">
                                        {renderCard('Name of the Finance', data?.firmName)}
                                        {renderCard('Firm Address', data?.firmAddress)}
                                        {renderCard('Door No', data?.doorNumber)}
                                        {renderCard('Street Name', data?.streetName)}
                                        {renderCard('Landmark', data?.landmark)}
                                        {renderCard('Place', data?.place)}
                                        {renderCard('Pincode', data?.pincode)}
                                        {renderCard('District', data?.district)}
                                        {renderCard('State', data?.state)}
                                        {renderCard('GeoLocation', data?.geoLocation)}
                                        {renderCard('Landline Number', data?.landlineNumber)}
                                        {renderCard('Fax Number', data?.faxNumber)}
                                        {renderCard('Website', data?.webSite)}
                                        {renderCard('Established Date', data?.firmEstablishedDate)}
                                    </AccordionTab>

                                    <AccordionTab header="Proprietors Info">
                                        {renderCard('Proprietors Name', data?.proprietorName)}
                                        {renderCard('Proprietors Mobile Number', data?.primaryMobileNo)}
                                        <h5 className='text-center mb-3'>Partner Details</h5>
                                        {/* {data?.proprietorMembers && data?.proprietorMembers.length > 0 && (
                                        <>
                                            <h5 className="mt-4">Partner Information</h5>
                                            {data.proprietorMembers.map((member, index) => (
                                                <div key={index}>
                                                    {renderCard(`Partner ${index + 1} Name`, member.member_name)}
                                                    {renderCard(`Partner ${index + 1} Mobile Number`, member.member_mobile_number)}
                                                </div>
                                            ))}
                                        </>
                                    )}*/}
                                        {data?.proprietorMembers && data.proprietorMembers.length > 0 ? (
                                            <div className="row">
                                                {data.proprietorMembers.map((member, index) => (
                                                    <Col md={4} key={index} className="mb-3">
                                                        {renderPartnerCard(index, member)}
                                                    </Col>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>No partners available</p>
                                        )}
                                    </AccordionTab>

                                    {/* <AccordionTab header="General Info">
                                    {data?.certificate?.length > 0 ? (
                                        data.certificate.map((cert, index) => (
                                            <div key={index}>
                                                {renderCard(`Certificate ${index + 1} Description`, cert.description)}
                                                {renderCard(`Date of OnBoarding`, data?.doj)}
                                               
                                                {cert.logo ? (
                                                    <img src={cert.logo} alt="Certificate Logo" className="mt-2 mb-3" style={{ width: '100px' }} />
                                                ) : (
                                                    <span>No Logo Available</span>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p>No certificates available</p>
                                    )}
                                     {data?.files?.length > 0 ? (
                                        data.files.map((file, index) => (
                                            <div key={index}>
                                                {renderCard(`File ${index + 1} Description`, file.description)}
                                                {file.logo ? (
                                                    <img src={file.logo} alt="File Logo" className="mt-2 mb-3" style={{ width: '50px' }} />
                                                ) : (
                                                    <span>No Logo Available</span>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p>No files available</p>
                                    )}
                                </AccordionTab> */}

                                    <AccordionTab header="Document Details">
                                        <div className="document-list">
                                            {/* Logo Section */}
                                            <div className="document-section card mb-3 p-3">
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className="fas fa-image me-2"></i>
                                                    <h5 className="document-title mb-0">Logo</h5>
                                                </div>
                                                <div className="document-content">
                                                    {data?.logo ? (
                                                        <a href={data.logo} target="_blank" rel="noopener noreferrer">
                                                            <img src={data.logo.signed_url} alt="Firm Logo" className="document-logo-img" />
                                                        </a>
                                                    ) : (
                                                        <Badge value="No Logo Available" severity="info" color='info'>No Logo Available</Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Certificates Section */}
                                            <div className="document-section card mb-3 p-3">
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className="fas fa-certificate me-2"></i>
                                                    <h5 className="document-title mb-0">Certificates</h5>
                                                </div>
                                                <div className="document-content">
                                                    {data?.certificate?.length > 0 ? (
                                                        data.certificate.map((cert, index) => (
                                                            <div key={index} className="document-row">
                                                                <span className="document-label"></span>
                                                                {/* <a href={cert?.file?.signed_url} target="_blank" rel="noopener noreferrer" className="document-value">
                                                                    Certificate {index + 1}
                                                                </a> */}

                                                                <Button color='link' onClick={() => toggleModal(cert?.file?.signed_url)}>Documents</Button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <Badge value="No certificates available" severity="info" color='info'>No certificates available</Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Files Section */}
                                            <div className="document-section card mb-3 p-3">
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className="fas fa-file-alt me-2"></i>
                                                    <h5 className="document-title mb-0">Files</h5>
                                                </div>
                                                <div className="document-content">
                                                    {data?.files?.length > 0 ? (
                                                        data?.files?.map((file, index) => (
                                                            <div key={index} className="document-row mb-2">
                                                                {/* <div className="document-label d-flex gap-2">
                                                                    
                                                                </div> */}
                                                                <div className='d-flex gap-2'>
                                                                    <div>
                                                                        {/* <a
                                                                        href={file?.file?.signed_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="document-value"
                                                                        aria-label={`File ${index + 1}`}
                                                                    >
                                                                        File {index + 1}
                                                                    </a> */}

                                                                        <Button color='link' onClick={() => toggleModal(file?.file?.signed_url)}> File {index + 1}</Button>

                                                                    </div>
                                                                    <div>
                                                                    </div>
                                                                    <strong>{file?.description || 'No description available'}</strong>

                                                                </div>


                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-muted">No files available</p>
                                                    )}
                                                </div>
                                            </div>


                                            {/* Date of Joining Section */}
                                            <div className="document-section card mb-3 p-3">
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className="fas fa-calendar-alt me-2"></i>
                                                    <h5 className="document-title mb-0">Date of Joining</h5>
                                                </div>
                                                <div className="document-content">
                                                    <div className="document-row">
                                                        <span className="document-label">DOJ:</span>
                                                        <span className="document-value">{data?.doj || "Not available"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTab>





                                </Accordion>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                isOpen={modal}
                toggle={toggleModal}>
                <ModalHeader toggle={() => toggleModal()}>Document Viewer</ModalHeader>
                <ModalBody>
                    <div className="iframe-container">
                        <iframe
                        title='iframe'
                            src={document}
                            style={{ width: '100%', height: '500px', border: 'none' }}
                            className="responsive-iframe"
                        />

                        {/* <iframe 
                        src={document} 
                        title="Document" 
                        style={{ width: "100%", height: "500px", border: "none" }} 
                    /> */}
                    </div>
                </ModalBody>
            </Modal>
        </>
    );
};

export default OrgView;
