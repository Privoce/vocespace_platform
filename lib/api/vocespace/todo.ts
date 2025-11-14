const API = "/api/todos";

/**
 * get all todos for a user
 * @param uid
 */
export const getTodos = async (uid: string) => {
  const url = new URL(API, location.origin);
  url.searchParams.append("uid", uid);
  return await fetch(url.toString());
};

export const todos = {
  getTodos,
};
