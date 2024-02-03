import { Box, Container } from '@mui/material';
import { Header } from '../../module/Header/header';
import { PaymentCopy } from '../../module/payment/payment';

export const PaymentRoute = () => {
  return (
    <div>
      <Header />
      <Container component="main">
        <Box marginTop={2} style={{ height: '90vh' }}>
          <PaymentCopy />
        </Box>
      </Container>
    </div>
  );
};
