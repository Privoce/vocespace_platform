import { SupabaseClient } from "@supabase/supabase-js";
import { mergeTodos, TodoItem, Todos } from "@/lib/std/todo";

export const getAll = async (
  client: SupabaseClient,
  uid: string
): Promise<Todos[]> => {
  const { data, error } = await client.from("todos").select("*").eq("id", uid);

  if (error) throw error;

  return data;
};

export const get = async (
  client: SupabaseClient,
  uid: string,
  date: string
): Promise<Todos> => {
  const { data, error } = await client
    .from("todos")
    .select("*")
    .eq("id", uid)
    .eq("date", date)
    .single();

  if (error) throw error;

  return data;
};

/**
 * 更新待办事项，直接覆盖
 */
export const update = async (
  client: SupabaseClient,
  todos: Todos
): Promise<boolean> => {
  const { error } = await client
    .from("todos")
    .update(todos)
    .eq("id", todos.id)
    .eq("date", todos.date);

  if (error) {
    throw error;
  }
  return true;
};

/**
 * 插入待办事项，如果已存在则合并后更新
 */
export const insert = async (
  client: SupabaseClient,
  todos: Todos
): Promise<boolean> => {
  // 首先从todos中获取date和id
  const { id, date } = todos;
  // 从数据库中查询这个用户在这个日期下是否已经有todo记录，如果有则需要进行合并再更新
  const existing = await get(client, id, date).catch(() => null);
  if (existing) {
    // 合并
    // const merged = mergeTodos(existing, todos);
    // 更新
    return await update(client, todos);
  }
  // 如果不存在，则直接插入
  const { error } = await client.from("todos").insert(todos);
  if (error) {
    throw error;
  }
  return true;
};

export const insertSingle = async (
  client: SupabaseClient,
  uid: string,
  item: TodoItem,
  date: string
): Promise<boolean> => {
  // 包装成Todos结构用insert函数插入
  const todos: Todos = {
    id: uid,
    items: [item],
    date: date,
  };

  return await insert(client, todos);
};

const remove = async (
  client: SupabaseClient,
  uid: string,
  date: string
): Promise<boolean> => {
  const { error } = await client
    .from("todos")
    .delete()
    .eq("id", uid)
    .eq("date", date);

  if (error) {
    throw error;
  }
  return true;
};

const removeAll = async (
  client: SupabaseClient,
  uid: string
): Promise<boolean> => {
  const { error } = await client.from("todos").delete().eq("id", uid);

  if (error) {
    throw error;
  }
  return true;
}

export const todos = {
  get,
  getAll,
  insert,
  insertSingle,
  update,
  remove,
  removeAll
};
