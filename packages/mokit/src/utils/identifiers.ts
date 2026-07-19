import { v4 as uuidv4 } from "uuid";

export default class Identifiers {
    static simpleUUID() {
        return uuidv4().replaceAll("-", "");
    }
}