import ContentCopy from '@mui/icons-material/ContentCopy';
import Done from '@mui/icons-material/Done';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { FC, ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  useEffect(() => {
    if (!state) {
      navigate('/', { replace: true });
    }
  }, [navigate, state]);
  const { amount, orderRefId, paymentLink } = state || {};
  return (
    <PaymentWrapper
      style={{
        justifyContent: 'space-between',
        height: '80%'
      }}
    >
      <PaymentWrapper>
        <PaymentDetails>
          Order placed successfully. To Complete make payment using these
          details.
        </PaymentDetails>
        <CopyWithLabelWrapper>
          <CopyInput label="Payment UPI Id" value={paymentLink} />
          <PaymentDetails variant="caption">Pay to this upi id</PaymentDetails>
        </CopyWithLabelWrapper>
        <CopyInput
          label="Amount"
          value={amount}
          startAdornment={<InputAdornment position="start">₹</InputAdornment>}
        />
        <CopyWithLabelWrapper>
          <CopyInput label="Order Id" value={orderRefId?.split('::')[1]} />
          <PaymentDetails variant="caption">
            Copy to payment notes
          </PaymentDetails>
        </CopyWithLabelWrapper>
      </PaymentWrapper>
      <PaymentDetails variant="caption" style={{ color: 'red' }}>
        Note: Order will be cancelled if payment is not made within 10 minutes.
      </PaymentDetails>
    </PaymentWrapper>
  );
};
