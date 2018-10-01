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
    this.handleOnClickFinalize = this.handleOnClickFinalize.bind(this);
    this.handleSaveMappings = this.handleSaveMappings.bind(this);
    this.pushDataToServer = this.pushDataToServer.bind(this);
    this.startUpload = this.startUpload.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
  }

  /**
   * Generate our upload tracking state data.
   *
   * @param nextProps
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.maxInAGroup !== this.props.maxInAGroup || nextProps.numUploaders !== this.props.numUploaders) {
      const uploaders = {};

      // Default all of our columns to "Ignore"
      for (let i = 0; i < nextProps.numUploaders; i++) {
        uploaders[i] = {
          maxInAGroup: nextProps.maxInAGroup,
          batch: 0,
          groups: 0,
          start: 0,
          stop: nextProps.maxInAGroup,
          columnMap: null,
          url: 'test.php',
          additionalPostData: [],
          uploading: false,
          uploadProgressAnimated: false,
          uploadProgressPercentage: 100,
          uploadProgressTitle: '',
        };
      }

      this.setState({ uploaders });
    }
  }

  /**
   * THis allows us to get the column mapping selected by a user deep down in the depths.
   *
   * @param uploaderIndex
   * @param columnMap
   */
  handleSaveMappings(uploaderIndex, columnMap) {
    this.setState((state) => ({ uploaders: {
        ...state.uploaders,
        [uploaderIndex]: {
          ...state.uploaders[uploaderIndex],
          columnMap
        }
      }
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
      const { maxInAGroup } = uploaderData;

      // TODO: Pull the data from the depths
      let data = null;

      // Remove the headers
      data.splice(0, 1);

      // get the result of the division
      // if there are remainders, add 1 to the division to care for them
      let numGroups = parseInt(data.length / maxInAGroup) + ((data.length % maxInAGroup) > 0 ? 1 : 0);

      this.setState({
        groups: numGroups,
        uploading: true,
        uploadProgressAnimated: false,
        uploadProgressPercentage: 3,
        uploadProgressTitle: `Uploading 1 of ${this.groups}`,
      });

      // Ignite the chain
      this.callPushDataToServer(uploaderIndex);      
    });
  }

  /**
   *
   * @returns {boolean}
   */
  callPushDataToServer(uploaderIndex) {
    const { batch, groups, start, stop } = this.state.uploaders[uploaderIndex];

    // TODO: Pull the data from the depths
    let data = null;

    if (batch >= groups) {
      //just in case, but this is handled in update_progress
      //We are done processing
      return false;
    }

    // extract the next batch from the whole data
    // console.log("Pushing batch " + batch + " to server | start = " + start + " stop = " + stop);
    let currentData = data.slice(start, stop);
    setTimeout(this.pushDataToServer(uploaderIndex, currentData), 1000);

    // Increase the index for the next batch so we know where we are
    this.setState((state) => ({
      start: state.stop,
      stop: state.stop + state.maxInAGroup,
    }));
  }

  /**
   *
   * @param uploaderIndex
   * @param data
   */
  pushDataToServer(uploaderIndex, data) {
    const { columnMap } = this.state;

    // Merge payload with any extra data
    let payload = {
      column_map: JSON.parse(columnMap),
      data: data,
    };

    fetch('myUploader.php', {
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
      this.updateProgress();
    }).catch((error) => {
      XLSUpload.showSwalAlert('ERROR OCCURRED! ' + JSON.stringify(error) + '<br />');
      console.log(error);
      this.updateProgress();
    });
  }

  /**
   *
   */
  updateProgress() {
    const { batch, groups } = this.state;

    // This method is called when the server returned a response, either success or failure

    // Increase the this.batch
    let thisBatch = batch + 1;
    this.setState({ batch: thisBatch });

    // Calculate the width of the progress bar and percentage done
    // it is safe to do this here as this.batch this.starts from 0
    let percentComplete = parseInt((thisBatch / groups) * 100);
    this.setState({
      uploading: true,
      uploadProgressPercentage: percentComplete,
      uploadProgressTitle: `Uploaded ${thisBatch} of ${groups}`,
    });

    if (thisBatch >= groups) {
      // If thisBatch is greater than or equal to the number of available groups then we are done
      // Reset the uploader items
      this.setState((state) => ({
        batch: 0,
        groups: 0,
        start: 0,
        stop: state.maxInAGroup,
        uploadProgressAnimated: false,
      }));
    }
    else {
      // Call the next guy in the queue
      this.callPushDataToServer();
    }
  }

  /**
   * Make all the pretty things!
   *
   * @returns {*}
   */
  render() {
    const { numUploaders } = this.props;
    const { maxInAGroup, uploadProgressAnimated, uploadProgressPercentage, uploadProgressTitle, uploading } = this.state;

    const fileUploaders = [];

    for (let i = 0; i < numUploaders; i++) {
      if (uploading) {
        fileUploaders.push(
          <XLSUploadProgress key={i} animated={uploadProgressAnimated} uploadProgressPercentage={uploadProgressPercentage} title={uploadProgressTitle} active visible />,
        );
      } else {
        fileUploaders.push(
          <XLSUpload
            key={i}
            disabled={uploading}
            maxInAGroup={maxInAGroup}
            saveMappings={(columnMap) => this.handleSaveMappings(i, columnMap)}
            serverColumnNames={['Name', 'Email', 'Phone Number']}
          />,
        );
      }
    }

    return (
      <div>
        {fileUploaders}
        {!uploading && <button type="button" className="btn btn-success btn-large btn-fill" onClick={this.handleOnClickFinalize}>Finalize</button>}
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
