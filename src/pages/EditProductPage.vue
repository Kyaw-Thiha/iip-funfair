<template>
  <div class="full-screen form-container row items-center justify-evenly">
    <div v-if="!isLoading">
      <h2 class="heading">{{ id != undefined ? 'Create' : 'Edit' }} Product</h2>
      <q-input
        class="input"
        outlined
        bottom-slots
        v-model="product.name"
        label="Name"
        ><template v-slot:hint> <p>Unique name of your product</p> </template>
      </q-input>

      <q-input
        class="input"
        outlined
        bottom-slots
        v-model="product.product_type"
        label="Product Type"
        ><template v-slot:hint>
          <p>What is your product?</p>
          <p>Eg: Beef Hamburger / Photo Booth / Math Quiz</p>
        </template>
      </q-input>

      <q-input
        class="input"
        outlined
        bottom-slots
        v-model="product.price"
        label="Price"
        ><template v-slot:hint>
          <p>Price of your product in MMK</p>
        </template>
      </q-input>
      <!-- <q-input
          class="input"
          outlined
          bottom-slots
          v-model="product.image"
          label="Image"
          ><template v-slot:hint>
            <p>Main hero image of your product</p>
          </template>
        </q-input> -->
      <q-file
        v-if="product.image == ''"
        v-model="imageFile"
        label="Image"
        accept=".jpg,.png,.gif"
        max-file-size="5000000"
        clearable
        outlined
      >
        <template v-slot:hint>
          <p>Main hero image of your product</p>
        </template>
      </q-file>
      <q-btn
        v-else
        class="q-mb-xl"
        label="Remove Image"
        color="primary"
        size="lg"
        :ripple="{ early: true }"
        @click="imageDeleteDialog = true"
      />

      <confirm-dialog v-model="imageDeleteDialog">
        <div>
          <h5>Are you sure you want to delete the image?</h5>
          <div>
            <q-btn
              class="q-my-lg"
              label="Delete"
              color="negative"
              :ripple="{ early: true }"
              @click="deleteImage"
            />
          </div>
        </div>
      </confirm-dialog>

      <div class="text-center">
        <q-btn
          class="confirm-btn"
          label="Confirm"
          color="primary"
          size="lg"
          :ripple="{ early: true }"
          @click="confirm"
        />
      </div>
    </div>
    <div v-else>
      <q-spinner-hourglass color="primary" size="8em" />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import useApi from 'src/composables/useApi';
import useAuthUser from 'src/composables/useAuthUser';
import useSupabase from 'src/boot/supabase';
import confirmDialog from 'src/components/ConfirmDialog.vue';

export default defineComponent({
  name: 'EditProductPage',
  components: { confirmDialog },
  setup() {
    const route = useRoute();
    const $q = useQuasar();

    //Checking for product id in the route
    const id = ref('');
    const isLoading = ref(false);

    onMounted(async () => {
      isLoading.value = true;
      if (route.params.id == undefined) {
        id.value = '';
      } else {
        id.value = route.params.id;
        //Fetch the product based on id
        await fetchProducts();
      }
      isLoading.value = false;
    });

    const fetchProducts = async () => {
      const fetchedProduct = await getById('product', id.value);
      //Adding the keys
      setProduct(fetchedProduct);
    };

    const product = reactive({
      id: '',
      name: '',
      product_type: '',
      price: 0,
      image: '',
    });

    const setProduct = (newProduct) => {
      //Adding the keys
      Object.keys(newProduct).forEach((key) => {
        product[key] = newProduct[key];
      });
    };

    const imageFile = ref(null);
    const imageDeleteDialog = ref(null);
    const deleteImage = async () => {
      await deleteImg('iip-funfair-shop', `product/${product.id}`);
      const { data, error } = await supabase
        .from('product')
        .update({
          image: '',
        })
        .eq('id', product.id)
        .select();

      setProduct(data);

      $q.notify({
        message: 'Image has been sucessfully deleted',
        caption: 'Refresh to see changes',
        color: 'primary',
      });
      imageDeleteDialog.value = false;
    };

    const router = useRouter();
    const { getById, post, update, uploadImg, deleteImg, getUrlPublic } =
      useApi();
    const { user } = useAuthUser();
    const { supabase } = useSupabase();

    const confirm = async () => {
      isLoading.value = true;
      //Validate if every fields are filled
      if (
        product.name != '' &&
        product.product_type != '' &&
        product.price != 0 &&
        (imageFile.value != null || product.image != '')
      ) {
        if (id.value == '') {
          await createProduct();
        } else {
          await editProduct();
        }
        router.push({ name: 'my-shop' });
      } else {
        $q.notify({
          message: 'Data is incomplete',
          caption: 'Fill up all the fields in the form',
          color: 'primary',
        });
      }
      isLoading.value = false;
    };

    const createProduct = async () => {
      //Get shop of user
      const fetchedUser = await getById(
        'users',
        user.value.id,
        'shops:shop_member(shop)'
      );

      const shopID = fetchedUser.shops[0].shop;

      //Uploading the image
      const fetchedImage = await uploadImg(
        imageFile.value,
        'iip-funfair-shop',
        `product/${shopID}`
      );

      //Getting public url
      const { data } = supabase.storage
        .from('iip-funfair-shop')
        .getPublicUrl(fetchedImage);

      const public_url = data.publicUrl;

      //Creating the product
      const fetchedProduct = await post('product', {
        shop: shopID,
        name: product.name,
        product_type: product.product_type,
        price: product.price,
        image: public_url,
        image_internal: fetchedImage,
      });
    };

    const editProduct = async () => {
      //Checking if the image was reset
      if (product.image == '') {
        //Uploading the image
        const fetchedImage = await uploadImg(
          imageFile.value,
          'iip-funfair-shop',
          `product/${product.id}`
        );

        //Getting public url
        const { data } = supabase.storage
          .from('iip-funfair-shop')
          .getPublicUrl(fetchedImage);

        const public_url = data.publicUrl;
        product.image = public_url;
      }

      //Updating the product values
      const { data, error } = await supabase
        .from('product')
        .update({
          id: product.id,
          shop: product.shop,
          name: product.name,
          product_type: product.product_type,
          price: product.price,
          image: product.image,
        })
        .eq('id', product.id)
        .select();
    };

    return {
      isLoading,
      product,
      id,
      imageFile,
      imageDeleteDialog,
      deleteImage,
      confirm,
    };
  },
});
</script>

<style lang="scss" scoped>
.form-container {
  margin-bottom: 20vh;
}
.heading {
  margin-bottom: 80px;
  @media screen and (max-width: $breakpoint-xs-max) {
    margin-bottom: 50px;
    text-align: center;
  }
}
.input {
  min-width: 500px;
  margin: 40px 0;
  p {
    margin: 0 0 8px;
  }
  @media screen and (max-width: $breakpoint-xs-max) {
    min-width: 300px;
    margin: 50px 0;
  }
}
.confirm-btn {
  margin-top: 50px;
  width: 450px;
  @media screen and (max-width: $breakpoint-sm-max) {
    width: 350px;
  }
  @media screen and (max-width: $breakpoint-xs-max) {
    width: 300px;
  }
}
</style>
