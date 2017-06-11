let casper = require('casper').create();

casper.start(casper.cli.get('rootUrl'))
.then(function () {
  return this.click(casper.cli.get('input'));
})
.then(function() {
  if (this.currentHTTPStatus === 200) {
    console.log(this.getCurrentUrl());
  } else {
    console.log('ERROR');
  }
});

casper.run();
