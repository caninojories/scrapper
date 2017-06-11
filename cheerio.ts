import * as cheerio from 'cheerio';
import * as config from './config';
import * as json2csv from 'json2csv';
import * as fs from 'fs';
import * as colors from 'colors';
import * as Mail from './email';
var fields = [
  'plaintiff',
  'defendant',
  'caseNumber',
  'appraisalAmount',
  'judgementAmount',
  'startingBid',
  'parcel',
  'propertyAddress',
  'dateOfSale',
  'saleStatus',
  'purchasePrice',
  'purchaser',
  'assigned',
  'purchasersAddress'
];
import {
  Request
} from './request';
import {
  LooPromise
} from './loopromise';

let spawn = require('child_process').spawn;

export let Cheerio = (html, rootUrl) => {
  return new Promise ((rootResolve, rootReject) => {
    let $ = cheerio.load(html);

    let item = [];
    let counter = 0;

    $('#slsgrid tr').each(function(i, elem) {
      let thisClass = $(this).attr('class');

      if (thisClass === 'odd' || thisClass === 'even') {
        let detailedLinkId = $(this).children()[0].children[0].attribs.id;
        let plaintiff   = $(this).children()[1].children[0].data;
        let defendant   = $(this).children()[2].children[0].data;
        let caseNumber  = $(this).children()[3].children[0].data;
        let appraisalAmount  = $(this).children()[4].children[0].data;
        let judgementAmount  = $(this).children()[5].children[0].data;
        let startingBid  = $(this).children()[6].children[0].data;
        let parcel  = $(this).children()[7].children[0].data.replace(/\s\s+/g, ' ');
        let propertyAddress;
        let dateOfSale = $(this).children()[9].children[0].data ? $(this).children()[9].children[0].data : $(this).children()[9].children[1].children[0].data;
        let saleStatus = $(this).children()[10].children[0].data.replace(/\s\s+/g, ' ');

        if (thisClass === 'even') {
          propertyAddress = $(this).children()[8].children[1].children[0].children[0].data.replace(/\s\s+/g, ' ') + $(this).children()[8].children[1].children[0].children[2].data.replace(/\s\s+/g, ' ');
        } else {
          propertyAddress = $(this).children()[8].children[1].children[0].data.replace(/\s\s+/g, ' ') + $(this).children()[8].children[1].children[2].data.replace(/\s\s+/g, ' ');
        }

        item.push({
          detailedLinkId  : detailedLinkId,
          detailedUrl     : '',
          plaintiff       : plaintiff,
          defendant       : defendant,
          caseNumber      : caseNumber,
          appraisalAmount : appraisalAmount,
          judgementAmount : judgementAmount,
          startingBid     : startingBid,
          parcel          : parcel,
          propertyAddress : propertyAddress,
          dateOfSale      : dateOfSale,
          saleStatus      : saleStatus
        });
      }
    });

    console.log(colors.bold.magenta('We have ' + item.length + ' items to crawl.'));
    let tempItem = [];

    new LooPromise().init(function() {
        return counter < item.length;
    }, function() {
      let casper;
      return new Promise(function(resolve, reject) {
        console.log(colors.bold.magenta('Running casperjs for item ' + (counter + 1)));
        casper = spawn('casperjs', ['casper.js', '--rootUrl="' + rootUrl.toString() + '"', '--input="#' + item[counter].detailedLinkId + '"'], { shell: true });

        let detailedUrl = '';

        casper.stdout.on('end', () => {
          console.log(colors.bold.magenta('Getting the url from casperjs'));
          console.log('DetailedUrl Here');
          console.log(detailedUrl.toString());
          console.log(item[counter].detailedUrl === rootUrl.toString());
          console.log(item[counter].detailedLinkId);
          item[counter].detailedUrl = detailedUrl.toString();
          item[counter].detailedUrl = item[counter].detailedUrl.replace('#', '%23');

          if (item[counter].detailedUrl.trim() === rootUrl.trim()) {
            //call again the item
            casper.kill();
            return resolve();
          }

          //check if we have detailedUrl
          if (item[counter].detailedUrl.trim() === 'ERROR') {
            console.log(colors.red.bold('Cannot get DetailedUrl for item ' + (counter + 1)))

            casper.kill();
            counter += 1;
            return resolve();
          }

          console.log(colors.bold.magenta('URL for detailed link is: ' + item[counter].detailedUrl));
          getDetailed(item[counter].detailedUrl)
          .then((response :any) => {
            console.log(response);
            item[counter].purchasePrice     = response.purchasePrice;
            item[counter].purchaser         = response.purchaser;
            item[counter].assigned          = response.assigned;
            item[counter].purchasersAddress = response.purchasersAddress;

            tempItem.push({
              'plaintiff'       : item[counter].plaintiff,
              'defendant'       : item[counter].defendant,
              'caseNumber'      : item[counter].caseNumber,
              'appraisalAmount' : item[counter].appraisalAmount,
              'judgementAmount' : item[counter].judgementAmount,
              'startingBid'     : item[counter].startingBid,
              'parcel'          : item[counter].parcel,
              'propertyAddress' : item[counter].propertyAddress,
              'dateOfSale'      : item[counter].dateOfSale,
              'saleStatus'      : item[counter].saleStatus,
              'purchasePrice'   : item[counter].purchasePrice,
              'purchaser'       : item[counter].purchaser,
              'assigned'        : item[counter].assigned,
              'purchasersAddress' : item[counter].purchasersAddress
            });

            casper.kill();
            counter += 1;
            resolve();
            console.log(colors.bold.green('SUCCESS'));
            console.log(colors.bold.cyan('======================================='));
          });
        });

        casper.stdout.on('data', (data) => {
          detailedUrl += data;
        });

        casper.on('error', (error) => {
          console.log(colors.bold.red('Failed to start casperjs with the error : ' + error));

          casper.kill();
          counter += 1;
          resolve();
        });
      })
    })
    .then(function() {
      let csv = json2csv({ data: tempItem, fields: fields });
      let fileName = 'file.' + new Date().getTime() + '.csv';
      console.log(fileName);
      return new Promise((resolve, reject) => {
        fs.writeFile(fileName, csv, function(err) {
          if (err) throw err;
          console.log(colors.bold.underline.green('FILE SAVE'));

          return resolve(fileName);
        });
      })
    })
    .then(fileName => {
      Mail.sendMail(fileName);

      rootResolve();
    });
  });
};


