import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';

import './XLSUploadErrors.scss';

class XLSUploadErrors extends Component {
  constructor(props) {
    super(props);

    this.downloadErrorData = this.downloadErrorData.bind(this);
  }

  /**
   * Download our error array as a file.
   *
   * @returns {boolean}
   */
  downloadErrorData() {
    const { errors } = this.props;

    if (errors.length <= 0) {
      this.constructor.showSwalAlert('There are no errors to download!');
      return false;
    }

    let new_ws = XLSX.utils.json_to_sheet(errors, { skipHeader: true, raw: true });

    /* build workbook */
    let newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, new_ws, 'Data with Errors');

    /* write file and trigger a download */
    let binaryOut = XLSX.write(newWorkbook, { bookType: 'xlsx', bookSST: true, type: 'binary' });
    let fileName = 'error_data.xlsx';

    try {
      saveAs(new Blob([this.constructor.s2ab(binaryOut)], { type: 'application/octet-stream' }), fileName);
    } catch (e) {
      console.log(e, binaryOut);
      this.constructor.showSwalAlert('We experienced an error while attempting to save your error file.');
    }
  }

  /**
   * Make all the pretty things!
   *
   * @returns {*}
   */
  render() {
    const { errors } = this.props;

    // Display any errors that we have
    let tableMappingErrors = [];

    if (errors.length > 0) {
      tableMappingErrors.push(
        <p className="error-text">
          There are {errors.length} records with error. These are most likely data with duplicated entries. Click the red button below to download those data as excel
          <br /><br />
          <button className="btn btn-danger btn-large btn-fill m-r-30" onClick={this.downloadErrorData}><i className="fa fa-download" /> Download Error Data</button>
        </p>,
      );

      let errorRows = [];
      for (let i = 0; i < errors.length; i++) {
        let td = [];

        if (Array.isArray(errors[i])) {
          for (let j = 0; j < errors[i].length; j++) {
            td.push(<td>{errors[i][j]}</td>);
          }
        } else {
          td.push(<td>{errors[i]}</td>);
        }

        errorRows.push(<tr>{td}</tr>);
      }

      tableMappingErrors.push(
        <table className="errorTable">
          <tbody>{errorRows}</tbody>
        </table>,
      );
    }

    if (tableMappingErrors.length === 0) {
      return (<div />);
    }

    // Render all the things!
    return (
      <p id="tableError">{tableMappingErrors}</p>
    );
  }
}

XLSUploadErrors.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.oneOf([PropTypes.array, PropTypes.string])),
};

XLSUploadErrors.defaultProps = {
  errors: [],
};

export default XLSUploadErrors;
