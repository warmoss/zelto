<template>
  <div>
    <div>
      <h1>Zelto Options</h1>
    </div>

    <div class="actions">
      <div class="actions-left">
        <el-button type="primary" :icon="Plus" @click="showEditModal">新增</el-button>
        <el-input v-model="search" style="max-width: 200px; margin-left: 10px;" clearable placeholder="请输入搜索内容">
          <template #append>
            <el-button :icon="Search" />
          </template>
        </el-input>
      </div>
      <div class="actions-right">
        <el-button type="primary" :icon="Upload" @click="showImportModal" :disabled="loading">导入</el-button>
        <el-button type="primary" :icon="Download" @click="handleExport" :disabled="loading">导出</el-button>
      </div>
    </div>
    <el-table :data="paginatedRows" style="width: 100%">
      <el-table-column prop="keyword" label="关键字" />
      <el-table-column prop="action" label="动作" width="100" :formatter="actionformatter" />
      <el-table-column prop="reason" label="原因" />
      <el-table-column prop="target" label="目标" width="180">
        <template #default="scope">
          <div class="tags">
            <el-tag type="primary" v-if="scope.row.targets.includes('company')" effect="dark" round>公司名称</el-tag>
            <el-tag type="success" v-if="scope.row.targets.includes('job')" effect="dark" round>职位名称</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button type="primary" :icon="Edit" circle size="small" @click="showEditModal(scope.row.id)" />
          <el-button type="danger" :icon="Delete" circle size="small" @click="handleDelete(scope.row.id)" />
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination" background :current-page="page.current" :page-size="page.size" :total="total"
      layout="prev, pager, next" @current-change="handlePageCurrentChange" :hide-on-single-page="true" />

    <options-edit-modal v-model="editing" :data="currentRow" @ok="handleEditOk"></options-edit-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus, Edit, Search, Delete, Upload, Download } from '@element-plus/icons-vue'
import database from "../common/database";
import messaging from "../common/messaging";
import downloading from "../common/downloading";
import OptionsEditModal from "./OptionsEditModal.vue";
import type { ZeltoRule } from "./../types/zelto";
import { Identifiers } from 'mokit';

// == States ==
const loading = ref(false)
const search = ref("");
const rows = ref<ZeltoRule[]>([]);
const editing = ref(false);
const currentRow = ref<ZeltoRule>({});

const page = reactive({
  current: 1,
  size: 10
})

// == Computed ==
const filteredRows = computed(() => filterRows(search.value, rows.value));
const total = computed(() => filteredRows.value.length)
const paginatedRows = computed(() => {
  const start = (page.current - 1) * page.size
  const end = start + page.size
  return filteredRows.value.slice(start, end)
})

// == Formatter ==
function actionformatter(row: ZeltoRule) {
  return row.action == "block" ? "屏蔽" : "醒目提示";
}

// == Methods ==
function handlePageCurrentChange(current: number) {
  page.current = current
}

function showEditModal(id?: string) {
  let data: ZeltoRule = {}
  if (id) {
    data = rows.value.find(item => item.id === id) ?? data;
  }

  currentRow.value = { ...data }
  editing.value = true
}

async function handleEditOk(rule: ZeltoRule) {
  let newRows: ZeltoRule[]

  const existingIndex = rows.value.findIndex(item => item.id === rule.id)
  if (existingIndex !== -1) {
    newRows = [...rows.value]
    newRows[existingIndex] = rule
  } else {
    newRows = [rule, ...rows.value]
  }

  await database.set("zelto", newRows);
  await load();
  await messaging.send({ type: "options_changed", from: "options", to: "contents" });
  ElMessage.success(existingIndex !== -1 ? '修改成功' : '新增成功')
}

async function handleDelete(id: string) {
  const found = rows.value.find(item => item.id === id)
  if (!found) {
    return
  }

  try {
    await ElMessageBox.confirm(`确定删除 ${found.keyword} 吗`, "确认删除", {
      type: "warning",
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch (error) {
    return
  }

  const newRows = rows.value.filter(item => item.id !== id)
  await database.set("zelto", newRows)
  await load()
  await messaging.send({ type: "options_changed", from: "options", to: "contents" });
  ElMessage.success('删除成功')
}

function showImportModal() {
  const input = document.createElement('input')
  input.type = "file"
  input.accept = ".zelto"
  input.addEventListener("change", handleImport)
  input.click()
}

async function handleImport(event: Event) {
  loading.value = false

  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) {
    return
  } else if (!file.name.endsWith('.zelto')) {
    ElMessage.warning('请选择 *.zelto 格式的文件');
    return;
  }

  const text = await downloading.readAsText(file);

  let importedData: ZeltoRule[];
  try {
    importedData = JSON.parse(text);
  } catch (error) {
    ElMessage.warning('文件内容不是有效的 *.zelto 格式');
    return;
  }

  if (!Array.isArray(importedData)) {
    ElMessage.warning('文件格式错误');
    return;
  }

  // 检查数据大小（可选：限制导入数据量）
  const dataSize = JSON.stringify(importedData).length;
  const maxSize = 4.5 * 1024 * 1024; // 4.5MB（预留 0.5MB 给 storage 元数据）
  if (dataSize > maxSize) {
    ElMessage.warning(`文件过大 (${(dataSize / 1024 / 1024).toFixed(2)}MB)，请确保不超过 4.5MB`);
    return;
  }

  const existingRuleMap = new Map()
  const existingRules = await database.get("zelto") ?? []
  for (let idx = 0; idx < existingRules.length; idx++) {
    const existingRule = existingRules[idx]
    existingRuleMap.set(existingRule.keyword, idx);
  }

  const newRules: ZeltoRule[] = existingRules;
  for (const newRule of importedData) {
    newRule.id = Identifiers.simpleUUID()
    const idx = existingRuleMap.get(newRule.keyword ?? "")
    if (idx || idx == 0) {
      newRules[idx] = newRule
    } else {
      newRules.unshift(newRule)
    }
  }
  await database.set("zelto", newRules);
  await load();
  await messaging.send({ type: "options_changed", from: "options", to: "contents" });
  ElMessage.success('导入成功')

  loading.value = false
}

async function handleExport() {
  loading.value = true;

  const rules = await database.get("zelto") ?? []
  for (const rule of rules) {
    delete rule["id"]
  }

  const data = JSON.stringify(rules, null, 2);
  const blob = new Blob([data], { type: 'application/zelto' });
  const url = URL.createObjectURL(blob);
  await downloading.download({ url: url, filename: `rules.zelto`, saveAs: true });
  URL.revokeObjectURL(url);

  ElMessage.success('导出成功')
  loading.value = false;
}

function filterRows(word: string, rules: ZeltoRule[]): ZeltoRule[] {
  word = word?.trim().toLowerCase();
  if (!word) {
    return rules;
  }

  return rules.filter(rule => {
    return (
      rule.keyword?.toLowerCase().includes(word) ||
      rule.reason?.toLowerCase().includes(word)
    )
  })
}

// == Init ==

async function load() {
  rows.value = await database.get("zelto") ?? [];
}

onMounted(() => load());
</script>

<style lang="scss" scoped>
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;

  .actions-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .actions-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.pagination {
  float: right;
  margin: 0 10px;
  margin-top: 20px;
}

.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
