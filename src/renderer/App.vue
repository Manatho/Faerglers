<template>
    <div id="app" class="fill">
        <router-view></router-view>
    </div>
</template>

<script>
export default {
  name: 'faerglers'
};
</script>

<style>
html,
body,
.fill {
  position: absolute;
  margin: 0px;
  padding: 0px;
  width: 100%;
  height: 100%;
}
</style>
