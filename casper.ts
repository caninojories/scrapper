let casper = require('casper').create();
casper.start('http://www.wcsooh.org/SheriffSales/slsgrid.aspx?srchtype=zip&srchvalue=45040');

casper.then(function () {
  return this.click(casper.cli.get('input'));
})
.then(function() {
  if (this.currentHTTPStatus === 200) {
    console.log(this.getCurrentUrl());
  } else {
    console.log('ERROR');
  }
})

casper.run();
