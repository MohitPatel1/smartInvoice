import { useFormContext, useWatch } from 'react-hook-form';
import { useEffect, useState } from 'react';
import useToggle from '../hooks/useToggle';
import { Stack, Divider,Typography, Button, Box } from '@mui/material';
import useResponsive from '../hooks/useResponsive';
import Iconify from './Iconify';
import AddressListDialog from './AddressListDialog';
import SuspenseAndErrorBoundary from '../utils/SuspenseAndErrorBoundary';
import RHFAutocompleteObject from './hook-form-elements/RHFAutocompleteObject';
import useFormTab from '../hooks/useFormTab';
import { hybridDB } from '../hooks/database/useMasterDB';
import { useRecoilState } from 'recoil';
import { globalSubBrokerTransport } from '../utils/recoil_state';
import { directSubBrokerJson } from '../types/newAccount/direct_subbroker';
import { userDataCache } from '../utils/localCacheAPI';


interface CommonNewEditAddress {
  leftLabel?:string,
  leftOnSelect?:Function,
  rightLabel:string,
  rightOnSelect?:Function,
  showSubBroker?:Boolean,
  sx?:Object,
  addressType?:string
}

const CommonNewEditAddress = ({leftLabel,  leftOnSelect, rightLabel, rightOnSelect, showSubBroker=false, sx,addressType}:CommonNewEditAddress ) => {
  const upMd = useResponsive('up', 'md');
  return (
    <Stack
      spacing={{ xs: 2, md: 5 }}
      direction={{ xs: 'column', md: 'row' }}
      divider={<Divider flexItem orientation={upMd ? 'vertical' : 'horizontal'} sx={{ borderStyle: 'dashed' }} />}
      sx={{ bgcolor: 'background.neutral', borderRadius: 1, my: 2, ...sx }}
    >
      {/* {console.log(leftLabel,addressType)} */}
        {(leftLabel &&  addressType!=="owner")?
          <SuspenseAndErrorBoundary>
            <AddressComponent fieldName="supplierDetails" label={leftLabel}  changeFunction={leftOnSelect} addressType={addressType||"supplier"} showSubBroker={showSubBroker} />
          </SuspenseAndErrorBoundary>
          :""
        }

        <SuspenseAndErrorBoundary>
          <AddressComponent fieldName= {(addressType=="owner") ? "owner" :'buyerDetails'} label={rightLabel}  addressType={addressType||"buyer"} changeFunction={rightOnSelect} showSubBroker={showSubBroker} />
        </SuspenseAndErrorBoundary>
    </Stack>
  )
}

export default CommonNewEditAddress

let subBrokerOptions:any=[];
function AddressComponent ({fieldName, label,changeFunction, showSubBroker,addressType} : {fieldName: string, label: string, changeFunction?:any, showSubBroker?: Boolean,addressType:string}) {
  
  
  const { toggle, onOpen, onClose } = useToggle();
  

  const { control,setValue } = useFormContext();
  const userData = userDataCache.getItem();
  console.log({userData});
  // for enter as tab
  useFormTab();

  const value = useWatch({
    control: control,
    name: fieldName
  })
  // console.log({value});

  return (
    <Stack sx={{ px:3, pb:3, width: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 3, mb: 1 }} onClick={onOpen}>
          <Typography variant="h6" sx={{ color: 'text.disabled', textTransform:"capitalize" }}>
              {label}:
          </Typography>

          <Button
              size="small"
              startIcon={<Iconify icon={value ? 'edit-fill' : 'plus-fill'} />}
          >
              {value ? 'Change' : 'Add'}
          </Button>
      </Stack>
      <AddressListDialog
        open={Boolean(toggle)}
        label={label}
        addressType={addressType}
        onClose={onClose}
        selected={(selectedId:string) => value?.id === selectedId}
        onSelect={(address:any) => {
          // chaning the session company
          if(addressType=="owner"){
            console.log({address,userData})
            userDataCache.createOrUpdate({...userData, sessionOgCompany: address});
            console.log("updated company");
            console.log({userData})
          }
          if(changeFunction){
            changeFunction(address);
          }else{
            setValue(fieldName, address,{shouldDirty:true});
          }
          onClose();
        }}
        
      />
      {value?
        <AddressInfo name={value?.companyName} addressType={addressType} type={value?.category} subBrokerOptions={subBrokerOptions} showSubBroker={showSubBroker} subBroker={value?.subBrokerDetails?.companyName}address={value?.addressDetails && value?.addressDetails[0]?.address} branch={value?.addressDetails && value?.addressDetails[0]?.branch} phone={value?.phoneNumbers && value?.phoneNumbers[0]?.phoneNumber} gst={value?.gstNumber} website={value?.website}/>
       :""}
    </Stack>
  )
}

