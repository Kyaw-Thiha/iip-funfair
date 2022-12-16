<template>
  <div class="q-mb-xl">
    <h2 class="text-center text-primary">Preorders</h2>

    <section class="q-px-md-xl q-px-sm-md q-px-xs-sm">
      <q-list padding>
        <q-item
          v-for="preorder in preorders"
          :key="preorder.id"
          class="q-my-md preorder"
          clickable
          v-ripple
          @click="router.push({ name: 'invoice', params: { id: preorder.id } })"
        >
          <q-item-section avatar>
            <q-avatar size="60px">
              <img :src="preorder.product_image" :alt="preorder.product_name" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label
              ><h6 class="q-mt-none">{{ preorder.product_name }}</h6>
            </q-item-label>
            <q-item-label caption lines="1"
              >Total: {{ preorder.total }}Ks
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn
              class="rounded-btn q-px-lg"
              icon="open_in_new"
              color="primary"
              size="lg"
              :ripple="{ early: true }"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </section>

    <section v-if="noTickets">
      <div class="full-screen row justify-evenly">
        <div>
          <h5 class="col-12 text-center">
            Hmm...Looks like you havn't bought any ticket yet
          </h5>

          <div class="col-12 text-center">
            <h6>Buy tickets and they will show up here :)</h6>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import useAuthUser from 'src/composables/useAuthUser';
import useApi from 'src/composables/useApi';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'MainLayout',
  components: {},
  setup() {
    const $q = useQuasar();
    const screen = $q.screen;

    const { user } = useAuthUser();
    const { filterByProperties, getById } = useApi();

    const router = useRouter();

    // const preorders = [
    //   {
    //     id: '239481',
    //     product_name: 'Good Foods',
    //     product_image:
    //       'https://www.aspicyperspective.com/wp-content/uploads/2020/07/best-hamburger-patties-1.jpg',
    //     quantity: 3,
    //     price: 2500,
    //   },
    //   {
    //     id: '123490',
    //     product_name: 'Good Foods',
    //     product_image:
    //       'https://www.aspicyperspective.com/wp-content/uploads/2020/07/best-hamburger-patties-1.jpg',
    //     quantity: 3,
    //     price: 2500,
    //   },
    // ];

    const preorders = reactive([]);
    const noPreorders = ref(false);

    onMounted(async () => {
      fetchPreorders();
    });

    const fetchPreorders = async () => {
      //Fetching preorders tickets
      const fetchedPreorders = await filterByProperties('invoice', {
        buyer: user.value.id,
      });
      fetchedPreorders.forEach(async (preorder) => {
        const shop = await getById('shop', preorder.shop, 'image,name');
        preorder.product_name = shop.name;
        preorder.product_image = shop.image;

        preorders.push(preorder);
      });

      if (fetchedPreorders.length <= 0) {
        noPreorders.value = true;
      }
    };

    return {
      router,
      screen,
      preorders,
    };
  },
});
</script>

<style lang="scss" scoped>
.preorder {
  border: 3px solid black;
  border-radius: 20px;
  background-color: $secondary;
}

.rounded-btn {
  border-radius: 20px;
}
</style>
