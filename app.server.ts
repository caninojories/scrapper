import * as express from 'express';
import * as bodyparser from 'body-parser';
import {
  LooPromise
} from './loopromise';
import {
  Server
} from './server';

let app = express();

app.use(bodyparser.urlencoded({
 extended: true,
 limit: '50mb'
}))

app.use(bodyparser.json({
 limit: '50mb'
}));

app.use(bodyparser.raw({
 limit: '50mb'
}));

app.route('/api/v1/start')
.post((req, res, next) => {
  let body = req.body;
  let counter = 0;

  if (!body.urls) {
    body.urls = ['http://www.wcsooh.org/SheriffSales/slsgrid.aspx?srchtype=zip&srchvalue=45040'];
  }

  new LooPromise().init(() => {
    return counter < body.urls.length;
  }, () => {
    return new Promise((resolve, reject) => {
      new Server(body.urls[counter]);
      counter++
      resolve();
    });
  });

  res.status(200)
  .send({
    code: 1,
    message: 'Scrap Server is Running Now'
  });
});

app.listen(3000, () => {
  console.log('Server is Running at port 3000');
});
