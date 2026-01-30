import React from "react";
import { Descriptions, Tag } from "antd";

const getMarkerConfig = (locationType) => {
  const configs = {
    tiffin: {
      color: '#FFD700',
      label: '🌅 Breakfast',
      tagColor: 'gold'
    },
    lunch: {
      color: '#FF6347',
      label: '☀️ Lunch',
      tagColor: 'orange'
    },
    dinner: {
      color: '#4169E1',
      label: '🌙 Dinner',
      tagColor: 'blue'
    },
    all: {
      color: '#32CD32',
      label: '🍽️ All Meals',
      tagColor: 'green'
    }
  };
  return configs[locationType] || configs.all;
};

const HotelDetailsContent = ({ hotel }) => {
  if (!hotel) return null;

  const config = getMarkerConfig(hotel.location_type);

  return (
    <div style={{ background: "#fff", padding: "0px 0px" }}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2, md: 3 }}
        labelStyle={{
          fontWeight: 700,
          background: "#e5e4e4ff",
          width: "140px",
        }}
      >
        <Descriptions.Item label="Seq ID:">
          {hotel['seq.id'] || "N/A"}
        </Descriptions.Item>
        
        <Descriptions.Item label="Hotel Name:">
          {hotel.location_name || "N/A"}
        </Descriptions.Item>
        
        <Descriptions.Item label="District:">
          {hotel.District || "N/A"}
        </Descriptions.Item>
        
        <Descriptions.Item label="Location Type:">
          <Tag color={config.tagColor}>
            {config.label || 'N/A'}
          </Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Commencement Year:">
          {hotel.commencement_year || "N/A"}
        </Descriptions.Item>
        
        <Descriptions.Item label="Coordinates:">
          {hotel.loc_coordinates?.[0] ? 
            `${hotel.loc_coordinates[0]}, ${hotel.loc_coordinates[1]}` : 
            "N/A"}
        </Descriptions.Item>
        
        <Descriptions.Item label="Created By:">
          {Array.isArray(hotel.created_by) && hotel.created_by.length > 0
            ? hotel.created_by.join(', ')
            : 'N/A'}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default HotelDetailsContent;