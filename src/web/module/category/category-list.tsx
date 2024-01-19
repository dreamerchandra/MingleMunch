import Tick from '@mui/icons-material/CheckCircle';
import { Box, Chip, Typography } from '@mui/material';
import Fuse from 'fuse.js';
import { FC, useEffect, useState } from 'react';
import { Category, useCategoryQuery } from './category-query';

export const CategoryList: FC<{
  shopId: string;
  selected: string[];
  onChange: (ids: string[]) => void;
  search: string;
}> = ({ shopId, selected, onChange, search }) => {
  const { data: categories } = useCategoryQuery(shopId);
  const [fuse, setFuse] = useState<Fuse<Category>>();

  useEffect(() => {
    if (categories == null) return;
    const fuseOptions = {
      shouldSort: true,
      keys: ['categoryName']
    };
    const fuse = new Fuse(categories, fuseOptions);
    setFuse(fuse);
  }, [categories]);
  const res = search ? fuse
  ?.search(search)
  .map((i) => i.item) : categories;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',

        mt: 2,
        gap: 1
      }}
    >
      <Typography variant="caption">Categories(Tap to apply filter)</Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          pb: 2,
          overflowX: 'auto',
          width: 'min(90vw, 900px)'
        }}
      >
        {res
          ?.map((category) => (
            <Chip
              key={category.categoryId}
              label={category.categoryName}
              color={
                selected.includes(category.categoryId) ? 'secondary' : 'default'
              }
              variant={
                selected.includes(category.categoryId) ? 'filled' : 'outlined'
              }
              onClick={() => {
                if (selected.includes(category.categoryId)) {
                  onChange(
                    selected.filter((item) => item !== category.categoryId)
                  );
                } else {
                  onChange([...selected, category.categoryId]);
                }
              }}
              icon={
                selected.includes(category.categoryId) ? <Tick /> : undefined
              }
            />
          ))}
      </Box>
    </Box>
  );
};
