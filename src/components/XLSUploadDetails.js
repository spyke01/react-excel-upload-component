import PropTypes from 'prop-types';
import React from 'react';

import './XLSUploadDetails.scss';

const XLSUploadDetails = (props) => {
  const { fileName, sheetData, visible } = props;
  let currentDate = new Date();

  if (!visible) {
    return (<div />);
  }

  // Render all the things!
  return (
    <div className="fileDetails">
      =========================<br />
      {currentDate.toISOString()}<br />
      FileName: {fileName}<br />
      Total No of Records: {sheetData.length - 1}<br />
      =========================<br />
    </div>
  );
};

XLSUploadDetails.propTypes = {
  fileName: PropTypes.string,
  sheetData: PropTypes.arrayOf(PropTypes.array),
  visible: PropTypes.bool,
};

XLSUploadDetails.defaultProps = {
  fileName: null,
  sheetData: null,
  visible: false,
};

export default XLSUploadDetails;
