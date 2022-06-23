import ProblemJson from "../web/problem-json";

class ProblemJsonException extends Error {
  private readonly _problemJson: ProblemJson;

  constructor(problemJson: ProblemJson) {
    super(problemJson.detail);
    this.message = problemJson.detail;
    this.name = problemJson.type;
    this._problemJson = problemJson;
  }

  get problemJson(): ProblemJson {
    return this._problemJson;
  }

  toString() {
    return this.problemJson.detail;
  }
}

export { ProblemJsonException };
