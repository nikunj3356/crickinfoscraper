let request = require ("request");
let fs = require ("fs");
let cheerio = require ("cheerio");
let matchFile = require ("./match.js");
// let url = "https://www.espncricinfo.com/scores/series/8039/season/2015/icc-cricket-world-cup?view=results";

function allMatchHandler (url)
{
    request (url, cb);
}

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

    let allMatch = $(".col-md-8.col-16");

    for (let i=0;i<allMatch.length;i++)
    {
        let allAnchors = $(allMatch[i]).find(".match-cta-container a");
        let scoreCardA = allAnchors[0];

        let link = $(scoreCardA).attr("href");
        let cLink = "https://www.espncricinfo.com" + link;
        
        matchFile.expfn (cLink);
    }
}

module.exports.allMatchHandler = allMatchHandler;