function getDetailed(url) {
  let purchasePrice     : any;
  let purchaser         : any;
  let assigned          : any;
  let purchasersAddress : any;
  let $                 : any;
  return new Promise((resolve, reject) => {
    Request(url)
    .then(html => {
      $ = cheerio.load(html);

      return tryCatchPurchasePrice($);
    })
    .then(response => {
      purchasePrice = response;

      return tryCatchPurchaser($);
    })
    .then(response => {
      purchaser = response;

      return tryCatchAssigned($);
    })
    .then(response => {
      assigned = response;

      return tryCatchPurchasersAddress($);
    })
    .then(response => {
      purchasersAddress = response;

      resolve({
        purchasePrice: purchasePrice,
        purchaser: purchaser,
        assigned: assigned,
        purchasersAddress: purchasersAddress
      });
    })
  });
}

function tryCatchPurchasePrice($) {
  return new Promise((resolve, reject) => {
    let purchasePrice = '';
    try {
      purchasePrice = $('#contentRight tr')[16].children[3].children[0].data.replace(/\s\s+/g, ' ');
      resolve(purchasePrice);
    } catch(e) {
      resolve(purchasePrice);
    }
  });
}

function tryCatchPurchaser($) {
  return new Promise((resolve, reject) => {
    let purchaser = '';
    try {
      purchaser = $('#contentRight tr')[17].children[3].children[0].data.replace(/\s\s+/g, ' ');
      resolve(purchaser);
    } catch(e) {
      resolve(purchaser);
    }
  });
}

function tryCatchAssigned($) {
  return new Promise((resolve, reject) => {
    let assigned = '';
    try {
      assigned = $('#contentRight tr')[18].children[3].children[0].data.replace(/\s\s+/g, ' ');
      resolve(assigned);
    } catch(e) {
      resolve(assigned);
    }
  });
}

function tryCatchPurchasersAddress($) {
  return new Promise((resolve, reject) => {
    let purchasersAddress = '';
    try {
      purchasersAddress = $('#contentRight tr')[19].children[3].children[0].children[0].data.replace(/\s\s+/g, ' ') + $('#contentRight tr')[19].children[3].children[0].children[2].data.replace(/\s\s+/g, ' ')
      resolve(purchasersAddress);
    } catch(e) {
      resolve(purchasersAddress);
    }
  });
}
