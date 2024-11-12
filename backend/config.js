export const defaultWeights = {
  urgencyWeight: 100,
  valueWeight: 60,
  sizeWeight: 40,
};

export const defaultColumns = () => ({
  "Priority Backlog": [],
  Today: [],
  "Done Done": [],
});

export const defaultStatus = "Priority Backlog";

export const STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
