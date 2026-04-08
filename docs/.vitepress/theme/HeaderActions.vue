<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vitepress";
import VPSwitchAppearance from "vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue";

const route = useRoute();

const isZh = computed(() => route.path.startsWith("/zh/"));

const localeLink = computed(() => {
    if (isZh.value) {
        return route.path === "/zh/" ? "/" : route.path.replace(/^\/zh/, "");
    }

    return route.path === "/" ? "/zh/" : `/zh${route.path}`;
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
            href="https://github.com/Ryo98-SL/react-awesome-api-bridge"
            target="_blank"
            rel="noreferrer"
        >
            GitHub
        </a>
    </div>
</template>
