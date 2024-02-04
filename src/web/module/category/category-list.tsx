import Tick from '@mui/icons-material/CheckCircle';
import { Box, Chip, Typography } from '@mui/material';
import Fuse from 'fuse.js';
import { FC, useEffect, useState } from 'react';
import { Category } from './category-query';

export const CategoryList: FC<{
  selected: string[];
  onChange: (ids: string[]) => void;
  search: string;
  categories?: Category[];
}> = ({ selected, onChange, search, categories }) => {
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
  const res = search
    ? fuse?.search(search).map((i) => i.item)
    : categories;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
        backgroundColor: '#fff',
        borderRadius: '5px',
        p: 1,
        gap: 1
      }}
    >
      <Typography
        variant="h6"
        sx={{
          pl: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontWeight: 'bold'
        }}
      >
        Categories
        <Typography
          variant="caption"
          sx={{
            color: 'GrayText'
          }}
        >
          (Tap to apply filter)
        </Typography>
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          pb: 2,
          overflowX: 'auto',
          width: 'min(100vw, 900px)',
          pr: 15,
        }}
      >
        {res?.map((category) => (
          <Chip
            key={category.categoryId}
            label={category.categoryName}
            color={
              selected.includes(category.categoryId) ? 'secondary' : 'info'
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
            sx={{
              fontWeight: '800'
            }}
            icon={selected.includes(category.categoryId) ? <Tick /> : undefined}
          />
        ))}
      </Box>
    </Box>
  );
};
