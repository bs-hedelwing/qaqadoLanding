<template>
  <button class="btn">
    <slot> </slot>
  </button>
</template>


<style>
.btn {
  display: inline-flex;
  outline: none;
  border: none;
  height: 50px;
  border-radius: 20px;
  background: #1f87ff;
  cursor: pointer;
  color: white;
  padding: 0 20px;
  align-items: center;
  justify-content: center;
  min-width: 190px;
}
</style>