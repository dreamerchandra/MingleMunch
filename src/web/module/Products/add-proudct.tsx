import ChangeCircle from '@mui/icons-material/ChangeCircle';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Checkbox,
  FormControl,
  FormControlLabel,
  Input,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextareaAutosize
} from '@mui/material';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import { FC, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useUser } from '../../firebase/auth';
import { uploadImage } from '../../firebase/product';
import { useCategoryQuery } from '../category/category-query';
import {
  useStaleProductQuery,
  useProductsQuery,
  useUpdateProductMutation
} from './product-query';
import { useNavigate, useParams } from 'react-router-dom';

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
  justify-content: end;
  margin: 0 16px;
`;

const TwoCol = styled('div')`
  display: flex;
  gap: 2;
  align-items: center;
  justify-content: space-between;
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
  isTaxIncluded: false,
  categoryId: '',
  suggestionIds: [] as string[],
  parcelCharges: '',
  cantOrderSeparately: false
};

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

export const AddProducts: FC<{ shopId: string }> = ({ shopId }) => {
  const [isUpdating, setUpdating] = useState(false);
  const { mutate } = useUpdateProductMutation();
  const { data: categories } = useCategoryQuery(shopId);
  const params = useParams();
  const { productId } = params;
  const {
    userDetails: { role, loading }
  } = useUser();
  const [formData, setFormData] = useState(initialFormData);
  const { data: products } = useProductsQuery({
    isEnabled: true,
    shopId: shopId,
    search: ''
  });
  const getProductById = useStaleProductQuery({ shopId });
  const navigate = useNavigate();

  useEffect(() => {
    if (!productId) {
      return;
    }
    const product = getProductById(productId);
    if (!product) {
      navigate(`/shop/${shopId}`, {
        replace: true
      });
      return;
    }
    setFormData({
      file: null,
      name: product.itemName,
      description: product.itemDescription,
      price: product.itemPrice.toString(),
      isTaxIncluded: false,
      categoryId: product.category.id,
      parcelCharges: product.parcelCharges?.toString() ?? '',
      suggestionIds: product.suggestionIds ?? [],
      cantOrderSeparately: product.cantOrderSeparately ?? false
    });
  }, [getProductById, navigate, productId, shopId]);

  if (loading || role === 'user') {
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
        const image = data.get('image');
        const category = data.get('category');
        if (!name || !price || !image || !category || !categories) {
          return;
        }
        setUpdating(true);
        const itemImage = await uploadImage(image as File);
        const product = {
          itemName: name as string,
          itemDescription: description as string,
          itemPrice: price,
          parcelCharges: Number(data.get('parcelCharges')) ?? 0,
          itemImage: itemImage,
          category: {
            name: categories.find((i) => i.categoryId == category)!
              .categoryName as string,
            id: category as string
          },
          suggestionIds: formData.suggestionIds,
          cantOrderSeparately: formData.cantOrderSeparately
        };
        mutate(
          { ...product, isAvailable: true, shopId, itemId: productId || '' },
          {
            onSuccess: () => {
              setFormData(initialFormData);
              navigate(`/shop/${shopId}`, {
                replace: true
              });
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
          <FormControl fullWidth>
            <InputLabel id="suggestion">Suggestion</InputLabel>
            <Select
              labelId="suggestion"
              name="suggestion"
              value={formData.suggestionIds}
              multiple
              input={<OutlinedInput label="Tag" />}
              renderValue={(selected) =>
                selected
                  .map((i) => products?.find((c) => c.itemId === i)?.itemName)
                  .join(', ')
              }
              onChange={(e) => {
                setFormData({
                  ...formData,
                  suggestionIds:
                    typeof e.target.value === 'string'
                      ? e.target.value.split(',')
                      : e.target.value
                });
              }}
              MenuProps={MenuProps}
            >
              {products
                ?.filter((p) => p.cantOrderSeparately)
                .map((product) => (
                  <MenuItem value={product.itemId} key={product.itemId}>
                    <Checkbox
                      checked={
                        formData.suggestionIds.indexOf(product.itemId) > -1
                      }
                    />
                    {product.itemName}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TwoCol>
            <FormControl fullWidth>
              <InputLabel id="category">Category</InputLabel>
              <Select
                labelId="category"
                name="category"
                value={formData.categoryId}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    categoryId: e.target.value as string
                  });
                }}
              >
                {categories?.map((category) => (
                  <MenuItem
                    value={category.categoryId}
                    key={category.categoryId}
                  >
                    {category.categoryName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl required fullWidth>
              <Input
                placeholder="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                }}
              />
            </FormControl>
          </TwoCol>
          <TwoCol>
            <FormControl fullWidth>
              <Input
                placeholder="Packing Charges (Rs. 3)"
                name="parcelCharges"
                type="number"
                value={formData.parcelCharges}
                onChange={(e) => {
                  setFormData({ ...formData, parcelCharges: e.target.value });
                }}
              />
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  name="cantOrderSeparately"
                  checked={formData.cantOrderSeparately}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      cantOrderSeparately: e.target.checked
                    });
                  }}
                />
              }
              label="Customization"
              labelPlacement="start"
            />
          </TwoCol>
        </CardContent>
        <CardActionsWrapper>
          <Button
            onClick={() => {
              setFormData(initialFormData);
              navigate(`/shop/${shopId}`, {
                replace: true
              });
            }}
          >
            Reset
          </Button>
          <LoadingButton
            size="small"
            type="submit"
            disabled={isUpdating}
            loading={isUpdating}
            variant="outlined"
          >
            {productId ? 'Update' : 'Add'}
          </LoadingButton>
        </CardActionsWrapper>
      </Card>
    </Container>
  );
};
