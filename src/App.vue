<script setup>
import { ref, computed, onMounted } from "vue";

const projects = ref([]);
const projectTitle = ref("");
const taskTitle = ref("");
const activeId = ref(null);
const error = ref("");

const active = computed(() => projects.value.find((p) => p.id === activeId.value) || null);
const columns = [
  { key: "todo", label: "Todo" },
  { key: "doing", label: "Doing" },
  { key: "done", label: "Done" }
];

async function load() {
  const res = await fetch("/api/projects");
  const data = await res.json();
  projects.value = data.data || [];
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
  const res = await fetch(`/api/projects/${active.value.id}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: taskTitle.value })
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

onMounted(load);
</script>

<template>
  <div class="wrap">
    <header>
      <div>
        <h1>Task Board</h1>
        <p class="muted">Vue 3 · taskflow-api</p>
      </div>
      <form class="row" @submit.prevent="addProject">
        <input v-model="projectTitle" placeholder="پروژه جدید" required />
        <button type="submit">+</button>
      </form>
    </header>

    <nav class="pills">
      <button v-for="p in projects" :key="p.id" :class="{ on: p.id === activeId }" @click="activeId = p.id">{{ p.title }}</button>
    </nav>

    <p v-if="error" class="err">{{ error }}</p>

    <template v-if="active">
      <form class="row" @submit.prevent="addTask">
        <input v-model="taskTitle" placeholder="تسک جدید" required />
        <button type="submit">افزودن</button>
      </form>
      <div class="board">
        <section v-for="col in columns" :key="col.key">
          <h2>{{ col.label }}</h2>
          <article v-for="t in (active.tasks || []).filter(x => x.status === col.key)" :key="t.id">
            <p>{{ t.title }}</p>
            <div class="moves">
              <button v-for="c in columns.filter(x => x.key !== col.key)" :key="c.key" @click="move(t, c.key)">{{ c.label }}</button>
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
.row { display: flex; gap: 0.5rem; }
input { padding: 0.6rem 0.75rem; border: 1px solid var(--line); border-radius: 8px; min-width: 180px; }
button { border: 0; background: var(--accent); color: #fff; border-radius: 8px; padding: 0.6rem 0.9rem; cursor: pointer; }
.pills { display: flex; gap: 0.4rem; flex-wrap: wrap; margin: 1rem 0; }
.pills button { background: #fff; color: var(--ink); border: 1px solid var(--line); }
.pills button.on { background: var(--accent); color: #fff; border-color: var(--accent); }
.board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; }
section { background: rgba(255,255,255,0.7); border: 1px solid var(--line); border-radius: 12px; padding: 0.85rem; min-height: 280px; }
h2 { font-size: 0.95rem; margin: 0 0 0.75rem; color: #556; }
article { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 0.75rem; margin-bottom: 0.6rem; }
.moves { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-top: 0.5rem; }
.moves button { background: #eef4f1; color: #135; font-size: 0.75rem; padding: 0.3rem 0.5rem; }
.err { color: #b33; }
@media (max-width: 800px) { .board { grid-template-columns: 1fr; } }
</style>
