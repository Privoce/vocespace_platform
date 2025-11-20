// import { SvgResource } from "@/app/resources/svg";
import { useI18n } from "@/lib/i18n/i18n";
import {
  Button,
  Card,
  Checkbox,
  Descriptions,
  DescriptionsProps,
  Divider,
  Input,
  List,
  Modal,
  Progress,
  Skeleton,
  Tree,
  TreeDataNode,
  TreeProps,
} from "antd";
import { Key, useEffect, useMemo, useState } from "react";
import styles from "@/styles/ai.module.scss";
import { MessageInstance } from "antd/es/message/interface";
// import { AppAuth, TodoItem } from '@/lib/std/space';
// import { useLocalParticipant } from '@livekit/components-react';
import { CardSize } from "antd/es/card/Card";
import { SupabaseClient } from "@supabase/supabase-js";
import { TodoItem, Todos } from "@/lib/std/todo";
import { api } from "@/lib/api";
import { inToday } from "@/lib/std";
import { v4 as uuidv4 } from "uuid";

export interface AppTodoProps {
  messageApi: MessageInstance;
  userId: string;
  disabled?: boolean;
  client: SupabaseClient;
}

interface TodoNode {
  title: string;
  key: string;
  checked: boolean;
  date: string; // 使用字符串存储的时间戳
}

export function Todo({
  messageApi,
  userId,
  disabled = false,
  client,
}: AppTodoProps) {
  const { t } = useI18n();
  const [todos, setTodos] = useState<Todos[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchTodos = async () => {
    setLoading(true);
    const response = await api.todos.getTodos(userId);
    if (response.ok) {
      const { todos }: { todos: Todos[] } = await response.json();
      setTodos(todos);
    } else {
      messageApi.error(t("more.app.todo.fetch_error"));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, [userId]);

  const { todoList, todoListChecked } = useMemo(() => {
    console.warn("Rendering todoTree with todos:", todos);
    const expandList: TodoNode[] = [];
    const checkedList: TodoNode[] = [];
    todos.forEach((todoGroup) => {
      todoGroup.items.forEach((todo) => {
        const todoNode: TodoNode = {
          title: todo.title,
          key: uuidv4(),
          checked: !!todo.done,
          date: todo.id,
        };

        expandList.push(todoNode);

        if (todo.done && inToday(todo.done)) {
          checkedList.push(todoNode);
        }
      });
    });
    // 需要按照日期进行排序
    return {
      todoList: expandList.sort((a, b) => {
        const dateA = new Date(Number(a.date)).getTime();
        const dateB = new Date(Number(b.date)).getTime();
        return dateB - dateA; // 降序排列
      }),
      // 只返回今天完成的任务
      todoListChecked: checkedList,
    };
  }, [todos]);

  return (
    <>
      <Card
        style={{ width: "100%", padding: 0, height: "100%" }}
        styles={{ body: { height: "100%", padding: 0, overflow: "hidden" } }}
        size="default"
      >
        <div className={styles.tree_wrapper}>
          <Divider style={{ fontSize: 12, margin: "12px 0" }}>
            {t("widgets.todo.today_done")}
          </Divider>
          <div className={styles.tree_wrapper_today}>
            {loading ? (
              <div style={{ padding: "16px" }}>
                <Skeleton paragraph={{ rows: 5 }} active />
              </div>
            ) : todoListChecked.length > 0 ? (
              <div className={styles.tree_wrapper_today_content}>
                {todoListChecked.map((item) => (
                  <div key={item.key} className={styles.todo_item}>
                    <Checkbox checked={item.checked} disabled>
                      {item.title}
                    </Checkbox>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#8c8c8c",
                }}
              >
                {t("widgets.todo.empty")}
              </div>
            )}
          </div>
          <Divider style={{ fontSize: 12, margin: "12px 0" }}>
            {t("widgets.todo.history")}
          </Divider>
          <div className={styles.tree_wrapper_list}>
            {loading ? (
              <div style={{ padding: "16px" }}>
                <Skeleton paragraph={{ rows: 10 }} active />
              </div>
            ) : todoList.length > 0 ? (
              <div>
                {todoList.map((item) => (
                  <div key={item.key} className={styles.todo_item}>
                    <Checkbox checked={item.checked} disabled>
                      {item.title}
                    </Checkbox>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#8c8c8c",
                }}
              >
                {t("widgets.todo.empty")}
              </div>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}
