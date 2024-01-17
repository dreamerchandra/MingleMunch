import Tick from '@mui/icons-material/CheckCircle';
import { Box, Chip, Typography } from '@mui/material';
import { FC } from 'react';
import { useCategoryQuery } from './category-query';

export const CategoryList: FC<{
  shopId: string;
  selected: string[];
  onChange: (ids: string[]) => void;
}> = ({ shopId, selected, onChange }) => {
  const { data: categories } = useCategoryQuery(shopId);
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
        {categories?.map((category) => (
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
            icon={selected.includes(category.categoryId) ? <Tick /> : undefined}
          />
        ))}
      </Box>
    </Box>
  );
};
