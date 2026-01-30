import React, { useState, useMemo } from 'react';
import { Modal, Button, Tag, List, Avatar, Divider, Skeleton } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import InfiniteScroll from 'react-infinite-scroll-component';
import locationsData from './locations.json';
import HotelDetailsContent from '../../../components/Common/HotelDetailsContent';

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const GOOGLE_MAPS_API_KEY = "AIzaSyBqZO5W2UKl7m5gPxh0_KIjaRckuJ7VUsE";
const HOTELS_PAGE_SIZE = 10;

const getMarkerConfig = (locationType) => {
  const configs = {
    tiffin: {
      color: '#FFD700',
      label: '🌅 Breakfast',
      tagColor: 'gold',
      icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    },
    lunch: {
      color: '#FF6347',
      label: '☀️ Lunch',
      tagColor: 'orange',
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    },
    dinner: {
      color: '#4169E1',
      label: '🌙 Dinner',
      tagColor: 'blue',
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    },
    all: {
      color: '#32CD32',
      label: '🍽️ All Meals',
      tagColor: 'green',
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    }
  };
  return configs[locationType] || configs.all;
};

const LocationsMapModal = ({ visible, onClose, locations }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  const center = {
    lat: locations.reduce((sum, loc) => sum + loc.loc_coordinates[0], 0) / locations.length,
    lng: locations.reduce((sum, loc) => sum + loc.loc_coordinates[1], 0) / locations.length
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',gap: '8px' }}>
          <EnvironmentOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
          <span style={{ fontSize: '18px' }}>Hotel Locations Map</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      <LoadScript 
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        onLoad={() => setIsMapLoaded(true)}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
          }}
        >
          {isMapLoaded && locations.map((location) => {
            const config = getMarkerConfig(location.location_type);
            const position = {
              lat: location.loc_coordinates[0],
              lng: location.loc_coordinates[1]
            };

            return (
              <React.Fragment key={location['seq.id']}>
                <Marker
                  position={position}
                  icon={{
                    url: config.icon,
                    scaledSize: window.google?.maps ? new window.google.maps.Size(40, 40) : undefined
                  }}
                  onClick={() => setSelectedMarker(location)}
                  title={location.location_name}
                />
                
                {selectedMarker && selectedMarker['seq.id'] === location['seq.id'] && (
                  <InfoWindow
                    position={position}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <div style={{ padding: '8px', minWidth: '220px' }}>
                      <h3 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
                        {location.location_name || 'NA'}
                      </h3>

                      <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                        <p style={{ margin: '4px 0' }}>
                          <strong>Seq ID:</strong> {location['seq.id'] ?? 'NA'}
                        </p>

                        <p style={{ margin: '4px 0' }}>
                          <strong>Type:</strong>{' '}
                          <Tag color={config.tagColor}>
                            {config.label || 'NA'}
                          </Tag>
                        </p>

                        <p style={{ margin: '4px 0' }}>
                          <strong>District:</strong> {location.District || 'NA'}
                        </p>

                        <p style={{ margin: '4px 0' }}>
                          <strong>Coordinates:</strong><br />
                          {location.loc_coordinates?.[0] ?? 'NA'},{' '}
                          {location.loc_coordinates?.[1] ?? 'NA'}
                        </p>

                        <p style={{ margin: '4px 0' }}>
                          <strong>Commencement Year:</strong>{' '}
                          {location.commencement_year ?? 'NA'}
                        </p>

                        <p style={{ margin: '4px 0' }}>
                          <strong>Created By:</strong>{' '}
                          {Array.isArray(location.created_by) && location.created_by.length > 0
                            ? location.created_by.join(', ')
                            : 'NA'}
                        </p>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </React.Fragment>
            );
          })}
        </GoogleMap>
      </LoadScript>
    </Modal>
  );
};

