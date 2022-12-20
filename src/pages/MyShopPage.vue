<template>
  <!--Vue Starport-->

  <div v-if="!isLoading" class="q-mb-xl">
    <section
      class="full-screen product"
      :style="{ '--imageURL': `url('${shop.image}')` }"
    >
      <div class="q-mx-md-xl q-mx-sm-lg q-mx-xs-sm">
        <div class="shop-info">
          <h2 class="text-primary">{{ shop.name }}</h2>
          <h6 class="text-primary">{{ shop.sales_date }}</h6>
          <h5>{{ shop.description }}</h5>

          <p class="preorder_perks">{{ shop.preorder_perks }} for PreOrders</p>
        </div>

        <q-btn
          class="q-mb-md q-mb-md-none q-mb-lg-none float-right"
          label="Edit Shop"
          size="xl"
          color="primary"
          :ripple="{ early: true }"
          :to="{ name: 'edit-shop', params: { id: shop.id } }"
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
            <div class="col-12 text-center q-mt-md">
              <q-btn
                label="Edit Product"
                size="lg"
                color="primary"
                :ripple="{ early: true }"
                :to="{ name: 'edit-product', params: { id: product.id } }"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="q-mt-lg text-center">
        <q-btn
          class="main-btn q-mb-xl"
          label="Add Product"
          size="xl"
          color="primary"
          :ripple="{ early: true }"
          rounded
          :to="{ name: 'create-product' }"
        />
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
        <h6 v-if="social.facebook != ''">
          <b>Facebook:</b> {{ social.facebook }}
        </h6>
        <h6 v-if="social.instagram != ''">
          <b>Instagram:</b> {{ social.instagram }}
        </h6>
        <h6 v-if="social.discord != ''">
          <b>Discord:</b> {{ social.discord }}
        </h6>
      </div>
    </section>

    <q-separator
      class="q-mb-lg q-mb-sm-xl q-mt-xl q-mt-sm-lg q-mt-md-none"
      inset
    />

    <!-- Members -->
    <section class="full-screen q-mt-xl">
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

            <div class="col-12 text-center" v-if="index == 0">
              <q-btn
                class="q-mt-md"
                label="Edit My Profile"
                size="md"
                color="primary"
                :ripple="{ early: true }"
                :to="{ name: 'edit-profile' }"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="q-mt-lg text-center">
        <q-btn
          class="main-btn q-mt-xl"
          label="Invite Members"
          size="xl"
          color="primary"
          :ripple="{ early: true }"
          rounded
          @click="inviteMemberDialog = true"
        />
      </div>
    </section>

    <q-separator
      class="q-mb-lg q-mb-sm-xl q-mt-xl q-mt-sm-lg q-mt-md-none"
      inset
    />

    <section>
      <div class="q-mx-xl">
        <h3 class="text-center q-mb-xl">Preorders</h3>
        <h5 class="">Current Preorders: {{ preordersCount }}</h5>

        <div class="q-mt-lg text-center">
          <q-btn
            class="main-btn q-mt-xl"
            label="See Preorders"
            size="xl"
            color="primary"
            :ripple="{ early: true }"
            rounded
            :to="{ name: 'my-shop-preorders' }"
          />
        </div>
      </div>
    </section>

    <!-- <section>
      <h3 class="text-center q-mb-sm q-mb-sm-xl">Tickets</h3>
      <div class="q-mt-md text-center">
        <q-btn
          class="main-btn text-primary q-mt-xl q-mx-md"
          label="See All Tickets"
          outline
          size="xl"
          color="primary"
          :ripple="{ early: true }"
          :to="{ name: 'sold-tickets' }"
        />
        <q-btn
          class="main-btn q-mt-xl q-mx-md"
          label="Manage Tickets"
          size="xl"
          color="primary"
          :ripple="{ early: true }"
          :to="{ name: 'ticket-management' }"
        />
      </div>
    </section> -->

    <invite-member-dialog
      v-model="inviteMemberDialog"
      :shopID="shopID"
      @userAdded="inviteMemberDialog = false"
    />
  </div>

  <!-- Loading -->
  <div v-else>
    <div class="full-screen row items-center justify-evenly">
      <q-spinner-hourglass color="primary" size="8em" />
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useApi from 'src/composables/useApi';
import useAuthUser from 'src/composables/useAuthUser';

import InviteMemberDialog from 'src/components/InviteMemberDialog.vue';

export default defineComponent({
  name: 'ProductDetailPage',
  components: { InviteMemberDialog },
  setup() {
    const router = useRouter();
    const { getById, filterAndCount } = useApi();
    const { user } = useAuthUser();

    onMounted(async () => {
      //Starting the loading process
      isLoading.value = true;

      //Checking if the user already has shop
      //If the user doesn't have a shop, he/she will be redirected to edit shop page
      const fetchedUser = await getById(
        'users',
        user.value.id,
        'shops:shop_member(*)'
      );

      if (fetchedUser.shops.length == 0) {
        router.replace({ name: 'create-shop' });
      } else {
        shopID.value = fetchedUser.shops[0].shop;
        await fetchProduct(shopID.value);
        await fetchPreordersCount();
      }

      isLoading.value = false;
    });

    const fetchProduct = async (shopID) => {
      //Fetching the shop
      const fetchedShop = await getById(
        'shop',
        shopID,
        '*, members:shop_member(*),products:product(*),socials:social(*)'
      );
      //Adding the keys
      Object.keys(fetchedShop).forEach((key) => {
        shop[key] = fetchedShop[key];
      });

      //Fetching the social media accounts
      const fetchedSocial = shop.socials[0];
      Object.keys(fetchedSocial).forEach((key) => {
        social[key] = fetchedSocial[key];
      });

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

      //Fetching the products
      for (const product of shop.products) {
        products.push(product);
      }
    };

    const fetchPreordersCount = async () => {
      const count = await filterAndCount('invoice', { shop: shop.id }, '*');
      preordersCount.value = count;
    };

    const shopID = ref('');

    const products = reactive([]);
    const shop = reactive({});
    const members = reactive([]);
    const social = reactive({});
    const preordersCount = ref(0);
    const isLoading = ref(false);
    // const product = reactive({
    //   name: 'Good Foods',
    //   description:
    //     'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    //   price: 5000.0,
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

    const inviteMemberDialog = ref(false);

    return {
      shopID,
      shop,
      products,
      members,
      social,
      preordersCount,
      isLoading,
      inviteMemberDialog,
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
}

.product::before {
  content: '';
  opacity: 0.8;
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

.shop-info {
  min-width: 750px;
  margin-bottom: 60px;

  border-radius: 20px;
  backdrop-filter: blur(8px);
  padding: 10px 20px;

  @media screen and (max-width: $breakpoint-sm-max) {
    min-width: 450px;
  }

  @media screen and (max-width: $breakpoint-xs-max) {
    min-width: 350px;
  }

  .preorder_perks {
    margin-top: 20px;
    padding: 3px 5px;
    display: inline-block;
    border-radius: 20px;
    background-color: $primary;
    color: white;
  }
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

.main-btn {
  width: 400px;

  @media screen and (max-width: $breakpoint-xs-max) {
    width: 250px;
  }
}
</style>
