import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import { FC, useState } from 'react';
import { useUser } from '../../firebase/auth';
import { useCategoryMutation } from './category-query';

const initialFormData = {
  name: ''
};

export const AddCategory: FC<{ shopId: string }> = ({ shopId }) => {
  const [formData, setFormData] = useState(initialFormData);
  const { mutate, isLoading } = useCategoryMutation({
    onSuccess: () => {
      setFormData(initialFormData);
    }
  });
  const {
    userDetails: { role, loading }
  } = useUser();
  if (loading || role === 'user') {
    return null;
  }

  return (
    <Container
      component="form"
      sx={{
        mt: 4
      }}
      onSubmit={(e) => {
        e.preventDefault();
        mutate({
          categoryName: formData.name,
          shopId: shopId
        });
      }}
    >
      <Card sx={{ maxWidth: 345, p: 3 }}>
        <FormControl required>
          <Input
            placeholder="Category Eg: Breads"
            sx={{ width: '100%' }}
            name="Add Category"
            style={{ fontSize: '1.5rem' }}
            value={formData.name}
            autoComplete="off"
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
            }}
          />
        </FormControl>
        <CardActionArea
          disableRipple
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 2
          }}
        >
          <LoadingButton
            size="small"
            type="submit"
            disabled={isLoading}
            loading={isLoading}
          >
            Save
          </LoadingButton>
        </CardActionArea>
      </Card>
    </Container>
  );
};
