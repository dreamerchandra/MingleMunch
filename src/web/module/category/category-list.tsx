import { useAutoAnimate } from '@formkit/auto-animate/react';
import {
  KeyboardArrowDownOutlined,
  KeyboardArrowUpOutlined,
  TuneOutlined
} from '@mui/icons-material';
import { Badge, Box, Button, Chip, styled } from '@mui/material';
import Fuse from 'fuse.js';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { Category } from './category-query';

const StyledUl = styled('ul')<{ wrap: boolean }>`
  display: flex;
  list-style: none;
  gap: 4px;
  margin: 0;
  margin-block: 0;
  padding: 0;
  flex-wrap: ${(props) => (props.wrap ? 'wrap' : 'nowrap')};
  width: 89%;
  overflow-x: auto;
  padding: 8px;
  padding-top: 0;
`;

const SwipeUpDetector: FC<{
  children: ReactNode;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
}> = ({ children, onSwipeUp, onSwipeDown }) => {
  const touchStartY = useRef(null);

  const handleTouchStart = (e: any) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: any) => {
    if (!touchStartY.current) return;

    const touchEndY = e.touches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;

    if (deltaY > 50) {
      // Perform your swipe up action here
      console.log('Swipe Up Detected!');
      // Reset touchStartY
      touchStartY.current = null;
      onSwipeUp();
    } else if (deltaY < -50) {
      onSwipeDown();
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => (touchStartY.current = null)}
      style={{
        display: 'flex',
        gap: '8px'
      }}
    >
      {children}
    </div>
  );
};

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
  const _res = search ? fuse?.search(search).map((i) => i.item) : categories;
  const res = _res?.length ? _res : categories;
  const selectedCategories =
    res?.filter((category) => selected.includes(category.categoryId)) ?? [];
  const notSelectedCategories =
    res?.filter((category) => !selected.includes(category.categoryId)) ?? [];
  const [wrap, setWrap] = useState(false);

  return (
    <SwipeUpDetector
      onSwipeUp={() => {
        setWrap(true);
      }}
      onSwipeDown={() => {
        setWrap(false);
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'start',
          backgroundColor: '#e6e6e6',
          borderRadius: '5px',
          width: 'min(100vw, 900px)',
          boxShadow: '5px 0px 10px 0px rgba(0,0,0,0.1)',
          alignItems: 'center'
        }}
      >
        <Button
          onClick={() => {
            setWrap(!wrap);
          }}
          sx={{
            p: 0,
          }}
        >
          {wrap ? <KeyboardArrowDownOutlined /> : <KeyboardArrowUpOutlined />}
        </Button>
        <Button
          onClick={() => {
            onChange([]);
          }}
          sx={{
            position: 'absolute',
            right: 20,
            top: 25,
            backgroundColor: '#e6e6e6',
            p: 0,
            px: 1,
            minWidth: 0,
            zIndex: 1
          }}
        >
          <Badge badgeContent={selected.length} color="primary">
            <TuneOutlined />
          </Badge>
        </Button>
        <Box
          style={{
            display: 'flex',
            gap: '8px'
          }}
        >
          <StyledUl ref={animationParent} wrap={wrap}>
            {[...selectedCategories, ...notSelectedCategories]?.map(
              (category) => (
                <li key={category.categoryId}>
                  <Chip
                    label={category.categoryName}
                    color={
                      selected.includes(category.categoryId)
                        ? 'primary'
                        : 'info'
                    }
                    variant={
                      selected.includes(category.categoryId)
                        ? 'filled'
                        : 'outlined'
                    }
                    onClick={() => {
                      if (selected.includes(category.categoryId)) {
                        onChange(
                          selected.filter(
                            (item) => item !== category.categoryId
                          )
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
    </SwipeUpDetector>
  );
};
