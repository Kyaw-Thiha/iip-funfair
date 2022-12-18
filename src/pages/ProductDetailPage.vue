<template>
  <!--Vue Starport-->
  <div class="q-mb-xl">
    <section
      v-if="Object.keys(product).length > 0"
      class="full-screen product"
      :style="{ '--imageURL': `url('${shop.image}')` }"
    >
      <div class="product-info q-mx-md-xl q-mx-sm-lg q-mx-xs-sm">
        <h2 class="text-primary">{{ shop.name }}</h2>
        <h5>{{ shop.description }}</h5>
        <h4 class="q-mt-md-xl q-mt-sm-lg q-mt-xs-md">
          Price: {{ product.price }}
        </h4>
        <q-btn
          class="float-right q-my-md"
          label="Buy Ticket"
          size="xl"
          color="primary"
          :ripple="{ early: true }"
          @click="isPurchaseDialogOpen = true"
        />
      </div>
    </section>
    <section v-if="members.length > 0" class="full-screen q-mt-xl">
      <h3 class="text-center q-mb-xl">Members</h3>
      <div class="row q-mx-lg q-mx-sm-sm">
        <div
          class="col-md-3 col-sm-4 col-xs-12 q-gutter-sm q-mb-xl"
          v-for="(member, index) in members"
          :key="index"
        >
          <div class="row items-center justify-evenly">
            <q-avatar size="128px">
              <img :src="member.image" :alt="member.name"
            /></q-avatar>

            <h4 class="q-mb-sm q-mt-lg q-mx-none col-12 text-center">
              {{ member.name }}
            </h4>
            <h6
              class="member-class q-py-xs q-px-sm q-mt-md-lg q-mt-sm-md q-mt-xs-sm inline-block"
            >
              {{ member.class }}
            </h6>
          </div>
        </div>
      </div>
      <div class="q-mt-lg text-center">
        <q-btn
          class="buy-ticket-btn q-mt-xl"
          label="Preorder"
          size="xl"
          color="primary"
          :ripple="{ early: true }"
          rounded
          @click="isPurchaseDialogOpen = true"
        />
      </div>
    </section>

    <div v-if="!Object.keys(product).length > 0">
      <div class="full-screen row items-center justify-evenly">
        <q-spinner-hourglass color="primary" size="8em" />
      </div>
    </div>

    <purchase-dialog
      :productID="route.params.id"
      :name="product.name"
      :price="product.price"
      :name_abbreviation="product.name_abbreviation"
      v-model="isPurchaseDialogOpen"
      @bought="router.push({ name: 'purchased-tickets' })"
    />
  </div>
</template>

<script>
import { defineComponent, reactive, ref, onMounted } from 'vue';
import PurchaseDialog from 'src/components/PurchaseDialog.vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';

import useApi from 'src/composables/useApi';

// interface Product {
//   name: string;
//   name_abbreviation: string;
//   description: string;
//   product_type: string;
//   image: string;
//   price: number;
//   shop: string;
// }

export default defineComponent({
  name: 'ProductDetailPage',
  components: { PurchaseDialog },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const { getById } = useApi();
    const fetchProduct = async () => {
      const fetchedProduct = await getById('product', route.params.id);

      //Fetching the shop
      shop = await getById(
        'shop',
        fetchedProduct.shop,
        '*, members:shop_member(*)'
      );

      //Fetching the shop members
      for (var i = 0; i < shop.members.length; i++) {
        const fetchedUser = await getById('users', shop.members[i].user);

        members.push(fetchedUser);
        if (fetchedUser.image == undefined || fetchedUser.image == '') {
          //Adding in the image path if image
          members[
            i
          ].image = `https://avatars.dicebear.com/api/micah/${fetchedUser.id}.svg`;
        }
      }

      //Adding the keys
      Object.keys(fetchedProduct).forEach((key) => {
        product[key] = fetchedProduct[key];
      });
    };

    onMounted(async () => {
      await fetchProduct();
    });

    const product = reactive({});
    const shop = reactive({});
    const members = reactive([]);

    // var product = reactive({
    //   name: 'Good Foods',
    //   description:
    //     'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    //   price: 5000,
    //   image:
    //     'https://www.allrecipes.com/thmb/QuBtUMOkpdH27PWiVzmyqupAik0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/228272_All-American-Burger-Dog_Christina_871688_original-1x1-1-8b15114941d54f2dbd3b6afbf033a9db.jpg',
    //   members: [
    //     {
    //       name: 'Kevin',
    //       photo: 'https://cdn.quasar.dev/img/avatar4.jpg',
    //       class: 'A Level',
    //     },
    //     {
    //       name: 'Sai Sai',
    //       photo: 'https://cdn.quasar.dev/img/avatar1.jpg',
    //       class: 'A Level',
    //     },
    //     {
    //       name: 'Hnin Oo',
    //       photo: 'https://cdn.quasar.dev/img/avatar3.jpg',
    //       class: 'A Level',
    //     },
    //     {
    //       name: 'Yadanar',
    //       photo: 'https://cdn.quasar.dev/img/avatar2.jpg',
    //       class: 'A Level',
    //     },
    //   ],
    // });

    const isPurchaseDialogOpen = ref(false);

    return {
      router,
      route,
      product,
      shop,
      members,
      isPurchaseDialogOpen,
    };
  },
});
</script>

<style lang="scss" scoped>
.product {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  .product-info {
    min-width: 1500px;

    @media screen and (max-width: $breakpoint-sm-max) {
      min-width: 800px;
    }
  }
}

.product::before {
  content: '';
  opacity: 0.6;
  //background-image: url('https://recipes.timesofindia.com/thumb/60256016.cms?width=1200&height=900');
  background-image: var(--imageURL);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  position: absolute;
  z-index: -1;
}

.member-photo-container {
  width: 100%;
}
.member-class {
  border: 3px solid black;
  border-radius: 20px;
}

.buy-ticket-btn {
  width: 400px;

  @media screen and (max-width: $breakpoint-xs-max) {
    width: 250px;
  }
}
</style>
