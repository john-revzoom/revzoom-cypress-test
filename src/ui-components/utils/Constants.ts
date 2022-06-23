/*----------------------- Global Constants ---------------------*/
export const KeyCode = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,

  SPACEBAR: 32,
  ENTER: 13,
  DELETE: 8,
  SHIFT: 16,
  CONTROL: 17,
  ALT: 18,
  META: 224,
  ESCAPE: 27,

  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90
};

/**
 *
 */
export const NULL_VALUE = null;

/**
 * comma operator
 */
export const COMMA_DELIMITER: string = ",";

/**
 * hiphen operator
 */
export const HIPHEN_DELIMITER: string = "-";

/**
 * underscore operator
 */
export const UNDERSCORE_DELIMITER: string = "_";

/**
 * forward slash operator
 */
export const FORWARD_SLASH: string = "/";

/**
 * backward slash operator
 */
export const BACKWARD_SLASH: string = "\\";

/**
 * separator in any file path
 */
export const FILE_PATH_SEPARATOR: string = FORWARD_SLASH;

/**
 * separator in a file name.
 */
export const FILE_NAME_DELIMITER: string = ".";

/**
 * contains default user name.
 */
export const DEFAULT_FULL_USERNAME: string = "Anonymous";

/**
 * ascending order value
 */
export const ASCENDING_SORT_ORDER: string = "ASC";

/**
 * descending order value
 */
export const DESCENDING_SORT_ORDER: string = "DESC";

/**
 * default sort order
 */
export const DEFAULT_SORT_ORDER: string = ASCENDING_SORT_ORDER;

/**
 * default array join delimiter
 */
export const DEFAULT_ARRAY_JOIN_DELIMITER: string = COMMA_DELIMITER;

/**
 * default value for page size
 */
export const DEFAULT_PAGE_SIZE: number = process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE
  ? parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE)
  : 100;
/**
 * Allowed extensions for upload
 */
export const ACCEPTED_EXTENSIONS_FOR_UPLOAD = ["jpg", "jpeg", "png", "gif", "webp"];
/**
 * Allowed file sizein KB for upload
 */
export const ACCEPTED_FILE_SIZE = 25 * 1024 * 1024;
/**
 * Max concurrent count
 */
export const MAX_CONCURRENT_COUNT = 2;
/**
 * Max retry count for Thumb generation check
 */
export const MAX_RETRY_FOR_THUMB_CHECK = 30;
/**
 * Interval for Thumb generation check in millisecond
 */
export const INTERVAL_FOR_THUMB_CHECK = 3000;
