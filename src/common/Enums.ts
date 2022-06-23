export enum SMARTCROP_PREVIEW {
  MODIFIED = "modified",
  ORIGINAL = "original"
}

export enum SMART_CROP {
  TYPE = "SMART_CROP"
}

export enum UPLOAD_STATUS {
  NOT_STARTED = "NO",
  RUNNING = "RUNNING",
  FINISHED = "FINISHED",
  CANCELLED = "CANCELLED",
  S3UPLOADED = "S3UPLOADED"
}

export enum NAVIGATION_MENU {
  HOME = "Home",
  SETTINGS = "Settings",
  BILLINGS = "Billings"
}

export enum AUTOMATION_STATUS {
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  CONFIGURED = "CONFIGURED",
  NOT_CONFIGURED = "NOT_CONFIGURED"
}

export enum Direction {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical"
}

export enum JOB_ACTIONS {
  PAUSE = "PAUSE",
  STOP = "STOP",
  RESUME = "RESUME"
}

export enum JOB_STATUS {
  NOT_STARTED = "NOT_STARTED",
  COMPLETED = "COMPLETED",
  RUNNING = "RUNNING",
  SUCCEEDED = "SUCCEEDED",
  STARTING = "STARTING",
  FAILED = "FAILED"
}

export enum REQUEST_STATUS {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "succeeded",
  FAILED = "failed"
}
