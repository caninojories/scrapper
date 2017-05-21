let casper = require('casper').create();
casper.start('http://www.wcsooh.org/SheriffSales/slsgrid.aspx?srchtype=zip&srchvalue=45040');

casper.then(function () {
    this.click(casper.cli.get('input'));
});
casper.then(function () {
    console.log(this.getCurrentUrl());
});

casper.run();
