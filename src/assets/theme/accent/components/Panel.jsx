import React from 'react';
import '../accent.css';

const Panel = ({ children }) => {
  return (
    <div className="panel-corners">
      <div className="panel-corner panel-corner-top-left" alt="top left corner" />
      <div className="panel-corner panel-corner-top-right" alt="top right corner" />
      <div className="panel-corner panel-corner-bottom-right" alt="bottom right corner" />
      <div className="panel-corner panel-corner-bottom-left" alt="bottom left corner" />
      <div className="panel-background">
        <div className="panel-content">{children}</div>
      </div>
    </div>
  );
};

export default Panel;