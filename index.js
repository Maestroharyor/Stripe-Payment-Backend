import express from "express";
import stripeSDK from "stripe";
const app = express();
// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = stripeSDK("sk_test_4eC39HqLyjWDarjtT1zdp7dc");

app.use(express.static("public"));
app.use(express.json());

const calculateOrderAmount = (items) => {
  let totalAmount = 0;

  for (const item of items) {
    // Calculate the discounted price based on the discount percentage
    const discountedPrice = item.price * (1 - item.discountPercentage / 100);

    // Calculate the subtotal for the item (price * quantity)
    const subtotal = discountedPrice * item.quantity;

    // Add the subtotal to the total amount
    totalAmount += subtotal;
  }

  // Return the total order amount
  return totalAmount;
};

app.get("/", (req, res) => {
  res.json({
    message: "Hello World!",
  });
});

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    success: true,
    message: "Payment intent created",
    data: {
      clientSecret: paymentIntent.client_secret,
    },
  });
});

app.listen(4242, () => console.log("Node server listening on port 4242!"));
