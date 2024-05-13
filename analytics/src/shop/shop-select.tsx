import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useState } from 'react';
import { useShopQuery } from '../query/use-hotel';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

export const ShopSelect = ({
  selectShop,
  setSelected
}: {
  selectShop: string[];
  setSelected: (selected: string[]) => void;
}) => {
  const { data: shops } = useShopQuery();
  const getNamesByIds = (ids: string[]) =>
    shops?.filter((s) => ids.includes(s.shopId)).map((s) => s.shopName);
  return (
    <FormControl sx={{ m: 1, width: 300 }}>
      <InputLabel id="select-shop">Select Shop</InputLabel>
      <Select
        value={selectShop}
        id="select-shop"
        label="Select Shop"
        onChange={(e) => setSelected(e.target.value as string[])}
        multiple
        renderValue={(selected) => getNamesByIds(selected)?.join(', ') ?? ''}
        MenuProps={MenuProps}
        placeholder="Select Shop"
      >
        {shops?.map((s) => (
          <MenuItem key={s.shopId} value={s.shopId}>
            <Checkbox checked={selectShop.indexOf(s.shopId) > -1} />
            <ListItemText primary={s.shopName} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
