import React, { useState } from 'react';
import { Document, Page, Text, PDFDownloadLink } from '@react-pdf/renderer';

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

  // Define a function to render the PDF document
  const PDFDocument = () => (
    <Document>
      <Page>
        <Text>{data.title}</Text>
        <Text>{data.content}</Text>
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
