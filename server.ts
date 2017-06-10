import * as config from './config';

import {
  Request
} from './request';
import {
  Cheerio
} from './cheerio';

export class Server {
  constructor(private _rootUrl: any) {
    this.start();
    console.log('Running the Program...');
  }

  start() {
    Request()
    .then(response => {
      Cheerio(response, this._rootUrl);
    });
  }
}
