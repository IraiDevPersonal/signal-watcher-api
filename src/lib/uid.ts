import { v4 } from "uuid";

export class Uid {
  static generate() {
    return v4();
  }
}
