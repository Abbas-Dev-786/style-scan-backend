const axios = require("axios");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const JSON5 = require("json5");
const extractJsonFromApiResponse = require("../utils/extractJSON");

module.exports.getJSON = catchAsync((req, res, next) => {
  const data = extractJsonFromApiResponse(req.body.data);

  res.json({ data });
});

module.exports.searchImage = catchAsync(async (req, res, next) => {
  const body = {
    model: "sonar-pro",
    stream: false,
    messages: [
      {
        role: "system",
        content:
          "You are a professional fashion stylist. Carefully analyze the provided image and list every single fashion item the person is wearing — including clothing, accessories (like sunglasses, watches, jewelry, bags), and footwear. Do not leave out small or partially visible accessories. Your goal is to help someone search for each item online, so include everything the person is wearing from head to toe.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please give me a response in json format of all visible fashion items the person in the image is wearing — including clothes, accessories, and shoes. This list will be used for online search and outfit inspiration so give me the keyword for searching. JSON format should be {type,name,description,search_keywords}",
          },
          {
            type: "image_url",
            image_url: {
              url: req.base64Image,
            },
          },
        ],
      },
    ],
  };

  const apiRes = await axios.post(
    "https://api.perplexity.ai/chat/completions",
    body,
    {
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  const apiData = apiRes.data?.choices?.[0]?.message?.content;

  if (!apiData) {
    next(new AppError("Response not recieved from PPLX", 500));
  }

  const data = extractJsonFromApiResponse(apiData);

  res.status(200).json({ message: "success", data });
});

module.exports.searchProduct = catchAsync(async (req, res, next) => {
  if (!req.body?.search_keywords) {
    return next(new AppError("Search keywords are required", 400));
  }

  const { search_keywords } = req.body;

  const body = {
    model: "sonar-pro",
    stream: false,
    messages: [
      {
        role: "system",
        content:
          "You are a professional fashion product search expert. Your task is to find and list CURRENTLY AVAILABLE fashion products from Amazon.com and Walmart.com. For Amazon products, ensure you provide complete, working product URLs that include the full path with the product title and ASIN. For Walmart products, use their standard product URLs. Only include products that you can verify are currently available for purchase with working links. IMPORTANT: You must respond ONLY with a valid JSON object, no markdown, no text, no explanations.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Search for fashion products matching: "${search_keywords}". Follow these strict requirements:
1. Only include products from Amazon.com and Walmart.com
2. For Amazon products:
   - Use complete Amazon URLs in this format: https://www.amazon.com/[product-name]/dp/[ASIN]
   - Include both the product name and ASIN in the URL
   - Example: https://www.amazon.com/Levi-Original-Trucker-Jacket-Medium/dp/B01N4W8D9O
3. For Walmart products: Use standard format: https://www.walmart.com/ip/[product-name]/[ID]
4. Verify each product URL exists and is accessible
5. Include ONLY products that are currently available for purchase

IMPORTANT: Respond ONLY with this exact JSON format, no other text or markdown:
{
  "products": [
    {
      "name": "Product Full Name",
      "price": "price in USD without $ symbol",
      "image_url": "direct product image url",
      "buy_link": "direct product purchase url",
      "retailer": "Amazon" or "Walmart",
      "asin": "ASIN number for Amazon products only"
    }
  ]
}

Return up to 5 verified, available products. Do not include any text before or after the JSON object.`,
          },
        ],
      },
    ],
    search_domain_filter: ["amazon.com", "walmart.com"],
    web_search_options: {
      search_context_size: "high",
    },
  };

  const apiRes = await axios.post(
    "https://api.perplexity.ai/chat/completions",
    body,
    {
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  const apiData = apiRes.data?.choices?.[0]?.message?.content;

  if (!apiData) {
    return next(new AppError("Response not received from PPLX", 500));
  }

  console.log(apiData);

  const data = JSON.parse(apiData);

  if (!data || !data.products) {
    return next(new AppError("Invalid response format from API", 500));
  }

  res.status(200).json({
    message: "success",
    results: data.products?.length,
    data: data,
  });
});
