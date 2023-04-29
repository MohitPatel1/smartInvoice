import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { saveAs } from 'file-saver';

const InvoicePDF = ({ data }) => {

  // Define styles for the components
  const styles = {
    page: {
      padding: "1cm",
      flexDirection: "column",
      backgroundColor: "#FFFFFF",
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderColor: "#000",
      flexGrow: 1,
      margin: 5,
      padding: 5,
    },
    tableHeader: {
      fontWeight: "bold",
    },
  };

  // Define the function to download the PDF
  const downloadPDF = () => {
    const blob = pdfBlob();
    saveAs(blob, "invoice.pdf");
  };

  // Define the function to generate the PDF
  const pdfBlob = () => {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text>Invoice</Text>
            <View style={styles.tableRow}>
              <Text style={[styles.tableHeader]}>Sr. No</Text>
              <Text style={[styles.tableHeader]}>Product Name</Text>
              <Text style={[styles.tableHeader]}>No. of Quantity</Text>
              <Text style={[styles.tableHeader]}>Price of Product</Text>
              <Text style={[styles.tableHeader]}>Total Amount</Text>
            </View>
            {data.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text>{index + 1}</Text>
                <Text>{item.productName}</Text>
                <Text>{item.quantity}</Text>
                <Text>{item.price}</Text>
                <Text>{item.total}</Text>
              </View>
            ))}
          </View>
        </Page>
      </Document>
    ).toBlob();
  };

  return (
    <div>
      <button onClick={downloadPDF}>Download Invoice</button>
    </div>
  );
};

export default InvoicePDF;
