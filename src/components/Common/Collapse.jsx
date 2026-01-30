import { DeleteFilled, EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Col, Collapse, Dropdown, Menu, Popconfirm, Row } from 'antd';
import MODULE_DISPLAY_CONFIGURATIONS from "constants/display_config";
import moment from "moment";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Panel } = Collapse;

const GenericCollapse = ({ data, titleKey, contentKeys, name, onDelete, ItemComponent }) => {
	const navigate = useNavigate();
	const [visibleMenuId, setVisibleMenuId] = useState(null);

	const labelAndKeys = MODULE_DISPLAY_CONFIGURATIONS[name];
	titleKey = labelAndKeys ? labelAndKeys[titleKey]?.key : titleKey;

	const handleModel = (id) => {
		setVisibleMenuId(visibleMenuId === id ? null : id);
	};

	const renderMenuItems = (item, index) => {
		const commonMenuItems = [
			<Menu.Item
				key={`${index}-edit`}
				onClick={() => {
					const id = labelAndKeys ? item[labelAndKeys.id] : item?.id;
					console.log("Navigating to:", titleKey, id);
					navigate(`/${name}/edit/${id}`);
				}}
			>
				<div className='d-flex align-items-center gap-1'>
					<span className='mdi mdi-pencil cursor-pointer edit-icon text-secondary mb-0'></span>
					<span>Edit</span>
				</div>
			</Menu.Item>,
			<Menu.Item 
				key={`${index}-delete`}
			>
				<Popconfirm
					title={`Delete ${name.split("-").join(" ")} ${item[titleKey]?.toUpperCase()}?`}
					description={"Are you sure you want to delete?"}
					icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
					onConfirm={() => onDelete(item)}
					placement="topLeft"
					trigger="click"
					onClick={(e) => {
						e.stopPropagation();
					}}
					okText="Delete"
					cancelText="Cancel"
					okButtonProps={{ danger: true, type: 'primary' }}
					cancelButtonProps={{ type: 'default' }}
				>
					<div className='d-flex align-items-center gap-1' style={{ color: 'red' }}>
						<DeleteFilled style={{ color: 'red' }} />
						<span className="cursor-pointer" style={{ color: 'red' }}>Delete</span>
					</div>
				</Popconfirm>
			</Menu.Item>

		];

		if (titleKey === "branch_name") {
			commonMenuItems.unshift(
				<Menu.Item key={`${index}-view`} onClick={() => navigate(`/branch/view/${item?.id}`)}>
					<div className='d-flex align-items-center gap-1'>
						<span className='mdi mdi-eye cursor-pointer edit-icon text-primary mb-0'></span>
						<span>View</span>
					</div>
				</Menu.Item>
			);
		}

		return commonMenuItems;
	};

	const renderContent = (item, index) => {
		return (
			<div>
				{contentKeys.map((key, idx) => {
					let displayLabel, displayKey = key;
					if (labelAndKeys != null) {
						displayLabel = labelAndKeys[key]?.label;
						displayKey = labelAndKeys[key]?.key;
					} else {
						displayLabel =
							key === "id"
								? name === "branch"
									? "Branch No"
									: "SI. No"
								: key
										.replace(/_/g, " ")
										.replace(/\b\w/g, (char) => char.toUpperCase());
					}

					let displayValue =
						key === "id"
							? index + 1
							: key === "status"
							? item[key].charAt(0).toUpperCase() + item[key].slice(1)
							: key === "created_time" ||
								key === "modified_time" ||
								key === "investment_date" ||
								key === "expense_transaction_date"
							? moment(item[displayKey]).format("DD-MM-YYYY")
							: key === "investment_user"
							? `${"full_name" in item && item["full_name"] ? `${item["full_name"]} | ` : ""}${item[displayKey]}` 
							: item[displayKey];

					return (
						<div
							key={idx}
							style={{
								backgroundColor: idx % 2 === 0 ? 'white' : '#f0f0f0',
								borderRadius: '4px'
							}}
							className='px-4 py-3'
						>
							<Row style={{ alignItems: 'center' }}>
								<Col xs={12} md={8}>
									<span style={{ fontWeight: 600 }}>{displayLabel}:</span>
								</Col>
								<Col xs={12} md={16}>
									{displayValue}
								</Col>
							</Row>
						</div>
					);
				})}
			</div>
		);
	};

	if (ItemComponent) {
		return (
			<div>
				{data.map((item, index) => (
					<ItemComponent
						key={index}
						item={item}
						index={index}
						titleKey={titleKey}
						name={name}
						onSwipeRight={(it) => {
							const id = labelAndKeys ? it[labelAndKeys.id] : it?.id;
							navigate(`/${name}/edit/${id}`);
						}}
						onSwipeLeft={(it) => onDelete(it)}
						renderContent={() => renderContent(item, index)}
					/>
				))}
			</div>
		);
	}

	return (
		<Collapse accordion>
			{data.map((item, index) => (
				<Panel key={index} header={
					<div className='d-flex gap-2'>
						<div>
							<h5>{item[titleKey]}</h5>
						</div>

						<div className="ms-auto">
							<Dropdown overlay={<Menu>{renderMenuItems(item, index)}</Menu>} trigger={["click"]}>
								<EllipsisOutlined
									style={{ fontSize: "24px", cursor: "pointer" }}
									onClick={(e) => {
										e.stopPropagation();
										handleModel(item?.id);
									}}
								/>
							</Dropdown>
						</div>
					</div>
				}>
					{renderContent(item, index)}
				</Panel>
			))}
		</Collapse>
	);
};

export default GenericCollapse;