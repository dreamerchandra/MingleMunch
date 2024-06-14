import { Box, Button, Input } from '@mui/material';
import { useUser } from '../firebase/auth';
import { useAppConfig, useMutateAppConfig } from './appconfig';
import { useState } from 'react';

export const MasterControl = () => {
  const { data } = useAppConfig();
  const { mutate, isLoading } = useMutateAppConfig();
  const {
    userDetails: { role }
  } = useUser();
  const [closeReason, setCloseReason] = useState('');
  if (role !== 'admin') {
    return null;
  }
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        justifyContent: 'center',
        mt: 2
      }}
    >
      <Button
        disabled={isLoading}
        variant="contained"
        onClick={() => {
          mutate({
            isOpen: !data?.isOpen,
            closeReason
          });
        }}
        color={data?.isOpen ? 'error' : 'success'}
      >
        {data?.isOpen ? 'Close App' : 'Open App'}
      </Button>
      <Input
        value={closeReason}
        onChange={(e) => {
          setCloseReason(e.target.value);
        }}
      />
    </Box>
  );
};
