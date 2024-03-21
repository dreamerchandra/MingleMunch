import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Box, Chip, Typography, styled } from '@mui/material';
import Fuse from 'fuse.js';
import { FC, useEffect, useState } from 'react';
import { Category } from './category-query';

const StyledUl = styled('ul')`
  display: flex;
  list-style: none;
  gap: 4px;
  margin: 0;
  margin-block: 0;
  padding: 0;
`;

export const CategoryList: FC<{
  selected: string[];
  onChange: (ids: string[]) => void;
  search: string;
  categories?: Category[];
}> = ({ selected, onChange, search, categories }) => {
  const [fuse, setFuse] = useState<Fuse<Category>>();
  const [animationParent] = useAutoAnimate({
    duration: 450,
    easing: 'ease-in-out',
    disrespectUserMotionPreference: true
  });

  useEffect(() => {
    if (categories == null) return;
    const fuseOptions = {
      shouldSort: true,
      keys: ['categoryName']
    };
    const fuse = new Fuse(categories, fuseOptions);
    setFuse(fuse);
  }, [categories]);
  const res = search ? fuse?.search(search).map((i) => i.item) : categories;
  const selectedCategories =
    res?.filter((category) => selected.includes(category.categoryId)) ?? [];
  const notSelectedCategories =
    res?.filter((category) => !selected.includes(category.categoryId)) ?? [];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
        backgroundColor: '#fff',
        borderRadius: '5px',
        p: 1
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
          pr: 15
        }}
      >
        <StyledUl ref={animationParent}>
          {[...selectedCategories, ...notSelectedCategories]?.map(
            (category) => (
              <li key={category.categoryId}>
                <Chip
                  label={category.categoryName}
                  color={
                    selected.includes(category.categoryId) ? 'primary' : 'info'
                  }
                  variant={
                    selected.includes(category.categoryId)
                      ? 'filled'
                      : 'outlined'
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
                    fontWeight: '700',
                    border: 0,
                    borderRadius: '5px'
                  }}
                />
              </li>
            )
          )}
        </StyledUl>
      </Box>
    </Box>
  );
};
