import React from 'react';
import Link from 'next/link';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import ArrowForward from '@mui/icons-material/ArrowForward';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Container from '@mui/joy/Container';
import MarkAsUnreadOutlinedIcon from '@mui/icons-material/MarkAsUnreadOutlined';
import { typographyClasses } from '@mui/joy/Typography';

export default function Features() {
  function TwoSidedLayout({ children, reversed }) {
    return (
      <>
        <div id='features'>
          <Box
            data-aos="fade-up" // Add AOS animation here
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 20,
              mb: 5,
            }}
          >
            <Button
              sx={{
                backgroundColor: '#6ebef7',
                color: 'black',
                borderRadius: '25px',
                padding: '8px 16px',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                textTransform: 'none',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
              startDecorator={<MarkAsUnreadOutlinedIcon sx={{ color: 'black', mr: 0.5 }} />}
              disabled
            >
              <Typography sx={{ color: 'black' }}>Core Features</Typography>
            </Button>
          </Box>
        </div>
        <Container
          sx={[
            theme => ({
              position: 'relative',
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'flex-start', // Align text above image
              gap: 8,
              mt: 8, // Move everything down slightly for spacing
              flexDirection: 'column', // Initially stack text above image
              [theme.breakpoints.up(900)]: { // On larger screens, switch layout
                flexDirection: 'row',
                alignItems: 'flex-start',
                mt: 15,
              },
              [theme.breakpoints.down(900)]: {
                alignItems: 'center',
              },
            }),
          ]}
        >
          <Box
            data-aos="fade-right" // Add AOS animation here
            sx={theme => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              maxWidth: '50ch',
              textAlign: 'center',
              mb: 4, // Add margin below text on small screens
              [theme.breakpoints.up(900)]: {
                alignItems: 'flex-start',
                textAlign: 'initial',
                mb: 0, // Remove margin when in row layout
              },
              [`& .${typographyClasses.root}`]: {
                textWrap: 'balance',
              },
            })}
          >
            {children}
          </Box>
          <AspectRatio
            data-aos="fade-left" // Add AOS animation here
            ratio={700 / 520}
            variant="outlined"
            sx={theme => ({
              width: 700, // Fixed width for larger screens
              height: 520, // Fixed height
              borderRadius: 'sm',
              [theme.breakpoints.between(900, 1130)]: {
                width: '100%', // Adjust image width for screens between 900px and 1130px
                height: 'auto',
              },
              [theme.breakpoints.down(900)]: { // Stacking layout
                width: '80%',
                height: 'auto',
                mb: '100px',
              },
            })}
          >
            <img
              src="/clearinbox.png"
              alt="Clear Your Inbox"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} // Ensures the image fits the container
            />
          </AspectRatio>
        </Container>
      </>
    );
  }

  return (
    <TwoSidedLayout>
      <Typography
        data-aos="fade-up" // Add AOS animation here
        color="primary"
        sx={{ fontSize: 'lg', fontWeight: 'lg' }}
      >
        Clear Your Inbox
      </Typography>
      <Typography
        data-aos="fade-up" // Add AOS animation here
        level="h1"
        sx={{
          fontWeight: 'xl',
          fontSize: 'clamp(1.875rem, 1.3636rem + 2.1818vw, 3rem)',
        }}
      >
        Unsubscribe from bothersome mailing lists
      </Typography>
      <Typography
        data-aos="fade-up" // Add AOS animation here
        textColor="text.secondary"
        sx={{ fontSize: 'lg', lineHeight: 'lg', mb: '10px' }}
      >
        View your top senders and find out how often you read their emails. Unsubscribe from mailing lists you deem unnecessary, mark their emails as read, and delete them.
      </Typography>
      <Link href="/login" passHref>
        <Button size="lg" endDecorator={<ArrowForward fontSize="xl" />} data-aos="fade-up">
          Start For Free
        </Button>
      </Link>
    </TwoSidedLayout>
  );
}
