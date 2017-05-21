import * as config from './config';

import {
  Request
} from './request';
import {
  Cheerio
} from './cheerio';

export class Server {
  constructor() {
    this.start();
  }

  start() {
    Request()
    .then(response => {
      Cheerio(response);
    });
  }
}

new Server();
