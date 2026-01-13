import { useParams } from 'react-router-dom';
import { useEffect, useRef, useCallback, React } from 'react';
import applications from '../data/applications';
import useSVGMaker from './scripts/svgmaker';
import './assets/svgmaker.css';

const SVGMaker = () => {

  const { name } = useParams();
    const application = applications.find((a) => a.name === name);  if (!application) {
      throw new Error('Application not found');
    }  const { title, date, desc } = application;
    const svgRef = useRef(null);
  const containerRef = useRef(null);



  const {
    currentTool,
    setTool,
    renderShapes,
    svgOutput,
    handleMouseDown,
    handleClick,
    handleMouseMove,
    handleMouseUp,
    handleKeyDown,
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
    deleteSelectedShape,
    selectedShapeIndex,
    layerNumber,
    layerMax,
    setLayerPosition,
  } = useSVGMaker(500, 500);

  return (
    <content style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      {/* Toolbar */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setTool('line')}
          style={{
            marginRight: '10px',
            padding: '5px 10px',
            background: currentTool === 'line' ? '#ADD8E6' : '#f0f0f0',
          }}
        >
          Line
        </button>
        <button
          onClick={() => setTool('rect')}
          style={{
            marginRight: '10px',
            padding: '5px 10px',
            background: currentTool === 'rect' ? '#ADD8E6' : '#f0f0f0',
          }}
        >
          Rectangle
        </button>
        <button
          onClick={() => setTool('circle')}
          style={{
            marginRight: '10px',
            padding: '5px 10px',
            background: currentTool === 'circle' ? '#ADD8E6' : '#f0f0f0',
          }}
        >
          Circle
        </button>
        <button
          onClick={() => setTool('polygon')}
          style={{
            marginRight: '10px',
            padding: '5px 10px',
            background: currentTool === 'polygon' ? '#ADD8E6' : '#f0f0f0',
          }}
        >
          Polygon
        </button>
        <button
          onClick={() => setTool('select')}
          style={{
            marginRight: '10px',
            padding: '5px 10px',
            background: currentTool === 'select' ? '#ADD8E6' : '#f0f0f0',
          }}
        >
          Select
        </button>
        <button
          onClick={() => setTool('resize')}
          style={{
            marginRight: '10px',
            padding: '5px 10px',
            background: currentTool === 'resize' ? '#ADD8E6' : '#f0f0f0',
          }}
        >
          Resize
        </button>
        <button
          onClick={deleteSelectedShape}
          disabled={selectedShapeIndex === null}
          style={{
            padding: '5px 10px',
            background: selectedShapeIndex === null ? '#f0f0f0' : '#ff4d4d',
            color: selectedShapeIndex === null ? '#999' : '#fff',
          }}
        >
          Delete
        </button>
      </div>

      {/* Style Controls */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '20px' }}>
          Stroke Color:
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            disabled={selectedShapeIndex === null && !['line', 'rect', 'circle', 'polygon'].includes(currentTool)}
            style={{ marginLeft: '5px' }}
          />
        </label>
        <label style={{ marginRight: '20px' }}>
          Stroke Opacity (%):
          <input
            type="number"
            min="0"
            max="100"
            value={strokeOpacity}
            onChange={(e) => setStrokeOpacity(e.target.value)}
            disabled={selectedShapeIndex === null && !['line', 'rect', 'circle', 'polygon'].includes(currentTool)}
            style={{ width: '60px', marginLeft: '5px' }}
          />
        </label>
        <label style={{ marginRight: '20px' }}>
          Stroke Width:
          <input
            type="number"
            min="1"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(e.target.value)}
            disabled={selectedShapeIndex === null && !['line', 'rect', 'circle', 'polygon'].includes(currentTool)}
            style={{ width: '60px', marginLeft: '5px' }}
          />
        </label>
        <label style={{ marginRight: '20px' }}>
          Fill Color:
          <input
            type="color"
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            disabled={selectedShapeIndex === null && !['rect', 'circle', 'polygon'].includes(currentTool)}
            style={{ marginLeft: '5px' }}
          />
        </label>
        <label style={{ marginRight: '20px' }}>
          Fill Opacity (%):
          <input
            type="number"
            min="0"
            max="100"
            value={fillOpacity}
            onChange={(e) => setFillOpacity(e.target.value)}
            disabled={selectedShapeIndex === null && !['rect', 'circle', 'polygon'].includes(currentTool)}
            style={{ width: '60px', marginLeft: '5px' }}
          />
        </label>
      </div>

      {/* Layer Control */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          Layer Position (1-{layerMax}):
          <input
            type="number"
            min="1"
            max={layerMax}
            value={layerNumber}
            onChange={(e) => setLayerPosition(parseInt(e.target.value))}
            disabled={selectedShapeIndex === null}
            style={{ width: '60px', marginLeft: '5px' }}
          />
        </label>
      </div>

      {/* Canvas Size Controls */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '20px' }}>
          Canvas Width:
          <input
            type="number"
            min="100"
            value={canvasWidth}
            onChange={(e) => setCanvasWidth(parseInt(e.target.value))}
            style={{ width: '80px', marginLeft: '5px' }}
          />
        </label>
        <label>
          Canvas Height:
          <input
            type="number"
            min="100"
            value={canvasHeight}
            onChange={(e) => setCanvasHeight(parseInt(e.target.value))}
            style={{ width: '80px', marginLeft: '5px' }}
          />
        </label>
      </div>

      {/* SVG Canvas */}
      <svg
        width={canvasWidth}
        height={canvasHeight}
        style={{ border: '1px solid #ccc' }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {renderShapes()}
      </svg>

      {/* SVG Output */}
      <div style={{ marginTop: '20px' }}>
        <h3>SVG Output</h3>
        <pre style={{ background: '#f0f0f0', padding: '10px', maxHeight: '200px', overflow: 'auto' }}>
          {svgOutput}
        </pre>
      </div>
    </content>
  );
};

export default SVGMaker;