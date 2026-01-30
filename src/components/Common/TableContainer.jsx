import React, { useContext, useState, useEffect } from "react";
import { Table, notification, Input, Popconfirm } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";
import dragIcon from "../../assets/icons/drag.png";

const RowContext = React.createContext({});
const GHOST_ID = "ghost-row-bottom";

/* ----------------------------------------------------------
    ⭐ DRAGGABLE ROW — NO FLICKER, NO JUMPING
------------------------------------------------------------ */
const DraggableBodyRow = ({ style, rowIndex, total, ...restProps }) => {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
    listeners,
  } = useSortable({
    id: restProps["data-row-key"],
    animateLayoutChanges: () => false,
  });

  // Prevent transform beyond allowed bounds for first/last rows
  let safeTransform = transform;
  if (isDragging && transform) {
    const y = transform.y;
    // Block dragging above the first row
    if (rowIndex === 0 && y < 0) {
      safeTransform = { x: 0, y: 0 };
    }
    // Block dragging below the last row
    if (rowIndex === total - 1 && y > 0) {
      safeTransform = { x: 0, y: 0 };
    }
  }

  // preserve className provided by AntD (for rowClassName), add dragging class when dragging
  const className = `${restProps.className ?? ""} ${isDragging ? "dragging-row" : ""}`;

  return (
    <RowContext.Provider
      value={{
        setActivatorNodeRef,
        listeners,
      }}
    >
      <tr
        ref={setNodeRef}
        {...restProps}
        className={className}
        style={{
          ...style,
          transform: safeTransform ? CSS.Transform.toString(safeTransform) : undefined,
          transition,
          position: isDragging ? "relative" : undefined,
          zIndex: isDragging ? 999 : undefined,
          // subtle background to make dragging row visible (also controlled by .dragging-row)
          background: isDragging ? undefined : undefined,
        }}
      />
    </RowContext.Provider>
  );
};

/* ----------------------------------------------------------
    ⭐ DRAG HANDLE — lightweight, no re-render issues
------------------------------------------------------------ */
const DragHandle = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);

  return (
    <div
      ref={setActivatorNodeRef}
      {...listeners}
      style={{
        width: 22,
        height: 22,
        cursor: "grab",
        touchAction: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => e.stopPropagation()} // prevent row click during drag
    >
      <img 
        src={dragIcon} 
        style={{ width: 14, height: 14, opacity: 0.8 }} 
        alt="drag"
        draggable={false}
      />
    </div>
  );
};

