import { getTest, getNonTest } from 'testing';
import {doodle} from 'doodling';
import whee from 'whee';

class TestClass {

  constructor() {
    this.state = {};
  }

  getThing() {
    return getTest();
  }

  getOtherThing() {
    return `${getTest()} other thing`;
  }

}
