import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardMedia,
    CardActions,
    IconButton,
    CircularProgress,
    Alert,
    Fade,
    Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import api from '../api/axios';

const ImageManager = ({ type, id, onUpdate }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const endpoint = type === 'hotel'
        ? `/admin-api/hotels/${id}/images/`
        : `/admin-api/rooms/${id}/images/`;

    const uploadEndpoint = type === 'hotel'
        ? `/admin-api/hotels/${id}/images/upload/`
        : `/admin-api/rooms/${id}/images/upload/`;

    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await api.get(endpoint);
            setImages(res.data);
        } catch (err) {
            console.error('Failed to fetch images', err);
            setError('Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchImages();
    }, [id, type]);

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        // Validate size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size exceeds 5MB limit.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('alt_text', file.name);

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            await api.post(uploadEndpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess('Image uploaded successfully!');
            fetchImages();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Upload failed', err);
            const msg = err.response?.data?.error || err.response?.data?.detail || 'Upload failed. Check your S3 configuration.';
            setError(msg);
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            await api.delete(`${endpoint}${imageId}/`);
            setSuccess('Image deleted successfully!');
            fetchImages();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Delete failed', err);
            setError('Failed to delete image');
        }
    };

    if (!id) return null;

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                    <PhotoLibraryIcon color="primary" />
                    Images ({images.length}/10)
                </Typography>

                <Button
                    variant="outlined"
                    component="label"
                    startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                    disabled={uploading || images.length >= 10}
                >
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : images.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed #ccc', borderRadius: 2 }}>
                    <Typography color="text.secondary">No images uploaded yet.</Typography>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {images.map((img) => (
                        <Grid item xs={6} sm={4} md={3} key={img.id}>
                            <Fade in={true}>
                                <Card sx={{ position: 'relative', borderRadius: 2 }}>
                                    <CardMedia
                                        component="img"
                                        height="120"
                                        image={img.image_url}
                                        alt={img.alt_text}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <CardActions sx={{ position: 'absolute', top: 0, right: 0, p: 0.5 }}>
                                        <IconButton
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.8)',
                                                '&:hover': { bgcolor: 'rgba(255,0,0,0.1)', color: 'error.main' }
                                            }}
                                            onClick={() => handleDelete(img.id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Fade>
                        </Grid>
                    ))}
                </Grid>
            )}
            <Divider sx={{ my: 3 }} />
        </Box>
    );
};

export default ImageManager;
