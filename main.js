let request = require ("request");
let fs = require ("fs");
let cheerio = require ("cheerio");
let allMatchFile = require ("./allMatch.js");
let url = "https://www.espncricinfo.com/series/_/id/8039/season/2015/icc-cricket-world-cup";

request (url, cb);

function cb (err, header, body)
{
    if (err==null && header.statusCode==200)
    {
        console.log ("Response received");
        // fs.writeFileSync ("page.html", body);
        parseHtml (body);
    }
    else if (header.statusCode==404)
    {
        console.log ("Page not found");
    }
    else
    {
        console.log (err);
        console.log (header);
    }
}

function parseHtml (body)
{
    let $ = cheerio.load (body);
    
    let viewAllResultsAnchor = $("a[data-hover = 'View All Results']");

    let link = viewAllResultsAnchor.attr("href");
    let cLink = "https://www.espncricinfo.com" + link;

    allMatchFile.allMatchHandler (cLink);
}
