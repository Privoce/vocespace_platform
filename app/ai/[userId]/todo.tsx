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
  const [todoListChecked, setTodoListChecked] = useState<TodoNode[]>([]);
  const fetchTodos = async () => {
    setLoading(true);
    setTodos([]);
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

  const todoList = useMemo(() => {
    console.warn("Rendering todoTree with todos:", todos);
    let expandList: TodoNode[] = [];
    let checkedList: TodoNode[] = [];

    todos.forEach((item) => {
      expandList.push(
        ...item.items.map((todo) => {
          let item = {
            title: todo.title,
            key: todo.id,
            checked: !!todo.done,
          };

          if (todo.done && inToday(todo.done)) {
            checkedList.push(item);
          }

          return item;
        })
      );
    });
    setTodoListChecked(checkedList);
    return expandList;
  }, [todos]);

  return (
    <>
      <Card
        style={{ width: "100%", padding: 0, height: "100%" }}
        styles={{ body: { height: "100%" } }}
        size="default"
      >
        <div className={styles.tree_wrapper}>
          <div className={styles.tree_wrapper_list}>
            {loading ? (
              <Skeleton paragraph={{ rows: 10 }} active />
            ) : (
              <List
                pagination={{
                  position: "bottom",
                  align: "end",
                  pageSize: 15,
                  size: "small",
                  simple: { readOnly: true },
                }}
                dataSource={todoList}
                bordered={false}
                split={false}
                locale={{
                  emptyText: (
                    <p
                      style={{
                        color: "#8c8c8c",
                        fontSize: 14,
                      }}
                    >
                      {t("widgets.todo.empty")}
                    </p>
                  ),
                }}
                renderItem={(item) => (
                  <List.Item>
                    <Checkbox checked={item.checked} disabled>
                      {item.title}
                    </Checkbox>
                  </List.Item>
                )}
              ></List>
            )}
          </div>

          <div className={styles.tree_wrapper_today}>
            <Divider style={{ fontSize: 12 }}>
              {t("widgets.todo.today_done")}
            </Divider>
            <List
              pagination={{
                position: "bottom",
                align: "end",
                pageSize: 5,
                size: "small",
                simple: { readOnly: true },
              }}
              dataSource={todoListChecked}
              bordered={false}
              split={false}
              locale={{
                emptyText: (
                  <p
                    style={{
                      color: "#8c8c8c",
                      fontSize: 14,
                    }}
                  >
                    {t("widgets.todo.empty")}
                  </p>
                ),
              }}
              renderItem={(item) => (
                <List.Item>
                  <Checkbox checked={true} disabled>
                    {item.title}
                  </Checkbox>
                </List.Item>
              )}
            ></List>
          </div>
        </div>
      </Card>
    </>
  );
}
