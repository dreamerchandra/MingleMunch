import {
  Box,
  Button,
  CircularProgress,
  Typography,
  styled
} from '@mui/material';
import {
  useOnboardReferralProgram,
  useUserConfig
} from '../../module/appconfig';
import { Check, CopyAll } from '@mui/icons-material';
import { FC, useState } from 'react';
import { LoadingButton } from '@mui/lab';

export const GettingStarted = () => {
  const { mutate, isLoading } = useOnboardReferralProgram();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 'calc(100dvh - 60px)',
        p: 0,
        backgroundColor: 'purple'
      }}
    >
      <Typography
        variant="h1"
        color="white"
        sx={{
          textAlign: 'center'
        }}
      >
        Invite Your Friend
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4
        }}
      >
        <Typography
          variant="h3"
          color="secondary.main"
          sx={{
            mt: 4
          }}
        >
          GET YOUR NEXT DELIVERY FREE
        </Typography>
      </Box>
      <Box
        sx={{
          position: 'fixed',
          bottom: 90,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <LoadingButton
          sx={{
            backgroundColor: 'white',
            color: '#151B33',
            padding: '10px 20px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0px 0px 10px 0px #0000001f'
          }}
          disabled={isLoading}
          loading={isLoading}
          onClick={() => {
            mutate();
          }}
        >
          <Typography className="rainbow_text_animated" variant="h2">
            {'>>'} GET STARTED {'<<'}
          </Typography>
        </LoadingButton>
      </Box>
    </Box>
  );
};

const StyledBox = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2),
  marginTop: theme.spacing(4),
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: 'white',
  gap: theme.spacing(2),
  boxShadow: '0px 0px 2px 0px #0000001f'
}));

const UserCard: FC<{ name: string; hasOrdered: boolean }> = ({
  name,
  hasOrdered
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 4
      }}
    >
      <Typography variant="h6">{name}</Typography>
      <Box
        sx={{
          px: 2,
          py: 1,
          borderRadius: '5px',
          backgroundColor: !hasOrdered ? '#f5deb3' : '#b9f5b3',
          color: !hasOrdered ? '#4b4b4b' : 'black'
        }}
      >
        {hasOrdered ? 'Ordered' : 'Invited'}
      </Box>
    </Box>
  );
};

export const InvitePage = () => {
  const [copied, setCoped] = useState(false);
  const { data: config } = useUserConfig();
  const referredUserIds = Object.keys(config?.referredUsers ?? {});
  return (
    <Box
      sx={{
        background: '#f5f5f5',
        height: 'calc(100dvh - 60px)'
      }}
    >
      <Box
        sx={{
          background: 'purple',
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
          p: 2,
          borderRadius: '0 0 16% 16%'
        }}
      >
        <Typography variant="h2" color="white">
          Refer & Get Free Delivery
        </Typography>
        <Typography variant="body1">
          Get you will free delivery when you friend places order
        </Typography>
      </Box>

      <Typography
        variant="h3"
        color="text.secondary"
        sx={{
          m: 4,
          mb: 2
        }}
      >
        Your Invite Code
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Button
          sx={{
            backgroundColor: 'white',
            color: 'black',
            px: 2,
            py: 1,
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0px 0px 10px 0px #0000001f',
            gap: 2
          }}
          onClick={() => {
            navigator.clipboard.writeText(config?.myReferralCodes ?? '');
            setCoped(true);
            setTimeout(() => {
              setCoped(false);
            }, 2000);
          }}
        >
          <Typography variant="h2" color="black">
            {config?.myReferralCodes}
          </Typography>
          {!copied ? <CopyAll /> : <Check />}
        </Button>
        {copied && <Typography>Now share within your group</Typography>}
      </Box>
      {referredUserIds.length > 0 ? (
        <StyledBox>
          <Typography variant="h3">Invited Member</Typography>
          {referredUserIds?.map((uid) => {
            const user = config?.referredUsers?.[uid];
            if (!user) return null;
            return <UserCard {...user} />;
          })}
          <Typography
            variant="h3"
            color="text.secondary"
            sx={{
              textAlign: 'center'
            }}
          >
            {(referredUserIds?.length ?? 0) === 3
              ? `Can't Invite More`
              : `${3 - (referredUserIds?.length ?? 0)} More left`}
          </Typography>
        </StyledBox>
      ) : null}
      <StyledBox>
        <Typography variant="h3">How it works</Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            alignItems: 'center'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              p: 1
            }}
          >
            1
          </Typography>
          <Typography variant="body1">
            Share the invite code with your friends.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            alignItems: 'center'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              p: 1
            }}
          >
            2
          </Typography>
          <Typography variant="body1">
            Your friend gets a free delivery coupon when they use the invite
            code.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            alignItems: 'center'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              p: 1
            }}
          >
            3
          </Typography>
          <Typography variant="body1">
            You receive a free delivery coupon when the referred friend places
            their first order.
          </Typography>
        </Box>
        <Typography
          variant="h3"
          color="text.secondary"
          sx={{
            mt: 1
          }}
        >
          Max 3 referrals
        </Typography>
      </StyledBox>
    </Box>
  );
};

export const InviteCode = () => {
  const { data: config, isLoading } = useUserConfig();
  if (isLoading) {
    return <CircularProgress />;
  }
  if (!config?.myReferralCodes) {
    return <GettingStarted />;
  }
  return <InvitePage />;
};
