import { Box, Container } from '@mui/material';
import { useProtectedRoute } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { SideMenu } from '../../module/Menu/SideMenu';
import { Products } from '../../module/Products/Products';
import { CheckoutHeadsUp } from '../../module/Shoping/CheckoutHeadup';
import { AddProducts } from '../../module/Products/add-proudct';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export const MenuPage = () => {
  useProtectedRoute();
  const [search, onSearch] = useState('');
  const { shopId = '' } = useParams();
  return (
    <>
      <Header Menu={SideMenu} onSearch={onSearch} />
      <Container component="main">
        <Box marginTop={2}>
          <AddProducts shopId={shopId} />
          <Products search={search} shopId={shopId} />
          <CheckoutHeadsUp />
        </Box>
      </Container>
    </>
  );
};
