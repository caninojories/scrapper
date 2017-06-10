let casper = require('casper').create();
casper.start(casper.cli.get('rootUrl'));
casper.then(function () {
  return this.click(casper.cli.get('input'));
})

casper.then(function() {
  if (this.currentHTTPStatus === 200) {
    console.log(this.getCurrentUrl());
  } else {
    console.log('ERROR');
  }
})

casper.run();
