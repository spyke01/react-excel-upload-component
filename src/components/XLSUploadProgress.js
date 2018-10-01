import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import './XLSUploadProgress.scss';

const XLSUploadProgress = (props) => {
  const { active, animated, error, progressPercentage, title, visible } = props;

  if (!visible) {
    return (<div />);
  }

  // Render all the things!
  return (
    <div className="progress-block form-group">
      <label>{title}</label>
      <div className="progress">
        <div
          className={classNames('progress-bar', 'progress-bar-striped', { 'active': active }, { 'progress-bar-animated': animated }, { 'progress-bar-danger': error }, { 'progress-bar-success bg-success': progressPercentage === 100 })}
          role="progressbar"
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
          style={{width: `${progressPercentage}%`}}
        >
          {progressPercentage}%
        </div>
      </div>
    </div>
  );
};

XLSUploadProgress.propTypes = {
  active: PropTypes.bool,
  animated: PropTypes.bool,
  error: PropTypes.bool,
  progressPercentage: PropTypes.number,
  title: PropTypes.string,
  visible: PropTypes.bool,
};

XLSUploadProgress.defaultProps = {
  active: true,
  animated: true,
  error: false,
  progressPercentage: 100,
  title: null,
  visible: false,
};

export default XLSUploadProgress;
