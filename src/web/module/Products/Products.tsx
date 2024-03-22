import {
  AutoAwesome,
  ExpandLessOutlined,
  ExpandMoreOutlined,
  UnfoldLess,
  UnfoldMore
} from '@mui/icons-material';
import { Paper } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Fuse from 'fuse.js';
import { FC, useEffect, useMemo, useState } from 'react';
import { Product } from '../../../common/types/Product';
import { useUser } from '../../firebase/auth';
import { useShopQuery } from '../Shop/shop-query';
import { CategoryList } from '../category/category-list';
import { useCategoryQuery } from '../category/category-query';
import { ProductItem } from './Product-iitems';
import { useProductsQuery } from './product-query';
import { SkeletonLoading } from '../Shop/shop-list';

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


  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          pt: 2,
          alignItems: 'center',
          gap: 1,
          pb: 16
        }}
      >
        <SkeletonLoading />
        <SkeletonLoading />
        <SkeletonLoading />
        <SkeletonLoading />
        <SkeletonLoading />
      </Box>
    )
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
          variant="h4"
          component="h1"
          color="text.secondary"
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
              elevation={0}
                sx={{
                  background: 'linear-gradient(90deg, #000 10%, #FF8C00 90%)',
                  px: 1,
                  py: 1,
                  color: '#fff',
                  borderRadius: '5px',
                  fontSize: '0.6rem',
                  width: 'fit-content',
                  fontWeight: '900',
                  height: 'fit-content'
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
                if ((collapsed.length - 1) === categories?.length) {
                  setCollapsed([]);
                } else {
                  setCollapsed([
                    '-1',
                    ...(categories?.map((c) => c.categoryId) ?? [])
                  ]);
                }
              }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {categories?.length === collapsed.length - 1 ? (
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100svh - 400px)',
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
            ?.filter((category) => {
              if (['admin', 'vendor'].includes(role)) {
                return true;
              }
              if (search !== '' && category.categoryId === '-1') {
                return false;
              }
              if (category.categoryId === '-1') {
                return true;
              }
              return filteredList.some((i) => {
                return i.category.id === category.categoryId;
              });
            })
            ?.map((category) => (
              <Box
                key={category.categoryId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  mb: 1,
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
                      top: '0px',
                      zIndex: 100,
                      background: '#fff'
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
                          variant="body1"
                          component="h2"
                          sx={{
                            fontWeight: 'bold',
                            color: category.categoryId === '-1' ? '#b9ffe7': 'aliceblue',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          {category.categoryId === '-1' && (
                            <AutoAwesome
                              sx={{
                                color: '#53e8b4',
                                fontSize: '16px'
                              }}
                            />
                          )}
                          {category.categoryName}
                        </Typography>
                      </Box>
                      {collapsed.includes(category.categoryId) ? (
                        <ExpandMoreOutlined
                          sx={{
                            fontSize: '25px',
                            borderRadius: '50%'
                          }}
                        />
                      ) : (
                        <ExpandLessOutlined
                          sx={{
                            fontSize: '25px',
                            borderRadius: '50%'
                          }}
                        />
                      )}
                    </Container>
                  </Box>
                  {category.categoryId === '-1' &&
                    !collapsed.includes('-1') &&
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
            bottom: 0,
            zIndex: 10000,
          }}
        >
          <CategoryList
            categories={
              categories?.filter(
                (c) =>
                  c.categoryId !== '-1' &&
                  data?.some((i) => i.category.id === c.categoryId)
              ) ?? []
            }
            search={search}
            selected={selectedCategoryIds}
            onChange={(e) => setCategory(e)}
          />
        </Box>
      </Box>
    </>
  );
};
