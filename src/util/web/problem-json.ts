import { t } from "i18next";

export default class ProblemJson {
  private readonly _detail: string;
  private readonly _status: number;
  private readonly _title: string;
  private readonly _type: string;

  constructor(detail: string, status: number, title: string, type: string) {
    this._detail = detail;
    this._status = status;
    this._title = title;
    this._type = type;
  }

  get detail(): string {
    return this._detail;
  }

  get status(): number {
    return this._status;
  }

  get title(): string {
    return this._title;
  }

  get type(): string {
    return this._type;
  }

  static toProblemJson(object: { [key: string]: any } | undefined | null): ProblemJson {
    let detail: string, status: number, title: string, type: string;
    if (object) {
      detail = object.detail;
      status = object.status;
      title = object.title;
      type = object.type;
      return new ProblemJson(detail, status, title, type);
    }
    return new ProblemJson(
      t("UNKNOWN_ERROR_DETAILS"),
      500,
      t("UNKNOWN_ERROR_TITLE"),
      "/exception/server_error/internal_server_error"
    );
  }
}

export { ProblemJson };
