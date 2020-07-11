let request = require ("request");
let fs = require ("fs");
let cheerio = require ("cheerio");
let xlsx = require ("xlsx");
let path = require ("path");
const { Console } = require("console");
// let url = "https://www.espncricinfo.com/series/8039/scorecard/656495/australia-vs-new-zealand-final-icc-cricket-world-cup-2014-15";

function matchHandler (url)
{
    request (url, cb);
}

function cb (err, header, body)
{
    if (err==null && header.statusCode==200)
    {
        console.log ("Response received");
        fs.writeFileSync ("page.html", body);
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
    
    let venueEle = $(".desc.text-truncate");
    let venue = venueEle.text().trim();
    let resultEle = $(".summary span")
    let result = resultEle.text().trim();

    let bothInnings = $(".card.content-block.match-scorecard-table .Collapsible");

    for (let i=0;i<bothInnings.length;i++)
    {
        let teamNameEle = $(bothInnings[i]).find("h5");
        let teamName = teamNameEle.text().split("Innings");
        teamName = teamName[0].trim();

        let allRows = $(bothInnings[i]).find(".table.batsman tbody tr");

        for (let j=0;j<allRows.length;j++)
        {
            let allCols = $(allRows[j]).find("td");
            let isPlayer = $(allCols[0]).hasClass("batsman-cell");

            if (isPlayer)
            {
                let pName = $(allCols[0]).text().trim();
                let runs = $(allCols[2]).text().trim();
                let balls = $(allCols[3]).text().trim();
                let fours = $(allCols[5]).text().trim();
                let sixes = $(allCols[6]).text().trim();
                let sr = $(allCols[7]).text().trim();
                
                processPlayer (venue, result, teamName, pName, runs, balls, fours, sixes, sr);
            }
        }
    }
}

function excelReader(filePath, name) 
{
    if (!fs.existsSync(filePath)) 
    {
        return null;
    }
    // workbook 
    let wt = xlsx.readFile(filePath);
    let excelData = wt.Sheets[name];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}

function excelWriter(filePath, json, name) 
{
    // console.log(xlsx.readFile(filePath));
    var newWB = xlsx.utils.book_new();
    // console.log(json);
    var newWS = xlsx.utils.json_to_sheet(json)
    xlsx.utils.book_append_sheet(newWB, newWS, name)//workbook name as param
    xlsx.writeFile(newWB, filePath);
}

function processPlayer(venue, result, team, name, runs, balls, fours, sixes, sr) 
{
    //    directory exist
    let obj = {
        runs, balls, fours, sixes, sr, team, result, venue
    };

    let teamPath = team;
    if (!fs.existsSync(teamPath)) 
    {
        fs.mkdirSync(teamPath);
    }

    let playerFile = path.join(teamPath, name) + '.xlsx';
    let fileData = excelReader(playerFile, name);
    let json = fileData;

    if (fileData == null) 
    {
        json = [];
    }

    json.push(obj);

    excelWriter(playerFile, json, name);
}

module.exports.expfn = matchHandler;