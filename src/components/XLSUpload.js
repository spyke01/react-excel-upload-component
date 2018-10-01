import PropTypes from 'prop-types';
import React, {Component} from 'react';
import swal from 'sweetalert';
import * as XLSX from 'xlsx';
import XLSUploadColumnMappings from './XLSUploadColumnMappings';
import XLSUploadErrors from './XLSUploadErrors';
import XLSUploadDetails from './XLSUploadDetails';
import XLSUploadProgress from './XLSUploadProgress';

import './XLSUpload.scss';

class XLSUpload extends Component {
  /**
   * Convert a string to an array buffer.
   *
   * @param s
   * @returns {ArrayBuffer}
   */
  static s2ab(s) {
    let b = new ArrayBuffer(s.length);
    let v = new Uint8Array(b);

    for (let i = 0; i !== s.length; ++i) {
      v[i] = s.charCodeAt(i) & 0xFF;
    }

    return b;
  }

  /**
   * Show a sweet looking alert, fall back alert in case sweet alert is not loaded.
   *
   * @param message
   */
  static showSwalAlert(message) {
    if (window.swal) {
      swal('Alert!', message, 'warning');
    } else {
      alert(message);
    }
  }

  /**
   * Verify we uploaded a correct type of file.
   *
   * @param file
   * @returns {boolean}
   */
  static verifyFile(file) {
    let extTemp = file.type.split('.');
    let fileType = extTemp[extTemp.length - 1];

    let nameTemp = file.name.split('.');
    let ext = nameTemp[nameTemp.length - 1];

    return ((fileType === 'sheet' || fileType === 'ms-excel') && (ext === 'xlsx' || ext === 'xls'));
  }

  /**
   *
   * @param props
   */
  constructor(props) {
    super(props);

    // Try to avoid this
    this.fileInputRef = React.createRef();

    this.state = {
      fileName: null,
      sheetData: [],
      // columnMappings: null,

      // Progress Bar items
      progressBar: {
        active: true,
        animated: true,
        error: false,
        title: 'Loading...',
        visible: false,
      },
    };

    this.errorArray = [];

    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleChangeMappings = this.handleChangeMappings.bind(this);
  }

  /**
   * When mappings change lets send them up to our wrapper so that we can process the data.
   */
  handleChangeMappings(mappings) {
    const { saveMappings } = this.props;
    const { sheetData } = this.state;

    // this.setState({ columnMappings: mappings });
    saveMappings(mappings, sheetData);
  }

  /**
   * Handle out file input changes.
   *
   * @returns {boolean}
   */
  handleOnChange(e) {
    // Obtain the file object
    let file = this.fileInputRef.current.files[0];

    if (!file) {
      this.constructor.showSwalAlert('No File Selected!');
      return false;
    }

    if (!this.constructor.verifyFile(file)) {
      this.constructor.showSwalAlert('Invalid File Selected!');

      // Make sure we are not allowing this file to be uploaded at all
      e.target.value = null;

      // Clear any current mappings
      this.setState((state) => {
        return {
          ...state,
          sheetData: null,
          fileName: null,
          progressBar: {
            ...state.progressBar,
            visible: false,
          },
        };
      });

      return false;
    }

    // Show our progress
    this.setState((state) => {
      return {
        ...state,
        fileName: file.name,
        progressBar: {
          ...state.progressBar,
          title: 'Parsing File',
          visible: true,
        },
      };
    });

    let reader = new FileReader();

    // On load start processing
    reader.onload = (e) => {
      // Get the binary data
      let data = e.target.result;

      // Parse the data as a workbook
      try {
        let wb = XLSX.read(data, { type: 'binary' });

        // Update progress
        this.setState((state) => {
          return {
            ...state,
            progressBar: {
              ...state.progressBar,
              title: 'Reading Data From File Completed Successfully',
              active: false,
              animated: false,
            },
          };
        });

        // Process the workbook
        this.processWorkbookData(wb);

      } catch (e) {
        console.log(e);
        this.constructor.showSwalAlert('Error Reading/Processing Excel File! Try again or use file');
        return false;
      }
    };

    // Error Handler
    reader.onerror = (error) => {
      this.setState((state) => {
        return {
          ...state,
          progressBar: {
            ...state.progressBar,
            title: 'ERROR reading the File!',
            active: false,
            error: true,
          },
        };
      });
      this.constructor.showSwalAlert('Error Parsing the Selected File!');
      console.log(error);
    };

    // In the case where we take a while to process lets add a reading message
    this.setState((state) => {
      return {
        ...state,
        progressBar: {
          ...state.progressBar,
          title: 'Reading Data From File . . .',
        },
      };
    });

    // Read our uploaded file using the FileReader as a Binary
    reader.readAsBinaryString(file);
  }

  /**
   * Process our uploaded workbooks
   *
   * @param wb
   * @returns {boolean}
   */
  processWorkbookData(wb) {
    // Clear any existing errors
    this.errorArray = [];

    // Get worksheet
    let ws = wb.Sheets[wb.SheetNames[0]];

    // Export the worksheet data as json
    let data = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

    // Extract the headers
    const columnHeaders = data[0];
    if (columnHeaders.length <= 0) {
      this.constructor.showSwalAlert('The first row in the document is EMPTY. It should contain the Headers');
      return false;
    }

    if (data.length <= 1 || data[1].length <= 0) {
      this.constructor.showSwalAlert('The Excel Sheet Seems to have no data');
      return false;
    }

    // Show Mapping
    this.setState({ sheetData: data });
  }

  /**
   * Make all the pretty things!
   *
   * @returns {*}
   */
  render() {
    const { fileName, progressBar, sheetData } = this.state;
    const { disabled, serverColumnNames, showFileDetails } = this.props;

    // Render all the things!
    return (
      <div>
        <div className="form-group">
          <input type="file" id="fileUploader" className="btn btn-fill btn-primary btn-large" disabled={disabled} onChange={this.handleOnChange} ref={this.fileInputRef} />
        </div>

        <div id="tableOutput">
          <XLSUploadProgress active={progressBar.active} animated={progressBar.animated} error={progressBar.error} title={progressBar.title} visible={progressBar.visible} />
          <XLSUploadColumnMappings serverColumnNames={serverColumnNames} sheetData={sheetData} handleChangeMappings={this.handleChangeMappings} />
          <XLSUploadDetails fileName={fileName} sheetData={sheetData} visible={showFileDetails} />
          <XLSUploadErrors errors={this.errorArray} />
        </div>
      </div>
    );
  }
}

XLSUpload.propTypes = {
  disabled: PropTypes.bool,
  saveMappings: PropTypes.func,

  // maxInAGroup: PropTypes.number,
  serverColumnNames: PropTypes.arrayOf(PropTypes.string),
  showFileDetails: PropTypes.bool,
};

XLSUpload.defaultProps = {
  disabled: false,
  saveMappings: null,

  // maxInAGroup: 1000,
  serverColumnNames: ['Name', 'Email', 'Phone Number'],
  showFileDetails: false,
};

export default XLSUpload;
