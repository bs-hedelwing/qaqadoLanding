<template>
  <div>
    <Header />

    <section>
      <ui-container>
        <ui-grid-row spacing="md">
          <ui-grid-col :cols="12" :lg="4"> <ui-card> 1 </ui-card></ui-grid-col>
          <ui-grid-col :cols="12" :lg="8"> <ui-card> 2 </ui-card></ui-grid-col>

          <ui-grid-col :cols="12" :lg="8"> <ui-card> 2 </ui-card></ui-grid-col>
          <ui-grid-col :cols="12" :lg="4"> <ui-card> 1 </ui-card></ui-grid-col>

          <ui-grid-col :cols="12" :lg="8">
            <ui-card> Chart </ui-card>
          </ui-grid-col>
          <ui-grid-col :cols="12" :lg="4"> <ui-card> 1 </ui-card></ui-grid-col>
        </ui-grid-row>
      </ui-container>
    </section>
  </div>
</template>


<style lang="scss" scoped>
body {
  background-image: linear-gradient(
    80.15deg,
    #dce1f8 0%,
    #fbefed 52.47%,
    #cadbff 100%
  );
}
</style>