const Location = () => {
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [expandedDistricts, setExpandedDistricts] = useState([]);
  const [expandedHotels, setExpandedHotels] = useState({});
  const [hotelsPagination, setHotelsPagination] = useState({});

  // Group hotels by district
  const groupedByDistrict = useMemo(() => {
    const grouped = {};
    locationsData.forEach((hotel) => {
      const district = hotel.District || "Uncategorized";
      if (!grouped[district]) {
        grouped[district] = [];
      }
      grouped[district].push(hotel);
    });
    return grouped;
  }, []);

  // Initialize pagination for districts
  React.useEffect(() => {
    const newPagination = {};
    Object.keys(groupedByDistrict).forEach(district => {
      newPagination[district] = {
        displayed: Math.min(HOTELS_PAGE_SIZE, groupedByDistrict[district].length),
        total: groupedByDistrict[district].length
      };
    });
    setHotelsPagination(newPagination);
    setExpandedDistricts(Object.keys(groupedByDistrict));
  }, [groupedByDistrict]);

  const loadMoreHotels = (district) => {
    setHotelsPagination(prev => {
      const current = prev[district] || { displayed: 0, total: 0 };
      return {
        ...prev,
        [district]: {
          ...current,
          displayed: Math.min(current.displayed + HOTELS_PAGE_SIZE, current.total)
        }
      };
    });
  };

  const handleHotelToggle = (district, hotelId) => {
    const key = `${district}-${hotelId}`;
    setExpandedHotels((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div style={{ padding: '0', margin: '0' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '0 0 16px 0',
        marginBottom: '10px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>
          Hotel Locations
        </h2>

        <Button
          type="text"
          icon={<EnvironmentOutlined style={{ fontSize: '24px' }} />}
          onClick={() => setMapModalVisible(true)}
          style={{
            width: '40px',
            height: '40px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </div>

      {/* Districts List */}
      <div style={{
        height: '500px',
        overflow: 'auto',
        marginTop: '20px'
      }}>
        {Object.keys(groupedByDistrict).map((district) => (
          <div
            key={district}
            style={{
              marginBottom: '12px',
              border: '1px solid #e8e8e8',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#fff'
            }}
          >
            {/* District Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '5px',
              backgroundColor: '#f5f5f5',
              borderBottom: '1px solid #e8e8e8'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: '10px'
              }}>
                <Avatar style={{ backgroundColor: '#1890ff' }}>
                  {district?.charAt(0)?.toUpperCase()}
                </Avatar>
                <span style={{
                  fontWeight: 600,
                  fontSize: '22px',
                  color: '#262626'
                }}>
                  {district}
                </span>
              </div>
              
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '38px',
                height: '38px',
                borderRadius: '19px',
                border: '1px solid #d9d9d9',
                backgroundColor: '#fff',
                color: 'rgba(0, 0, 0, 0.88)',
                fontWeight: 600,
                fontSize: '22px',
                marginRight: '20px'
              }}>
                {groupedByDistrict[district].length}
              </div>
            </div>

            {/* Hotels List */}
            <div
              id={`scrollableDiv-${district}`}
              style={{
                maxHeight: '400px',
                overflow: 'auto',
                padding: '0 5px'
              }}
            >
              <InfiniteScroll
                dataLength={hotelsPagination[district]?.displayed || HOTELS_PAGE_SIZE}
                next={() => loadMoreHotels(district)}
                hasMore={
                  (hotelsPagination[district]?.displayed || 0) <
                  (hotelsPagination[district]?.total || 0)
                }
                loader={
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <Skeleton avatar paragraph={{ rows: 1 }} active />
                  </div>
                }
                endMessage={
                  <Divider plain style={{ margin: '16px 0' }}>
                    <span style={{ color: 'red', fontSize: '18px', fontWeight: 'bold' }}>★ </span>
                    <span style={{ color: '#595959', fontSize: '14px' }}>
                      End of{' '}
                      <span style={{ fontWeight: 600, color: '#262626' }}>{district}</span>
                      {' '}district{' '}
                      <span style={{ color: 'red', fontSize: '18px', fontWeight: 'bold' }}>★</span>
                    </span>
                  </Divider>
                }
                scrollableTarget={`scrollableDiv-${district}`}
              >
                <List
                  dataSource={groupedByDistrict[district].slice(
                    0,
                    hotelsPagination[district]?.displayed || HOTELS_PAGE_SIZE
                  )}
                  style={{ background: '#fafafa', margin: 0 }}
                  renderItem={(hotel, index) => {
                    const isExpanded = expandedHotels[`${district}-${hotel['seq.id']}`];
                    const districtIndex = index + 1;

                    return (
                      <div
                        key={hotel['seq.id']}
                        style={{
                          borderBottom: '2px solid #f0f0f0',
                          padding: 0,
                          background: '#fff'
                        }}
                      >
                        <List.Item
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: isExpanded ? '#f9f9f9' : '#fff',
                            cursor: 'pointer',
                            padding: '12px 20px'
                          }}
                          onClick={() => handleHotelToggle(district, hotel['seq.id'])}
                        >
                          <List.Item.Meta
                            avatar={
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '32px',
                                height: '32px',
                                padding: '4px 12px',
                                border: '1px solid #d9d9d9',
                                borderRadius: '6px',
                                backgroundColor: '#fff',
                                color: 'rgba(0, 0, 0, 0.88)',
                                fontWeight: 600,
                                fontSize: '20px'
                              }}>
                                {districtIndex}
                              </div>
                            }
                            title={
                              <span style={{
                                fontWeight: 600,
                                color: 'black',
                                fontSize: '20px'
                              }}>
                                {hotel.location_name}
                              </span>
                            }
                          />
                        </List.Item>

                        {isExpanded && (
                          <div style={{
                            marginTop: '6px',
                            padding: 0,
                            background: '#f9f9f9'
                          }}>
                            <HotelDetailsContent hotel={hotel} />
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
              </InfiniteScroll>
            </div>
          </div>
        ))}
      </div>

      {/* Map Modal */}
      <LocationsMapModal
        visible={mapModalVisible}
        onClose={() => setMapModalVisible(false)}
        locations={locationsData}
      />
    </div>
  );
};

export default Location;