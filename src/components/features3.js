import React from 'react';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import ArrowForward from '@mui/icons-material/ArrowForward';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Container from '@mui/joy/Container';
import MarkAsUnreadOutlinedIcon from '@mui/icons-material/MarkAsUnreadOutlined';
import { typographyClasses } from '@mui/joy/Typography';

// Combined Features Component
export default function Features3() {
  function TwoSidedLayout({ children, reversed }) {
    return (
      <>
        <Container
          sx={[
            theme => ({
              position: 'relative',
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'flex-start', // Align text above image
              gap: 8,
              flexDirection: 'column', // Initially stack text above image
              [theme.breakpoints.up(900)]: { // On larger screens, switch layout
                flexDirection: 'row',
                alignItems: 'flex-start',
              },
              [theme.breakpoints.down(900)]: {
                alignItems: 'center',
              },
            }),
          ]}
        >
          <Box
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
              src="/massdelete.png"
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
      <Typography color="primary" sx={{ fontSize: 'lg', fontWeight: 'lg' }}>
        Mass Delete Emails
      </Typography>
      <Typography
        level="h1"
        sx={{
          fontWeight: 'xl',
          fontSize: 'clamp(1.875rem, 1.3636rem + 2.1818vw, 3rem)',
        }}
      >
        Bulk delete emails and mark them as read
      </Typography>
      <Typography
        textColor="text.secondary"
        sx={{ fontSize: 'lg', lineHeight: 'lg', mb: '10px' }}
      >
        View your top senders and find out how often you read their emails. Unsubscribe from mailing lists you deem unnecessary, mark their emails as read, and delete them all in one place.
      </Typography>
      <Button size="lg" endDecorator={<ArrowForward fontSize="xl" />}>
        Start For Free
      </Button>
    </TwoSidedLayout>
  );
}
