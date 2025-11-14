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
  const [checkedKeys, setCheckedKeys] = useState<Key[]>([]);
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

  const todoTree: TreeDataNode[] = useMemo(() => {
    console.warn("Rendering todoTree with todos:", todos);
    return todos.map((item) => {
      let checked: Key[] = [];
      const res = {
        title: new Date(Number(item.date)).toLocaleDateString(),
        key: item.date,
        children: item.items.map((todo) => {
          if (todo.done) {
            checked.push(todo.id);
          }
          return {
            title: todo.title,
            key: todo.id,
            isLeaf: true,
          };
        }),
      };

      setCheckedKeys((prev) => Array.from(new Set([...prev, ...checked])));
      return res;
    });
  }, [todos]);

  const onSelect: TreeProps["onSelect"] = (selectedKeys, info) => {
    console.log("selected", selectedKeys, info);
  };

  const onCheck: TreeProps["onCheck"] = (checkedKeys, info) => {
    console.log("onCheck", checkedKeys, info);
  };

  return (
    <>
      <Card
        style={{ width: "100%", padding: 0, height: "100%" }}
        size="default"
      >
        <div className={styles.tree_wrapper}>
          <Tree
            checkable
            checkedKeys={checkedKeys}
            onSelect={onSelect}
            onCheck={onCheck}
            treeData={todoTree}
          />
        </div>
        {/* {!disabled && (
          <div className={styles.todo_add_wrapper}>
            <Input
              className={styles.todo_add_input}
              placeholder={t("more.app.todo.add")}
              width={"100%"}
              value={newTodo}
              style={{ borderColor: disabled ? "#666" : "#22CCEE" }}
              onChange={(e) => {
                setNewTodo(e.target.value);
              }}
              size="middle"
              onPressEnter={addTodo}
              suffix={
                <Button
                  className={styles.todo_add_btn}
                  style={{ padding: 0, height: "fit-content" }}
                  type="text"
                  onClick={addTodo}
                  disabled={disabled}
                >
                  <SvgResource
                    type="add"
                    svgSize={16}
                    color={disabled ? "#666" : "#8c8c8c"}
                  ></SvgResource>
                </Button>
              }
            ></Input>
          </div>
        )} */}
      </Card>
      {/* <Modal
        width={600}
        open={showExport}
        title={localParticipant.name || localParticipant.identity}
        cancelText={t("common.cancel")}
        okText={t("common.close")}
        onCancel={() => {
          setShowExport(false);
        }}
        onOk={() => {
          setShowExport(false);
        }}
      >
        <ExportTodoHistroy
          items={historyItems}
          appData={appData}
        ></ExportTodoHistroy>
      </Modal> */}
    </>
  );
}

// export function ExportTodoHistroy({
//   items,
//   appData,
// }: {
//   items: DescriptionsProps["items"];
//   appData: TodoItem[];
// }) {
//   let { percent, start, end } = useMemo(() => {
//     let start = Number(appData[0].id);
//     let end = appData[appData.length - 1].done ?? Date.now();

//     // 计算已完成任务数
//     let completedCount = appData.filter((item) => item.done).length;

//     // 计算完成百分比
//     let percent = Math.round((completedCount / appData.length) * 100);

//     return {
//       start,
//       end,
//       percent,
//     };
//   }, [appData]);

//   return (
//     <>
//       <Descriptions
//         bordered
//         items={items}
//         column={1}
//         styles={{
//           label: {
//             color: "#8c8c8c",
//             fontWeight: 700,
//             backgroundColor: "#1a1a1a",
//           },
//           content: {
//             backgroundColor: "#1E1E1E",
//             color: "#8c8c8c",
//           },
//         }}
//       />
//       <div style={{ marginTop: 16 }}>
//         <div
//           style={{
//             display: "inline-flex",
//             justifyContent: "space-between",
//             width: "100%",
//           }}
//         >
//           <span>Start: {new Date(start).toLocaleString()}</span>
//           <span>End: {new Date(end).toLocaleString()}</span>
//         </div>
//         <Progress percent={percent} strokeColor={"#22CCEE"} />
//       </div>
//     </>
//   );
// }
