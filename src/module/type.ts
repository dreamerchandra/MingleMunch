import { Dispatch, SetStateAction } from 'react';

export interface DrawerProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}
