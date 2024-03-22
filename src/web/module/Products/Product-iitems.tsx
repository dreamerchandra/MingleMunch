import { Add, Remove } from '@mui/icons-material';
import AddToCart from '@mui/icons-material/AddShoppingCart';
import Edit from '@mui/icons-material/Edit';
import LoadingButton from '@mui/lab/LoadingButton';
import { Drawer } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../../common/types/Product';
import { useCart } from '../Shoping/cart-activity';
import { useMutationProductEdit, useProductQuery } from './product-query';

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
        pr: 1,
      }}
    >
      <div>
        {inCart.length ? (
          <Container
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'end',
              p: 0
            }}
          >
            <Button
              size="small"
              sx={{
                paddingLeft: '16px',
                paddingRight: '16px',
                minWidth: '0px'
              }}
              onClick={() => removeFromCart(product)}
            >
              <Remove fontSize="small" />
            </Button>
            <Typography variant="h4" color="green">
              {inCart.length}
            </Typography>
            <Button
              size="small"
              sx={{
                paddingLeft: '16px',
                paddingRight: '16px',
                minWidth: '0px'
              }}
              onClick={() => {
                onAdd();
                addToCart(product);
              }}
            >
              <Add fontSize="small" />
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
                  setTimeout(() => {
                    onAdd();
                    addToCart(product);
                  }, 100); // little animation
                }}
                variant="outlined"
                sx={{
                  borderRadius: '10px',
                  fontWeight: '900',
                  border: '2px solid #4caf50',
                  boxShadow:
                    '1px 1px 0px 0px, 1px 1px 0px 0px, 1px 1px 0px 0px, 2px 2px 0px 0px, 2px 2px 0px 0px',
                  position: 'relative',
                  fontSize: '0.6rem',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  ':active': {
                    boxShadow: '0px 0px 0px 0px',
                    top: '5px',
                    left: '5px'
                  }
                }}
                disableRipple
              >
                <Add fontSize="small" />
                ADD
              </Button>
            )}
          </Container>
        )}
      </div>

      {product.suggestionIds && product.suggestionIds.length > 0 && (
        <Typography
          variant="caption"
          onClick={() => {
            onAdd();
            addToCart(product);
          }}
        >
          Customization
        </Typography>
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
        variant="body2"
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
      {description.length > 20 ? (
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

export const ProductItem: FC<{
  product: Product;
  isSuggestion?: boolean;
  allowEdit: boolean;
}> = ({ product, isSuggestion = false, allowEdit }) => {
  const { itemDescription, itemName, itemPrice: itemPrice } = product;
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
          <Typography variant="h4" component="h2">
            {itemName}
          </Typography>
          <ItemDescription description={itemDescription} />

          <Typography variant="body1" color="text.secondary">
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
          zIndex: 20000
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
