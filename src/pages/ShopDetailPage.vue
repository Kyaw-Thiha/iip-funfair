<template>
  <!--Vue Starport-->
  <div v-if="Object.keys(shop).length > 0" class="q-mb-xl">
    <section
      v-if="Object.keys(shop).length > 0"
      class="full-screen shop"
      :style="{ '--imageURL': `url('${shop.image}')` }"
    >
      <div class="shop-info q-mx-md-xl q-mx-sm-lg q-mx-xs-sm">
        <h2 class="text-primary">{{ shop.name }}</h2>
        <h6 class="text-primary">{{ shop.sales_date }}</h6>
        <h5>{{ shop.description }}</h5>
        <p class="preorder_perks">{{ shop.preorder_perks }} for PreOrders</p>

        <q-btn
          class="q-mt-xl q-mb-md q-mb-md-none q-mb-lg-none float-right"
          label="Preorder"
          size="xl"
          color="primary"
          :ripple="{ early: true }"
          @click="isPurchaseDialogOpen = true"
        />
      </div>
    </section>

    <!-- Products -->
    <section class="full-screen q-mt-xl">
      <h3 class="text-center q-mb-xl">Products</h3>
      <div class="row q-mx-lg q-mx-sm-sm">
        <div
          class="col-md-3 col-sm-4 col-xs-12 q-gutter-sm q-mb-xl"
          v-for="(product, index) in products"
          :key="index"
        >
          <div
            class="product-card q-ma-md q-pa-md row items-center justify-evenly"
          >
            <q-avatar size="128px">
              <img :src="product.image" :alt="product.name" />
              /></q-avatar
            >

            <h4 class="q-mb-sm q-mt-lg q-mx-none col-12 text-center">
              {{ product.name }}
            </h4>

            <h6
              class="member-class q-py-xs q-px-sm q-mt-md-lg q-mt-sm-md q-mt-xs-sm inline-block"
            >
              {{ product.product_type }}
            </h6>
            <h6 class="col-12 text-center q-mt-md">
              Price: {{ product.price }}Ks
            </h6>
          </div>
        </div>
      </div>
    </section>

    <q-separator
      class="q-mb-lg q-mb-sm-xl q-mt-xl q-mt-sm-lg q-mt-md-none"
      inset
    />

    <!-- Social Media links -->
    <section>
      <div
        v-if="
          social.facebook != '' ||
          social.instagram != '' ||
          social.discord != ''
        "
        class="social-container"
      >
        <h4 class="q-mb-xl">Social Media Links</h4>
        <q-btn
          v-if="social.facebook != ''"
          class="q-mb-xl"
          label="Facebook"
          size="xl"
          color="primary"
          :ripple="{ early: true }"
          rounded
          :href="social.facebook"
          target="_blank"
        />
        <q-btn
          v-if="social.instagram != ''"
          class="q-mb-xl"
          label="Facebook"
          size="xl"
          color="primary"
          :ripple="{ early: true }"
          rounded
          :href="social.instagram"
          target="_blank"
        />
        <q-btn
          v-if="social.discord != ''"
          class="q-mb-xl"
          label="Facebook"
          size="xl"
          color="primary"
          :ripple="{ early: true }"
          rounded
          :href="social.discord"
          target="_blank"
        />
      </div>
    </section>

    <q-separator
      class="q-mb-lg q-mb-sm-xl q-mt-xl q-mt-sm-lg q-mt-md-none"
      inset
    />

    <!-- Members -->
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

    <purchase-dialog
      :shop="shop"
      :products="products"
      v-model="isPurchaseDialogOpen"
      @bought="router.push({ name: 'preorders' })"
    />
  </div>

  <div v-else>
    <div class="full-screen row items-center justify-evenly">
      <q-spinner-hourglass color="primary" size="8em" />
    </div>
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
      const fetchedShop = await getById(
        'shop',
        route.params.id,
        '*, members:shop_member(*),products:product(*),socials:social(*)'
      );

      //Adding in members
      for (const member of fetchedShop.members) {
        //Fetching user
        const fetchedUser = await getById('users', member.user);
        member.name = fetchedUser.name;
        member.class = fetchedUser.class;
        member.image = fetchedUser.image;

        if (fetchedUser.image == undefined || fetchedUser.image == '') {
          //Adding in the image path if image is not present
          member.image = `https://avatars.dicebear.com/api/micah/${fetchedUser.id}.svg`;
        }

        members.push(member);
      }

      //Fetching the social media accounts
      const fetchedSocial = fetchedShop.socials[0];

      Object.keys(fetchedSocial).forEach((key) => {
        social[key] = fetchedSocial[key];
      });

      //Adding in products
      for (const product of fetchedShop.products) {
        products.push(product);
      }

      //Adding the keys for shop
      Object.keys(fetchedShop).forEach((key) => {
        shop[key] = fetchedShop[key];
      });
    };

    onMounted(async () => {
      await fetchProduct();
    });

    const shop = reactive({});
    const products = reactive([]);
    const members = reactive([]);
    const social = reactive({});

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
      shop,
      products,
      members,
      social,
      isPurchaseDialogOpen,
    };
  },
});
</script>

<style lang="scss" scoped>
.shop {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  .shop-info {
    min-width: 400px;

    border-radius: 20px;
    backdrop-filter: blur(8px);
    padding: 10px 20px;

    .preorder_perks {
      margin-top: 20px;
      padding: 3px 5px;
      display: inline-block;
      border-radius: 20px;
      background-color: $primary;
      color: white;
    }

    @media screen and (max-width: $breakpoint-xs-max) {
      width: 250px;
    }
  }
}

.shop::before {
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

.product-card {
  border-radius: 20px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
    rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
}

.social-container {
  margin: 50px 80px;

  @media screen and (max-width: $breakpoint-xs-max) {
    margin: 50px 30px;
  }
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
