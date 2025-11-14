export interface TodoItem {
  id: string;
  /**
   * 任务
   */
  title: string;
  /**
   * 完成时间戳，如果未完成则没有该字段
   */
  done?: number;
  /**
   * 是否显示
   * - 当用户删除任务时，会检查done字段，如果有则表示任务已完成，设置visible为false而不是删除
   * - 如果没有done字段，则表示任务未完成，直接删除
   * - 这样做的目的是为了防止用户误操作删除了已完成的任务，导致数据丢失
   * - 用户可以通过导出功能导出已完成的任务
   */
  visible: boolean;
}

export interface Todos {
  /**
   * user id
   */
  id: string;
  /**
   * jsonb array of todo items
   */
  items: TodoItem[];
  /**
   * timestamp of items
   */
  date: string;
}

// 合并只需要合并items字段，并且我们需要遍历确保不要重复添加相同id的todo item
export const mergeTodos = (existing: Todos, incoming: Todos): Todos => {
  const existingItemsMap: { [key: string]: TodoItem } = {};
  existing.items.forEach((item) => {
    existingItemsMap[item.id] = item;
  });

  incoming.items.forEach((item) => {
    if (!existingItemsMap[item.id]) {
      existingItemsMap[item.id] = item;
    } else {
      // 如果已经存在，则更新字段
      existingItemsMap[item.id] = {
        ...existingItemsMap[item.id],
        ...item,
      };
    }
  });

  return {
    id: existing.id,
    date: existing.date,
    items: Object.values(existingItemsMap),
  };
};
