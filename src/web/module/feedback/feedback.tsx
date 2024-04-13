import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { LoadingButton } from '@mui/lab';
import { TextareaAutosize, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Rating, { IconContainerProps } from '@mui/material/Rating';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { useLastOrder } from '../LastOrder/last-order';
import { Center, FullScreen } from '../full-screen';
import { useFeedback, useFeedbackMutation } from './use-feedback';

const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
    color: theme.palette.action.disabled
  },
  '* svg': {
    fontSize: '3rem'
  }
}));

const Wrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  padding: '2px',
  alignItems: 'start',
  margin: 'auto',
  marginBottom: '16px'
});

const customIcons: {
  [index: string]: {
    icon: React.ReactElement;
    label: string;
  };
} = {
  1: {
    icon: <SentimentVeryDissatisfiedIcon color="error" />,
    label: 'Very Dissatisfied'
  },
  2: {
    icon: <SentimentDissatisfiedIcon color="error" />,
    label: 'Dissatisfied'
  },
  3: {
    icon: <SentimentSatisfiedIcon color="warning" />,
    label: 'Neutral'
  },
  4: {
    icon: <SentimentSatisfiedAltIcon color="success" />,
    label: 'Satisfied'
  },
  5: {
    icon: <SentimentVerySatisfiedIcon color="success" />,
    label: 'Very Satisfied'
  }
};

function IconContainer(props: IconContainerProps & { rating: number | null }) {
  const { value, rating, ...other } = props;
  const color = value < 7 ? '#f66b6b' : value >= 9 ? '#99ed50' : '#f4ff1e';
  return (
    <span
      {...other}
      style={{
        padding: '8px',
        border: `1px solid #b3b2b2`,
        margin: '3px',
        borderRadius: '8px',
        color: '#000',
        background: (rating ?? 0) >= value ? color : '',
        fontWeight: '600',
        fontSize: '12px'
      }}
    >
      {value}
    </span>
  );
}

export const Feedback = () => {
  const lastOrder = useLastOrder();
  const { data, isLoading } = useFeedback();
  const { mutate, isLoading: isMutating } = useFeedbackMutation();
  const [rating, setRating] = useState<null | number>(null);
  const [suggestion, setSuggestion] = useState('');
  const isLastOrderDelivered = lastOrder?.status === 'delivered';
  if(data?.length) {
    return null;
  } 
  if (!isLastOrderDelivered || isLoading) {
    return null;
  }
  return (
    <FullScreen>
      <Center>
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0px 0px 20px 0px #151B331f',
            width: 'min(90vw, 1200px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography
            sx={{
              fontWeight: 'bold',
              mb: 1,
              p: 2
            }}
            variant="h6"
          >
            How likely are you to recommend us to a friend?
          </Typography>
          <Wrapper>
            <StyledRating
              name="highlight-selected-only"
              IconContainerComponent={(prop) => (
                <IconContainer {...prop} rating={rating} />
              )}
              max={10}
              getLabelText={(value: number) =>
                customIcons[(value % 5) + 1].label
              }
              value={rating}
              onChange={(_, newValue) => {
                setRating(newValue);
              }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 0
              }}
            />
            <Typography variant="caption">Not Likely</Typography>
          </Wrapper>
          <Wrapper
            sx={{
              margin: '8px',
              alignItems: 'normal'
            }}
          >
            <TextareaAutosize
              minRows={4}
              placeholder="Please feel free to leave your suggestion!"
              style={{
                fontFamily: 'sans-serif'
              }}
              value={suggestion}
              onChange={(e) => {
                setSuggestion(e.target.value);
              }}
            />
          </Wrapper>
          <LoadingButton
            loading={isMutating}
            variant="contained"
            color="secondary"
            sx={{
              p: 2
            }}
            disabled={rating === null}
            onClick={() => {
              mutate({
                orderId: lastOrder.orderId,
                rating: rating || 0,
                suggestion
              });
            }}
          >
            Submit
          </LoadingButton>
        </Box>
      </Center>
    </FullScreen>
  );
};
