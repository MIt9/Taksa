import {Injectable} from '@angular/core';
import uuidv4 from 'uuid/v4';

@Injectable()
export class UtilityService {
  public server:string = 'http://10.13.16.68:4600';
  public api:string;
  public file:string;
  constructor() {
    this.api = this.server + '/api/';
    this.file = this.server + '/files/';
  }
  public generateUID():string{
    return uuidv4();
  }
}
