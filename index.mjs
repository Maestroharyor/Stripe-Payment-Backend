import express from "express";
import stripeSDK from "stripe";
import cors from "cors";
const app = express();
// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = stripeSDK("sk_test_4eC39HqLyjWDarjtT1zdp7dc");

app.use(express.static("public"));
app.use(express.json());
app.use(cors());

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

function mapToNewFormat(inputArray) {
  return inputArray.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
        },
        unit_amount: item.price * 100, // Assuming the price is in dollars (convert to cents)
      },
      quantity: item.quantity,
    };
  });
}

app.post("/create-checkout-session", async (req, res) => {
  const { items, cancel_url, success_url } = req.body;

  if (!items || items.length) {
    return res.status(400).send({
      success: false,
      message: "Cart Items not found",
    });
  }

  if (!cancel_url) {
    return res.status(400).send({
      success: false,
      message: "Cancel URL not sent",
    });
  }

  if (!success_url) {
    return res.status(400).send({
      success: false,
      message: "Success URL not sent",
    });
  }

  const line_items = mapToNewFormat(items);

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: "payment",
    success_url,
    cancel_url,
  });

  res.send({
    success: true,
    message: "Session URL Created Successfully",
    data: { url: session.url },
  });
});

app.listen(4242, () => console.log("Node server listening on port 4242!"));
