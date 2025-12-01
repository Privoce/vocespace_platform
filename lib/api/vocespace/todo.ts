import { Todos } from "@/lib/std/todo";

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

export const add = async (todo: Todos) => {
  const url = new URL(API, location.origin);
  return await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ todo }),
  });
};

export const deleteTodo = async (uid: string, date: string, todoId: string) => {
  const url = new URL(API, location.origin);
  url.searchParams.append("uid", uid);
  url.searchParams.append("date", date);
  url.searchParams.append("todoId", todoId);
  return await fetch(url.toString(), {
    method: "DELETE",
  });
};

export const todos = {
  getTodos,
  add,
  deleteTodo,
};
