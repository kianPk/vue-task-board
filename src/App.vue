<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";

const STORAGE_KEY = "vue-task-board:activeId";

const projects = ref([]);
const projectTitle = ref("");
const taskTitle = ref("");
const taskPriority = ref("medium");
const search = ref("");
const priorityFilter = ref("all");
const activeId = ref(localStorage.getItem(STORAGE_KEY) || null);
const focusedTaskId = ref(null);
const error = ref("");

const active = computed(() => projects.value.find((p) => p.id === activeId.value) || null);
const columns = [
  { key: "todo", label: "Todo" },
  { key: "doing", label: "Doing" },
  { key: "done", label: "Done" }
];
const priorities = ["low", "medium", "high"];
const hasPriority = computed(() =>
  (active.value?.tasks || []).some((t) => t.priority != null)
);

const filteredTasks = computed(() => {
  let list = active.value?.tasks || [];
  const q = search.value.trim().toLowerCase();
  if (q) list = list.filter((t) => String(t.title || "").toLowerCase().includes(q));
  if (priorityFilter.value !== "all" && hasPriority.value) {
    list = list.filter((t) => (t.priority || "medium") === priorityFilter.value);
  }
  return list;
});

watch(activeId, (id) => {
  if (id) localStorage.setItem(STORAGE_KEY, id);
});

async function load() {
  const res = await fetch("/api/projects");
  const data = await res.json();
  projects.value = data.data || [];
  if (activeId.value && !projects.value.find((p) => p.id === activeId.value)) {
    activeId.value = projects.value[0]?.id || null;
  }
  if (!activeId.value && projects.value[0]) activeId.value = projects.value[0].id;
}

async function addProject() {
  error.value = "";
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: projectTitle.value })
  });
  const data = await res.json();
  if (!data.ok) { error.value = data.error; return; }
  projectTitle.value = "";
  await load();
  activeId.value = data.data.id;
}

async function addTask() {
  if (!active.value) return;
  const body = { title: taskTitle.value, priority: taskPriority.value };
  const res = await fetch(`/api/projects/${active.value.id}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!data.ok) { error.value = data.error; return; }
  taskTitle.value = "";
  await load();
}

async function move(task, status) {
  await fetch(`/api/tasks/${task.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  await load();
}

function tasksIn(col) {
  return filteredTasks.value.filter((x) => x.status === col);
}

function onKey(e) {
  if (!focusedTaskId.value || !active.value) return;
  const map = { "1": "todo", "2": "doing", "3": "done" };
  const status = map[e.key];
  if (!status) return;
  const task = (active.value.tasks || []).find((t) => t.id === focusedTaskId.value);
  if (task) move(task, status);
}

onMounted(() => {
  load();
  window.addEventListener("keydown", onKey);
});
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <div class="wrap">
    <header>
      <div>
        <h1>Task Board</h1>
        <p class="muted">Vue 3 · taskflow-api · press 1/2/3 to move focused task</p>
      </div>
      <form class="row" @submit.prevent="addProject">
        <input v-model="projectTitle" placeholder="پروژه جدید" required />
        <button type="submit">+</button>
      </form>
    </header>

    <nav class="pills">
      <button
        v-for="p in projects"
        :key="p.id"
        :class="{ on: p.id === activeId }"
        @click="activeId = p.id"
      >{{ p.title }}</button>
    </nav>

    <p v-if="error" class="err">{{ error }}</p>

    <template v-if="active">
      <div class="toolbar">
        <input v-model="search" type="search" placeholder="Search tasks by title…" />
        <div v-if="hasPriority" class="chips">
          <button
            type="button"
            :class="{ on: priorityFilter === 'all' }"
            @click="priorityFilter = 'all'"
          >all</button>
          <button
            v-for="pr in priorities"
            :key="pr"
            type="button"
            :class="{ on: priorityFilter === pr }"
            @click="priorityFilter = pr"
          >{{ pr }}</button>
        </div>
      </div>

      <form class="row" @submit.prevent="addTask">
        <input v-model="taskTitle" placeholder="تسک جدید" required />
        <select v-model="taskPriority">
          <option v-for="pr in priorities" :key="pr" :value="pr">{{ pr }}</option>
        </select>
        <button type="submit">افزودن</button>
      </form>
      <div class="board">
        <section v-for="col in columns" :key="col.key">
          <h2>{{ col.label }}</h2>
          <article
            v-for="t in tasksIn(col.key)"
            :key="t.id"
            :class="{ focused: focusedTaskId === t.id }"
            tabindex="0"
            @click="focusedTaskId = t.id"
            @focus="focusedTaskId = t.id"
          >
            <p>{{ t.title }}</p>
            <span v-if="t.priority" class="prio" :data-p="t.priority">{{ t.priority }}</span>
            <div class="moves">
              <button
                v-for="c in columns.filter(x => x.key !== col.key)"
                :key="c.key"
                @click.stop="move(t, c.key)"
              >{{ c.label }}</button>
            </div>
          </article>
        </section>
      </div>
    </template>
  </div>
</template>

<style>
:root {
  --bg: #f3f1eb; --ink: #1a1a1a; --card: #fff; --line: #ddd6c8; --accent: #0f6e56;
  font-family: "Segoe UI", Tahoma, sans-serif;
}
* { box-sizing: border-box; }
body { margin: 0; background: linear-gradient(180deg, #e7efe9, var(--bg)); color: var(--ink); }
.wrap { max-width: 1100px; margin: 0 auto; padding: 1.5rem; }
header { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; align-items: end; }
h1 { margin: 0; font-size: 1.8rem; }
.muted { color: #667; margin: 0.2rem 0 0; }
.row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
input, select { padding: 0.6rem 0.75rem; border: 1px solid var(--line); border-radius: 8px; min-width: 140px; }
button { border: 0; background: var(--accent); color: #fff; border-radius: 8px; padding: 0.6rem 0.9rem; cursor: pointer; }
.pills { display: flex; gap: 0.4rem; flex-wrap: wrap; margin: 1rem 0; }
.pills button { background: #fff; color: var(--ink); border: 1px solid var(--line); }
.pills button.on { background: var(--accent); color: #fff; border-color: var(--accent); }
.toolbar { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem; }
.toolbar input[type="search"] { flex: 1; min-width: 200px; }
.chips { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.chips button { background: #fff; color: var(--ink); border: 1px solid var(--line); font-size: 0.8rem; padding: 0.35rem 0.65rem; }
.chips button.on { background: var(--accent); color: #fff; border-color: var(--accent); }
.board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; }
section { background: rgba(255,255,255,0.7); border: 1px solid var(--line); border-radius: 12px; padding: 0.85rem; min-height: 280px; }
h2 { font-size: 0.95rem; margin: 0 0 0.75rem; color: #556; }
article { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 0.75rem; margin-bottom: 0.6rem; outline: none; }
article.focused { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(15,110,86,0.25); }
.prio { display: inline-block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; padding: 0.15rem 0.4rem; border-radius: 4px; background: #eef4f1; color: #135; }
.prio[data-p="high"] { background: #fde8e8; color: #922; }
.prio[data-p="low"] { background: #eef0f4; color: #556; }
.moves { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-top: 0.5rem; }
.moves button { background: #eef4f1; color: #135; font-size: 0.75rem; padding: 0.3rem 0.5rem; }
.err { color: #b33; }
@media (max-width: 800px) { .board { grid-template-columns: 1fr; } }
</style>
