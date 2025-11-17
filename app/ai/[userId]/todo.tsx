// import { SvgResource } from "@/app/resources/svg";
import { useI18n } from "@/lib/i18n/i18n";
import {
  Button,
  Card,
  Checkbox,
  Descriptions,
  DescriptionsProps,
  Input,
  List,
  Modal,
  Progress,
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

export interface AppTodoProps {
  messageApi: MessageInstance;
  userId: string;
  disabled?: boolean;
  client: SupabaseClient;
}

export function Todo({
  messageApi,
  userId,
  disabled = false,
  client,
}: AppTodoProps) {
  const { t } = useI18n();
  const [todos, setTodos] = useState<Todos[]>([]);

  const fetchTodos = async () => {
    const response = await api.todos.getTodos(userId);
    if (response.ok) {
      const { todos }: { todos: Todos[] } = await response.json();
      setTodos(todos);
    } else {
      messageApi.error(t("more.app.todo.fetch_error"));
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [userId]);

  const todoList = useMemo(() => {
    console.warn("Rendering todoTree with todos:", todos);
    let expandList: {
      title: string;
      key: string;
      checked: boolean;
    }[] = [];

    todos.forEach((item) => {
      expandList.push(
        ...item.items.map((todo) => {
          return {
            title: todo.title,
            key: todo.id,
            checked: !!todo.done,
          };
        })
      );
    });

    return expandList;
  }, [todos]);

  return (
    <>
      <Card
        style={{ width: "100%", padding: 0, height: "100%" }}
        size="default"
      >
        <div className={styles.tree_wrapper}>
          <List
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
        </div>
      </Card>
    </>
  );
}
