const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeMostWanted(req, res, next) {
  const url = "https://nia.gov.in/most-wanted.htm";

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const criminals = [];

    $("div.inner").each((index, element) => {
      // Limit the results to only 30
      if (index >= 30) return false;

      const name = $(element).find("div.name").text().trim();
      let imageUrl = $(element).find("img").attr("src");

      if (imageUrl && !imageUrl.startsWith("http")) {
        imageUrl = `https://nia.gov.in/${imageUrl}`;
      }

      criminals.push({ name, image_url: imageUrl });
    });

    res.status(200).json({ success: true, data: criminals });
  } catch (error) {
    console.error("Error fetching the data:", error);
    next(error);
  }
}

module.exports = scrapeMostWanted;
