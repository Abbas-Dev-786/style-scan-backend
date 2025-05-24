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

// module.exports.searchProduct = catchAsync(async (req, res, next) => {
//   const { search_keywords } = req.body;
// });
