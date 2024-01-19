import AddToCart from '@mui/icons-material/AddShoppingCart';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Typography
} from '@mui/material';
import Container from '@mui/material/Container';
import Fuse from 'fuse.js';
import { FC, useMemo, useState } from 'react';
import { Product } from '../../../common/types/Product';
import { useUser } from '../../firebase/auth';
import { useShopQuery } from '../Shop/shop-query';
import { useCart } from '../Shoping/cart-activity';
import { CategoryList } from '../category/category-list';
import { useMutationProductEdit, useProductQuery } from './product-query';

const FooterActions: FC<{ product: Product }> = ({ product }) => {
  const { addToCart, removeFromCart, cartDetails } = useCart();
  const {
    userDetails: { role }
  } = useUser();
  const inCart = cartDetails.cart.filter(
    (item) => item.itemId === product.itemId
  );
  const { mutateAsync, isLoading } = useMutationProductEdit();

  return (
    <>
      {inCart.length ? (
        <Container
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'end'
          }}
        >
          <Button size="small" onClick={() => removeFromCart(product)}>
            -
          </Button>
          <>{inCart.length}</>
          <Button size="small" onClick={() => addToCart(product)}>
            +
          </Button>
        </Container>
      ) : (
        <Container
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'end'
          }}
        >
          {['admin', 'vendor'].includes(role) ? (
            <>
              <LoadingButton
                size="small"
                onClick={() =>
                  mutateAsync({
                    productId: product.itemId,
                    isAvailable: !product.isAvailable
                  })
                }
                variant="outlined"
                disabled={isLoading}
                loading={isLoading}
              >
                {product.isAvailable ? 'Can Order' : 'Out of stock'}
              </LoadingButton>

              <IconButton
                aria-label="add to cart"
                color="primary"
                onClick={() => addToCart(product)}
                disabled={!product.isAvailable}
              >
                <AddToCart />
              </IconButton>
            </>
          ) : (
            <Button
              size="small"
              onClick={() => addToCart(product)}
              variant="outlined"
            >
              Add to cart
            </Button>
          )}
        </Container>
      )}
    </>
  );
};

const ProductItem: FC<{ product: Product }> = ({ product }) => {
  const { itemDescription, itemName, itemPrice } = product;

  return (
    <div
      style={{
        width: 'min(90vw, 800px)',
        margin: 'auto'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}
      >
        <div style={{ padding: '8px' }}>
          <Typography variant="h3" component="h2">
            {itemName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {itemDescription}
          </Typography>
          <Typography variant="h3" color="text.secondary">
            ₹{itemPrice}
          </Typography>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div style={{ height: '25px' }}></div>
          <FooterActions product={product} />
        </div>
      </div>
      <Divider />
    </div>
  );
};

const fuseOptions = {
  shouldSort: true,
  keys: ['itemName', 'itemDescription']
};
export const Products: FC<{
  search: string;
  shopId: string;
  onSearch: (str: string) => void;
}> = ({ search, shopId, onSearch }) => {
  const {
    userDetails: { role, loading }
  } = useUser();
  const { data: shops } = useShopQuery();
  const [selectedCategoryIds, setCategory] = useState<string[]>([]);

  const { data, isLoading } = useProductQuery({
    search: '',
    isAvailable: role === 'user' ? true : undefined,
    isEnabled: !loading,
    shopId
  });
  const filteredList = useMemo(() => {
    const filterByCategory = (item: Product) => {
      if (selectedCategoryIds.length === 0) return true;
      return selectedCategoryIds.includes(item.category.id);
    };
    if (data == null) return [];
    if (search == '') return data.filter(filterByCategory);
    const fuse = new Fuse(data, fuseOptions);
    return fuse
      .search(search)
      .map((item) => item.item)
      .filter(filterByCategory);
  }, [data, search, selectedCategoryIds]);

  if (isLoading) {
    return <CircularProgress />;
  }
  const shopName =
    shops?.find((shop) => shop.shopId === shopId)?.shopName ?? 'Loading...';

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 20,
        }}
      >
        <Typography variant="h2" component="h1" sx={{ margin: 'auto' }}>
          {shopName}
        </Typography>
        <CategoryList
          shopId={shopId}
          selected={selectedCategoryIds}
          onChange={(e) => setCategory(e)}
        />
        {filteredList.length === 0 && (
          <Container
            sx={{
              height: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h3" component="h2">
              Too many filters.
            </Typography>
            <Typography variant="h6" component="h2">
              Try clearing some.
            </Typography>
            <Button
              onClick={() => {
                setCategory([]);
                onSearch('');
              }}
              sx={{
                mt: 4
              }}
              variant="outlined"
              color="warning"
            >
              Clear All
            </Button>
          </Container>
        )}
        {filteredList?.map((product) => (
          <ProductItem product={product} key={product.itemId} />
        ))}
      </Box>
    </>
  );
};
