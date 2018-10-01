For a recent project I needed to upload excel files and pass these into the Facebook API in a robust manner. I came across [SeunMatt/excel_uploader](https://github.com/SeunMatt/excel_uploader)  but we needed a React version for what we were doing at the time. I drafted this up quickly for local testing before integration.

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

### Components
The main component is XLSUpload however this does not contain the logic for processing the uploaded files. This is because that logic should roll up to whichever component or container is including it. I have create the XLSUploadWrapper as a Proof of Concept (PoC) for how you might handle the data.

### Server Side Handlers
There is a demo server side handler in the public folder which is from the original repo and would need to be midified to your specific needs.

### Dependencies
To install the actual dependencies required for this component into your own app before porting over you need to run the following command:

```npm install classnames file-loader file-saver sweetalert uuid xlsx --save```

### Compatibility Notes
Since this app was create with the create-react-app package it relies on webpack for it's build process. If you need to use this in gulp then you will need to take the SCSS file inclusions out of the JS files and load them separately or use an additional package top handle these accordingly.

### Known Issues
The code to process the uploads is not currently finished. The projec tis in a holding pattern while we determine if we are going to persue React for it due to time constraints. It should take only a few hours to finalize this area and given time I will work on this. In the meantime the code is as-is.
