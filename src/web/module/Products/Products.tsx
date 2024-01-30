import AddToCart from '@mui/icons-material/AddShoppingCart';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Fuse from 'fuse.js';
import { FC, useMemo, useState } from 'react';
import { Product } from '../../../common/types/Product';
import { useUser } from '../../firebase/auth';
import { useShopQuery } from '../Shop/shop-query';
import { useCart } from '../Shoping/cart-activity';
import { CategoryList } from '../category/category-list';
import { useCategoryQuery } from '../category/category-query';
import {
  useMutationProductEdit,
  useProductsQuery,
  useProductQuery
} from './product-query';
import Edit from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { Drawer } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

const FooterActions: FC<{
  product: Product;
  onAdd: () => void;
  isSuggestion: boolean;
}> = ({ product, onAdd }) => {
  const { addToCart, removeFromCart, cartDetails } = useCart();
  const {
    userDetails: { role }
  } = useUser();
  const inCart = cartDetails.cart.filter(
    (item) => item.itemId === product.itemId
  );
  const { mutateAsync, isLoading } = useMutationProductEdit();
  const navigator = useNavigate();

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'end'
      }}
    >
      <div>
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
              <Remove color="warning" />
            </Button>
            <Typography variant="h6" color="green">
              {inCart.length}
            </Typography>
            <Button
              size="small"
              onClick={() => {
                onAdd();
                addToCart(product);
              }}
            >
              <Add color="info" />
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
                  aria-label="Edit"
                  color="primary"
                  onClick={() => {
                    navigator(
                      `/shop/${product.shopId}/product/${product.itemId}`,
                      { replace: true }
                    );
                    window.scrollTo(0, 0);
                  }}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  aria-label="add to cart"
                  color="primary"
                  onClick={() => {
                    onAdd();
                    addToCart(product);
                  }}
                  disabled={!product.isAvailable}
                >
                  <AddToCart />
                </IconButton>
              </>
            ) : (
              <Button
                size="small"
                onClick={() => {
                  onAdd();
                  addToCart(product);
                }}
                variant="outlined"
              >
                Add to cart
              </Button>
            )}
          </Container>
        )}
      </div>
      {product.suggestionIds && product.suggestionIds.length > 0 && (
        <Typography variant="caption">Customization</Typography>
      )}
    </Container>
  );
};

const SuggestionProductItem: FC<{ productId: string }> = ({ productId }) => {
  const { data: product } = useProductQuery(productId);
  if (!product) return null;
  if (!product.isAvailable) return null;
  return <ProductItem product={product} isSuggestion />;
};

const ProductItem: FC<{ product: Product; isSuggestion?: boolean }> = ({
  product,
  isSuggestion = false
}) => {
  const { itemDescription, itemName, itemPrice } = product;
  const [open, setOpen] = useState(false);

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
          <FooterActions
            product={product}
            isSuggestion={isSuggestion}
            onAdd={() => {
              if ((product.suggestionIds?.length ?? 0) > 0) {
                setOpen(true);
              }
            }}
          />
        </div>
      </div>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        anchor="bottom"
        sx={{
          zIndex: 2000
        }}
      >
        <Box
          sx={{
            backgroundColor: '#eab6b637'
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, p: 2 }}>
            Customization
          </Typography>
          {product.suggestionIds?.map((id) => (
            <SuggestionProductItem productId={id} key={id} />
          ))}
        </Box>
      </Drawer>
      <Divider
        sx={{
          borderColor: '#eab6b637'
        }}
      />
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
  const { data: categories } = useCategoryQuery(shopId);

  const { data, isLoading } = useProductsQuery({
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
          mb: 20
        }}
      >
        <Typography variant="h2" component="h1" sx={{ margin: 'auto' }}>
          {shopName}
        </Typography>
        <CategoryList
          shopId={shopId}
          search={search}
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
        <div style={{ height: '25px' }}></div>
        {selectedCategoryIds.length > 0
          ? filteredList?.map((product) => (
              <ProductItem product={product} key={product.itemId} />
            ))
          : categories
              ?.filter((category) =>
                filteredList.some((i) => i.category.id === category.categoryId)
              )
              ?.map((category) => (
                <Box
                  key={category.categoryId}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #f1f6dc',
                    borderRadius: '10px',
                    mb: 2
                  }}
                >
                  <Typography
                    key={category.categoryId}
                    variant="h5"
                    component="h2"
                    sx={{
                      alignSelf: 'start'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'start',
                        gap: 5,
                        width: 'fit-content',
                        justifyContent: 'start',
                        color: '#d1ff04',
                        fontWeight: 'bold',
                        backgroundColor: '#000000',
                        pl: 2,
                        pr: 2,
                        borderRadius: '10px 0 0 0'
                      }}
                    >
                      {category.categoryName}
                    </Box>
                    {filteredList
                      .filter((p) => p.category.id === category.categoryId)
                      .filter((p) =>
                        ['admin', 'vendor'].includes(role)
                          ? true
                          : p.cantOrderSeparately
                          ? false
                          : p.isAvailable
                      )
                      ?.map((product) => (
                        <ProductItem product={product} key={product.itemId} />
                      ))}
                  </Typography>
                </Box>
              ))}
      </Box>
    </>
  );
};
