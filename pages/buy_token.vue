<template>
  <ui-container style="padding-top: 92px">
    <ui-grid-row spacing="md">
      <ui-grid-col :cols="8">
        <ui-card
          ><form>
            <div class="form-section">
              <ui-typography size="lg" gutter-bottom="lg" tag="h5"
                >Выберите валюту:</ui-typography
              >
              <ui-grid-row spacing="sm">
                <ui-grid-col
                  :cols="2"
                  v-for="(cur, i) in ['ETH', 'BTC', 'BNB', 'BUSD', 'SBER']"
                  :key="i"
                >
                  <label
                    class="radio"
                    :class="cur === currency && 'radio_active'"
                  >
                    {{ cur }} 0.0008000
                    <input
                      type="radio"
                      v-model="currency"
                      :value="cur"
                      name="currency"
                    />
                  </label>
                </ui-grid-col>
              </ui-grid-row>
            </div>

            <div class="form-section">
              <ui-typography size="lg" gutter-bottom="lg" tag="h5"
                >Укажите сумму:</ui-typography
              >

              <div>
                <input
                  style="
                    height: 40px;
                    outline: none;
                    border-radius: 10px;
                    border: thin solid #c4c4c4;
                    padding: 16px;
                    font-size: 18px;
                    color: #101010;
                  "
                  type="text"
                />
                <ui-typography size="md" tag="span">
                  = 123, 578, 786 токенов</ui-typography
                >

                <ui-typography
                  size="md"
                  gutter-bottom="lg"
                  style="margin-top: 16px"
                  >Бонус: 5 QQD</ui-typography
                >
                <div class="progress-bar">
                  <div class="progress-bar__slider" style="width: 50%"></div>
                </div>
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    margin-top: 16px;
                  "
                >
                  <div>0%</div>
                  <div>52%</div>
                </div>
              </div>
            </div>
            <div class="form-section">
              <ui-typography size="lg" gutter-bottom="lg" tag="h5"
                >Оплатите:</ui-typography
              >
              <ui-button color="secondary" size="xl">
                Оплатить <icons-metamask style="margin-left: 12px"
              /></ui-button>
            </div>
          </form> </ui-card
      ></ui-grid-col>
      <ui-grid-col :cols="4">
        <ui-grid-row spacing="md">
          <ui-grid-col :cols="12"> <ui-card></ui-card></ui-grid-col>
          <ui-grid-col :cols="12"
            ><ui-card>
              <ui-typography size="lg" gutter-bottom="md" tag="h5">
                Предварительная продажа токенов:
              </ui-typography>
              <ui-typography size="sm" gutter-bottom="sm" tag="p">
                Стоимость токена:
              </ui-typography>
              <ui-typography size="lg" gutter-bottom="sm" tag="p">
                1 токен = 1 сумма
              </ui-typography>
              <ui-typography size="sm" gutter-bottom="sm" tag="p">
                Стоимость что-то там токена:
              </ui-typography>
              <ui-typography size="lg" gutter-bottom="sm" tag="p">
                1 токен = 1 сумма
              </ui-typography>
              <ui-typography size="sm" gutter-bottom="sm" tag="p">
                Бонус:
              </ui-typography>
              <ui-typography size="lg" gutter-bottom="sm" tag="p">
                52%
              </ui-typography>

              <ui-typography size="lg" gutter-bottom="md" tag="h5">
                Прогресс токена
              </ui-typography>

              <ui-slider :value="300000" :min="0" :max="1000000"></ui-slider>
            </ui-card>
          </ui-grid-col>
        </ui-grid-row>
      </ui-grid-col>
    </ui-grid-row>
  </ui-container>
</template>


<script lang="ts" setup>
const currency = ref("ETH");
</script>

<style lang="scss">
@import "~/assets/variables.scss";

.form-section:not(:last-of-type) {
  margin-bottom: 45px;
}

.radio {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 15px;
  border: 3px solid transparent;
  background: $secondary;
  justify-content: center;
  &_active {
    border: 3px solid $primary;
  }
  input {
    display: none;
  }
}

.progress-bar {
  &__slider {
    background: $primary;
    height: 16px;
    border-radius: inherit;
  }
  background: $secondary;
  height: 16px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}
</style>