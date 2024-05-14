import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useState } from 'react';
import { Input } from '@mui/material';
import { useUser } from '../../firebase/auth';
import {
  useCreateHerCoupon,
  useHerCouponsQuery
} from './her-coupon-query';
import { LoadingButton } from '@mui/lab';
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
};

export const NewHerCoupon = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [coupon, setCoupon] = useState('' as string);
  const {
    userDetails: { role }
  } = useUser();
  const { data: herCoupons, isLoading } = useHerCouponsQuery();
  const { mutate, isLoading: isCreating } = useCreateHerCoupon();
  if (role !== 'admin') {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}
    >
      <Button onClick={handleOpen} variant="contained" color="info">
        New Coupon
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {isLoading ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box>
              {herCoupons?.map((coupon) => (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '50%'
                  }}
                >
                  <Typography key={coupon.coupon}>{coupon.coupon}</Typography>
                  <Typography color="green">
                    {Object.keys(coupon.invited).length}
                  </Typography>
                  <Typography color="green">
                    {Object.keys(coupon.usedBy).length}
                  </Typography>
                  <Button
                    onClick={() => {
                      const next5Days = new Date();
                      next5Days.setDate(next5Days.getDate() + 5);
                      const text = `🍔🍔 Craving something delicious? 🍕\n
                    Order now from GoBurn and enjoy free delivery \n https://delivery.goburn.in/coupon/${
                      coupon.coupon
                    } \n
                    Valid till: ${next5Days.toDateString()} \n`;
                      navigator.share?.({
                        text
                      });
                    }}
                  >
                    Share
                  </Button>
                </Box>
              ))}
            </Box>
          )}
          <Input
            placeholder="Coupon Code"
            value={coupon}
            onChange={(e) => {
              setCoupon(e.target.value.toUpperCase());
            }}
          />
          <LoadingButton
            loading={isCreating}
            onClick={() => {
              mutate(coupon);
              setCoupon('');
            }}
          >
            Save
          </LoadingButton>
        </Box>
      </Modal>
    </Box>
  );
};
