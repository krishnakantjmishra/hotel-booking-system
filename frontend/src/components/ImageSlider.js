import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { Box } from '@mui/material';
import HotelIcon from "@mui/icons-material/Hotel";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const ImageSlider = ({ images, height = 200, altText = "Image", showPlaceholder = true }) => {
    if (!images || images.length === 0) {
        if (!showPlaceholder) return null;
        return (
            <Box
                sx={{
                    height,
                    bgcolor: "primary.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
                }}
            >
                <HotelIcon sx={{ fontSize: height / 2, color: "white", opacity: 0.3 }} />
            </Box>
        );
    }

    return (
        <Box sx={{ height, width: '100%', position: 'relative', overflow: 'hidden' }}>
            <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={images.length > 1}
                style={{ height: '100%', '--swiper-navigation-size': '20px', '--swiper-theme-color': '#fff' }}
            >
                {images.map((img, index) => (
                    <SwiperSlide key={img.id || index}>
                        <Box
                            component="img"
                            src={img.image_url}
                            alt={altText}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                            }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                            }}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </Box>
    );
};

export default ImageSlider;
