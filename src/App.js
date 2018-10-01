import React from 'react';
// import logo from './logo.svg';
import './App.css';
import XLSUploadWrapper from './components/XLSUploadWrapper';

const App = () => {
  return (
    <div className="App">
      <div className="card">
        <div className="card-header">
          <h3 className="">Import Data</h3>
        </div>

        <div className="card-body">
          <div className="row">
            <div className="col-sm-6">
              <XLSUploadWrapper numUploaders={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
