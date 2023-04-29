import React, { useState } from 'react';
import { Document,Image, Page, Text, PDFDownloadLink } from '@react-pdf/renderer';
import { View } from '@react-pdf/renderer';

function Trial() {
  // Define the static data
  const data = {
    title: 'Invoice',
    content: 'This is some static data that will be included in the PDF document.'
  };

  // Define a state variable to keep track of whether the PDF document should be generated
  const [generatePDF, setGeneratePDF] = useState(false);

  // Define a function to handle the button click event and set the generatePDF state variable to true
  const handleClick = () => {
    setGeneratePDF(true);
  };
  const pdfStyles = {
    page: {
      border: 1, // border width
      borderColor: 'black', // border color
      borderStyle: 'solid', // border style
      padding: 100, // padding for the content inside the border
      margin:'10px'
    },
    body: {
      paddingTop: 35,
      paddingBottom: 65,
      paddingHorizontal: 35,
    },
    header: {
      fontSize: 12,
      marginBottom: 20,
      textAlign: 'center',
      color: 'grey',
    },
  };
  const PDFDocument = () => (
    <Document>
      <Page size="A4">
        <View style={{margin:10,border:2,height:830,width:575}}>
          <View>
            <img src="C:\Users\Kush\Documents\Python\twitter1.png"/>
          </View>
        </View>
      </Page>
    </Document>
  );
  return (
    <div>
      <button onClick={handleClick}>Generate PDF</button>
      {generatePDF && (
        <PDFDownloadLink document={<PDFDocument />} fileName="Invoice.pdf">
          Download PDF
        </PDFDownloadLink>
      )}
    </div>
  );
}

export default Trial;
