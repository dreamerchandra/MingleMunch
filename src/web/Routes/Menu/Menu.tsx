import { Box, Container } from '@mui/material';
import { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../firebase/auth';
import { Header } from '../../module/Header/header';
import { Products } from '../../module/Products/Products';
import { AddProducts } from '../../module/Products/add-proudct';
import { useShopQuery } from '../../module/Shop/shop-query';
import { CheckoutHeadsUp } from '../../module/Shoping/CheckoutHeadup';
import { AddCategory } from '../../module/category/add-category';

export const MenuPage = () => {
  const [search, onSearch] = useState('');
  const { shopId = '' } = useParams();
  const { data: shops } = useShopQuery();
  const shop = shops?.find((s) => s.shopId === shopId);
  const { userDetails } = useUser();
  const isAdmin = ['admin', 'vendor'].includes(userDetails?.role) || false;
  const navigate = useNavigate();
  const [allowEdit, setAllowEdit] = useState(false);
  return (
    <>
      <Header  onSearch={onSearch} search={search} />
      <Container
        component="main"
        sx={{
          height: 'calc(100vh - 240px)',
          overflow: 'auto',
          backgroundColor: '#f5f5f5',
          background:
            'linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(/abstract_emoji.png)',
          backgroundSize: '100vw',
        }}
      >
        <Box marginTop={2}>
          <Carousel
            showThumbs={false}
            infiniteLoop
            interval={2500}
            autoPlay
            showStatus={false}
            showArrows={false}
          >
            {shop?.carousel
              ?.filter((c) => (isAdmin ? true : c.isPublished))
              .map((c) => (
                <div
                  key={c.image}
                  style={{
                    aspectRatio: '16/9'
                  }}
                  onClick={() => {
                    c.url && navigate(c.url);
                  }}
                >
                  <img
                    src={c.image}
                    style={{
                      objectFit: 'cover',
                      height: '100%',
                      borderRadius: '10px'
                    }}
                  />
                </div>
              ))}
          </Carousel>
          {allowEdit ? (
            <>
              <AddProducts shopId={shopId} />
              <AddCategory shopId={shopId} />
            </>
          ) : null}
          <Products
            search={search}
            shopId={shopId}
            onSearch={onSearch}
            allowEdit={allowEdit}
            setAllowEdit={setAllowEdit}
          />
          <CheckoutHeadsUp />
        </Box>
      </Container>
    </>
  );
};
