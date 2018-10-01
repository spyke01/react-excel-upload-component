import PropTypes from 'prop-types';
import React, {Component} from 'react';
import XLSUpload from './XLSUpload';
import XLSUploadProgress from './XLSUploadProgress';

class XLSUploadWrapper extends Component {
  /**
   *
   * @param props
   */
  constructor(props) {
    super(props);

    this.state = {
      uploaders: {},
    };

    this.callPushDataToServer = this.callPushDataToServer.bind(this);
    this.fillUploaderState = this.fillUploaderState.bind(this);
    this.handleOnClickFinalize = this.handleOnClickFinalize.bind(this);
    this.handleSaveMappings = this.handleSaveMappings.bind(this);
    this.pushDataToServer = this.pushDataToServer.bind(this);
    this.startUpload = this.startUpload.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
  }

  /**
   *
   */
  componentWillMount() {
    this.fillUploaderState(this.props);
  }

  /**
   * Generate our upload tracking state data.
   *
   * @param nextProps
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.maxInAGroup !== this.props.maxInAGroup || nextProps.numUploaders !== this.props.numUploaders) {
      this.fillUploaderState(nextProps);
    }
  }

  /**
   *
   * @param props
   */
  fillUploaderState(props) {
    const { maxInAGroup, numUploaders } = props;

    const uploaders = {};

    // Default all of our columns to "Ignore"
    for (let i = 0; i < numUploaders; i++) {
      uploaders[i] = {
        maxInAGroup,
        batch: 0,
        groups: 0,
        start: 0,
        stop: maxInAGroup,
        columnMap: null,
        url: 'sleepDemo.php',
        additionalPostData: [],
        uploading: false,
        uploadProgressAnimated: false,
        uploadProgressPercentage: 0,
        uploadProgressTitle: '',
      };
    }

    this.setState({ uploaders });
  }

  /**
   * This allows us to get the column mapping selected by a user deep down in the depths.
   *
   * @param uploaderIndex
   * @param columnMap
   * @param sheetData
   */
  handleSaveMappings(uploaderIndex, columnMap, sheetData) {
    console.log(`saving ${uploaderIndex}: ${columnMap}`);
    this.setState((state) => ({
      uploaders: {
        ...state.uploaders,
        [uploaderIndex]: {
          ...state.uploaders[uploaderIndex],
          columnMap,
          sheetData,
        },
      },
    }));
  }

  /**
   * Handle the finalize button clicky click action.
   */
  handleOnClickFinalize() {
    this.startUpload();
  }

  /**
   * Start our upload process.
   */
  startUpload() {
    const { uploaders } = this.state;

    //  Loop through the uploaders base don our num of uploaders
    Object.entries(uploaders).forEach(([uploaderIndex, uploaderData]) => {
      const { columnMap, maxInAGroup, sheetData } = uploaderData;
      console.log(uploaderData);

      // If we don't have everything then skip this guy
      if (columnMap == null || columnMap.length <= 0 || sheetData == null || sheetData.length <= 0) {
        console.log(columnMap && columnMap.length);
        console.log(sheetData && sheetData.length);
        return true;
      }

      // Remove the headers
      const numRows = sheetData.length;

      // get the result of the division
      // if there are remainders, add 1 to the division to care for them
      let numGroups = parseInt(numRows / maxInAGroup) + ((numRows % maxInAGroup) > 0 ? 1 : 0);

      this.setState((state) => ({
        uploaders: {
          ...state.uploaders,
          [uploaderIndex]: {
            ...state.uploaders[uploaderIndex],
            groups: numGroups,
            start: 1,
            uploading: true,
            uploadProgressAnimated: false,
            uploadProgressPercentage: 3,
            uploadProgressTitle: `Uploading 1 of ${numGroups}`,
          },
        },
      }), () => {
        // Ignite the chain
        this.callPushDataToServer(uploaderIndex);
      });
    });
  }

