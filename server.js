// This is a public sample test API key.
// To avoid exposing it, don't submit any personally identifiable information through requests with this API key.
// Sign in to see your own test API key embedded in code samples.
const stripe = require('stripe')('sk_test_A0El0fA7E6g21W7QpR5nO578');
const express = require('express');
var cors = require('cors')
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "vwfundraiser.cwutw5rdr7fh.us-west-2.rds.amazonaws.com",
  user: "admin",
  password: "r`4mfB}C$WRBJmd^",
  database: "vwfundraiser"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


const app = express();


app.use(express.static('public'));
app.use(express.urlencoded());
app.use(cors())

app.get('/api/products', async (req, res) => {

  
  con.query("select * from products", function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
    res.status(200).send(result);
  });
});

app.get('/api/orders', async (req, res) => {
  con.query("select * from orders", function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
    res.status(200).send(result);
  });
});


app.get('/api/status', async (req, res) => {
  res.status(200).send("All Good");
});

app.get('/api/success', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id , {
    expand: ['line_items']
  });

  con.query("select * from orders where orderId = '"+session.payment_intent+"'", function (err, result) {
    if (err) throw err;
    console.log(result.length);
    if(result.length > 0)
    {
      
      res.send("undefined");
       return;
    }

    console.log("hello");
var date_ob = new Date();
var day = ("0" + date_ob.getDate()).slice(-2);
var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
var year = date_ob.getFullYear();
var hours = date_ob.getHours();
var minutes = date_ob.getMinutes();
var seconds = date_ob.getSeconds();
  
var dateTime = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

  var sql = "INSERT INTO `vwfundraiser`.`orders`(`orderId`,`customer`,`productname`, `orderDate`,`amount`,`payment`,`status`) VALUES \
  ('"+session.payment_intent+"','"+session.customer+"','"+session.line_items.data[0].description+"' , '"+dateTime+"', '"+session.amount_total+"','"+session.payment_method_types[0]+"', '"+session.payment_status+"');";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
  res.send({session});
  });
 
});


app.post('/api/create-checkout-session', async (req, res) => {
  
  const YOUR_DOMAIN = req.headers.origin;
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
    success_url: `${YOUR_DOMAIN}/thankyou/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${YOUR_DOMAIN}/error/?session_id={CHECKOUT_SESSION_ID}`
  });

  res.redirect(303, session.url);
});

app.listen(4242, () => console.log('Running on port 4242'));