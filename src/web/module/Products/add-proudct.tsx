import ChangeCircle from '@mui/icons-material/ChangeCircle';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  FormControl,
  FormControlLabel,
  Input,
  Switch,
  TextareaAutosize
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import { FC, useRef, useState } from 'react';
import { useUpdateProductMutation } from './product-query';
import { uploadImage } from '../../firebase/product';
import { useUser } from '../../firebase/auth';
import { TAX } from '../../../common/types/constant';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'react-toastify';

const StyleImg = styled('img')`
  width: 100%;
  object-fit: cover;
  cursor: pointer;
  height: 100%;
  transition: filter 0.5s ease;
`;

const Description = styled(TextareaAutosize)`
  width: 100%;
  height: 100px;
  resize: none;
  border: none;
  border-bottom: 1px;
  outline: none;
  padding: 10px;
  border-top: 0;
  border-left: 0;
  border-right: 0;
  font-family: inherit;
`;

const ChangeButton = styled(Button)`
  width: 100%;
  height: 143px;
  position: relative;
  transition: background 0.5s ease;
  .text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .change {
    position: absolute;
    top: 10px;
    right: 10px;
    span {
      color: red;
    }
  }
  &.fileActive {
    .text {
      display: none;
      color: white;
    }
    &:hover {
      background: rgba(0, 0, 0, 0.5);
      .text {
        display: block;
      }
      img {
        filter: brightness(50%);
      }
    }
  }
`;

const CardActionsWrapper = styled(CardActions)`
  display: flex;
  justify-content: space-between;
  margin: 0 16px;
`;

const PriceInput = styled(Input)`
  font-size: 0.75rem;
`;

const PriceWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  width: 20ch;
`;
const AddFilePicker: FC<{
  file: File | null;
  setFile: (file: File | null) => void;
}> = ({ file, setFile }) => {
  const ref = useRef<HTMLInputElement | null>(null);
  const openFileHandle = () => {
    ref.current?.click();
  };
  const changeFiles = () => {
    const files = ref.current?.files;
    if (files) {
      setFile(files[0]);
    }
  };
  return (
    <ChangeButton
      onClick={openFileHandle}
      className={`${file ? 'fileActive' : ''}`}
    >
      <div className="change">{file ? <ChangeCircle /> : <span>*</span>}</div>
      {file ? <StyleImg src={URL.createObjectURL(file)} alt="preview" /> : null}
      <input
        accept="image/*"
        name="image"
        style={{ display: 'none' }}
        ref={ref}
        type="file"
        onChange={changeFiles}
      />
      <div className="text">Add Image</div>
    </ChangeButton>
  );
};
const initialFormData = {
  file: null as File | null,
  name: '',
  description: '',
  price: '',
  isTaxIncluded: false
};

export const AddProducts = () => {
  const [isUpdating, setUpdating] = useState(false);
  const { mutate } = useUpdateProductMutation();
  const {
    userDetails: { role, loading }
  } = useUser();
  const [formData, setFormData] = useState(initialFormData);
  if (loading || role !== 'vendor') {
    return null;
  }
  return (
    <Container
      component="form"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const name = data.get('title');
        const description = data.get('description');
        const price = Number(data.get('price'));
        const isTaxIncluded = data.get('isTaxIncluded');
        const image = data.get('image');
        if (!name || !price || !image) {
          return;
        }
        setUpdating(true);
        const itemImage = await uploadImage(image as File);
        const product = {
          itemName: name as string,
          itemDescription: description as string,
          itemPrice: isTaxIncluded ? Math.round(price - price * TAX) : price,
          itemImage: itemImage
        };
        mutate(
          { ...product, isAvailable: true },
          {
            onSuccess: () => {
              setFormData(initialFormData);
              toast.success('Product updated successfully');
            },
            onSettled: () => {
              setUpdating(false);
            }
          }
        );
      }}
    >
      <Card sx={{ maxWidth: 345 }}>
        <CardMedia
          component={AddFilePicker}
          file={formData.file}
          setFile={(file) => {
            setFormData({ ...formData, file });
          }}
        />
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <FormControl required>
            <Input
              placeholder="Pizza"
              sx={{ width: '100%' }}
              name="title"
              style={{ fontSize: '1.5rem' }}
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
              }}
            />
          </FormControl>
          <FormControl>
            <Description
              placeholder="Mushroom, Cheese, Tomato, Basil, Olive Oil"
              name="description"
              maxRows={3}
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
              }}
            />
          </FormControl>
        </CardContent>
        <CardActionsWrapper>
          <PriceWrapper>
            <FormControl required>
              <PriceInput
                placeholder="Price"
                sx={{ width: '7ch' }}
                name="price"
                type="number"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                }}
              />
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  placeholder="With Tax"
                  aria-label="With Tax"
                  name="isTaxIncluded"
                />
              }
              label="With tax"
            />
          </PriceWrapper>
          <LoadingButton
            size="small"
            type="submit"
            disabled={isUpdating}
            loading={isUpdating}
          >
            Save
          </LoadingButton>
        </CardActionsWrapper>
      </Card>
    </Container>
  );
};
