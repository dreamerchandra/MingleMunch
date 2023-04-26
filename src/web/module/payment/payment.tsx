import { ContentCopy, Done } from '@mui/icons-material';
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography
} from '@mui/material';
import { styled } from '@mui/system';
import { FC, ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PaymentWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'left',
  height: '60vh',
  justifyContent: 'center',
  gap: theme.spacing(2),
  width: '100%',
  margin: theme.spacing(1, 0)
}));

const PaymentDetails = styled(Typography)(({ theme }) => ({
  lineHeight: 1.5,
  color: theme.palette.text.primary,
  padding: theme.spacing(0, 1)
}));

const CopyWithLabelWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: left;
`;

const CopyInput: FC<{
  value: string;
  label: string;
  startAdornment?: ReactNode;
}> = ({ value, label, startAdornment }) => {
  const [copied, setCopied] = useState(false);
  return (
    <FormControl sx={{ m: 1, width: '30ch' }} variant="outlined">
      <InputLabel htmlFor="outlined-adornment-password">{label}</InputLabel>
      <OutlinedInput
        readOnly
        value={value}
        startAdornment={startAdornment || null}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              edge="end"
              onClick={() => {
                setCopied(true);
                navigator.clipboard.writeText(value);
                setTimeout(() => {
                  setCopied(false);
                }, 1000);
              }}
            >
              {copied ? <Done /> : <ContentCopy />}
            </IconButton>
          </InputAdornment>
        }
        label={label}
      />
    </FormControl>
  );
};

export const PaymentCopy = () => {
  const { state } = useLocation();
  const { amount, orderRefId, paymentLink } = state;
  return (
    <PaymentWrapper>
      <PaymentDetails>
        Order placed successfully. To Complete make payment using these details.
      </PaymentDetails>
      <CopyInput
        label="Amount"
        value={amount}
        startAdornment={<InputAdornment position="start">₹</InputAdornment>}
      />
      <CopyWithLabelWrapper>
        <CopyInput label="Order Id" value={orderRefId.split('::')[1]} />
        <PaymentDetails variant="caption">Copy to payment notes</PaymentDetails>
      </CopyWithLabelWrapper>
      <CopyWithLabelWrapper>
        <CopyInput label="Payment UPI Id" value={paymentLink} />
        <PaymentDetails variant="caption">Pay to this upi id</PaymentDetails>
      </CopyWithLabelWrapper>
    </PaymentWrapper>
  );
};
