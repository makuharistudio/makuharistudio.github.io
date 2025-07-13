import { useState, useCallback, useEffect } from 'react';

const SVG_NS = 'http://www.w3.org/2000/svg';
const validShapeTypes = ['line', 'rect', 'circle', 'polygon'];

const useSVGMaker = (initialWidth = 500, initialHeight = 500) => {
  const [shapes, setShapes] = useState([]);
  const [currentTool, setCurrentTool] = useState('line');
  const [tempPoints, setTempPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [lastMousePos, setLastMousePos] = useState(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeOpacity, setStrokeOpacity] = useState(100);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillColor, setFillColor] = useState('#FFFFFF');
  const [fillOpacity, setFillOpacity] = useState(100);
  const [canvasWidth, setCanvasWidth] = useState(initialWidth);
  const [canvasHeight, setCanvasHeight] = useState(initialHeight);
  const [svgOutput, setSvgOutput] = useState('');

  const getCurrentStyle = useCallback(() => ({
    stroke: strokeColor,
    strokeOpacity: parseFloat(strokeOpacity) / 100,
    strokeWidth: parseFloat(strokeWidth),
    fill: fillColor,
    fillOpacity: parseFloat(fillOpacity) / 100
  }), [strokeColor, strokeOpacity, strokeWidth, fillColor, fillOpacity]);

  useEffect(() => {
    if (selectedShapeIndex !== null) {
      setShapes((prev) => {
        const newShapes = [...prev];
        newShapes[selectedShapeIndex] = {
          ...newShapes[selectedShapeIndex],
          style: getCurrentStyle()
        };
        return newShapes;
      });
    }
  }, [strokeColor, strokeOpacity, strokeWidth, fillColor, fillOpacity, selectedShapeIndex, getCurrentStyle]);

  const isValidShape = useCallback((type, points) => {
    if (points.length < 2) return false;
    const [p1, p2] = points;
    if (type === 'line') {
      return Math.hypot(p2.x - p1.x, p2.y - p1.y) > 1;
    } else if (type === 'rect') {
      const width = Math.abs(p2.x - p1.x);
      const height = Math.abs(p2.y - p1.y);
      return width > 1 && height > 1;
    } else if (type === 'circle') {
      const r = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      return r > 1;
    } else if (type === 'polygon') {
      if (points.length < 3) return false;
      const lastPoint = points[points.length - 1];
      const firstPoint = points[0];
      return (
        points.length >= 3 &&
        lastPoint.x === firstPoint.x &&
        lastPoint.y === firstPoint.y &&
        points.slice(0, -1).some((p, i) => {
          const nextP = points[(i + 1) % (points.length - 1)];
          return Math.hypot(p.x - nextP.x, p.y - nextP.y) > 1;
        })
      );
    }
    return false;
  }, []);

  const setTool = useCallback((tool) => {
    setCurrentTool(tool);
    setTempPoints([]);
    setIsDrawing(false);
    if (tool !== 'select' && tool !== 'resize') {
      setSelectedShapeIndex(null);
      setIsResizing(false);
      setResizeHandle(null);
    }
    setIsDragging(false);
  }, []);

  const updateCanvasSize = useCallback(() => {}, []);

  const deleteSelectedShape = useCallback(() => {
    if (selectedShapeIndex !== null) {
      setShapes((prev) => prev.filter((_, i) => i !== selectedShapeIndex));
      setSelectedShapeIndex(null);
      setIsResizing(false);
      setResizeHandle(null);
    }
  }, [selectedShapeIndex]);

  const setLayerPosition = useCallback((newLayer) => {
    if (selectedShapeIndex === null || isNaN(newLayer)) return;
    const totalShapes = shapes.length;
    if (newLayer < 1 || newLayer > totalShapes) return;

    setShapes((prev) => {
      const newIndex = newLayer - 1;
      const shape = prev[selectedShapeIndex];
      const newShapes = [...prev];
      newShapes.splice(selectedShapeIndex, 1);
      newShapes.splice(newIndex, 0, shape);
      setSelectedShapeIndex(newIndex);
      return newShapes;
    });
  }, [selectedShapeIndex, shapes.length]);

  const pointToLineDistance = useCallback((px, py, x1, y1, x2, y2) => {
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2));
    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    return Math.hypot(px - projX, py - projY);
  }, []);

  const isPointInShape = useCallback((x, y, shape) => {
    if (shape.type === 'line') {
      for (let i = 0; i < shape.points.length - 1; i++) {
        const p1 = shape.points[i];
        const p2 = shape.points[i + 1];
        const dist = pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
        if (dist < 10) return true;
      }
      return false;
    } else if (shape.type === 'rect') {
      const [p1, p2] = shape.points;
      const xMin = Math.min(p1.x, p2.x);
      const xMax = Math.max(p1.x, p2.x);
      const yMin = Math.min(p1.y, p2.y);
      const yMax = Math.max(p1.y, p2.y);
      return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
    } else if (shape.type === 'circle') {
      const [p1, p2] = shape.points;
      const cx = p1.x;
      const cy = p1.y;
      const r = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      return Math.hypot(x - cx, y - cy) <= r;
    } else if (shape.type === 'polygon') {
      let inside = false;
      const points = shape.points.slice(0, -1);
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x;
        const yi = points[i].y;
        const xj = points[j].x;
        const yj = points[j].y;
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    }
    return false;
  }, [pointToLineDistance]);

  const isPointInHandle = useCallback((x, y, handleX, handleY, handleSize = 20) => {
    return (
      x >= handleX - handleSize / 2 &&
      x <= handleX + handleSize / 2 &&
      y >= handleY - handleSize / 2 &&
      y <= handleY + handleSize / 2
    );
  }, []);

  const getHandlePositions = useCallback((shape) => {
    const handles = [];
    if (shape.type === 'line') {
      handles.push({ type: 'endpoint', index: 0, x: shape.points[0].x, y: shape.points[0].y });
      handles.push({ type: 'endpoint', index: 1, x: shape.points[1].x, y: shape.points[1].y });
    } else if (shape.type === 'rect') {
      const [p1, p2] = shape.points;
      const xMin = Math.min(p1.x, p2.x);
      const xMax = Math.max(p1.x, p2.x);
      const yMin = Math.min(p1.y, p2.y);
      const yMax = Math.max(p1.y, p2.y);
      handles.push({ type: 'corner', index: 0, x: xMin, y: yMin });
      handles.push({ type: 'corner', index: 1, x: xMax, y: yMin });
      handles.push({ type: 'corner', index: 2, x: xMax, y: yMax });
      handles.push({ type: 'corner', index: 3, x: xMin, y: yMax });
    } else if (shape.type === 'circle') {
      const [p1, p2] = shape.points;
      const cx = p1.x;
      const cy = p1.y;
      const r = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      handles.push({ type: 'center', index: 0, x: cx, y: cy });
      handles.push({ type: 'radius', index: 1, x: cx + r, y: cy });
    } else if (shape.type === 'polygon') {
      shape.points.slice(0, -1).forEach((point, index) => {
        handles.push({ type: 'vertex', index, x: point.x, y: point.y });
      });
    }
    return handles;
  }, []);

  const selectShapeAtPoint = useCallback((x, y) => {
    let newIndex = null;
    let selectedHandle = null;

    if (currentTool === 'resize') {
      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        const handles = getHandlePositions(shape);
        for (let j = 0; j < handles.length; j++) {
          if (isPointInHandle(x, y, handles[j].x, handles[j].y)) {
            newIndex = i;
            selectedHandle = { type: handles[j].type, index: handles[j].index };
            console.log('Handle clicked:', selectedHandle, 'Shape index:', i);
            break;
          }
        }
        if (newIndex !== null) break;
      }
    }

    if (newIndex === null && (currentTool === 'select' || currentTool === 'resize')) {
      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (validShapeTypes.includes(shape.type) && isPointInShape(x, y, shape)) {
          newIndex = i;
          break;
        }
      }
    }

    if (newIndex !== null) {
      const shape = shapes[newIndex];
      setStrokeColor(shape.style.stroke);
      setStrokeOpacity((shape.style.strokeOpacity * 100).toFixed(1));
      setStrokeWidth(shape.style.strokeWidth);
      setFillColor(shape.style.fill);
      setFillOpacity((shape.style.fillOpacity * 100).toFixed(1));
      setSelectedShapeIndex(newIndex);
      setResizeHandle(currentTool === 'resize' ? selectedHandle : null);
    } else {
      setSelectedShapeIndex(null);
      setResizeHandle(null);
    }
  }, [shapes, currentTool, isPointInShape, isPointInHandle, getHandlePositions]);

  const getSvgCoordinates = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }, []);

  const handleMouseDown = useCallback(
    (event) => {
      const { x, y } = getSvgCoordinates(event);

      if (currentTool === 'select' || currentTool === 'resize') {
        selectShapeAtPoint(x, y);
        if (selectedShapeIndex !== null) {
          if (currentTool === 'resize' && resizeHandle) {
            setIsResizing(true);
          } else if (currentTool === 'select') {
            setDragStart({ x, y });
            setIsDragging(true);
          }
        }
      } else if (validShapeTypes.includes(currentTool)) {
        setTempPoints((prev) => [...prev, { x, y }]);
        if (tempPoints.length === 0) {
          setIsDrawing(true);
        }
      }
    },
    [currentTool, selectedShapeIndex, resizeHandle, tempPoints.length, selectShapeAtPoint, getSvgCoordinates]
  );

  const handleClick = useCallback(
    (event) => {
      if (!validShapeTypes.includes(currentTool)) return;
      const { x, y } = getSvgCoordinates(event);

      if (currentTool === 'polygon') {
        if (tempPoints.length >= 2 && isPointInHandle(x, y, tempPoints[0].x, tempPoints[0].y)) {
          console.log('Closing polygon at:', { x, y }, 'First point:', tempPoints[0]);
          const newPoints = [...tempPoints, tempPoints[0]];
          if (isValidShape('polygon', newPoints)) {
            const style = getCurrentStyle();
            style.fillOpacity = 1;
            setShapes((prev) => {
              const newShapes = [...prev, { type: 'polygon', points: newPoints, style }];
              setSelectedShapeIndex(newShapes.length - 1);
              return newShapes;
            });
            setTool('select');
            setStrokeColor(style.stroke);
            setStrokeOpacity((style.strokeOpacity * 100).toFixed(1));
            setStrokeWidth(style.strokeWidth);
            setFillColor(style.fill);
            setFillOpacity((style.fillOpacity * 100).toFixed(1));
            setTempPoints([]);
            setIsDrawing(false);
          }
        }
      } else if (tempPoints.length === 1) {
        const newPoints = [...tempPoints, { x, y }];
        if (isValidShape(currentTool, newPoints)) {
          const style = getCurrentStyle();
          style.fillOpacity = 1;
          setShapes((prev) => {
            const newShapes = [...prev, { type: currentTool, points: newPoints, style }];
            setSelectedShapeIndex(newShapes.length - 1);
            return newShapes;
          });
          setTool('select');
          setStrokeColor(style.stroke);
          setStrokeOpacity((style.strokeOpacity * 100).toFixed(1));
          setStrokeWidth(style.strokeWidth);
          setFillColor(style.fill);
          setFillOpacity((style.fillOpacity * 100).toFixed(1));
        }
        setTempPoints([]);
        setIsDrawing(false);
      }
    },
    [currentTool, tempPoints, isValidShape, getCurrentStyle, setTool, getSvgCoordinates, isPointInHandle]
  );

  const handleMouseMove = useCallback(
    (event) => {
      const { x, y } = getSvgCoordinates(event);
      setLastMousePos({ x, y });

      if (isResizing && selectedShapeIndex !== null && resizeHandle && currentTool === 'resize') {
        setShapes((prev) => {
          const newShapes = [...prev];
          const shape = { ...newShapes[selectedShapeIndex] };
          const points = [...shape.points];

          if (shape.type === 'line') {
            points[resizeHandle.index] = { x, y };
          } else if (shape.type === 'rect') {
            const [p1, p2] = points;
            if (resizeHandle.index === 0) {
              points[0] = { x, y };
            } else if (resizeHandle.index === 1) {
              points[1].x = x;
              points[0].y = y;
            } else if (resizeHandle.index === 2) {
              points[1] = { x, y };
            } else if (resizeHandle.index === 3) {
              points[0].x = x;
              points[1].y = y;
            }
          } else if (shape.type === 'circle') {
            if (resizeHandle.type === 'center') {
              const r = Math.sqrt((points[1].x - points[0].x) ** 2 + (points[1].y - points[0].y) ** 2);
              points[0] = { x, y };
              points[1] = { x: x + r, y: y };
            } else if (resizeHandle.type === 'radius') {
              const cx = points[0].x;
              const cy = points[0].y;
              const r = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
              points[1] = { x: cx + r, y: cy };
            }
          } else if (shape.type === 'polygon') {
            points[resizeHandle.index] = { x, y };
            if (resizeHandle.index === 0) {
              points[points.length - 1] = { x, y };
            }
          }

          if (isValidShape(shape.type, points)) {
            newShapes[selectedShapeIndex] = { ...shape, points };
          }
          return newShapes;
        });
      } else if (isDragging && selectedShapeIndex !== null && dragStart && currentTool === 'select') {
        const dx = x - dragStart.x;
        const dy = y - dragStart.y;
        setShapes((prev) => {
          const newShapes = [...prev];
          newShapes[selectedShapeIndex].points = newShapes[selectedShapeIndex].points.map((p) => ({
            x: p.x + dx,
            y: p.y + dy
          }));
          return newShapes;
        });
        setDragStart({ x, y });
      }
    },
    [isDragging, isResizing, selectedShapeIndex, dragStart, resizeHandle, currentTool, getSvgCoordinates, isValidShape]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
    }
    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
    }
  }, [isDragging, isResizing]);

  const handleKeyDown = useCallback(
    (event) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedShapeIndex !== null) {
        deleteSelectedShape();
      } else if (event.key === 'Escape' && currentTool === 'polygon' && isDrawing) {
        setTempPoints([]);
        setIsDrawing(false);
        setTool('select');
      }
    },
    [selectedShapeIndex, deleteSelectedShape, currentTool, isDrawing, setTool]
  );

  useEffect(() => {
    const handleDocumentKeyDown = (event) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedShapeIndex !== null) {
        deleteSelectedShape();
      } else if (event.key === 'Escape' && currentTool === 'polygon' && isDrawing) {
        setTempPoints([]);
        setIsDrawing(false);
        setTool('select');
      }
    };
    document.addEventListener('keydown', handleDocumentKeyDown);
    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [selectedShapeIndex, deleteSelectedShape, currentTool, isDrawing, setTool]);

  const generateSVG = useCallback(() => {
    let svgCode = `<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="${SVG_NS}">\n`;
    shapes.forEach((shape, i) => {
      if (!validShapeTypes.includes(shape.type)) return;
      const layerNum = i + 1;
      if (shape.type === 'line') {
        const pointsStr = shape.points
          .map((p) => `${Math.round(p.x)},${Math.round(p.y)}`)
          .join(' ');
        svgCode += `  <polyline data-layer="${layerNum}" points="${pointsStr}" stroke="${shape.style.stroke}" stroke-opacity="${shape.style.strokeOpacity}" stroke-width="${shape.style.strokeWidth}" fill="${shape.style.fill}" fill-opacity="${shape.style.fillOpacity}" />\n`;
      } else if (shape.type === 'rect') {
        const [p1, p2] = shape.points;
        const x = Math.round(Math.min(p1.x, p2.x));
        const y = Math.round(Math.min(p1.y, p2.y));
        const width = Math.round(Math.abs(p2.x - p1.x));
        const height = Math.round(Math.abs(p2.y - p1.y));
        svgCode += `  <rect data-layer="${layerNum}" x="${x}" y="${y}" width="${width}" height="${height}" stroke="${shape.style.stroke}" stroke-opacity="${shape.style.strokeOpacity}" stroke-width="${shape.style.strokeWidth}" fill="${shape.style.fill}" fill-opacity="${shape.style.fillOpacity}" />\n`;
      } else if (shape.type === 'circle') {
        const [p1, p2] = shape.points;
        const cx = Math.round(p1.x);
        const cy = Math.round(p1.y);
        const r = Math.round(Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2));
        svgCode += `  <circle data-layer="${layerNum}" cx="${cx}" cy="${cy}" r="${r}" stroke="${shape.style.stroke}" stroke-opacity="${shape.style.strokeOpacity}" stroke-width="${shape.style.strokeWidth}" fill="${shape.style.fill}" fill-opacity="${shape.style.fillOpacity}" />\n`;
      } else if (shape.type === 'polygon') {
        const pointsStr = shape.points
          .map((p) => `${Math.round(p.x)},${Math.round(p.y)}`)
          .join(' ');
        svgCode += `  <polygon data-layer="${layerNum}" points="${pointsStr}" stroke="${shape.style.stroke}" stroke-opacity="${shape.style.strokeOpacity}" stroke-width="${shape.style.strokeWidth}" fill="${shape.style.fill}" fill-opacity="${shape.style.fillOpacity}" />\n`;
      }
    });
    svgCode += '</svg>';
    setSvgOutput(svgCode);
  }, [shapes, canvasWidth, canvasHeight]);

  const renderShapeProps = useCallback((shape, index) => {
    if (shape.type === 'line') {
      const pointsStr = shape.points
        .map((p) => `${Math.round(p.x)},${Math.round(p.y)}`)
        .join(' ');
      return { points: pointsStr };
    } else if (shape.type === 'rect') {
      const [p1, p2] = shape.points;
      return {
        x: Math.round(Math.min(p1.x, p2.x)),
        y: Math.round(Math.min(p1.y, p2.y)),
        width: Math.round(Math.abs(p2.x - p1.x)),
        height: Math.round(Math.abs(p2.y - p1.y))
      };
    } else if (shape.type === 'circle') {
      const [p1, p2] = shape.points;
      return {
        cx: Math.round(p1.x),
        cy: Math.round(p1.y),
        r: Math.round(Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2))
      };
    } else if (shape.type === 'polygon') {
      const pointsStr = shape.points
        .map((p) => `${Math.round(p.x)},${Math.round(p.y)}`)
        .join(' ');
      return { points: pointsStr };
    }
    return {};
  }, []);

  const renderShapes = useCallback(() => {
    const elements = [];

    const shapeComponents = {
      line: ({ index, shape, props }) => (
        <polyline
          key={`shape-${index}`}
          {...props}
          stroke={shape.style.stroke}
          strokeOpacity={shape.style.strokeOpacity}
          strokeWidth={shape.style.strokeWidth}
          fill={shape.style.fill}
          fillOpacity={shape.style.fillOpacity}
          className={selectedShapeIndex === index ? 'selected' : ''}
        />
      ),
      rect: ({ index, shape, props }) => (
        <rect
          key={`shape-${index}`}
          {...props}
          stroke={shape.style.stroke}
          strokeOpacity={shape.style.strokeOpacity}
          strokeWidth={shape.style.strokeWidth}
          fill={shape.style.fill}
          fillOpacity={shape.style.fillOpacity}
          className={selectedShapeIndex === index ? 'selected' : ''}
        />
      ),
      circle: ({ index, shape, props }) => (
        <circle
          key={`shape-${index}`}
          {...props}
          stroke={shape.style.stroke}
          strokeOpacity={shape.style.strokeOpacity}
          strokeWidth={shape.style.strokeWidth}
          fill={shape.style.fill}
          fillOpacity={shape.style.fillOpacity}
          className={selectedShapeIndex === index ? 'selected' : ''}
        />
      ),
      polygon: ({ index, shape, props }) => (
        <polygon
          key={`shape-${index}`}
          {...props}
          stroke={shape.style.stroke}
          strokeOpacity={shape.style.strokeOpacity}
          strokeWidth={shape.style.strokeWidth}
          fill={shape.style.fill}
          fillOpacity={shape.style.fillOpacity}
          className={selectedShapeIndex === index ? 'selected' : ''}
        />
      )
    };

    const highlightComponents = {
      line: ({ index, shape, props }) => (
        <polyline
          key={`highlight-${index}`}
          {...props}
          stroke="#ADD8E6"
          strokeOpacity="0.7"
          strokeWidth={parseFloat(shape.style.strokeWidth) + 6}
          fill="none"
          className="highlight"
        />
      ),
      rect: ({ index, shape, props }) => (
        <rect
          key={`highlight-${index}`}
          {...props}
          stroke="#ADD8E6"
          strokeOpacity="0.7"
          strokeWidth={parseFloat(shape.style.strokeWidth) + 6}
          fill="none"
          className="highlight"
        />
      ),
      circle: ({ index, shape, props }) => (
        <circle
          key={`highlight-${index}`}
          {...props}
          stroke="#ADD8E6"
          strokeOpacity="0.7"
          strokeWidth={parseFloat(shape.style.strokeWidth) + 6}
          fill="none"
          className="highlight"
        />
      ),
      polygon: ({ index, shape, props }) => (
        <polygon
          key={`highlight-${index}`}
          {...props}
          stroke="#ADD8E6"
          strokeOpacity="0.7"
          strokeWidth={parseFloat(shape.style.strokeWidth) + 6}
          fill="none"
          className="highlight"
        />
      )
    };

    shapes.forEach((shape, index) => {
      if (!validShapeTypes.includes(shape.type)) return;
      const props = renderShapeProps(shape, index);

      if (selectedShapeIndex === index && currentTool === 'select') {
        const HighlightComponent = highlightComponents[shape.type];
        elements.push(<HighlightComponent key={`highlight-${index}`} index={index} shape={shape} props={props} />);
      }

      const ShapeComponent = shapeComponents[shape.type];
      elements.push(<ShapeComponent key={`shape-${index}`} index={index} shape={shape} props={props} />);
    });

    shapes.forEach((shape, index) => {
      if (selectedShapeIndex === index && currentTool === 'resize') {
        const handles = getHandlePositions(shape);
        const handleSize = 20;
        handles.forEach((handle, hIndex) => {
          elements.push(
            <rect
              key={`handle-${index}-${hIndex}`}
              x={handle.x - handleSize / 2}
              y={handle.y - handleSize / 2}
              width={handleSize}
              height={handleSize}
              fill="red"
              stroke="none"
              className="resize-handle"
              style={{ cursor: 'nwse-resize', pointerEvents: 'all' }}
            />
          );
        });
      }
    });

    if (isDrawing && tempPoints.length >= 1 && validShapeTypes.includes(currentTool)) {
      const mousePos = lastMousePos || { x: tempPoints[tempPoints.length - 1].x, y: tempPoints[tempPoints.length - 1].y };
      const style = getCurrentStyle();
      let tempProps;
      if (currentTool === 'line') {
        tempProps = { points: `${tempPoints[0].x},${tempPoints[0].y} ${mousePos.x},${mousePos.y}` };
      } else if (currentTool === 'rect') {
        tempProps = {
          x: Math.min(tempPoints[0].x, mousePos.x),
          y: Math.min(tempPoints[0].y, mousePos.y),
          width: Math.abs(mousePos.x - tempPoints[0].x),
          height: Math.abs(mousePos.y - tempPoints[0].y)
        };
      } else if (currentTool === 'circle') {
        tempProps = {
          cx: tempPoints[0].x,
          cy: tempPoints[0].y,
          r: Math.sqrt((mousePos.x - tempPoints[0].x) ** 2 + (mousePos.y - tempPoints[0].y) ** 2)
        };
      } else if (currentTool === 'polygon') {
        const points = [...tempPoints, mousePos];
        tempProps = {
          points: points.map((p) => `${p.x},${p.y}`).join(' ')
        };
      }
      const TempComponent = shapeComponents[currentTool];
      elements.push(
        <TempComponent
          key="temp-shape"
          index={-1}
          shape={{ style: { ...style, fillOpacity: 1 } }}
          props={tempProps}
        />
      );

      if (currentTool === 'polygon' && tempPoints.length >= 1) {
        const firstPoint = tempPoints[0];
        const isHoveringFirstPoint = lastMousePos && isPointInHandle(lastMousePos.x, lastMousePos.y, firstPoint.x, firstPoint.y);
        console.log('Hovering first point:', isHoveringFirstPoint, 'Mouse:', lastMousePos, 'First point:', firstPoint);
        elements.push(
          <rect
            key="temp-polygon-first-handle"
            x={firstPoint.x - 10}
            y={firstPoint.y - 10}
            width={20}
            height={20}
            fill={isHoveringFirstPoint ? '#00FF00' : 'red'}
            stroke="none"
            className="resize-handle"
            style={{ cursor: 'pointer', pointerEvents: 'all' }}
          />
        );
      }
    }

    return elements;
  }, [
    shapes,
    selectedShapeIndex,
    isDrawing,
    tempPoints,
    currentTool,
    lastMousePos,
    getCurrentStyle,
    canvasWidth,
    canvasHeight,
    renderShapeProps,
    getHandlePositions,
    isPointInHandle
  ]);

  useEffect(() => {
    generateSVG();
  }, [generateSVG]);

  return {
    shapes,
    currentTool,
    setTool,
    selectedShapeIndex,
    layerNumber: selectedShapeIndex !== null ? selectedShapeIndex + 1 : '',
    layerMax: shapes.length || 1,
    setLayerPosition,
    strokeColor,
    setStrokeColor,
    strokeOpacity,
    setStrokeOpacity,
    strokeWidth,
    setStrokeWidth,
    fillColor,
    setFillColor,
    fillOpacity,
    setFillOpacity,
    canvasWidth,
    setCanvasWidth,
    canvasHeight,
    setCanvasHeight,
    updateCanvasSize,
    deleteSelectedShape,
    handleMouseDown,
    handleClick,
    handleMouseMove,
    handleMouseUp,
    handleKeyDown,
    svgOutput,
    renderShapes
  };
};

export default useSVGMaker;