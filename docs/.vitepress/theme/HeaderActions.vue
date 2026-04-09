<script setup lang="ts">
import { computed } from "vue";
import { useData, useRoute } from "vitepress";
import VPSwitchAppearance from "vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue";

const route = useRoute();
const { site } = useData();

const base = computed(() => site.value.base || "/");
const baseNoTrailingSlash = computed(() =>
    base.value.endsWith("/") ? base.value.slice(0, -1) : base.value,
);

const relativePath = computed(() => {
    const p = route.path || "/";
    const b = baseNoTrailingSlash.value;
    if (b && p.startsWith(b)) return p.slice(b.length) || "/";
    return p;
});

const isZh = computed(() => relativePath.value.startsWith("/zh/"));

const localeLink = computed(() => {
    let nextPath = "/";
    if (isZh.value) {
        nextPath =
            relativePath.value === "/zh/"
                ? "/"
                : relativePath.value.replace(/^\/zh/, "");
    } else {
        nextPath = relativePath.value === "/" ? "/zh/" : `/zh${relativePath.value}`;
    }

    return `${baseNoTrailingSlash.value}${nextPath}`;
});

const localeLabel = computed(() => (isZh.value ? "English" : "简体中文"));
</script>

<template>
    <div class="custom-header-actions">
        <a class="locale-link" :href="localeLink">{{ localeLabel }}</a>
        <div class="theme-toggle" aria-label="Appearance">
            <VPSwitchAppearance />
        </div>
        <a
            class="github-link"
            href="https://github.com/Ryo98-SL/react-api-bridge"
            target="_blank"
            rel="noreferrer"
        >
            GitHub
        </a>
    </div>
</template>
