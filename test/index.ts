import * as chai from 'chai';
import chaiHttp = require('chai-http');

export const chaiWithHttp = chai.use(chaiHttp);
export const expect = chai.expect;
