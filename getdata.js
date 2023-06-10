const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Function to crawl the data from the provided URL
async function crawlData(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Find the table with class "resultsarchive-table"
    const table = $('.resultsarchive-table');

    // Extract the year and grand prix from the URL
    const year = url.split('/')[5];
    const grandPrix = url.split('/')[8];
    console.log("url: ", url.split('/')[5])
    // Create an array to store the results
    const results = [];

    // Find all the rows in the table except the header row
    let rows = table.find('tr:not(.results-table-header)');

    // Iterate over the rows and extract the data
    rows.each((index, element) => {
        if(index != 0){
      const position = $(element).find('td:nth-child(2)').text().trim();
      const number = $(element).find('td:nth-child(3)').text().trim();
      const driver = $(element).find('td:nth-child(4)').find('span.hide-for-tablet').text().trim() + $(element).find('td:nth-child(4)').find('span.hide-for-mobile').text().trim();
      const car = $(element).find('td:nth-child(5)').text().trim();
      const laps = $(element).find('td:nth-child(6)').text().trim();
      const timeRetired = $(element).find('td:nth-child(7)').text().trim();
      const points = $(element).find('td:nth-child(8)').text().trim();
      
      // Create an object with the extracted data
      const result = {
        year,
        grandPrix,
        position,
        number,
        driver,
        car,
        laps,
        timeRetired,
        points,
      };

      // Add the object to the results array
      results.push(result);
    }
    });

    // Export the results to a CSV file
    const csvData = results.map((result) => Object.values(result).join(',')).join('\n');
    const filename = `${year}_${grandPrix}_results.csv`;
    fs.writeFileSync(filename, csvData);
    console.log(`Results exported to ${filename}`);
  } catch (error) {
    console.error(`Error crawling data from ${url}: ${error}`);
  }
}

// Array of URLs
const urls = [
  "/en/results.html/2020/races/1045/austria/race-result.html",
//   "/en/results.html/2020/races/1046/austria/race-result.html",
//   "/en/results.html/2020/races/1047/hungary/race-result.html",
//   "/en/results.html/2020/races/1048/great-britain/race-result.html",
//   "/en/results.html/2020/races/1049/great-britain/race-result.html",
//   "/en/results.html/2020/races/1050/spain/race-result.html",
//   "/en/results.html/2020/races/1051/belgium/race-result.html"
];

// Base URL
const baseUrl = "https://www.formula1.com";

// Iterate over the URLs, add the base URL, and crawl the data
for (const url of urls) {
  const fullUrl = baseUrl + url;
  crawlData(fullUrl);
}
