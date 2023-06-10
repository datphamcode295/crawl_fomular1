const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Base URL
const baseUrl = "https://www.formula1.com";


// Function to crawl the website and extract the URLs
async function crawlFormula1Data(year) {
    console.log(`Crawling data for ${year}...`);
  const url = `https://www.formula1.com/en/results.html/${year}/races.html`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Find the table with class "resultsarchive-table"
    const table = $('.resultsarchive-table');

    // Find all the "a" tags with class "ArchiveLink" inside the table
    const archiveLinks = table.find('a.ArchiveLink');

    // Print the URLs
    await archiveLinks.each(async(index, element) => {
      const url = $(element).attr('href');
      const fullUrl = baseUrl + url;
      await crawlData(fullUrl);
    });
  } catch (error) {
    console.error(`Error crawling data for ${year}: ${error}`);
  }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to crawl the data from the provided URL
async function crawlData(url) {
  try {
    await sleep(4000);
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Find the table with class "resultsarchive-table"
    const table = $('.resultsarchive-table');

    // Extract the year and grand prix from the URL
    const year = url.split('/')[5];
    const grandPrix = url.split('/')[8];
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
    const filename = `results.csv`;
    await fs.appendFileSync(filename, csvData);
    console.log(`Results exported to ${year}`);
  } catch (error) {
    console.error(`Error crawling data from ${url}: ${error}`);
  }
}

async function main() {
    // Call the crawlFormula1Data function for each year from 2020 to 2023
    for (let year = 1975; year <= 1976; year++) {
        await crawlFormula1Data(year);
    }
}

main();