export function AddressInfo({ name, address,type, phone ,gst,subBroker,showSubBroker,subBrokerOptions,branch,website,addressType}: any) {
    const [globalSubBrokerTransportState,setGlobalSubBrokerTransportState] = useRecoilState(globalSubBrokerTransport);
    const[subBrokerEdit,setSubBrokerEdit] = useState(false);

    
    useEffect(() => {
      //  for setting the value in current form when global function creates subBroker/transport
      if(globalSubBrokerTransportState.show==false && globalSubBrokerTransportState?.data?.companyName && Object.keys(globalSubBrokerTransportState).length!==0){
          if(globalSubBrokerTransportState.type=="subBroker"){
            setValue(`${type}Details.subBrokerDetails`,globalSubBrokerTransportState.data)
          }
        }
    }, [globalSubBrokerTransportState.show]);
  

    const {  setValue, getValues, formState: { errors }, reset } = useFormContext();
    return (
      <>
        <Typography variant="subtitle2">{name}</Typography>
        {/* <Typography variant="body2" sx={{ mt: 1, mb: 0.5 }}>
          {address}
        </Typography> */}
        <Typography variant="body2">{branch?`branch: ${branch}`:""}</Typography>
        {/* <Typography variant="body2">{phone?`Phone: ${phone}`:""}</Typography> */}
        <Typography variant="body2">{gst && addressType=="owner"?`GST: ${gst}`:""}</Typography>
        {/* <Typography variant="body2">{website?`Website: ${website}`:""}</Typography> */}
        {showSubBroker?
          !subBroker || subBrokerEdit ?
          <Box sx={{ mt: 1 }}>
            <RHFAutocompleteObject
              label= "Sub Broker"
              name={`${type}Details.subBrokerDetails`}
              isOptionEqualToValue={(option: any, value: any) => value.companyName ? (option.companyName) === (value?.companyName) : true}
              getOptionLabel={(subBrokerObj: any) => subBrokerObj?.companyName ||""}
              options={
                ()=> hybridDB.query(
                  "docFields/subBrokerDesignDoc",
                  {stale:"update_after",reduce:false}
                  ).then(
                    ((data:any)=>{
                      // console.log(data);
                      return data.rows?.map((data:any)=>data.value)
                    }))
              }
              size="small"
              onChange={(e: any, newValue: any)=>{
                  setValue(`${type}Details.subBrokerDetails`,newValue);
                  setSubBrokerEdit(false);
              }}
              sx={{ minWidth: "130px", maxWidth: "210px" }}
              newCreationFunction={()=>{
                setGlobalSubBrokerTransportState({show:true,type:"subBroker",data: directSubBrokerJson})
                }}
            />
          </Box>
          :
          <Stack direction="row">
            <Typography variant="body2">{showSubBroker&&subBroker?`Sub Broker: ${subBroker}`:""}</Typography>
            <Button size="small" startIcon={<Iconify
            icon={'edit-fill'}
          />}
            onClick={() => {
              setSubBrokerEdit(true);
              let formData = getValues();
              delete formData[`${type}Details`].subBrokerDetails;
              console.log(formData)
              reset(formData)

            }}
          />
          </Stack>
        :""}
      </>
    );
  }