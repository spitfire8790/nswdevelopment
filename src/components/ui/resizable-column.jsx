import React from 'react';
import styles from './resizable-column.module.css';

const ResizableColumn = ({ children, width, onResize }) => {
  const thRef = useRef(null);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      
      const delta = e.pageX - startX.current;
      const newWidth = Math.max(50, startWidth.current + delta);
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onResize]);

  const handleMouseDown = (e) => {
    isResizing.current = true;
    startX.current = e.pageX;
    startWidth.current = thRef.current.offsetWidth;
    document.body.style.cursor = 'col-resize';
  };

  return (
    <th 
      ref={thRef}
      className={styles.resizableColumn}
      style={{ width }}
    >
      {children}
      <div 
        className={styles.resizeHandle}
        onMouseDown={handleMouseDown}
      />
    </th>
  );
};

export default ResizableColumn;