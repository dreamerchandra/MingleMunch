import {
  Add,
  ArrowDropDown,
  ArrowDropUp,
  Remove,
  UnfoldLess,
  UnfoldMore
} from '@mui/icons-material';
import AddToCart from '@mui/icons-material/AddShoppingCart';
import Edit from '@mui/icons-material/Edit';
import LoadingButton from '@mui/lab/LoadingButton';
import { Drawer, Paper } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Fuse from 'fuse.js';
import { FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../../common/types/Product';
import { useUser } from '../../firebase/auth';
import { useShopQuery } from '../Shop/shop-query';
import { useCart } from '../Shoping/cart-activity';
import { CategoryList } from '../category/category-list';
import { useCategoryQuery } from '../category/category-query';
import {
  useMutationProductEdit,
  useProductQuery,
  useProductsQuery
} from './product-query';

const FooterActions: FC<{
  product: Product;
  onAdd: () => void;
  isSuggestion: boolean;
  allowEdit: boolean;
}> = ({ product, onAdd, allowEdit }) => {
  const { addToCart, removeFromCart, cartDetails } = useCart();
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
        justifyContent: 'end',
        p: 0,
        pr: 1
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
            {allowEdit ? (
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
                onClick={() => {
                  onAdd();
                  addToCart(product);
                }}
                variant="outlined"
                sx={{
                  borderRadius: '10px',
                  fontWeight: '900',
                  border: '2px solid #4caf50',
                  boxShadow:
                    '1px 1px 0px 0px, 1px 1px 0px 0px, 1px 1px 0px 0px, 2px 2px 0px 0px, 2px 2px 0px 0px',
                  position: 'relative',
                  ':active': {
                    boxShadow: '0px 0px 0px 0px',
                    top: '5px',
                    left: '5px'
                  }
                }}
                disableRipple
              >
                <Add />
                ADD
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
  return <ProductItem product={product} isSuggestion allowEdit={false} />;
};

const ItemDescription: FC<{ description: string }> = ({ description }) => {
  const [more, setMore] = useState(false);
  return (
    <div>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: !more ? 2 : 'none'
        }}
      >
        {description}
      </Typography>
      {description.length > 15 ? (
        <Button
          onClick={() => {
            setMore(!more);
          }}
          size="small"
        >
          Read More
        </Button>
      ) : null}
    </div>
  );
};

const ProductItem: FC<{
  product: Product;
  isSuggestion?: boolean;
  allowEdit: boolean;
}> = ({ product, isSuggestion = false, allowEdit }) => {
  const { itemDescription, itemName, itemPrice } = product;
  const [open, setOpen] = useState(false);

  return (
    <div style={{}}>
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
          <ItemDescription description={itemDescription} />

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
            allowEdit={allowEdit}
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
  allowEdit: boolean;
  setAllowEdit: (edit: boolean) => void;
}> = ({ search, shopId, onSearch, allowEdit, setAllowEdit }) => {
  const {
    userDetails: { role, loading }
  } = useUser();
  const { data: shops } = useShopQuery();
  const [selectedCategoryIds, setCategory] = useState<string[]>([]);
  const { data: categories } = useCategoryQuery(shopId);
  const [collapsed, setCollapsed] = useState<string[]>([]);

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
  const shop = shops?.find((shop) => shop.shopId === shopId);
  const shopName = shop?.shopName ?? 'Loading...';

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
        <Typography
          variant="h2"
          component="h1"
          sx={{ margin: 'auto' }}
          onClick={() => {
            if (['admin', 'vendor'].includes(role)) {
              setAllowEdit(!allowEdit);
            }
          }}
        >
          {shopName}
        </Typography>
        {selectedCategoryIds.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              mb: 1
            }}
          >
            {shop?.deliveryFee === 0 ? (
              <Paper
                sx={{
                  background: 'linear-gradient(90deg, #000 10%, #FF8C00 90%)',
                  px: 1,
                  py: 1,
                  color: '#fff',
                  borderRadius: '5px',
                  fontSize: '13px',
                  width: 'fit-content',
                  fontWeight: '900'
                }}
              >
                # FREE DELIVERY
              </Paper>
            ) : (
              <>.</>
            )}
            <button
              color="info"
              onClick={() => {
                if (collapsed.length) {
                  setCollapsed([]);
                } else {
                  setCollapsed(categories?.map((c) => c.categoryId) ?? []);
                }
              }}
              style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {categories?.length === collapsed.length ? (
                <UnfoldMore />
              ) : (
                <UnfoldLess />
              )}
            </button>
          </Box>
        )}

        <div style={{ height: '4px' }}></div>
        {filteredList.length === 0 && (
          <Container
            sx={{
              height: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0
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
        {selectedCategoryIds.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: 'min(90vw, 900px)',
              px: 1,
              backgroundColor: '#fff',
              justifyItems: 'space-between',
              borderRadius: '10px',
              boxShadow: '0px 0px 10px 0px #0000001f'
            }}
          >
            {filteredList?.map((product) => (
              <ProductItem
                product={product}
                key={product.itemId}
                allowEdit={allowEdit}
              />
            ))}
          </Box>
        ) : (
          categories
            ?.filter((category) =>
              filteredList.some((i) => i.category.id === category.categoryId)
            )
            ?.map((category) => (
              <Box
                key={category.categoryId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  mb: 2,
                  background: '#fff',
                  p: 1,
                  boxShadow: '0px 0px 10px 0px #0000001f'
                }}
              >
                <Typography
                  key={category.categoryId}
                  variant="h5"
                  component="h2"
                  sx={{
                    alignSelf: 'start',
                    width: 'min(90vw, 900px)'
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'start',
                      gap: 5,
                      justifyContent: 'start',
                      width: '100%',
                      position: 'sticky',
                      top: '5px',
                      zIndex: 100
                    }}
                    onClick={() => {
                      if (collapsed.includes(category.categoryId)) {
                        setCollapsed((prev) =>
                          prev.filter((c) => c !== category.categoryId)
                        );
                      } else {
                        setCollapsed((prev) => [...prev, category.categoryId]);
                      }
                    }}
                  >
                    <Container
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        p: 0
                      }}
                    >
                      <Typography
                        variant="h5"
                        component="h2"
                        sx={{
                          fontWeight: 'bold',
                          backgroundColor: '#000',
                          px: 2,
                          borderRadius: '5px',
                          color: '#d1ff04'
                        }}
                      >
                        {category.categoryName}
                      </Typography>
                      {collapsed.includes(category.categoryId) ? (
                        <ArrowDropDown
                          sx={{
                            fontSize: '25px',
                            color: '#ff0000',
                            backgroundColor: '#c3c0c0a2',
                            borderRadius: '50%'
                          }}
                        />
                      ) : (
                        <ArrowDropUp
                          sx={{
                            fontSize: '25px',
                            color: '#ff0000',
                            backgroundColor: '#c3c0c0a2',
                            borderRadius: '50%'
                          }}
                        />
                      )}
                    </Container>
                  </Box>
                  {filteredList
                    .filter((p) => p.category.id === category.categoryId)
                    .filter(() => !collapsed.includes(category.categoryId))
                    .filter((p) =>
                      ['admin', 'vendor'].includes(role)
                        ? true
                        : p.cantOrderSeparately
                        ? false
                        : p.isAvailable
                    )
                    ?.map((product) => (
                      <ProductItem
                        product={product}
                        key={product.itemId}
                        allowEdit={allowEdit}
                      />
                    ))}
                </Typography>
              </Box>
            ))
        )}
        <Box
          sx={{
            position: 'fixed',
            bottom: '56px',
            left: 0
          }}
        >
          <CategoryList
            shopId={shopId}
            search={search}
            selected={selectedCategoryIds}
            onChange={(e) => setCategory(e)}
          />
        </Box>
      </Box>
    </>
  );
};
