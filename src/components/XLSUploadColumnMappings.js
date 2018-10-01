import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import uuid from 'uuid';
import XLSUpload from './XLSUpload';

import './XLSUploadColumnMappings.scss';

class XLSUploadColumnMappings extends Component {
  /**
   *
   * @param props
   */
  constructor(props) {
    super(props);

    this.state = {
      selections: new Map(),
      selectionsWithErrors: [],
    };

    this.handleMappingChange = this.handleMappingChange.bind(this);
  }

  /**
   *
   */
  componentWillMount() {
    this.resetState(this.props);
  }

  /**
   * Reset our selections if our data changes.
   *
   * @param nextProps
   */
  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.sheetData) !== JSON.stringify(this.props.sheetData) || JSON.stringify(nextProps.serverColumnNames) !== JSON.stringify(this.props.serverColumnNames)) {
      this.resetState(nextProps);
    }
  }

  /**
   *
   * @param props
   */
  resetState(props) {
    const { sheetData } = props;
    console.log('reseting state');
    console.log(sheetData);

    const selections = new Map();

    // Default all of our columns to "Ignore"
    if (sheetData != null) {
      if (sheetData[1] != null) {
        for (let i = 0; i < sheetData[1].length; i++) {
          selections.set(i, '-1');
        }
      }
    }

    this.setState({
      selections,
      selectionsWithErrors: [],
    });
  }

  /**
   * When mappings change lets send them up to our wrapper so that we can process the data.
   *
   * @param {*} e
   * @param {int} index
   *
   * @returns {boolean}
   */
  handleMappingChange(e, index) {
    const { handleChangeMappings } = this.props;
    const { selections } = this.state;

    // First save what we changed to
    const updatedSelections = new Map(selections);
    updatedSelections.set(index, e.target.value);

    this.setState({ selections: updatedSelections }, () => {
      console.log('Generating new mapping');
      console.log(updatedSelections);
      // Let's do some error checking on our selections
      let mappings = this.prepareColumnMap();

      if (mappings) {
        handleChangeMappings(mappings);
      }
    });
  }

  /**
   * Check and make sure we aren't duplicating selections.
   *
   * @returns {*}
   */
  prepareColumnMap() {
    let colMap = '{';
    let haveErrors = false;
    let selectionsWithErrors = [];
    const { selections } = this.state;
    // console.log(selections);

    selections.forEach((value, key) => {
      // console.log(`value: ${value} key: ${key}`);
      if (value !== '-1') {
        let regex = new RegExp('\\b' + value + '\\b');

        if (colMap.search(regex) > 0) {
          XLSUpload.showSwalAlert('ERROR! You have mapped more than one Data to the same type. See the row highlighted in RED');
          haveErrors = true;

          // Track that this guy has an error
          selectionsWithErrors.push(key);
        }

        colMap += '"' + value + '":"' + key + '",';
      }
    });

    this.setState({ selectionsWithErrors });
    // console.log(selectionsWithErrors);

    if (haveErrors) {
      return false;
    }

    return colMap.substring(0, (colMap.length - 1)) + '}';
  }

  render() {
    const { serverColumnNames, sheetData } = this.props;
    const { selections, selectionsWithErrors } = this.state;

    // Generate our field mapping boxes
    let dynamicOptions = [];
    serverColumnNames.forEach(function(element) {
      /*
       The value of the options is going to be the displayed
       value in lower case and spaces replaced with underscore char
      */
      let regex = new RegExp(' ', 'g');
      let eVal = element.toLowerCase().replace(regex, '_');

      dynamicOptions.push(<option value={eVal} key={uuid.v4()}>{element}</option>);
    });
    dynamicOptions.push(<option value="-1" key={uuid.v4()}>Ignore</option>);

    let dynamicMappingRows = [];
    if (sheetData != null) {
      if (sheetData[1] != null) {
        for (let i = 0; i < sheetData[1].length; i++) {
          dynamicMappingRows.push(
            <tr key={uuid.v4()}>
              <td>{sheetData[1][i]}</td>
              <td><i className="fa fa-arrow-right" /></td>
              <td>
                <select className={classNames({ error: (selectionsWithErrors.indexOf(i) !== -1) })} key={uuid.v4()} value={selections.get(i) || '-1'} onChange={(e) => this.handleMappingChange(e, i)}>
                  {dynamicOptions}
                </select>
              </td>
            </tr>,
          );
        }
      }
    }

    if (dynamicMappingRows.length === 0) {
      return (<div />);
    }

    // Render all the things!
    return (
      <div>
        <div className="table-responsive">
          <table className="table table-bordered table-striped columnMappingTable">
            <thead>
              <tr>
                <th>This Data On Excel</th>
                <th>Represents</th>
                <th>What?</th>
              </tr>
            </thead>
            <tbody>{dynamicMappingRows}</tbody>
          </table>
        </div>
        {selectionsWithErrors.length > 0 && (
          <div className="mappingErrors">ERROR! You have mapped more than one Data to the same type. See the row highlighted in RED</div>
        )}
      </div>
    );
  }
}

XLSUploadColumnMappings.propTypes = {
  handleChangeMappings: PropTypes.func,
  serverColumnNames: PropTypes.arrayOf(PropTypes.string),
  sheetData: PropTypes.arrayOf(PropTypes.array),
};

XLSUploadColumnMappings.defaultProps = {
  handleChangeMappings: null,
  serverColumnNames: null,
  sheetData: null,
};

export default XLSUploadColumnMappings;
