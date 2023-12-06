import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Typography, Grid, Paper, Input, Container } from '@mui/material';

const HomePage = () => {
  const [carModel, setCarModel] = useState('');
  const [price, setPrice] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [maxPictures, setMaxPictures] = useState(1);
  const [chosenImages, setChosenImages] = useState([]);

  const handleChooseImages = async (event) => {
    const files = event.target.files;

    if (files.length > maxPictures) {
      console.error('Error: You can upload a maximum of', maxPictures, 'pictures');
      return;
    }

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    formData.append('carModel', carModel);
    formData.append('price', price);
    formData.append('phoneNumber', phoneNumber);

    try {
      await axios.post('http://localhost:7000/api/choose-images', formData);
      fetchChosenImages();
    } catch (error) {
      console.error('Error choosing images:', error.message);
    }
  };

  const fetchChosenImages = async () => {
    try {
      const response = await axios.get('http://localhost:7000/api/get-images');
      setChosenImages(response.data.chosenImages);
    } catch (error) {
      console.error('Error fetching chosen images:', error.message);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await axios.delete(`http://localhost:7000/api/delete-image/${imageId}`);
      fetchChosenImages();
    } catch (error) {
      console.error('Error deleting image:', error.message);
    }
  };

  useEffect(() => {
    fetchChosenImages();
  }, []);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        Image Gallery with Car Information
      </Typography>

      <Input
        type="text"
        placeholder="Car Model"
        value={carModel}
        onChange={(e) => setCarModel(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <Input
        type="tel"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Max Pictures (1-10)"
        value={maxPictures}
        onChange={(e) => setMaxPictures(Math.min(Math.max(1, e.target.value), 10))}
      />
      <Input type="file" accept="image/*" onChange={handleChooseImages} multiple />

      <Grid container spacing={2} justifyContent="center">
        {chosenImages.map((item) => (
          <Grid item key={item._id} xs={12} sm={6} md={4} lg={3}>
            <Paper elevation={3} style={{ padding: '10px', textAlign: 'center' }}>
              <Typography variant="subtitle1">{item.carModel}</Typography>
              <Typography variant="subtitle1">Price: {item.price}</Typography>
              <Typography variant="subtitle1">Phone: {item.phoneNumber}</Typography>

              <img
                src={`data:${item.contentType};base64,${item.data}`}
                alt="Chosen"
                style={{ width: '100%', maxHeight: '200px', marginBottom: '10px', objectFit: 'cover' }}
              />

              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDeleteImage(item._id)}
                style={{ marginTop: '10px' }}
              >
                Delete Image
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default HomePage;
