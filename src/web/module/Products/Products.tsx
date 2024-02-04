import { useTheme } from '@emotion/react';
import {
  ArrowDropDown,
  ArrowDropUp,
  AutoAwesome,
  UnfoldLess,
  UnfoldMore
} from '@mui/icons-material';
import { Paper } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Fuse from 'fuse.js';
import { FC, useEffect, useMemo, useState } from 'react';
import { Product } from '../../../common/types/Product';
import { useUser } from '../../firebase/auth';
import { useShopQuery } from '../Shop/shop-query';
import { CategoryList } from '../category/category-list';
import { useCategoryQuery } from '../category/category-query';
import { useProductsQuery } from './product-query';
import { ProductItem } from './Product-iitems';

const fuseOptions = {
  shouldSort: true,
  keys: ['itemName'],
  threshold: 0.3
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
  useEffect(() => {
    setCollapsed(
      categories
        ?.filter((c) => c.categoryId !== '-1')
        ?.map((c) => c.categoryId) ?? []
    );
  }, [categories]);
  useEffect(() => {
    if (search === '') return;
    setCollapsed([]);
  }, [search]);

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
  const theme = useTheme() as {
    breakpoints: { down: (key: string) => string };
  };

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
              boxShadow: '0px 0px 2px 0px #0000001f'
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
              filteredList.some((i) =>
                search === ''
                  ? i.category.id === category.categoryId ||
                    category.categoryId === '-1'
                  : i.category.id === category.categoryId
              )
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
                      <Box
                        sx={{
                          background: 'black',
                          borderRadius: '5px',
                          px: 1
                        }}
                      >
                        <Typography
                          variant="h5"
                          component="h2"
                          sx={{
                            fontWeight: 'bold',
                            color: 'aliceblue',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 1
                          }}
                          className={
                            category.categoryId === '-1'
                              ? 'rainbow_text_animated'
                              : ''
                          }
                        >
                          {category.categoryId === '-1' && (
                            <AutoAwesome
                              fontSize="small"
                              sx={{
                                color: '#53e8b4'
                              }}
                            />
                          )}
                          {category.categoryName}
                        </Typography>
                      </Box>
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
                  {category.categoryId === '-1' &&
                    filteredList
                      .filter((p) => p.isRecommended)
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
            bottom: 60,
            zIndex: 100,
            boxShadow: '2px 2px 10px 0px #0000001f',
            [theme.breakpoints.down('md')]: {
              left: 10
            }
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
