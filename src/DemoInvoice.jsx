import {
    Page,
    Text,
    View,
    Document,
    Image,
    StyleSheet,
    Font,
  } from "@react-pdf/renderer";
  import { pdfComponents, pdfStyles } from "../../components/pdf-formats";
  import { appLevelDefaults } from "../../appLevelDefaults";
  import { ogDefaultsCache, ogDataCache, userObjCache } from "../../utils/localCacheAPI";
  import { Difference_In_Days, fDate } from "../../utils/formatTime";
  import { Fragment } from 'react';
  import { DrCrFormat, fIndianFormat, formatGstStateCode, inWords } from "../../utils/formatNumber";
  
  
  // ----------------------------------------------------------------------
  
  // ----------------------------------------------------------------------
  
  const ChosenComponent = (props: any) => {
    const { choice } = props;
    const Component = pdfComponents[choice] || pdfComponents.emptyComponent;
    // console.log(Component);
    return <Component {...props} />;
  };
  
  // Create Document Component
  const InvoicePdf = ({ invObj, salesManObj }: any) => {
    Font.register({
      family: 'Roboto',
      fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
    });
    Font.register({
      family: 'Roboto-bold',
      fonts: [{ src: '/fonts/Roboto-Bold.ttf' }],
    });
  
    const ogDefaults: any = ogDefaultsCache.getItem();
    const userObj = userObjCache.getItem();
    const ogData: any = ogDataCache.getItem();
    console.log({invObj});
    const documentProps = {
      title: `Invoice Form - ${invObj?.buyerDetails?.companyName} - ${
        invObj?.supplierDetails?.companyName
      } - ${invObj?.serialNumber} - ${
        invObj?.supplierInvoiceDate &&
        new Date(invObj?.supplierInvoiceDate).toLocaleDateString()
      }`,
      author: `${localStorage?.getItem("username")}`,
      keywords: `Invoice Form, ${invObj?.serialNumber}, ${invObj?.buyerDetails?.companyName}, ${invObj?.supplierDetails?.companyName}`,
      creator: `https://smartagent.one`,
      producer: `${invObj?.owner?.companyName}`,
      language: "English",
      pageMode: "useThumbs",
      // onRender : func
    };
    const headerChoice =
      ogDefaults?.headerAndFooter?.invoiceFormHeader ||
      ogDefaults?.headerAndFooter?.defaultHeader ||
      appLevelDefaults?.defaultHeader;
    const footerChoice =
      ogDefaults?.headerAndFooter?.invoiceFormFooter ||
      ogDefaults?.headerAndFooter?.defaultFooter ||
      appLevelDefaults?.defaultFooter;
  
      const actualQtyUoms = Object.keys(invObj?.grandTotalProductQuantity?.actualQuantity || {});
      const billedQtyUoms = Object.keys(invObj?.grandTotalProductQuantity?.billedQuantity || {});
      const pdfData = {
        totalActualQuantity: Object.values(invObj?.grandTotalProductQuantity?.actualQuantity || {}).reduce((sum: number, qtyNum: any) => (sum + Number(qtyNum || 0)), 0),
        totalActualQuantityUom: (actualQtyUoms.length === 1) ? actualQtyUoms[0] : "",
        totalBilledQuantity: Object.values(invObj?.grandTotalProductQuantity?.billedQuantity || {}).reduce((sum: number, qtyNum: any) => (sum + Number(qtyNum || 0)), 0),
        totalBilledQuantityUom: (billedQtyUoms.length === 1) ? billedQtyUoms[0] : "",
        bankDetails: invObj?.supplierDetails?.bankDetails && {
          bankName: invObj.supplierDetails.bankDetails[0]?.bankName,
          bankAccountNumber: invObj.supplierDetails.bankDetails[0]?.bankAccountNumber,
          bankIfsc : invObj.supplierDetails.bankDetails[0]?.bankIfsc
        }
        
      };
    
    return (
      // @ts-ignore
      <Document {...documentProps}>
        <Page size="A4" orientation="portrait" style={[pdfStyles.page]}>
        <View style={{...pdfStyles.allSideBorder,flexGrow:50}}>
        <ChosenComponent
              choice={headerChoice}
              headerRightStrings={[
                `Agt. Ref. No. : ${invObj?.serialNumber}`,
                `Agt. Ref. Date : ${invObj?.voucherDate && fDate(invObj?.voucherDate)}`,
              ]}
              ogData={ogData}
              ownerObj={invObj.owner}
              fixed={true}
              styles={pdfStyles}
            />
          <View style={{textAlign: "center",fontSize: 12,fontWeight: 500,borderBottom:1,marginVertical:1}}>
            <Text>DISPATCH ADVICE</Text>
          </View>
          <View style={{...pdfStyles.gridContainer,borderBottom:1}}>
            {/* flex column */}
            <View style={{flexDirection:'column'}}>
            <Text style={{fontSize: 10,fontWeight:700}}>M/S.{" "} <Text style={{fontSize: 10,marginLeft:5,fontFamily:"Roboto-bold"}}>{invObj.buyerDetails.companyName}</Text></Text>
            <View style={{ width: "60%", alignItems: "flex-start",marginLeft:2 }}>
              <View style={{marginLeft:25}}>
                <Text style={{fontSize:9}}>
                  {Boolean(invObj?.buyerDetails?.addressDetails) &&
                    `${invObj?.buyerDetails?.addressDetails[0]?.address || ""}  ${
                      (invObj?.buyerDetails?.addressDetails[0]?.pinCode &&
                        `- ${invObj?.buyerDetails?.addressDetails[0]?.pinCode}`) ||
                      ""
                    }`}
                </Text>
                
                {Boolean(invObj?.buyerDetails?.addressDetails && invObj?.buyerDetails?.addressDetails[0]) && (
                  <Text style={{fontSize:9}}>Branch: {invObj.buyerDetails.addressDetails[0]?.branch || ""}</Text>
                )}
                {Boolean(invObj?.buyerDetails?.gstNumber) && (
                  <View>
                    <Text style={{fontSize:9}}>GSTIN: {invObj.buyerDetails.gstNumber}</Text>
                    <Text style={{fontSize:9}}>State Code : <Text style={{fontSize:9,textTransform: 'uppercase'}}>{formatGstStateCode(invObj.buyerDetails.gstNumber)} </Text></Text>
                  </View>
                  )}
                  <Text style={{fontSize:9}}>Sub Broker: {invObj?.buyerDetails?.subBrokerDetails?.companyName||""}</Text>
                  <Text style={{fontSize:10}}>Sales Man : <Text style={{fontSize: 10,marginLeft:5,fontFamily:"Roboto-bold"}}>{invObj?.salesMan?.userName?.toUpperCase()}</Text></Text>
              </View>
              </View>
            </View>
                <View style={{flexDirection:'row'}}>
                    <View style={{flexDirection:'column',alignItems:'flex-start',paddingLeft:15,paddingRight:3}}>
                      <Text style={{fontSize:10}}>Sup.Inv.No.</Text>
                      <Text style={{fontSize:10}}>Sup.Inv.Date</Text>
                      <Text style={{fontSize:10}}>Sup.Order.No.</Text>
                      <Text style={{fontSize:10}}>Buyer.PO.No.</Text>
                    </View>
                    <View style={{flexDirection:'column',alignItems:'flex-end'}}>
                      <Text style={{fontSize:10}}>:</Text>
                      <Text style={{fontSize:10}}>:</Text>
                      <Text style={{fontSize:10}}>:</Text>
                      <Text style={{fontSize:10}}>:</Text>
                    </View>
                    <View style={{flexDirection:'column',alignItems:'flex-start',paddingLeft:3,paddingRight:3}}>
                      <Text style={{marginRight:5,fontFamily:"Roboto-bold",fontSize:10,textAlign:"left"}}>{invObj?.supplierInvoiceNumber}</Text>
                      <Text style={{marginRight:5,fontFamily:"Roboto-bold",fontSize:10,textAlign:'left'}}>{invObj?.supplierInvoiceDate && fDate(invObj?.supplierInvoiceDate)}</Text>
                      <Text style={{marginRight:5,fontFamily:"Roboto-bold",fontSize:10,textAlign:'left'}}>{invObj?.againstOrder?.serialNumber||"-"}</Text>
                      <Text style={{marginRight:5,fontFamily:"Roboto-bold",fontSize:10,textAlign:'left'}}>{invObj?.againstOrder?.buyerOrderNumber||"-"}</Text>
                </View>
            </View>
          </View>
          <Text style={{fontSize:9,overflow:'hidden'}}>Sent by : <Text style={{fontSize: 10,marginLeft:5,fontFamily:"Roboto-bold"}}>{invObj?.supplierDetails?.companyName || ""}</Text> {Boolean(invObj?.buyerDetails?.addressDetails) &&
                    `${invObj?.supplierDetails?.addressDetails[0]?.address || ""}  ${
                      (invObj?.supplierDetails?.addressDetails[0]?.pinCode &&
                        `- ${invObj?.supplierDetails?.addressDetails[0]?.pinCode}`) ||
                      ""
                    }`}</Text>
          
                {Boolean(invObj?.supplierDetails?.gstNumber) && (
                  <View>
                    <Text style={{fontSize:9,marginLeft:35}}>GSTIN: {invObj.supplierDetails.gstNumber}</Text>
                    <Text style={{fontSize:9}}>State Code : <Text style={{fontSize:9,textTransform: 'uppercase'}}>{formatGstStateCode(invObj.supplierDetails.gstNumber)} </Text></Text>
                  </View>
                  )}
          <Text style={{fontSize: 10,fontWeight: 700}}>Transport Details:</Text>
          <View style={{...pdfStyles.gridContainer,marginBottom:3}}>
                <View style={{flexDirection:'column',marginLeft:20}}>
                  {Boolean(invObj?.deliveryDetails[0]) && invObj?.deliveryDetails.map((transport:any,index:number)=>(
                    <View style={{flexDirection:'row'}}>
                      <Text style={{fontSize: 9,fontWeight: 700,width:'55%'}}>{index+1}. <Text style={{fontSize: 9,marginLeft:5,fontFamily:"Roboto-bold"}}>{transport?.companyName}{" - "}{transport?.branchName}</Text></Text>
                      <Text style={{marginLeft:7,fontSize: 10,fontWeight: 700}}>LR No. : <Text style={{fontSize: 9,marginLeft:5,fontFamily:"Roboto-bold"}}>{transport?.consignmentNumber}</Text></Text>
                      <Text style={{marginLeft:7,fontSize: 10,fontWeight: 700}}>Case No. : <Text style={{fontSize: 9,marginLeft:5,fontFamily:"Roboto-bold"}}>{ transport?.numberOfBale}</Text></Text>
                      <Text style={{marginLeft:7,fontSize: 10,fontWeight: 700}}>LR Date : <Text style={{fontSize: 9,marginLeft:5,fontFamily:"Roboto-bold"}}>{transport?.consignmentDate && fDate(transport?.consignmentDate)}</Text></Text>
                    </View>
                  ))}
            </View>
          </View>
          <View style={{ flexDirection: "row", textAlign: "center", ...pdfStyles.bottomBorder,...pdfStyles.topBorder }}>
                {/* @ts-ignore */}
              <Text style={{ width: "6%", padding: 1, textTransform: 'none' }}>Sr.</Text>
              <Text style={{ width: "10%", ...pdfStyles.tableCell }}>Image</Text>
              <Text style={{ width: "15%", ...pdfStyles.tableCell }}>Quality</Text>
              <Text style={{ width: "27%", ...pdfStyles.tableCell }}>Description</Text>
              <Text style={{ width: "13%", ...pdfStyles.tableCell }}>Actual Qty</Text>
              <Text style={{ width: "13%", ...pdfStyles.tableCell }}>Billed Qty</Text>
              <Text style={{ width: "10%", ...pdfStyles.tableCell }}>Price</Text>
              <Text style={{ width: "20%", ...pdfStyles.tableCell }}>Amount</Text>
          </View>
          {Boolean(invObj?.products) && Boolean(invObj?.products[0]?.amount||invObj?.products[0]?.actualQuantity ||invObj?.products[0]?.billedQuantity|| invObj?.products[0]?.description)
              && invObj.products.map((product:any, prodIndex:number) =>
                <Fragment>
                <View  key={prodIndex} wrap style={{ flexDirection: "row", fontSize: 10, textAlign: "center",borderTopWidth: (prodIndex > 0) && invObj.products[prodIndex-1]?.variationsBreakdown && invObj.products[prodIndex-1]?.variationsBreakdown[0].name ?1:0}}>
                    <Text style={{ width: "6%", padding: 1 }}>{prodIndex + 1}</Text>
                    <View style={{ width: "10%", ...pdfStyles.tableCell, alignItems: "center", justifyContent: "center" }}>
                        {Boolean(product.imageFieldName)&& Boolean(invObj?._attachments)&& Boolean(invObj?._attachments[product?.imageFieldName]) &&
                            // @ts-ignore
                            <Image source={invObj?._attachments[product?.imageFieldName]?.data?.preview} style={{ width: "95%" }} />
                        }
                    </View>
                    <Text style={{ width: "15%", ...pdfStyles.tableCell ,textTransform: 'uppercase'}}>{product.name}</Text>
                    <Text style={{ width: "27%", ...pdfStyles.tableCell ,textTransform: 'uppercase'}}>{product.description}</Text>
                    <Text style={{ width: "13%", ...pdfStyles.tableCell, textTransform: 'uppercase', textAlign:"right" }}>{product.actualQuantity ? `${product.actualQuantity} ${product?.actualQuantityUom}`:" "}</Text>
                    <Text style={{ width: "13%", ...pdfStyles.tableCell, textTransform: 'uppercase', textAlign: "right" }}>{product.billedQuantity ? `${product.billedQuantity} ${product?.billedQuantityUom}`:" "}</Text>
                    <Text style={{ width: "10%", ...pdfStyles.tableCell, textTransform: 'uppercase' }}>{((product.minPrice && product.maxPrice)||invObj?.priceRangeCheckBox)?`${product.minPrice} to ${product.maxPrice}`:product.price||""}</Text>
                    <Text style={{ width: "20%", ...pdfStyles.tableCell ,textTransform: 'uppercase', textAlign:"right"}}>{fIndianFormat(product?.amount)}</Text>
                </View>
                {Boolean(product?.variationsBreakdown) && Boolean(product?.variationsBreakdown[0]) && Boolean(product?.variationsBreakdown[0]?.name)&& product.variationsBreakdown.some((product:any)=> product.price||product.quantity) && (
                  <View style={{ flexDirection: "row", ...pdfStyles.topBorder }} wrap>
                      <View style={{ width: "9%", flexDirection: "column", ...pdfStyles.rightBorder, textAlign: "center" }}>
                          <Text style={{ ...pdfStyles.bottomBorder, padding: 1 }}>Size</Text>
                          <Text style={{ ...pdfStyles.bottomBorder, padding: 1 }}>Qty</Text>
                          <Text style={{ padding: 1 }}>Price</Text>
                      </View>
                      {product.variationsBreakdown.map((sizeDetails:any, sizeIndex:number) =>
                              <View key={sizeDetails.name + sizeIndex} style={{ flexDirection: "column", ...pdfStyles.rightBorder, textAlign: "center" }}>
                              <View style={{ ...pdfStyles.bottomBorder, paddingHorizontal: 4 }} >
                                  <Text style={{ margin:"auto", padding: 1 }}>{sizeDetails.name || "-"}</Text>
                              </View>
                              <View style={{ ...pdfStyles.bottomBorder, paddingHorizontal: 4 }} >
                                  <Text style={{ margin:"auto", padding: 1 }}>{sizeDetails.quantity || " "}</Text>
                              </View>
                              <View>
                                  <Text style={{ margin:"auto", padding: 1, paddingHorizontal: 4 }}>{sizeDetails.price || " "}</Text>
                              </View>
                            
                          </View>
                      )}
                  </View>
                  )}
              </Fragment>
              )}
              <View style={{flexGrow:500}}>
                {/* for extending the columns */}
              <View   style={{ flexDirection: "row",flexGrow:100}}>
                    <Text style={{ width: "6%", padding: 1 }}></Text>
                    <View style={{ width: "10%", ...pdfStyles.tableCell, alignItems: "center", justifyContent: "center" }}>
                    </View>
                    <Text style={{ width: "15%", ...pdfStyles.tableCell }}></Text>
                    <Text style={{ width: "27%", ...pdfStyles.tableCell }}></Text>
                    <Text style={{ width: "13%", ...pdfStyles.tableCell, textTransform: 'lowercase' }}></Text>
                    <Text style={{ width: "13%", ...pdfStyles.tableCell, textTransform: 'lowercase' }}></Text>
                    <Text style={{ width: "10%", ...pdfStyles.tableCell, textTransform: 'lowercase' }}></Text>
                    <Text style={{ width: "20%", ...pdfStyles.tableCell }}></Text>
              </View>
              </View>
          <View style={{ flexDirection: "row", textAlign: "center", ...pdfStyles.topBorder,...pdfStyles.bottomBorder }}>
                {/* @ts-ignore */}
              <Text style={{ width: "6%", padding: 1, textTransform: 'none' }}></Text>
              <Text style={{ width: "10%" }}></Text>
              <Text style={{ width: "15%" }}></Text>
              <Text style={{ width: "27%",fontFamily:"Roboto-bold", textAlign:"right", fontSize:10 ,paddingRight:1}}>Sub Total</Text>
              <Text style={{fontFamily:"Roboto-bold", width: "13%",...pdfStyles.tableCell, textAlign:"right", fontSize:10 ,textTransform: 'uppercase'}}>
                {pdfData.totalActualQuantityUom ? `${pdfData.totalActualQuantity} ${pdfData.totalActualQuantityUom}` : ""}
              </Text>
              <Text style={{fontFamily:"Roboto-bold", width: "13%",...pdfStyles.tableCell, textAlign:"right", fontSize:10 ,textTransform: 'uppercase'}}>
                {pdfData.totalBilledQuantityUom ? `${pdfData.totalBilledQuantity} ${pdfData.totalBilledQuantityUom}` : ""}
              </Text>
              <Text style={{ width: "10%" ,...pdfStyles.tableCell}}></Text>
              <Text style={{fontFamily:"Roboto-bold",width: "20%",...pdfStyles.tableCell, textAlign:"right", fontSize:10}}>{fIndianFormat((invObj?.grandTotalProductAmount && invObj?.grandTotalProductAmount?.toFixed(2))||0.00)}</Text>
          </View>
            <View wrap={false}>
                <View style={{  ...pdfStyles.gridContainer}}>
                    <View style={{marginLeft:2,maxWidth:"75%"}} >
                        <Text style={pdfStyles.bold500}>Notes:</Text>
                        <Text style={{maxLines:4, overflow:"hidden"}}>{invObj?.invoiceNotes}</Text>
                    </View>
                    <View style={{flexDirection:'row', justifyContent:'flex-end', minWidth: "25%"}}>
                      <View style={{flexDirection:'column',alignItems:'flex-end', marginRight:2}}>
                        {invObj?.otherCharges.some((otherCharge:any)=>otherCharge?.chargeAmount) && invObj?.otherCharges.map((otherCharge:any,index:number)=>(
                          <Text style={{fontSize:10}}>{otherCharge?.chargeName}{otherCharge?.chargePercent?`@${Math.abs(otherCharge?.chargePercent)}%`:""}{" "}:</Text>
                        ))}
                        <Text style={{fontSize:10}}>Taxable Amt.{" "}:</Text>
                        <Text style={{fontSize:10}}>Tax (GST){" "}:</Text>
                      </View>
                      <View style={{flexDirection:'column',alignItems:'flex-end'}}>
                        {invObj?.otherCharges.some((otherCharge:any)=>otherCharge?.chargeAmount) && invObj?.otherCharges.map((otherCharge:any,index:number)=>(
                          <Text style={{alignItems:"flex-end",fontFamily:"Roboto-bold",fontSize:10}}>{fIndianFormat((otherCharge?.chargeAmount&&otherCharge?.chargeAmount?.toFixed(2))||0)}</Text>
                        ))}
                        <Text style={{fontFamily:"Roboto-bold",fontSize:10}}>{fIndianFormat((invObj?.grandTotalGrossAmount && invObj?.grandTotalGrossAmount?.toFixed(2))||0)}</Text>   
                        <Text style={{fontFamily:"Roboto-bold",fontSize:10}}>{fIndianFormat((invObj?.grandTotalTaxAmount && invObj?.grandTotalTaxAmount?.toFixed(2))||0)}</Text>   
                      </View>
                    </View>
                </View>
            </View>
            <View style={{...pdfStyles.gridContainer,borderBottom:1,...pdfStyles.topBorder}}>
              <Text style={{marginLeft:2,fontFamily:"Roboto-bold"}}>Due Date : {fDate(invObj?.dueDate)}</Text>
              <Text style={{marginLeft:2,fontFamily:"Roboto-bold"}}>Payment Within {invObj?.dueDate && invObj?.supplierInvoiceDate &&  Difference_In_Days(invObj?.dueDate, invObj?.supplierInvoiceDate)} days</Text>
              <Text style={{marginLeft:2,fontFamily:"Roboto-bold"}}>Net Amount Rs. <Text style={{paddingRight:5,fontFamily:"Roboto-bold"}}>{fIndianFormat((invObj?.grandTotalVoucherAmount && invObj?.grandTotalVoucherAmount?.toFixed(2))||0)}</Text></Text>
            </View>
            <View style={{...pdfStyles.gridContainer,borderBottom:1}}>
              <Text style={{marginLeft:2,marginVertical:1,alignItems:'center'}}>Rs.(In Words) : <Text style={{marginRight:5,fontSize:10,textTransform: 'uppercase'}}>{invObj?.grandTotalVoucherAmount && inWords(invObj?.grandTotalVoucherAmount)}</Text></Text>
              
            </View>
            
  
            
            <View style={{...pdfStyles.gridContainer}} wrap>
              <View style={{alignItems:'flex-start',width:"70%"}}>
              <View style={{marginLeft:2}}>
                  <Text style={{fontSize: 10,fontWeight: 700}}>
                    Terms & Conditions
                  </Text>
                  <Text style={{fontSize: 8,fontWeight: 700}}>
                  {ogDefaults?.invoiceTermsAndConditions || appLevelDefaults.invoiceTermsAndConditions}
                  </Text>
                <View>
                <View>
                  <Text style={{fontSize: 9,fontWeight: 400,marginTop:2}}>
                    Payment must me made in favour of <Text style={{marginRight:5,fontFamily:"Roboto-bold",fontSize:10}}>"{invObj?.supplierDetails?.companyName}"</Text>, by Payees Cheque/Draft only.
                  </Text>
                  <Text style={{fontSize: 10, fontWeight:"heavy" }}>
                    Bank:<Text style={{marginRight:5,fontFamily:"Roboto-bold",fontSize:10}}>{invObj?.supplierDetails?.bankDetails && invObj?.supplierDetails?.bankDetails[0]?.bankName}</Text>, A/C No.: <Text style={{marginRight:5,fontFamily:"Roboto-bold",fontSize:10}}>{invObj?.supplierDetails?.bankDetails && invObj?.supplierDetails?.bankDetails[0]?.bankAccountNumber}</Text>, IFSC: <Text style={{marginRight:5,fontFamily:"Roboto-bold",fontSize:10}}>{invObj?.supplierDetails?.bankDetails && invObj?.supplierDetails?.bankDetails[0]?.bankIfsc}</Text>
                  </Text>
                </View>
                <Text style={{marginTop:5,marginLeft:5,fontFamily:"Roboto-bold",fontSize:10}}>E. & O.E.</Text>
                </View>
                </View>
              </View>
              <View style={{alignItems:'flex-end',width:"30%"}}>
                  <Text style={{ borderTopWidth: 1, paddingTop: 6,marginTop:70,marginRight:10 }}>
                    Authorised Signatory
                  </Text>
              </View>
            </View>
           
        </View>
        <ChosenComponent
              choice={footerChoice}
              ogData={ogData}
              fixed={true}
              printedBy={userObj?.userName}
              border={false}
              styles={pdfStyles}
            />
        </Page>
        {Boolean(invObj?.products) && Boolean(invObj?.products[0]?.amount||invObj?.products[0]?.actualQuantity ||invObj?.products[0]?.billedQuantity|| invObj?.products[0]?.description) && Boolean(invObj?._attachments) && Boolean(Object.keys(invObj?._attachments || {}).length!==0)&&(
        <Page size="A4" orientation="portrait" style={[pdfStyles.page]}>
        <View wrap>
          {Object.values(invObj?._attachments || {}).some((attmObj: any) => Boolean(attmObj?.data?.preview)) && (
                  <View>
                      <Text style={{ ...pdfStyles.bold500, marginVertical: 10 }}>Images:</Text>
                    <View style={{ marginTop: 10 }}>
                        {Object.values(invObj?.products || {}).map((prodObj, prodIndex:any, array:any) =>
                        ((prodIndex % 4) === 0 &&
                            <View key={prodIndex} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                {console.log({ prodIndex })}
                                {array[prodIndex]?.imageFieldName && invObj?._attachments[array[prodIndex]?.imageFieldName]&&
                                    <Image source={invObj?._attachments[array[prodIndex]?.imageFieldName]?.data?.preview} style={{ width: "24%", margin: 1 }} />
                                }
                                {array[prodIndex + 1]?.imageFieldName && invObj?._attachments[array[prodIndex + 1]?.imageFieldName]&&
                                    <Image source={invObj?._attachments[array[prodIndex + 1]?.imageFieldName]?.data?.preview} style={{ width: "24%", margin: 1 }} />
                                }
                                {array[prodIndex + 2]?.imageFieldName &&invObj?._attachments[array[prodIndex + 2]?.imageFieldName] &&
                                    <Image source={invObj?._attachments[array[prodIndex + 2]?.imageFieldName]?.data?.preview} style={{ width: "24%", margin: 1 }} />
                                }
                                {array[prodIndex + 3]?.imageFieldName && invObj?._attachments[array[prodIndex + 3]?.imageFieldName]&&
                                    <Image source={invObj?._attachments[array[prodIndex + 3]?.imageFieldName]?.data?.preview} style={{ width: "24%", margin: 1 }} />
                                }
                            </View>
                        )
                        )}
                    </View>
                </View>
            )}
            </View>
        </Page>
        )}
      </Document>
    );
  };
  
  export default InvoicePdf;