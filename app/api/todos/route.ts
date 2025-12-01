import { dbApi } from "@/lib/api/db";
import { Todos } from "@/lib/std/todo";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const uid = request.nextUrl.searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { error: "Missing uid parameter" },
        { status: 400 }
      );
    }

    // 在请求处理函数内部创建 client
    const client = await createClient();

    let todos = await dbApi.todos.getAll(client, uid);
    // let todos = todoJsonb.map(castToTodos);

    return NextResponse.json({
      todos,
    });
  } catch (e) {
    console.error("Error in GET /api/todos:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { todo }: { todo: Todos } = await request.json();
    // console.warn("Received todo in POST /api/todos:", todo);
    // 更新数据库
    const client = await createClient();
    let success = await dbApi.todos.insert(client, todo);
    if (success) {
      return NextResponse.json(
        { message: "Todo inserted/updated successfully" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Failed to insert/update todo" },
      { status: 500 }
    );
  } catch (e) {
    console.error("Error in POST /api/todos:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const uid = request.nextUrl.searchParams.get("uid");
    const date = request.nextUrl.searchParams.get("date");
    const todoId = request.nextUrl.searchParams.get("todoId");

    if (!uid || !date || !todoId) {
      return NextResponse.json(
        { error: "Missing uid, date, or todoId parameter" },
        { status: 400 }
      );
    }

    const client = await createClient();
    const success = await dbApi.todos.deleteTodo(client, uid, date, todoId);

    if (success) {
      return NextResponse.json(
        { message: "Todo deleted successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to delete todo" },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("Error in DELETE /api/todos:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