  /**
   *
   * @returns {boolean}
   */
  callPushDataToServer(uploaderIndex) {
    const { batch, groups, sheetData, start, stop } = this.state.uploaders[uploaderIndex];

    if (batch >= groups) {
      //just in case, but this is handled in update_progress
      //We are done processing
      return false;
    }

    // extract the next batch from the whole data
    // console.log("Pushing batch " + batch + " to server | start = " + start + " stop = " + stop);
    let currentData = sheetData.slice(start, stop);
    setTimeout(this.pushDataToServer(uploaderIndex, currentData), 1000);

    // Increase the index for the next batch so we know where we are
    this.setState((state) => ({
      uploaders: {
        ...state.uploaders,
        [uploaderIndex]: {
          ...state.uploaders[uploaderIndex],
          start: state.stop,
          stop: state.stop + state.maxInAGroup,
        },
      },
    }));
  }

  /**
   *
   * @param uploaderIndex
   * @param data
   */
  pushDataToServer(uploaderIndex, data) {
    const { additionalPostData, columnMap, url } = this.state.uploaders[uploaderIndex];

    // Merge payload with any extra data
    let payload = {
      column_map: JSON.parse(columnMap),
      data: data,
      ...additionalPostData
    };

    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).then((response) => {
      if (response.data) {
        this.errorArray = this.errorArray.concat(response.data);
      }
      if (response.error) {
        XLSUpload.showSwalAlert(JSON.stringify(response.error));
      }
      this.updateProgress(uploaderIndex);
    }).catch((error) => {
      XLSUpload.showSwalAlert(`ERROR OCCURRED! ${error}`);
      this.updateProgress(uploaderIndex);
    });
  }

  /**
   *
   * @param uploaderIndex
   */
  updateProgress(uploaderIndex) {
    const { batch, groups } = this.state.uploaders[uploaderIndex];

    // This method is called when the server returned a response, either success or failure

    // Increase the this.batch
    let thisBatch = batch + 1;

    // Calculate the width of the progress bar and percentage done
    // it is safe to do this here as this.batch this.starts from 0
    let percentComplete = parseInt((thisBatch / groups) * 100);
    this.setState((state) => ({
      uploaders: {
        ...state.uploaders,
        [uploaderIndex]: {
          ...state.uploaders[uploaderIndex],
          batch: thisBatch,
          uploading: true,
          uploadProgressPercentage: percentComplete,
          uploadProgressTitle: `Uploaded ${thisBatch} of ${groups}`,
        },
      },
    }));

    if (thisBatch >= groups) {
      // If thisBatch is greater than or equal to the number of available groups then we are done
      // Reset the uploader items
      this.setState((state) => ({
        uploaders: {
          ...state.uploaders,
          [uploaderIndex]: {
            ...state.uploaders[uploaderIndex],
            batch: 0,
            groups: 0,
            start: 0,
            stop: state.maxInAGroup,
            uploadProgressAnimated: false,
          },
        },
      }));
    }
    else {
      // Call the next guy in the queue
      this.callPushDataToServer(uploaderIndex);
    }
  }

  /**
   * Make all the pretty things!
   *
   * @returns {*}
   */
  render() {
    // const { numUploaders } = this.props;
    const { uploaders } = this.state;

    const fileUploaders = [];
    let currentlyUploading = false;

    Object.entries(uploaders).forEach(([uploaderIndex, uploaderData]) => {
      const { maxInAGroup, uploadProgressAnimated, uploadProgressPercentage, uploadProgressTitle, uploading } = uploaderData;

      if (uploading) {
        currentlyUploading = true;
        fileUploaders.push(
          <XLSUploadProgress key={uploaderIndex} animated={uploadProgressAnimated} uploadProgressPercentage={uploadProgressPercentage} title={uploadProgressTitle} active visible />,
        );
      } else {
        fileUploaders.push(
          <XLSUpload
            key={uploaderIndex}
            disabled={uploading}
            maxInAGroup={maxInAGroup}
            saveMappings={(columnMap, sheetData) => this.handleSaveMappings(uploaderIndex, columnMap, sheetData)}
            serverColumnNames={['Name', 'Email', 'Phone Number']}
          />,
        );
      }
    });

    return (
      <div>
        {fileUploaders}
        {!currentlyUploading && <button type="button" className="btn btn-success btn-large btn-fill" onClick={this.handleOnClickFinalize}>Finalize</button>}
      </div>
    );
  }
}

XLSUploadWrapper.propTypes = {
  maxInAGroup: PropTypes.number,
  numUploaders: PropTypes.number,
};

XLSUploadWrapper.defaultProps = {
  maxInAGroup: 1000,
  numUploaders: 1,
};

export default XLSUploadWrapper;
