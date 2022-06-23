import { AUTOMATION_STATUS } from "../common/Enums";
import HttpResponseDeserializer from "../util/web/http-response-deserializer";
import { HttpResultType } from "../util/web/http-client";
import Optional from "../util/Optional";
import { JSON_TYPE } from "../common/Types";
import moment from "moment";

export default class AutomationItem {
  private id!: string;
  private name!: string;
  private type!: string;
  private creationDate!: moment.Moment;
  private status!: AUTOMATION_STATUS;

  constructor() {}

  getAutomationId(): string {
    return this.id;
  }

  setAutomationId(value: string) {
    this.id = value;
  }

  getName(): string {
    return this.name;
  }

  setName(value: string) {
    this.name = value;
  }

  getType(): string {
    return this.type;
  }

  setType(value: string) {
    this.type = value;
  }

  getCreationDate(): moment.Moment {
    return this.creationDate;
  }

  setCreationDate(value: moment.Moment) {
    this.creationDate = value;
  }

  getStatus(): AUTOMATION_STATUS {
    return this.status;
  }

  setStatus(value: AUTOMATION_STATUS) {
    this.status = value;
  }

  isCompleted() {
    return this.status === AUTOMATION_STATUS.COMPLETED;
  }

  isRunning() {
    return this.status === AUTOMATION_STATUS.RUNNING;
  }

  isConfigured() {
    return this.status === AUTOMATION_STATUS.CONFIGURED;
  }

  isNotConfigured() {
    return this.status === AUTOMATION_STATUS.NOT_CONFIGURED;
  }

  static deserializer(): HttpResponseDeserializer<AutomationItem> {
    return new (class implements HttpResponseDeserializer<AutomationItem> {
      deserialize(httpResultType: HttpResultType): Optional<AutomationItem> {
        if (httpResultType) {
          let data = httpResultType.data;
          let automationItem = AutomationItem.toAutomationItem(data);
          return Optional.of(automationItem);
        }
        return Optional.empty();
      }
    })();
  }

  public static toAutomationItem(data: JSON_TYPE): AutomationItem {
    const id = data["id"];
    const name = data["name"];
    const creationDate = data["creation_date"];
    const type = data["type"];
    const status = data["status"];
    let automationItem = new AutomationItem();
    automationItem.setAutomationId(id);
    automationItem.setName(name);
    automationItem.setCreationDate(moment(creationDate));
    automationItem.setType(type);
    automationItem.setStatus(status);
    return automationItem;
  }
}
