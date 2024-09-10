import * as React from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardActions from '@mui/joy/CardActions';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Typography from '@mui/joy/Typography';
import Check from '@mui/icons-material/Check';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';

export default function Pricing() {
  return (
    <div id='pricing'>
    <Box
      sx={{
        textAlign: 'center',
        mt: 15,
        mb: 20,
      }}
    >
      <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3, // Margin bottom to separate from the cards
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
            startDecorator={<PaymentsOutlinedIcon sx={{ color: 'black', mr: 0.5 }} />} // Set icon color to black
            disabled // Make the button unclickable
          >
            <Typography sx={{ color: 'black' }}>Pricing</Typography>
          </Button>
        </Box>
      <Typography level="h1" sx={{ mb: 4, fontSize: '4rem' }}>
        Organize Your Inbox
      </Typography>
      <Typography level="body1" sx={{ mb: 8, fontSize: '1.2rem' }}>
        Select the plan that best suits your needs. Upgrade or cancel anytime.
      </Typography>
      
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* Free Plan Card */}
        <Card
          size="lg"
          variant="outlined"
          sx={{ width: 350, maxWidth: '100%' }}
        >
          <Chip size="sm" variant="outlined" color="success">
            FREE
          </Chip>
          <Typography level="h2" sx={{ textAlign: 'left' }}>Free Plan</Typography>
          <Divider inset="none" />
          <List size="sm" sx={{ mx: 'calc(-1 * var(--ListItem-paddingX))' }}>
            <ListItem>
              <ListItemDecorator>
                <Check />
              </ListItemDecorator>
              Unlimited Mass Clean Up
            </ListItem>
            <ListItem>
              <ListItemDecorator>
                <Check />
              </ListItemDecorator>
              10 Email Unsubscribes Per Month
            </ListItem>
            <ListItem>
              <ListItemDecorator>
                <Check />
              </ListItemDecorator>
              5 Inbox Recaps Per Month
            </ListItem>
            <ListItem>
              <ListItemDecorator>
                <Check />
              </ListItemDecorator>
              Upgrade Anytime
            </ListItem>
          </List>
          <Divider inset="none" />
          <CardActions>
            <Typography level="title-lg" sx={{ mr: 'auto' }}>
              Free
            </Typography>
            <Button
              variant="soft"
              color="success"
              endDecorator={<KeyboardArrowRight />}
            >
              Start now
            </Button>
          </CardActions>
        </Card>

        {/* Basic Plan Card */}
        <Card
          size="lg"
          variant="outlined"
          sx={{ width: 350, maxWidth: '100%' }}
        >
          <Chip size="sm" variant="outlined" color="neutral">
            BASIC
          </Chip>
          <Typography level="h2" sx={{ textAlign: 'left' }}>Monthly</Typography>
          <Divider inset="none" />
          <List size="sm" sx={{ mx: 'calc(-1 * var(--ListItem-paddingX))' }}>
            <ListItem>
              <ListItemDecorator>
                <Check />
              </ListItemDecorator>
              Unlimited Mass Clean Up
            </ListItem>
            <ListItem>
              <ListItemDecorator>
                <Check />
              </ListItemDecorator>
              Unlimited Email Unsubscribes
            </ListItem>
            <ListItem>
              <ListItemDecorator>
                <Check />
              </ListItemDecorator>
              Unlimited Inbox Recaps
            </ListItem>
            <ListItem>
              <ListItemDecorator>
                <Check />
              </ListItemDecorator>
              Cancel Anytime
            </ListItem>
          </List>
          <Divider inset="none" />
          <CardActions>
            <Typography level="title-lg" sx={{ mr: 'auto' }}>
              $8{' '}
              <Typography textColor="text.tertiary" sx={{ fontSize: 'sm' }}>
                / month
              </Typography>
            </Typography>
            <Button
              variant="soft"
              color="neutral"
              endDecorator={<KeyboardArrowRight />}
            >
              Start now
            </Button>
          </CardActions>
        </Card>

        {/* Most Popular Plan Card */}
        <Card
          size="lg"
          variant="solid"
          color="neutral"
          invertedColors
          sx={{ bgcolor: '#01105b', width: 350, maxWidth: '100%' }}
        >
          <Chip size="sm" variant="outlined">
            MOST POPULAR
          </Chip>
          <Typography level="h2" sx={{ textAlign: 'left' }}>Yearly</Typography>
          <Divider inset="none" />
          <List size="sm" sx={{ mx: 'calc(-1 * var(--ListItem-paddingX))' }}>
            <ListItem>
              <ListItemDecorator>
                <Check />
              </ListItemDecorator>
              Unlimited Mass Clean Up
            </ListItem>
            <ListItem>
              <ListItemDecorator>
                <Check />
              </ListItemDecorator>
              Unlimited Email Unsubscribes
            </ListItem>
            <ListItem>
              <ListItemDecorator>
                <Check />
              </ListItemDecorator>
              Unlimited Inbox Recaps
            </ListItem>
            <ListItem>
              <ListItemDecorator>
                <Check />
              </ListItemDecorator>
              Cancel Anytime
            </ListItem>
          </List>
          <Divider inset="none" />
          <CardActions>
            <Typography level="title-lg" sx={{ mr: 'auto' }}>
              $60{' '}
              <Typography textColor="text.tertiary" sx={{ fontSize: 'sm' }}>
                / year
              </Typography>
            </Typography>
            <Button
              sx={{
                color: 'black',
                '&:hover': {
                  backgroundColor: 'lightgray',
                },
              }}
              endDecorator={<KeyboardArrowRight />}
            >
              Start now
            </Button>
          </CardActions>
        </Card>
      </Box>
    </Box>
    </div>
  );
}
