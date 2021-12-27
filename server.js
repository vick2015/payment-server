// This is a public sample test API key.
// To avoid exposing it, don't submit any personally identifiable information through requests with this API key.
// Sign in to see your own test API key embedded in code samples.
const stripe = require('stripe')('sk_test_cnyRPIzV7vSWphzJnxvH7xed');
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded());

app.get('/api/status', async (req, res) => {
  res.status(200).send("All Good");
});


app.post('/api/create-checkout-session', async (req, res) => {

  
  const YOUR_DOMAIN = req.headers.referer;
  const session = await stripe.checkout.sessions.create({
    customer_email: req.body.customer_email,
    submit_type: 'donate',
    billing_address_collection: 'auto',
    shipping_address_collection: {
      allowed_countries: ['US', 'CA'],
    },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: req.body.itemName,
            images:[req.body.itemImage]
          },
          unit_amount: req.body.unitPrice*100,
        },
        quantity: req.body.qty,
        description: "spring fundraiser 2022"
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}thankyou`,
    cancel_url: `${YOUR_DOMAIN}thankyou`,
  });

  res.redirect(303, session.url);
});

app.listen(4242, () => console.log('Running on port 4242'));