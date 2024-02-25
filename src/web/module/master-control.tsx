import { Box, Button } from '@mui/material';
import { useUser } from '../firebase/auth';
import { useAppConfig, useMutateAppConfig } from './appconfig';

export const MasterControl = () => {
  const { data } = useAppConfig();
  const { mutate, isLoading } = useMutateAppConfig();
  const {
    userDetails: { role }
  } = useUser();
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
            isOpen: !data?.isOpen
          });
        }}
        color={data?.isOpen ? 'error' : 'success'}
      >
        {data?.isOpen ? 'Close App' : 'Open App'}
      </Button>
      {/* <Button
        disabled={isLoading}
        variant="contained"
        onClick={async () => {
          await generateReport();
          setReportGenerated(true);
          setTimeout(() => {
            setReportGenerated(false);
          }, 3000);
        }}
        color="secondary"
      >
        {reportGenerated ? 'Report Generated' : 'Generate Report'}
      </Button> */}
    </Box>
  );
};
