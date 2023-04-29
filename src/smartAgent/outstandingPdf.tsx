// share button

import { Box, Container, Grid, Divider, Link, Paper, Dialog, DialogTitle, DialogActions, Button, Checkbox, FormControlLabel, FormLabel, Radio, RadioGroup, FormControl, IconButton, Stack, Typography, useTheme, Modal, Skeleton, Tooltip, CircularProgress } from '@mui/material'
import React, { Fragment, useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form';
import CommonNewEditAddress from '../../components/CommonNewEditAddress'
import { DataGrid, GridColDef, GridToolbarFilterButton, GridToolbarContainer, gridVisibleSortedRowIdsSelector } from '@mui/x-data-grid';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import FormProvider from '../../components/hook-form-elements/FormProvider';
import Label from '../../components/Label';
import Page from '../../components/Page';
import SvgIconStyle from '../../components/SvgIconStyle';
import DocViewToolbar from "../../components/DocViewToolbar";
import { fIndianFormat } from "../../utils/formatNumber";
import { LoadingButton } from "@mui/lab";
import { hybridDB } from '../../hooks/database/useMasterDB';
import useResponsive from '../../hooks/useResponsive';
import { PATH_OBJ } from '../../router';
import { fIndianAmount } from '../../utils/formatNumber';
import { fDate, fddMMM, dateDiffInDays } from '../../utils/formatTime';
import { MobilePdfShare, PdfRenderView } from '../../components/pdfActionButtons';
import PaymentPendingpdf from './PaymentPendingpdf';
import Iconify from "../../components/Iconify";
import { BlobProvider, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { width } from '@mui/system';
import { DatePicker } from "@mui/x-date-pickers";
import { WidthFull } from '@mui/icons-material';
import RHFDatePicker from '../../components/hook-form-elements/RHFDatePicker';
import { any, bool, number } from 'prop-types';
import CheckBox from '@mui/icons-material/CheckBox';
// ----------------------------------------------------------------------
interface BuyerInfoInterface {
  invoiceTotal: number;
  outstanding: number;
  nextWeekDue: number;
  overdue: number;
  companyName?: string
}

const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

function PendingPaymentList() {

  const upMd = useResponsive("up", "md");
  const [pdfView, setPdfView] = useState(false);
  const theme = useTheme();

  const [paymentData, setPaymentData] = useState<any>([]);
  const [enablePrintButton, setEnablePrintButton] = useState<any>(false);
  const [pdfPaymentData, setPdfPaymentData] = useState<any>({});
  const [pdfSettings, setPdfSettings] = useState({ popUp: false, filter: 'outstanding', grouping: 'supplier', paymentDetails: false, lrDetails: false });
  const [pdfComponent, setPdfComponent] = useState<any>(null)
  const invoiceData: any[] = [];

  const defaultValues = {
    buyerDetails: ""
  }

  const formMethods = useForm({
    defaultValues
  });

  useEffect(() => {
    if (pdfPaymentData) {
      setPdfComponent(<PaymentPendingpdf
        data={pdfPaymentData}
        selection={pdfSettings}
      />
      )
    }
  }, [pdfPaymentData, pdfView, pdfSettings])

  const {
    setValue,
    reset,
    getValues,
    handleSubmit,
    setError,
    watch,
    control,
    formState: { dirtyFields, errors, isDirty, isSubmitting },
  }: any = formMethods;

  const clientSelection = (value: any) => {
    console.log(value);
    setValue("buyerDetails", value);
  }

  const clientCompany = useWatch({
    control: control,
    name: "buyerDetails"
  })

  const getPdf = () => {
    setPdfView(true)
    setPdfSettings({ ...pdfSettings, popUp: false })
  }

  useEffect(() => {
    if (clientCompany && clientCompany?._id) {
      if (clientCompany?.category) {
        hybridDB.query("invoices/invoices_buyer_wise", {
          stale: "update_after",
          group_level: 3,
          startkey: [clientCompany?._id],
          endkey: [clientCompany?._id, '\ufff0'],
          reduce: true
        }).then((res: any) => {
          console.log('%c invoices_buyer_wise', 'background: #ffc0cb; color: ##00ff00', res)
          const today = new Date()
          let currentSupplierId = '';
          let supplierTitleIndex = 0;
          let CD = '-';

          const buyerDetails: BuyerInfoInterface = {
            invoiceTotal: 0,
            outstanding: 0,
            nextWeekDue: 0,
            overdue: 0,
            companyName: res?.rows[0]?.value?.buyerDetails?.companyName
          };

          setPaymentData(res.rows?.map((item: any) => item.value).filter((item: any) => item?.outstandingAmount > 0));

          (res.rows && res.rows.forEach((invoice: any, index: number, invoicesArray: any) => {
            // If new supplier comes push supplier title element
            // key[1] = supplier ID
            if (invoice?.key[1] !== currentSupplierId) {
              // reset supplier id
              currentSupplierId = invoice?.key[1]
              // reset supplier title index
              supplierTitleIndex = invoiceData.length
              // append supplier title element to invoiceData
              invoiceData.push({
                supplierInvoiceTotal: 0,
                supplierOutstanding: 0,
                supplierNextWeekDue: 0,
                supplierOverDue: 0,
                supplierName: invoice?.value?.supplierDetails?.companyName
              })
            }
            // for all invoices push invoice data
            // calculate days after due date = dueDayDiff              
            const dueDayDiff = dateDiffInDays(new Date(invoice?.value?.dueDate), today);
            // update buyer,supplier outstanding              
            buyerDetails.outstanding += invoice?.value?.outstandingAmount
            invoiceData[supplierTitleIndex].supplierOutstanding += invoice?.value?.outstandingAmount
            // if Due day has passed 
            if (dueDayDiff > 0) {
              // update supplier,buyer overdue ammount
              invoiceData[supplierTitleIndex].supplierOverDue += invoice?.value?.outstandingAmount
              buyerDetails.overdue += invoice?.value?.outstandingAmount
            }
            // if Due day is in next week
            else if (dueDayDiff > -7) {
              // update supplier,buyer next week due ammount                  
              invoiceData[supplierTitleIndex].supplierNextWeekDue += invoice?.value?.outstandingAmount
              buyerDetails.nextWeekDue += invoice?.value?.outstandingAmount
            }
            // add invoice amount to supplier, buyer invoice ammount
            invoiceData[supplierTitleIndex].supplierInvoiceTotal += Number(invoice?.value?.grandTotalVoucherAmount) || 0
            buyerDetails.invoiceTotal += Number(invoice?.value?.grandTotalVoucherAmount) || 0
            // calculate Cash Discount
            CD = (-1 * (invoice?.value?.cdObject?.chargePercent)) ? `${-1 * (invoice?.value?.cdObject?.chargePercent)}%` : "-"

            invoiceData.push(
              {
                invoiceId: invoice.key[2],
                invoiceOutstanding: invoice?.value?.outstandingAmount,
                invoiceDueDate: invoice?.value?.dueDate,
                invoiceDate: invoice?.value.supplierInvoiceDate,
                invoiceNumber: invoice?.value.supplierInvoiceNumber,
                invoiceAmt: invoice?.value.grandTotalVoucherAmount,
                supplierName: invoice?.value.supplierDetails.companyName,
                days: dateDiffInDays(new Date(invoice?.value.supplierInvoiceDate), today),
                supplierTitleIndex,
                dueDayDiff,
                CD,
              });
          }))

          setPdfPaymentData({
            // We should get buyer company name from buyer select, in case a buyer has no invoices.
            key: buyerDetails,
            value: invoiceData
          })
          setEnablePrintButton(true)
        }
        ).catch((err: any) => {
          console.log("invoices_buyer_wise", err);
        }
        )
      }
    }
  }, [clientCompany])



  const invoiceStatusFormat = (status: any, outstandingAmount: any, grandTotalVoucherAmount: any) => {
    let color = "default";
    let value = "";
    if (status == "10draft") {
      color = "info"
      value = "draft"
    } else if (outstandingAmount === 0) {
      color = "success",
        value = "paid"
    } else if (Number(outstandingAmount) > Number(grandTotalVoucherAmount) || outstandingAmount < 0) {
      color = "error",
        value = "alert"
    } else if (Number(outstandingAmount) < Number(grandTotalVoucherAmount)) {
      color = "secondary",
        value = "part"
    } else if (Number(outstandingAmount) == Number(grandTotalVoucherAmount)) {
      color = "warning",
        value = "unpaid"
    } else {
      color = "warning",
        value = "unpaid"
    }

    return { color: color, value: value }
  }
  const columns: GridColDef[] = [
    {
      field: 'buyerDetails',
      headerName: 'Client Details',
      width: 300,
      headerAlign: 'center',
      renderCell: (params: any) => (
        <Fragment>
          <Stack sx={{ paddingY: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {params.row?.buyerDetails?.companyName}
            </Typography>
            <Typography variant="body2" noWrap>
              Salesman: {params.row?.salesMan}
            </Typography>
          </Stack>
        </Fragment>
      ),
    },
    {
      field: 'supplierDetails',
      headerName: 'Supplier Details',
      width: 300,
      headerAlign: 'center',
      renderCell: (params: any) => (
        <Fragment>
          <Stack sx={{ paddingY: 1 }}>
            <Typography variant="body2" noWrap>
              {params.row?.supplierDetails?.companyName}
            </Typography>
          </Stack>
        </Fragment>
      ),
    },
    {
      field: "voucherDate",
      headerName: 'Invoice Details',
      width: 200,
      renderCell: (params: any) => (
        <Stack>
          <Link
            noWrap
            variant="body2"
            sx={{ color: "text.disabled", cursor: "pointer" }}
          >
            {params.row?.serialNumber}
          </Link>
          <Typography variant="body2" noWrap>
            Supp Inv: {params.row.supplierInvoiceNumber}
          </Typography>
          <Typography variant="body2" noWrap>
            Supp Dt: {params.row.supplierInvoiceDate && fDate(params.row.supplierInvoiceDate)}
          </Typography>
        </Stack>
      )
    },
    {
      field: "Invt&pendingAmt",
      headerName: 'Pending Amt',
      width: 200,
      headerAlign: "center",
      renderCell: (params: any) => (

        <Typography variant="body2" noWrap textAlign={'center'}>

          <SvgIconStyle
            src={`/icons/Rupee-Symbol-Black.svg`}
            width={15}
            height={10}
          />
          {" " + fIndianAmount(params.row?.outstandingAmount, 0)}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <Stack spacing={1} >
          <Label
            variant={
              theme.palette.mode === "light" ? "ghost" : "filled"
            }
            color={invoiceStatusFormat(params.row?.status, params.row?.outstandingAmount, params.row?.grandTotalVoucherAmount).color}
            sx={{ textTransform: "capitalize" }}
          >
            {invoiceStatusFormat(params.row?.status, params.row?.outstandingAmount, params.row?.grandTotalVoucherAmount).value}
          </Label>
          {params.row?.dueDate <= new Date().toISOString() && (params.row?.status === "unpaid" || params.row?.status === "part") &&
            <Label
              variant={
                theme.palette.mode === "light" ? "ghost" : "filled"
              }
              color="error"
              sx={{ textTransform: "capitalize" }}
            >
              Overdue
            </Label>
          }
        </Stack>
      )
    }
  ];
  return (
    <Page title={PATH_OBJ.payment.children.pendingPayment.title}>
      <Container maxWidth={"lg"}>
        <HeaderBreadcrumbs
          heading={"pending Payments"}
          links={[
            { name: "Dashboard", href: PATH_OBJ.home.path },
            { name: "Payment List", href: PATH_OBJ.payment.children.list.path },
            { name: "Create payment", href: PATH_OBJ.payment.path },
            { name: "Outstanding List" },
          ]}
          sx={{ textTransform: "capitalize" }}
        />
        <FormProvider methods={formMethods} >
          <Stack
            spacing={{ xs: 2, md: 5 }}
            direction={{ xs: "column", md: "row" }}
            divider={
              <Divider
                flexItem
                orientation={upMd ? "vertical" : "horizontal"}
                sx={{ borderStyle: "dashed" }}
              />
            }
            sx={{ borderRadius: 1, my: 2 }}
          >
            <CommonNewEditAddress
              rightLabel="Buyer"
              addressType='buyer'
              rightOnSelect={clientSelection}
              sx={{ width: 1 }}
            />
            <Container sx={{ width: "100%", display: 'flex', alignItems: "center", justifyContent: "center" }}>
              {enablePrintButton &&
                <Button sx={{ width: "30%", height: "20%" }} variant="contained" onClick={() => setPdfSettings({ ...pdfSettings, popUp: true })}
                // allow popup on get pdf click for now, after we give report to frontend we will disable this. and add popup to buyer select                    
                >
                  Get PDF
                </Button>}
            </Container>


            {/* <Grid container spacing={2}>                                                                      
                    <Grid item xs={5}>                                                                                                                                  
                          <FormLabel id="demo-radio-buttons-group-label">Grouping</FormLabel>
                            <RadioGroup                                             
                                defaultValue="suplier"
                                name="group-level-1">
                                <FormControlLabel value="none" control={<Radio />} label="None" />
                                <FormControlLabel value="suplier" control={<Radio />} label="Supplier" />
                                <FormControlLabel value="supplierGroup" control={<Radio />} label="Supplier Group" />
                            </RadioGroup>
                    </Grid>
                    <Grid item xs={7}>
                            <FormLabel id="demo-radio-buttons-group-label">Filter 2</FormLabel>
                              <RadioGroup                                             
                                  defaultValue="suplier"
                                  name="group-level-2">
                                  <FormControlLabel value="all" control={<Radio />} label="All" />
                                  <FormControlLabel value="outstanding" control={<Radio />} label="Outstanding invoices" />                                                        
                                  <FormControlLabel value="Overdue" control={<Radio />} label="Overdue invoices" />
                              </RadioGroup>                                                                                  
                    </Grid>
                    <Grid item container xs={2} alignItems="center">
                        <LoadingButton size="large" type="submit" variant="contained" loading={isSubmitting}>
                            Ok
                        </LoadingButton>                                                                     
                    </Grid>
                    <Grid item xs={10} justifyContent="center" alignItems="center" direction="column"> 
                        <Grid item xs={2} > 
                            <FormLabel id="demo-radio-buttons-group-label">Details</FormLabel>     
                        </Grid>
                        <Grid item xs={10} direction="column">                                                
                              <Grid item xs={4} direction="row">                                                                                                                            
                                        <FormControlLabel
                                            value="end"
                                            control={<Checkbox />}
                                            label="Summary"
                                            labelPlacement="end"
                                            checked = {pdfSettings.summary}
                                            onChange = {(e:any)=>setPdfSettings({...pdfSettings,summary:e.target.checked})}
                                        />    
                                        <FormControlLabel
                                            value="end"
                                            control={<Checkbox />}
                                            label="Payment Details"
                                            labelPlacement="end"
                                            checked = {pdfSettings.lrDetail}
                                            onChange = {(e:any)=>setPdfSettings({...pdfSettings,lrDetail:e.target.checked})}
                                        />                                                                         
                                </Grid>
                                    <Grid item xs={8}>
                                        <FormControlLabel
                                            value="end"
                                            control={<Checkbox />}
                                            label="LR Details"
                                            labelPlacement="end"
                                            checked = {pdfSettings.lrDetail}
                                            onChange = {(e:any)=>setPdfSettings({...pdfSettings,lrDetail:e.target.checked})}
                                        /> 
                                        <FormControlLabel
                                            value="end"
                                            control={<Checkbox />}
                                            label="Above Date"
                                            labelPlacement="end"
                                            checked = {pdfSettings.lrDetail}
                                            onChange = {(e:any)=>setPdfSettings({...pdfSettings,lrDetail:e.target.checked})}
                                        />    
                                  </Grid>  
                           </Grid>                                          
                      </Grid>                                  
                      </Grid> */}
          </Stack>
          <Paper sx={{ padding: 1 }}>
            {console.log(paymentData)}

            <Modal
              open={pdfView}
              onClose={() => {
                setPdfView(false);
                setPdfSettings({ popUp: false, filter: 'outstanding', grouping: 'supplier', paymentDetails: false, lrDetails: false })
              }
              }
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={{
                margin: 'auto',
                width: "70%",
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 1,
              }}
              >

                <PDFViewer style={{ width: "100%", height: "90vh" }}>

                  {pdfComponent}

                </PDFViewer>

              </Box>
            </Modal>
            <DataGrid
              getRowId={(row) => row?._id}
              autoHeight
              initialState={{
                sorting: {
                  sortModel: [{ field: 'voucherDate', sort: 'desc' }]
                }
              }}
              rows={paymentData}
              sx={{ height: 400 }}
              columns={columns}
              getRowHeight={() => 'auto'}
            />

            {/* (enablePrintButton) */}



            <Dialog open={pdfSettings.popUp} fullWidth maxWidth="sm" onClose={() => setPdfSettings({ ...pdfSettings, popUp: false })}>
              <DialogTitle>⚙️ PDF Settings</DialogTitle>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 2 }}>
                <DialogActions
                  sx={{
                    zIndex: 9,
                    padding: '12px !important',
                    boxShadow: (theme: any) => theme.customShadows.z8,
                  }}
                >
                  <Grid container> {/* spacing={2} */}
                    <Grid item xs={4}>
                      <FormLabel id="demo-radio-buttons-group-label">Grouping</FormLabel>
                      <RadioGroup
                        // onClick={(e:any)=>setPdfSettings({...pdfSettings,grouping:(e.target.value)})}                                        
                        onClick={(e: any) => console.log(e.target.value)}
                        defaultValue="supplier"
                        name="group-level-1">
                        <FormControlLabel value="none" control={<Radio />} label="None" onChange={(e: any) => setPdfSettings({ ...pdfSettings, grouping: (e.target.value) })} />
                        <FormControlLabel value="supplier" control={<Radio />} label="Supplier" onChange={(e: any) => setPdfSettings({ ...pdfSettings, grouping: (e.target.value) })} />
                        {/* <FormControlLabel value="supplierGroup" control={<Radio />} label="Supplier Group" onChange = {(e:any)=>setPdfSettings({...pdfSettings,grouping:(e.target.value)})}/> */}
                      </RadioGroup>
                    </Grid>
                    <Grid item xs={8}>
                      <FormLabel id="demo-radio-buttons-group-label">Filter</FormLabel>
                      <RadioGroup
                        defaultValue="outstanding"
                        name="group-level-2">
                        <FormControlLabel value="all" control={<Radio />} label="All Invoices" onChange={(e: any) => setPdfSettings({ ...pdfSettings, filter: (e.target.value) })} />
                        <FormControlLabel value="outstanding" control={<Radio />} label="Outstanding Only" onChange={(e: any) => setPdfSettings({ ...pdfSettings, filter: (e.target.value) })} />
                        <FormControlLabel value="overdue" control={<Radio />} label="Overdue Only" onChange={(e: any) => setPdfSettings({ ...pdfSettings, filter: (e.target.value) })} />
                      </RadioGroup>
                      {/* </Grid>                     */}
                      {/* <Grid item xs={12} justifyContent="center" alignItems="center" direction="column">  */}
                      {/* <Grid item xs={2} >  */}
                      {/* <FormLabel id="demo-radio-buttons-group-label">Details</FormLabel>      */}
                      {/* </Grid> */}
                      {/* <Grid container direction="row" justifyContent={'space-around'}>                                                 */}
                      {/* <Grid item xs={6}>                                                                                                                             */}
                      {/* <FormControlLabel                                            
                                            value="end"
                                            control={<Checkbox />}
                                            label="Summary"
                                            labelPlacement="end"
                                            checked = {true}   */}
                      {/* // style = {{marginRight:5}}    */}
                      {/* // enable style margin 5 after above date is implimented                                        */}
                      {/* />                                            */}

                      {/* <FormControlLabel
                                            id='payment-detail-checkbox'
                                            value="end"
                                            control={<Checkbox />}
                                            label="Payment Details"
                                            labelPlacement="end"
                                            checked = {Boolean(pdfSettings.paymentDetails)}
                                            onChange = {(e:any)=>setPdfSettings({...pdfSettings,paymentDetails:(e.target.checked)})} */}
                      {/* // style = {{marginRight:5}} */}
                      {/* />                                                                          */}
                      {/* </Grid> */}
                      {/* <Grid item xs={6}> */}
                      {/* <FormControlLabel
                                            id='lr-detail-checkbox'
                                            value="end"
                                            control={<Checkbox />}
                                            label="LR Details"
                                            labelPlacement="end"
                                            checked = {Boolean(pdfSettings.lrDetails)}
                                            onChange = {(e:any)=>setPdfSettings({...pdfSettings,lrDetails:e.target.checked})} */}
                      {/* // style = {{marginRight:5}} */}
                      {/* />  */}
                      {/* <FormControlLabel
                                            value="end"
                                            control={<Checkbox />}
                                            label="Above Date"
                                            labelPlacement="end"
                                            checked = {pdfSettings.lrDetail}
                                            onChange = {(e:any)=>setPdfSettings({...pdfSettings,lrDetail:e.target.checked})}
                                            style = {{marginRight:5}}
                                        />     */}
                      {/* <RHFDatePicker
                                          name="tempData.fromDate"
                                          size="small"
                                          label="Above Date"
                                          on
                                        /> */}
                      {/* </Grid>   */}
                      {/* </Grid>                                           */}
                    </Grid>
                  </Grid>
                </DialogActions>
                <Grid container justifyContent="space-between" alignItems="center">
                  <Grid item xs={3.7} justifyContent="center" alignItems="center">
                    <Button onClick={() => setPdfSettings({ ...pdfSettings, popUp: false })} style={{ width: "100%", backgroundColor: "red" }} variant="contained">
                      Close
                    </Button>
                  </Grid>
                  <Grid item xs={8} alignItems="center">
                    {
                      isMobile ? (
                        <Grid
                          container
                          justifyContent="right"
                          // direction={"row"}
                          paddingRight={6}
                          gap={1}
                        // spacing={{ xs: 2, md: 5 }}
                        // sx={{ borderRadius: 1, my: 2 }}
                        >

                          <PDFDownloadLink
                            document={pdfComponent}
                            fileName={"Outstanding"}
                          >
                            {({ loading }: any) => (
                              <Tooltip title="Download">
                                <IconButton >
                                  {loading ? <CircularProgress size={24} color="inherit" /> : <Iconify icon={'download-fill'} />}
                                </IconButton>
                              </Tooltip>
                            )}
                          </PDFDownloadLink>
                          <MobilePdfShare
                            pdfComponent={pdfComponent}
                            pdfFileName={"Outstanding List"}
                          />
                        </Grid>
                      ) :
                        <Button onClick={getPdf} style={{ width: "100%" }} variant="contained" >
                          Print
                        </Button>
                    }
                  </Grid>
                </Grid>
              </Box>
            </Dialog>
          </Paper>
        </FormProvider>
      </Container>
    </Page>
  )
}

export default PendingPaymentList
