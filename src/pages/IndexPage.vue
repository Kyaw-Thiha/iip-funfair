<template>
  <q-page>
    <section class="full-screen hero row items-center justify-evenly">
      <div class="hero-text text-center q-pa-md-lg q-pa-sm-xs q-pa-xs-xs">
        <h1 class="text-primary q-mt-none q-mb-xl q-mb-sm-md q-mb-xs-sm">
          IIP Fun Fair
        </h1>
        <h3
          class="text-white q-mb-none q-mb-sm q-mt-md-xl q-mt-sm-md q-mt-xs-none"
        >
          coming Dec 20th + 21st
        </h3>
      </div>
    </section>

    <q-separator v-if="screen.lt.md" class="q-my-md" inset color="primary" />

    <section class="full-screen" v-if="carouselProducts.length > 0">
      <product-carousel :products="carouselProducts" />
    </section>
    <section class="full-screen q-mb-xl" v-if="products.length > 0">
      <h3 class="text-center products-title">Products</h3>
      <div class="row items-center justify-evenly">
        <q-input
          class="col-8"
          :dense="screen.lt.md"
          outlined
          v-model="searchString"
          label="Search"
        />

        <q-btn
          class="col-1 id-input-btn"
          :size="screen.lt.md ? 'md' : 'lg'"
          icon="search"
          color="primary"
          @click="search"
          :ripple="{ early: true }"
        />
      </div>
      <div
        class="row justify-around q-mt-xl"
        style="column-gap: 10px; row-gap: 60px"
      >
        <product-card
          class="col-md-3 col-sm-5 col-xs-12"
          v-for="product in selectedProducts"
          :key="product.id"
          :id="product.id"
          :shop="product.shop"
          :image="product.image"
          :name="product.name"
          :name_abbreviation="product.name_abbreviation"
          :product-type="product.product_type"
          :price="product.price"
        />
      </div>
    </section>
    <section>
      <p class="text-center">
        Website made with ❤️ By Kevin @ Kyaw Thiha
        <span class="q-mx-xs"></span> & <span class="q-mx-xs"></span> Min Thiha
        Chit
      </p>
    </section>
    <section v-if="isLoggedIn()">
      <q-btn
        class="float-right"
        :size="screen.lt.md ? 'md' : 'lg'"
        label="Log Out"
        color="primary"
        @click="logout()"
        :ripple="{ early: true }"
      />
    </section>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import useApi from 'src/composables/useApi';
import useAuthUser from 'src/composables/useAuthUser';

import ProductCarousel from 'components/ProductCarousel.vue';
import ProductCard from 'components/ProductCard.vue';

interface Product {
  id: string;
  name: string;
  name_abbreviation: string;
  image: string;
  product_type: string;
  price: number;
  shop: string;
}

export default defineComponent({
  name: 'IndexPage',
  components: { ProductCarousel, ProductCard },
  setup() {
    const $q = useQuasar();
    const screen = $q.screen;

    const { logout, isLoggedIn } = useAuthUser();
    const { list } = useApi();

    onMounted(async () => {
      await fetchProducts();
      getCarouselProducts();
    });

    var products = reactive(new Array<Product>());
    var selectedProducts = reactive(new Array<Product>());

    const fetchProducts = async () => {
      const fetchedProducts = await list('product');

      const randomizedProducts = shuffle(fetchedProducts);

      randomizedProducts.forEach((product) => {
        products.push(product);
        selectedProducts.push(product);
      });
    };

    const shuffle = (array: Array<Product>) => {
      //Randomize the given array
      let currentIndex = array.length,
        randomIndex;

      // While there remain elements to shuffle.
      while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex],
        ];
      }

      return array;
    };

    const carouselProducts = reactive(new Array<Product>());
    const getCarouselProducts = () => {
      const shuffled = [...products].sort(() => 0.5 - Math.random());

      const chosenProducts = shuffled.slice(0, 5);

      chosenProducts.forEach((product) => {
        carouselProducts.push(product);
      });
    };

    const searchString = ref('');
    const search = () => {
      //Initialise back the products based on initial data

      if (searchString.value != '') {
        //Filtering the products based on search string
        const filteredProducts = products.filter((product) => {
          const lowerProductName = product.name.toLowerCase();
          const lowerProductType = product.product_type.toLowerCase();

          return (
            lowerProductName.includes(searchString.value) ||
            lowerProductType.includes(searchString.value)
          );
        });

        //Removing all initial products

        selectedProducts.length = 0;

        //Adding back the filtered products
        filteredProducts.forEach((item) => {
          selectedProducts.push(item);
        });
      } else {
        //Removing all initial products
        selectedProducts.forEach((item: Product) => selectedProducts.pop());
        selectedProducts.pop(); //Removing the last remaining element

        //Adding back the filtered products
        products.forEach((item) => selectedProducts.push(item));
      }
    };

    return {
      screen,
      fetchProducts,
      products,
      carouselProducts,
      selectedProducts,
      searchString,
      search,
      logout,
      isLoggedIn,
    };
  },
});
</script>

<style lang="scss" scoped>
.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero::before {
  content: '';
  opacity: 0.8;
  //background-image: url('hero.jpg');
  background-image: url('https://images.unsplash.com/photo-1533900298318-6b8da08a523e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80');
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

.hero-text {
  backdrop-filter: blur(8px);
  border-radius: 25px;

  @media screen and (max-width: $breakpoint-xs-max) {
    width: 360px;
  }
}

.products-title {
  margin-top: 52px;
  margin-bottom: 80px;

  @media screen and (max-width: $breakpoint-sm-max) {
    margin-top: 48px;
    margin-bottom: 60px;
  }

  @media screen and (max-width: $breakpoint-sm-max) {
    margin-top: 48px;
    margin-bottom: 40px;
  }
}
</style>
