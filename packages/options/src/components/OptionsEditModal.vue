<template>
    <el-dialog v-model="visible" title="根据关键词屏蔽职位" width="500">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="auto" label-position="left">
            <el-form-item prop="keyword" label="关键词">
                <el-input v-model="formData.keyword" />
            </el-form-item>
            <el-form-item prop="reason" label="屏蔽原因">
                <el-input v-model="formData.reason" />
            </el-form-item>
            <el-form-item prop="action" label="屏蔽动作">
                <el-select v-model="formData.action" placeholder="请选择">
                    <el-option label="屏蔽" value="block" />
                    <el-option label="醒目提示" value="warn" />
                </el-select>
            </el-form-item>
            <el-form-item prop="targets" label="目标范围">
                <el-select v-model="formData.targets" multiple placeholder="请选择">
                    <el-option label="职位名称" value="job" />
                    <el-option label="公司名称" value="company" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="visible = false">取消</el-button>
                <el-button type="primary" @click="handleOk(formRef)">保存</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, useTemplateRef, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { ZeltoRule } from "./../types/zelto";
import { Identifiers } from 'mokit';

// == Types ==
interface Props {
    modelValue: boolean,
    onOk: (rule: ZeltoRule) => void;
    data?: ZeltoRule
}

// == Props ==
const visible = defineModel({ required: true })
const { onOk, data = {} } = defineProps<Props>()

// == State ==
const defaultFormData = {
    id: "",
    keyword: "",
    reason: "",
    action: "block",
    targets: ["company", "job"],
    vindex: 1,
};
const formRef = useTemplateRef('formRef')
const formData = reactive({ ...defaultFormData });
const formRules = reactive<FormRules<ZeltoRule>>({
    keyword: [
        { required: true, message: '不能为空', trigger: 'blur' },
        { max: 50, message: '不能超过50个字', trigger: 'blur' },
    ],
    reason: [
        { required: true, message: '不能为空', trigger: 'blur' },
        { max: 50, message: '不能超过50个字', trigger: 'blur' },
    ],
    action: [
        { required: true, message: '不能为空', trigger: 'blur' },
    ],
    targets: [
        { type: 'array', required: true, message: '不能为空', trigger: 'blur' },
    ],
})

// == Methods ==
async function handleOk(form: FormInstance | undefined) {
    if (!form) {
        return;
    }
    const valid = await form.validate().catch(() => { });
    if (!valid) {
        return;
    }

    onOk(formData);
    visible.value = false;
    form.resetFields();
}

// == Lifecycle ==
watch(
    () => data,
    (newData) => {
        newData.id = newData.id ?? Identifiers.simpleUUID()
        Object.assign(formData, defaultFormData, newData)
    }
)
</script>
