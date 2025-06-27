import React, { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './App.css';
import {
  IconInfoCircle,
  IconFileText,
  IconBox,
  IconFlag,
  IconFile,
  IconPencil,
  IconCopy,
  IconFiles,
  IconTrash,
} from '@tabler/icons-react';

const initialPages = [
  { id: 'info', label: 'Info' },
  { id: 'details', label: 'Details' },
  { id: 'other', label: 'Other' },
  { id: 'ending', label: 'Ending' },
];

const pageIcons = {
  Info: <IconInfoCircle size={18} stroke={1.7} color="#339af0" />,
  Details: <IconFileText size={18} stroke={1.7} color="#868e96" />,
  Other: <IconBox size={18} stroke={1.7} color="#845ef7" />,
  Ending: <IconFlag size={18} stroke={1.7} color="#fa5252" />,
  'New Page': <IconFile size={18} stroke={1.7} color="#12b886" />,
};

function SortableTab({ id, label, active, onClick, onContextMenu, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 0,
    position: 'relative',
  };

  const icon = pageIcons[label] || <IconFile size={18} stroke={1.7} />;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`tab-button${active ? ' active' : ''}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      {...attributes}
      {...listeners}
    >
      <span style={{marginRight: 8, display: 'flex', alignItems: 'center'}}>{icon}</span>
      {label}
      {children}
    </div>
  );
}

function FormPages() {
  const [pages, setPages] = useState(initialPages);
  const [activeIdx, setActiveIdx] = useState(0);
  const [contextIdx, setContextIdx] = useState(null);
  const contextMenuRef = useRef();
  const tabRefs = useRef([]);
  const indicatorRef = useRef();
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [menuPos, setMenuPos] = useState({ left: 0, top: 0, width: 0, visible: false, idx: null });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    const updateIndicator = () => {
      const tab = tabRefs.current[activeIdx];
      if (tab) {
        const rect = tab.getBoundingClientRect();
        const parentRect = tab.parentNode.getBoundingClientRect();
        setIndicator({ left: rect.left - parentRect.left, width: rect.width });
      }
    };
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeIdx, pages]);

  useEffect(() => {
    if (contextIdx !== null && tabRefs.current[contextIdx]) {
      const tab = tabRefs.current[contextIdx];
      const rect = tab.getBoundingClientRect();
      const parentRect = tab.parentNode.getBoundingClientRect();
      setMenuPos({
        left: rect.left - parentRect.left,
        top: rect.bottom - parentRect.top + 4,
        width: rect.width,
        visible: true,
        idx: contextIdx,
      });
    } else {
      setMenuPos((pos) => ({ ...pos, visible: false, idx: null }));
    }
  }, [contextIdx, pages]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = pages.findIndex((p) => p.id === active.id);
      const newIndex = pages.findIndex((p) => p.id === over.id);
      setPages((pages) => arrayMove(pages, oldIndex, newIndex));
      if (activeIdx === oldIndex) {
        setActiveIdx(newIndex);
      } else if (activeIdx > oldIndex && activeIdx <= newIndex) {
        setActiveIdx(activeIdx - 1);
      } else if (activeIdx < oldIndex && activeIdx >= newIndex) {
        setActiveIdx(activeIdx + 1);
      }
    }
  };

  const addPage = (idx) => {
    const newPage = {
      id: `page-${Date.now()}`,
      label: `New Page`,
    };
    const newPages = [...pages];
    newPages.splice(idx, 0, newPage);
    setPages(newPages);
    setActiveIdx(idx);
  };

  const handleContextMenu = (e, idx) => {
    e.preventDefault();

    closeContextMenu();

    setContextIdx(idx);
    setTimeout(() => {
      if (contextMenuRef.current) {
        contextMenuRef.current.focus();
      }
    }, 0);
  };

  const handleTabSelected = (idx) => {
    closeContextMenu();
    setActiveIdx(idx);
  };

  const closeContextMenu = () => setContextIdx(null);

  return (
    <div className="tabs-container">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pages.map((p) => p.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="tabs-header" style={{position: 'relative'}}>
            <div
              ref={indicatorRef}
              className="tab-indicator"
              style={{
                left: indicator.left,
                width: indicator.width,
                transition: 'left 0.3s cubic-bezier(0.4,0.2,0.2,1), width 0.3s cubic-bezier(0.4,0.2,0.2,1)',
              }}
            />
            {pages.map((page, idx) => (
              <React.Fragment key={page.id}>
                {idx !== 0 && (
                  <button
                    className="tab-add-btn"
                    onClick={() => addPage(idx)}
                    tabIndex={-1}
                    aria-label="Add page"
                  >
                    <span className="plus">+</span>
                    <span className="add-text">Add page</span>
                  </button>
                )}
                <div ref={el => tabRefs.current[idx] = el} style={{display: 'inline-flex'}}>
                  <SortableTab
                    id={page.id}
                    label={page.label}
                    active={activeIdx === idx}
                    onClick={() => handleTabSelected(idx)}
                    onContextMenu={(e) => handleContextMenu(e, idx)}
                  >
                    <span
                      className="tab-context-trigger"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setContextIdx(idx);
                      }}
                    >
                      ⋮
                    </span>
                  </SortableTab>
                </div>
              </React.Fragment>
            ))}
            <button
              className="tab-add-btn"
              onClick={() => addPage(pages.length)}
              tabIndex={-1}
              aria-label="Add page"
            >
              <span className="plus">+</span>
              <span className="add-text">Add page</span>
            </button>
            {menuPos.visible && (
              <div
                className="tab-context-menu"
                tabIndex={-1}
                ref={contextMenuRef}
                style={{
                  position: 'absolute',
                  left: menuPos.left,
                  top: menuPos.top,
                  minWidth: menuPos.width,
                  zIndex: 1000,
                }}
                onBlur={closeContextMenu}
              >
                <div className="tab-context-header">Settings</div>
                <div className="tab-context-list">
                  <button className="tab-context-item flag">
                    <IconFlag size={16} stroke={1.7} color="#339af0" style={{marginRight: 6}} />
                    Set as first page
                  </button>
                  <button className="tab-context-item">
                    <IconPencil size={16} stroke={1.7} color="#868e96" style={{marginRight: 6}} />
                    Rename
                  </button>
                  <button className="tab-context-item">
                    <IconCopy size={16} stroke={1.7} color="#868e96" style={{marginRight: 6}} />
                    Copy
                  </button>
                  <button className="tab-context-item">
                    <IconFiles size={16} stroke={1.7} color="#868e96" style={{marginRight: 6}} />
                    Duplicate
                  </button>
                </div>
                <hr className="tab-context-divider" />
                <button className="tab-context-item delete">
                  <IconTrash size={16} stroke={1.7} color="#e03131" style={{marginRight: 6}} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
      <div className="tabs-content">
        <h2>{pages[activeIdx]?.label} Page</h2>
        <div style={{ marginTop: 16, color: '#aaa' }}>
          Form content for "{pages[activeIdx]?.label}" goes here.
        </div>
      </div>
    </div>
  );
}

export default FormPages; 