const TableList = ({
  data,
  Header,
  reOrder,
  filterOption,
  handleReOrder,
  handleDragEnd,
  loader,
  onDelete,
  name,
}) => {
  const [tableData, setTableData] = useState(data ?? []);
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    setTableData(data ?? []);
  }, [data]);

  /* ----------------------------------------------------------
      SENSORS (prevents accidental move on touch/click)
  ------------------------------------------------------------ */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }, // avoid jitter on grab
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 3,
      },
    })
  );

  /* ----------------------------------------------------------
      DRAG STATE & BOUNDS
  ------------------------------------------------------------ */
  const [isDragging, setIsDragging] = useState(false);
  const [limits, setLimits] = useState({ top: 0, bottom: 0 });

  const onDragStart = (event) => {
    setIsDragging(true);
    const table = document.querySelector(".ant-table-body");
    if (table) {
      const rect = table.getBoundingClientRect();
      setLimits({
        top: rect.top,
        bottom: rect.bottom,
      });
    }
  };

  const onDragMove = (event) => {
    // defensive checks (some events won't have activatorEvent)
    if (!event.activatorEvent) return;

    const pointerY = event.activatorEvent.clientY;

    // Stop ABOVE first row
    if (pointerY < limits.top + 10) {
      // telling dnd-kit there's no valid over target prevents jumping/flicker
      // NOTE: mutating event.over is tolerated here; it's a common pattern to block drop targets
      // but we also protect in onDragEnd.
      // eslint-disable-next-line no-param-reassign
      event.over = null;
      return;
    }

    // Stop BELOW last row
    if (pointerY > limits.bottom - 10) {
      // eslint-disable-next-line no-param-reassign
      event.over = null;
      return;
    }
  };

  const onDragCancel = () => {
    setIsDragging(false);
  };

  const onDragEnd = ({ active, over }) => {
    setIsDragging(false);

    if (!over) return; // blocked by onDragMove or cancelled

    // If user dropped on ghost row, interpret as "place at end" (last index)
    const oldIndex = tableData.findIndex((i) => i.id === active.id);
    let newIndex;
    if (over.id === GHOST_ID) {
      // Place at the last position
      newIndex = tableData.length - 1;
    } else {
      newIndex = tableData.findIndex((i) => i.id === over.id);
    }

    // if indices not found or same, do nothing
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    // prevent invalid moves: e.g., trying to move above the first row or below the last row
    if (newIndex < 0 || newIndex > tableData.length - 1) return;

    const reordered = arrayMove(tableData, oldIndex, newIndex);
    setTableData(reordered);
    if (typeof handleDragEnd === "function") handleDragEnd(reordered);
  };

  const keys = {
    area: "areaName",
    line: "lineName",
    branch: "branch_name",
    user: "name",
  };

  /* ----------------------------------------------------------
      COLUMNS (updated with center alignment)
  ------------------------------------------------------------ */
  const generateColumns = () =>
    Header.map((column) => ({
      title: column.label,
      dataIndex: column.value,
      key: column.value,
      width: column.value === "move" ? 60 : column.value === "index" ? 70 : column.value === "order" ? 80 : "auto",
      align: 'center', // ⭐ CENTER ALIGNMENT ADDED

      sorter: column.sort
        ? (a, b) => {
            if (typeof a[column.value] === "number") {
              return a[column.value] - b[column.value];
            }
            return a[column.value]?.localeCompare(b[column.value]) ?? 0;
          }
        : false,

      filters: column.filter ? filterOption[column.value] : null,
      onFilter: column.filter
        ? (value, record) => record[column.value]?.startsWith(value)
        : false,
      filterSearch: column.filterSearch,

      render: (record, row, index) => {
        if (column.value === "move") return <DragHandle />;

        if (column.value === "actions")
          return (
            <div className="actions d-flex gap-1 justify-content-center">
              {(name === "branch" || name === "user") && (
                <span
                  className="mdi mdi-eye cursor-pointer edit-icon text-primary"
                  onClick={() => navigate(`/${name}/view/${row.id}`)}
                />
              )}
              <span
                className="mdi mdi-pencil cursor-pointer edit-icon text-secondary"
                onClick={() => navigate(`/${name}/edit/${row.id}`)}
              />
              <Popconfirm
                title={`Delete ${name} ${row?.[keys[name]]?.toUpperCase()}?`}
                description={"Are you sure you want to delete?"}
                icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                onConfirm={() => onDelete(row)}
                placement="topLeft"
              >
                <span className="mdi mdi-delete cursor-pointer delete-icon" />
              </Popconfirm>
            </div>
          );

        if (column.value === "index") return index + 1;

        if (column.value === "order")
          return <Input onChange={(e) => handleReOrder(e, row)} />;

        return <>{record}</>;
      },
    }));

  /* ----------------------------------------------------------
      GHOST ROW - invisible but provides a stable target at bottom
  ------------------------------------------------------------ */
  const GhostRow = (props) => {
    // props may be passed by AntD; ignore and render an empty row with appropriate height
    return (
      <tr data-row-key={GHOST_ID} className="ghost-row">
        <td colSpan={Header.length} style={{ height: 40, padding: 0, border: "none" }} />
      </tr>
    );
  };

  /* ----------------------------------------------------------
      FINAL JSX
  ------------------------------------------------------------ */
  // items for SortableContext: include ghost only while dragging (stable target)
  const sortableItems = isDragging
    ? [...tableData.map((i) => i.id), GHOST_ID]
    : tableData.map((i) => i.id);

  return (
    <div>
      {/* small CSS to keep this component self-contained */}
      <style>{`
        /* PREVENT TEXT SELECTION IN REORDER MODE */
        .ant-table,
        .ant-table-tbody,
        .ant-table-tbody tr,
        .ant-table-tbody td {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* Allow text selection in input fields */
        .ant-table input,
        .ant-table textarea {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }

        /* Prevent image dragging */
        .ant-table img {
          pointer-events: none;
          user-drag: none;
          -webkit-user-drag: none;
          -moz-user-drag: none;
        }

        /* alternating rows */
        .odd-row td { background-color: #fafafa !important; }
        .even-row td { background-color: #ffffff !important; }

        /* dragging highlight */
        .dragging-row td { 
          background-color: #1677ff !important;
          color: white;
        }

        /* hover */
        .ant-table-tbody > tr:hover > td { 
          background-color: #1677ff !important;
          color: white;
        }

        /* ghost row invisible but occupies space */
        .ghost-row td { 
          background: transparent !important; 
          height: 40px; 
        }
      `}</style>

      {contextHolder}

      {reOrder ? (
        <DndContext
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
            <Table
              dataSource={isDragging ? [...tableData, { id: GHOST_ID }] : tableData}
              columns={generateColumns()}
              rowKey="id"
              pagination={false}
              bordered
              rowClassName={(_, index) => (index % 2 === 0 ? "even-row" : "odd-row")}
              components={{
                body: {
                  row: (props) => {
                    const id = props["data-row-key"];
                    // render ghost row when present
                    if (id === GHOST_ID) return <GhostRow {...props} />;

                    const rowIndex = tableData.findIndex((r) => r.id === id);
                    return (
                      <DraggableBodyRow
                        {...props}
                        rowIndex={rowIndex}
                        total={tableData.length}
                      />
                    );
                  },
                },
              }}
              scroll={{ x: "100%" }}
            />
          </SortableContext>
        </DndContext>
      ) : (
        <div
          style={{
            height: isDragging ? "100%" : "auto",
            overflow: "hidden",
          }}
        >
          <Table
            dataSource={tableData}
            columns={generateColumns()}
            rowKey="id"
            pagination={false}
            bordered
            rowClassName={(_, index) => (index % 2 === 0 ? "even-row" : "odd-row")}
            scroll={{ x: "100%" }}
            loading={loader}
          />
        </div>
      )}
    </div>
  );
};

export default TableList;