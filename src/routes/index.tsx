import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minhas Tarefas" },
      { name: "description", content: "Lista de tarefas com persistência em nuvem." },
    ],
  }),
  component: Index,
});

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
};

function Index() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setTodos(data as Todo[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setTitle("");
    const { data, error } = await supabase
      .from("todos")
      .insert({ title: t })
      .select()
      .single();
    if (!error && data) setTodos((prev) => [data as Todo, ...prev]);
  };

  const toggle = async (todo: Todo) => {
    const next = !todo.completed;
    setTodos((prev) => prev.map((x) => (x.id === todo.id ? { ...x, completed: next } : x)));
    await supabase.from("todos").update({ completed: next }).eq("id", todo.id);
  };

  const remove = async (id: string) => {
    setTodos((prev) => prev.filter((x) => x.id !== id));
    await supabase.from("todos").delete().eq("id", id);
  };

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <main className="min-h-screen bg-red-600 px-4 py-16">
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Minhas Tarefas</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {loading ? "Carregando..." : `${remaining} pendente${remaining === 1 ? "" : "s"} de ${todos.length}`}
          </p>
        </header>

        <form onSubmit={addTodo} className="mb-6 flex gap-2 rounded-xl border border-border bg-card p-2 shadow-sm">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="O que você precisa fazer?"
            className="flex-1 bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            disabled={!title.trim()}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </form>

        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition hover:shadow-md"
            >
              <button
                onClick={() => toggle(todo)}
                className="text-muted-foreground transition hover:text-primary"
                aria-label={todo.completed ? "Marcar como pendente" : "Marcar como concluída"}
              >
                {todo.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <span
                className={`flex-1 text-sm ${
                  todo.completed ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {todo.title}
              </span>
              <button
                onClick={() => remove(todo.id)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-white/90 opacity-0 transition hover:bg-white/20 hover:text-white group-hover:opacity-100"
                aria-label="Excluir anotação"
              >
                <Trash2 className="h-4 w-4" /> Excluir
              </button>
            </li>
          ))}
          {!loading && todos.length === 0 && (
            <li className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-10 text-center text-sm text-muted-foreground">
              Nenhuma tarefa ainda. Adicione a primeira acima!
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
