import { Box, Container } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../../module/Header/header';
import { SideMenu } from '../../module/Menu/SideMenu';
import { Products } from '../../module/Products/Products';
import { AddProducts } from '../../module/Products/add-proudct';
import { CheckoutHeadsUp } from '../../module/Shoping/CheckoutHeadup';
import { AddCategory } from '../../module/category/add-category';

export const MenuPage = () => {
  const [search, onSearch] = useState('');
  const { shopId = '' } = useParams();
  return (
    <>
      <Header Menu={SideMenu} onSearch={onSearch} search={search} />
      <Container component="main">
        <Box marginTop={2}>
          <AddProducts shopId={shopId} />
          <AddCategory shopId={shopId} />
          <Products search={search} shopId={shopId} onSearch={onSearch} />
          <CheckoutHeadsUp />
        </Box>
      </Container>
    </>
  );
};
