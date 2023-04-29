import { useLocation, useNavigate } from "react-router-dom";
import { useErrorReporter } from "../../hooks/useErrorReporter";
import useIsMountedRef from "../../hooks/useIsMountedRef";
import useSettings from "../../hooks/useSettings";
import useQuery from "../../utils/useQuery";
import { hybridDB, useMasterDB } from "../../hooks/database/useMasterDB";
import {
  userDataCache,
  ogDefaultsCache,
  ogDataCache,
} from "../../utils/localCacheAPI";
import { appLevelDefaults } from "../../appLevelDefaults";
import useResponsive from "../../hooks/useResponsive";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { orderSchema } from "../../types/docType";
import { Fragment, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { appLevelOptions, toastErrorSettings, toastSuccessSettings } from "../../config";
import Page from "../../components/Page";
import {
  Container,
  Card,
  Box,
  Stack,
  Typography,
  Divider,
  InputAdornment,
  Button,
} from "@mui/material";
import HeaderBreadcrumbs from "../../components/HeaderBreadcrumbs";
import { PATH_OBJ } from "../../router";
import FormProvider from "../../components/hook-form-elements/FormProvider";
import { FormErrorDisplayer } from "../../components/FormErrorDisplayer";
import CommonNewEditAddress from "../../components/CommonNewEditAddress";
import SuspenseAndErrorBoundary from "../../utils/SuspenseAndErrorBoundary";
import RHFAutocompleteObject from "../../components/hook-form-elements/RHFAutocompleteObject";
import OrderDetails from "./OrderDetails";
import RHFTextField from "../../components/hook-form-elements/RHFTextField";
import {RHFUploadMultiFile} from "../../components/hook-form-elements/RHFUpload";
import DeliveryDetails from "../../components/DeliveryDetails";
import GetProductDetails from "../../components/GetProductDetails";
import SvgIconStyle from "../../components/SvgIconStyle";
import { LoadingButton } from "@mui/lab";
import RHFDatePicker from "../../components/hook-form-elements/RHFDatePicker";
import Iconify from "../../components/Iconify";
import Label from "../../components/Label";
import { statusFormat } from "../../utils/formatNumber";
import { useTimeoutDB } from '../../hooks/database/useTimoutDB';
import { productDetails } from '../../types/generalType';
import { uniqueSerialNumber } from "../../utils/generateSerialNumber";
import RHFMultiSelectAutocompleteString from "../../components/hook-form-elements/RHFMultiSelectAutocompleteString";
import useFormTab from "../../hooks/useFormTab";
import DueDaysDateFormComponent from "../../components/DueDaysDateFormComponent";
import { object } from "prop-types";

function AddEditOrder({ actionType, editOrderNumber }: any) {
  const { themeStretch } = useSettings();
  const isMountedRef = useIsMountedRef();
  const errorReporter = useErrorReporter();
  let query = useQuery();
  const navigate = useNavigate();
  const { masterDB } = useMasterDB();
  const timeoutDB = useTimeoutDB()
  const userData: any = userDataCache.getItem();
  const ogDefaults: any = ogDefaultsCache.getItem();
  const ogData: any = ogDataCache.getItem();
  editOrderNumber = editOrderNumber || query.get("serialNumber");
  console.log(userData?.userPermissions);
  let orderModulePermission =
    editOrderNumber && actionType === "edit"
      ? userData?.userPermissions?.order?.edit
      : userData?.userPermissions?.order?.create;
  const upMd = useResponsive("up", "md");


  const defaultValues = {
    type: "order",
    serialNumber: "",
    buyerOrderNumber: "",
    owner: userData.sessionOgCompany,
    voucherDate: new Date().toISOString(),
    dueDays: 0,
    dueDate: new Date().toISOString(),
    buyerDetails: "",
    supplierDetails: "",
    salesMan: {
      userID: userData.userID,
      user: userData.user,
      userCode: userData.userCode,
      userName: userData.userName,
      userPhone: userData.userPhone,
      userRole: userData.userRole,
    },
    deliveryDetails: [
      {
        consignmentDate: new Date().toISOString(),
      },
    ],
    uom: ogDefaults.defaultUOM || appLevelDefaults.defaultUOM || "",
    products: [{
      variationsBreakdown: [{
        name: ""
      }],
      conversionQuantity: 1,
      actualQuantityUom: ogDefaults.defaultUOM || appLevelDefaults.defaultUOM || "",
      billedQuantityUom: ogDefaults.defaultUOM || appLevelDefaults.defaultUOM || "",
    }],
    gstPercentage: ogDefaults?.orderDefaultGstMode || [],
    grandTotalProductAmount: 0,
    grandTotalGrossAmount: 0,
    grandTotalVoucherAmount: 0,
    orderNotes: ogDefaults?.orderNotes || appLevelDefaults?.orderNotes,
    status: orderModulePermission === "allow" ? "15active" : "10draft",
    extra_attachments: []
  };
  const formMethods = useForm({
    defaultValues,
    resolver: yupResolver(orderSchema),
  });
  // for enter as tab
  useFormTab();

  const {
    setValue,
    reset,
    getValues,
    handleSubmit,
    setError,
    watch,
    formState: { dirtyFields, errors, isDirty, isSubmitting },
  }: any = formMethods;
  let today = new Date();
  const RandomID = Math.random()?.toString(36)?.substring(2, 4);
  const { state: copySerialNumber } = useLocation();
  console.log("==================")
  console.log(copySerialNumber);

  useEffect(() => {
    console.log({ actionType, editOrderNumber });
    if (editOrderNumber || copySerialNumber) {
      hybridDB
        .query("docFields/serialNumber", {
          key: editOrderNumber || copySerialNumber,
          include_docs: true,
          limit: 1,
          attachments: true,
          binary: true,
        })
        .then(async (resOrderData: any) => {
          console.log({ resOrderData });
          resOrderData = resOrderData.rows[0].doc;

          // edge case if order doc is created old way
          if (resOrderData.attachmentDocId) {
            await hybridDB.get(
              resOrderData.attachmentDocId,
              { attachments: true, binary: true }
            ).then((resAttmDoc: any) => {
              if (resAttmDoc._attachments) {
                resOrderData._attachments = resAttmDoc._attachments;
                // if attachment docs have extra_attachments then take them all and reset it to the array of extra_attachments
                // attachments is object with key of attachment name and value of attachment object, extra_attachment's key is extra_attachments_index 
                if (resOrderData._attachments) {
                  let extra_attachments = [];
                  for (let key in resOrderData._attachments) {
                    
                    if (key.includes("extra_attachments_")) {
                      console.log("=-=-=-=-=-=-=-=-=--");
                      console.log(resOrderData._attachments[key])
                      // setting preview url for extra_attachments
                      resOrderData._attachments[key].preview = URL.createObjectURL(resOrderData._attachments[key].data);
                      extra_attachments.push(resOrderData._attachments[key]);
                    }
                  }
                  resOrderData.extra_attachments = extra_attachments;
                }
                console.log(resOrderData )
              }
            });
          };

          if (resOrderData?.serialNumber && actionType === "edit") {
            // setting empty arrays to handle empty products & delivery details when editing.
            if (!resOrderData?.products?.length) {
              resOrderData.products = [];
            };
            if (!resOrderData?.deliveryDetails?.length) {
              resOrderData.deliveryDetails = [];
            };
            reset(resOrderData);
          } else if (actionType !== "edit" && copySerialNumber) {

            delete resOrderData._rev;
            delete resOrderData.attachmentDocId;

            uniqueSerialNumber(masterDB).then(
              (serialNumber: string) => {
                resOrderData.serialNumber = serialNumber;
                resOrderData._id = `order:${ogData?.ownerGroupID}_${serialNumber}_${RandomID}`;
                // console.log(resOrderData)
                reset(resOrderData);
                setValue("dueDate", today, { shouldDirty: false });
                setValue("voucherDate", today, { shouldDirty: false });
              });

          }
        });
    }
  }, [editOrderNumber]);

  const calculateFinalGrandTotal = () => {
    const grandTotalAmount = formMethods.getValues("grandTotalProductAmount");
    // console.log({grandTotalAmount});
    // console.log({grandTotalAmount});
    if (grandTotalAmount) {
      formMethods.setValue(
        `grandTotalGrossAmount`,
        Math.round(grandTotalAmount)
      );
      formMethods.setValue(
        `grandTotalVoucherAmount`,
        Math.round(grandTotalAmount)
      );
    }
  };

  const handleActive = async () => {
    let formData = getValues();
    if (orderModulePermission !== "allow") {
      toast.error(
        "You dont have necessary permissions. Please contact your admin",
        toastErrorSettings
      );
      navigate(-1);
      throw new Error("Permissions not available.");
    } else {
      formData.status = "15active";
      if (editOrderNumber && formData._id && actionType === "edit") {
        if (formData._attachments) {
          let attachmentId = await masterDB.attachment(formData, true);
          if (attachmentId) {
            // if id created then delete the attachment and replace with id
            delete formData._attachments;
            formData.attachmentDocId = attachmentId;
          }
        }
        console.log(formData);
        let editRes = await masterDB.edit(formData);
        console.log({ editRes });
        if (!editRes.ok) {
          toast.error("Activation failed", toastErrorSettings);
          return editRes;
        } else {
          toast.success("Activation Successful", toastSuccessSettings);
          // so user can see his changes, we have two option either we reload which will also do the same thing or this
          navigate(0);
        }
      }
    }
  };

  const onSubmit = (e: any) => {
    const timeOut = new Promise((resolve) => setTimeout(resolve, 500));

    const submitAction = async () => {
      let latestDoc = e;
      let tempAttachments = latestDoc._attachments;
      delete latestDoc.extra_attachments;
      console.log({ latestDoc });
      if (orderModulePermission === "dont allow") {
        toast.error(
          "You don't have necessary permissions. Please contact your admin",
          toastErrorSettings
        );
        navigate(-1);
        throw new Error("Permissions not available.");
      }
      latestDoc.status =
        orderModulePermission === "allow" ? "15active" : "10draft";

      // console.clear();
      // console.log({latestDoc, tempAttachments});

      const docRes: any = await hybridDB.putWithAttachmentsDocSeperate(latestDoc)
        .catch((error: any) => {
          console.error({ error });
          if (actionType === "edit" && error.status === 409 && error.name === "conflict") {
            throw new Error('File recently updated by another user.');
          }
          throw error;
        });


      if (Array.isArray(docRes)) {
        if (docRes.some((resObj: any) => !resObj.ok)) throw new Error(JSON.stringify(docRes));

        if (Object.values(tempAttachments)?.some((attmObj: any) => Boolean(attmObj?.data))) {
          for (const [key, value] of Object.entries(tempAttachments)) {
            // @ts-ignore
            tempAttachments[key].data = { preview: value.data.preview }
          };

          // delete latestDoc._attachments;

          return {
            ...latestDoc,
            _attachments: tempAttachments
          };
        };
      } else if (docRes.ok) {
        return latestDoc;
      };

      throw new Error(JSON.stringify(docRes));
    };
    // wait a minimum 500ms before resolving the form
    //return promise makes use of isSubmitting property of RHF
    return Promise.all([timeOut, submitAction()]).then((values) => {

      console.log({ values });
      let order = values[1];

      toast.success(
        actionType === "edit" ? `Order edit successfull.` : "Order Created.",
        toastSuccessSettings
      );
      // reset();
      navigate(`/orders/view?serialNumber=${e?.serialNumber}`, { state: order });

    }).catch((error: any) => {
      errorReporter(error, "promise error", e);

      toast.error(error.message, toastErrorSettings);
      if (isMountedRef.current) {
        setError("afterSubmit", { ...error, message: error.message });
      }
      return error


    });
  };

  const supplierSelect = (value: any) => {
    console.log(value);
    if (value?.category == "supplier" || value?.category == "pair - buyer & supplier") {
      setValue("supplierDetails", value, { shouldDirty: true });
    }
    // let commission = getValues("commission");
    // if(commission[0].collectFrom="Supplier"&& value?.subBrokerDetails?.companyName){
    //   setValue("commission[0].collectFrom","sub-broker supplier")
    // }
  };

  const buyerSelect = (value: any) => {
    console.log(value);
    if (value?.category == "buyer" || value?.category == "pair - buyer & supplier") {
      setValue("buyerDetails", value, { shouldDirty: true });
    }
    // // Credit due calculation should pick from Due Days mentioned in Buyer.
    // Pick Transport details from client creation.
    if (value?.transportDetails) {
      if (typeof value?.transportDetails == "string") {
        timeoutDB.get(value?.transportDetails).then(result => {
          if (result && result.category == "10transport") {
            setValue("deliveryDetails[0]", result)
          }
        })
      } else if (typeof value?.transportDetails == "object") {
        console.log(value)
        setValue("deliveryDetails[0]", value?.transportDetails);
        setValue("deliveryDetails[0].branchName", value?.transportDetails?.branchName || getValues("buyerDetails.addressDetails[0].city"), { shouldDirty: false });
      }
    }
    if (value?.primarySalesMan) {
      if (value?.primarySalesMan?.userID !== userData?.userID) {
        alert("You are not Primary Sales Man for this Buyer!");
      }
    }
    if (value?.paymentTermsInDays) {
      setValue("dueDays", Number(value?.paymentTermsInDays || 0))
    }
  };

  const handleApproxPriceChange = (approxPrice: number) => {

    const totalProdAmount = getValues(`products`).reduce((reducer: number, obj: any) => {
      if (Number(obj.amount || 0) > 0) {
        return reducer += obj.amount;
      } else {
        return reducer += obj.billedQuantity * approxPrice;
      }
    }, 0);

    setValue(`approxPrice`, approxPrice);
    setValue(`grandTotalProductAmount`, totalProdAmount);
    calculateFinalGrandTotal();
  };
  return (
    // @ts-ignore
    <Page title={PATH_OBJ.orders.children[actionType].title}>
      <Container maxWidth={themeStretch ? false : "lg"}>
        <HeaderBreadcrumbs
          heading={`${actionType == "edit" ? "Save" : "Add"} Order`}
          links={[
            { name: "Dashboard", href: PATH_OBJ.home.path },
            { name: "orderList", href: PATH_OBJ.orders.path },
            { name: `Create Order` },
          ]}
          sx={{ textTransform: "capitalize" }}
          action={
            <Label
              variant={'ghost'}
              color={
                (getValues("status") === '15active' && 'success') ||
                (getValues("status") === '10draft' && 'warning') ||
                (getValues("status") === '05deleted' && 'error') ||
                'default'
              }
              sx={{ textTransform: 'uppercase', mb: 1 }}
            >
              {statusFormat(getValues("status"))}
            </Label>
          }
        />
        <FormProvider methods={formMethods} onSubmit={handleSubmit(onSubmit)}>
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
              rightLabel="Owner"
              addressType="owner"
              sx={{ bgcolor: "none", width: 1 }}
            />
            <SuspenseAndErrorBoundary>
              <OrderDetails actionType={actionType} sx={{ width: 1 }} />
            </SuspenseAndErrorBoundary>
          </Stack>
          <Card sx={{ p: 2 }}>
            <FormErrorDisplayer />
            <CommonNewEditAddress
              leftLabel="Supplier"
              leftOnSelect={supplierSelect}
              rightLabel="Buyer"
              rightOnSelect={buyerSelect}
              showSubBroker={true}
            />

            <Typography variant="h6" sx={{ color: "text.disabled", mb: 1 }}>
              Delivery Details:
            </Typography>
            <SuspenseAndErrorBoundary>
              <DeliveryDetails primaryFieldName={"deliveryDetails"} />
            </SuspenseAndErrorBoundary>

            <Divider
              flexItem
              orientation={"horizontal"}
              sx={{ my: 3, borderStyle: "dashed" }}
            />

            <GetProductDetails
              primaryFieldName="products"
              calculateFinalGrandTotal={calculateFinalGrandTotal}
            />

            <Stack spacing={2} sx={{ mt: 3 }} alignItems="flex-end">
              <DueDaysDateFormComponent
                updateDueDate={(dueDays: number) => {
                  let voucherDate = getValues("voucherDate");
                  // setValue doesnt work with numbers properly
                  setValue("dueDays", `${dueDays}`);
                  setValue(
                    "dueDate",
                    new Date(
                      new Date(voucherDate).setDate(
                        new Date(voucherDate).getDate() + (dueDays || 0)
                      )
                    ), { shouldDirty: false }
                  );
                }}
              />
              <RHFTextField
                name="orderNotes"
                sx={{ width: "220px" }}
                multiline
                rows={4}
                label="Notes"
              />
              <Typography sx={{ textAlign: 'left', width: 220 }}>Approx Price per pcs: (not in PDF)</Typography>
              <RHFTextField
                name="approxPrice"
                size="small"
                type="number"
                sx={{ textAlign: 'right', width: 220, ml: 1 }}
                disabled={!(watch(`products`).some((obj: any) => { console.log({ obj }); return obj.amount < 1 }))}
                onChange={(event: any) => handleApproxPriceChange(event?.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SvgIconStyle src={`/icons/Rupee-Symbol-Black.svg`} width={15} height={15} />
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" justifyContent="flex-end">
                <Typography sx={{ mt: 1 }}>Grand Total:</Typography>
                <RHFTextField
                  name="grandTotalVoucherAmount"
                  sx={{ textAlign: "right", width: 160, ml: 1 }}
                  size="small"
                  disabled={true}
                  rules={{
                    min: {
                      value: 0,
                      message: "Total Amount should be above zero.",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SvgIconStyle
                          src={`/icons/Rupee-Symbol-Black.svg`}
                          width={15}
                          height={15}
                        />
                      </InputAdornment>
                    ),
                  }}
                  onBlur={() => calculateFinalGrandTotal()}
                />
              </Stack>
              
            </Stack>
          <Stack
            spacing={{ xs: 2, md: 5 }}
            direction={{ xs: "column", md: "row" }}
          >
            <RHFUploadMultiFile
                  fieldNameHolder="extra_attachments"
                  imageFieldName="extra_attachments"
                  name="extra_attachments"
                  // @ts-ignore
                  showPreview
                  accept="image/*"
                  maxSize={5045728}
                  sx={{ width: 1,maxHeight: 400 }}
                />
          </Stack>
          </Card>
          <Stack
            justifyContent="flex-end"
            direction="row"
            spacing={2}
            sx={{ mt: 3 }}
          >
            <LoadingButton
              size="large"
              type="submit"
              variant="contained"
              disabled={getValues("salesMan") && !isDirty}
              loading={isSubmitting}
            >
              {actionType == "edit" ? "Save" : "Create"}
            </LoadingButton>
            {console.log("hello karan", {
              actionType,
              status: getValues("status"),
            })}
            {actionType == "edit" && getValues("status") == "10draft" ? (
              <Button
                color="primary"
                variant="outlined"
                size="large"
                startIcon={<Iconify icon={"checkmark-fill"} />}
                sx={{ alignSelf: "flex-end" }}
                onClick={handleActive}
              >
                Mark as Active
              </Button>
            ) : (
              ""
            )}
          </Stack>
        </FormProvider>
      </Container>
    </Page>
  );
}

export default AddEditOrder;
