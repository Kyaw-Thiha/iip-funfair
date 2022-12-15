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
        v-model="product.name_abbreviation"
        :rules="[(val) => val.length == 3 || 'Please use 3 characters']"
        label="Name Code"
        ><template v-slot:hint>
          <p>
            Unique 3-words name code. Eg: 'Good Foods' product would be 'GFD'
          </p>
          <p>Used when creating ticket for the product</p>
        </template>
      </q-input>
      <q-input
        class="input"
        outlined
        bottom-slots
        v-model="product.description"
        label="Description"
        ><template v-slot:hint> <p>Description of your product</p> </template>
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
      <q-select
        class="input"
        outlined
        v-model="product.sales_date"
        :options="['20th December', '21st December']"
        label="Sales Date"
        ><template v-slot:hint>
          <p>Select the day you are selling</p>
        </template></q-select
      >
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
  name: 'EditShopPage',
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
      name_abbreviation: '',
      description: '',
      product_type: '',
      sales_date: '20th December',
      price: 0,
      image: '',
      image_internal: '',
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
      await deleteImg('iip-funfair-shop', product.image_internal);
      console.log(product);

      const { data, error } = await supabase
        .from('product')
        .update({
          image: '',
          image_internal: '',
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
      //Validate if every fields are filled
      if (
        product.name != '' &&
        product.name_abbreviation != '' &&
        product.description != '' &&
        product.product_type != '' &&
        product.sales_date != '' &&
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
        console.log(product);
        console.log(product.name != '');
        console.log(product.name_abbreviation != '');
        console.log(product.description != '');
        console.log(product.product_type != '');
        console.log(product.sales_date != '');
        console.log(product.price != 0);
        console.log(imageFile.value != null);

        $q.notify({
          message: 'Data is incomplete',
          caption: 'Fill up all the fields in the form',
          color: 'primary',
        });
      }
    };

    const createProduct = async () => {
      //Setting up the shop
      const shop = await post('shop', {});

      //Creating the shop member
      const shopID = shop[0].id;
      const shopMember = await post('shop_member', {
        user: user.value.id,
        shop: shopID,
      });

      //Uploading the image
      const fetchedImage = await uploadImg(
        imageFile.value,
        'iip-funfair-shop',
        shopID
      );

      //Getting public url
      const { data } = supabase.storage
        .from('iip-funfair-shop')
        .getPublicUrl(fetchedImage);
      const public_url = data.publicUrl;
      //const public_url = await getUrlPublic(fetchedImage, 'iip-funfair-shop');

      //Creating the product
      const fetchedProduct = await post('product', {
        shop: shopID,
        name: product.name,
        name_abbreviation: product.name_abbreviation,
        description: product.description,
        product_type: product.product_type,
        sales_date: product.sales_date,
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
          product.id
        );

        //Getting public url
        const { data } = supabase.storage
          .from('iip-funfair-shop')
          .getPublicUrl(fetchedImage);
        const public_url = data.publicUrl;

        product.image = public_url;
        product.image_internal = fetchedImage;
      }

      //Updating the product values
      const { data, error } = await supabase
        .from('product')
        .update({
          id: product.id,
          shop: product.shop,
          name: product.name,
          name_abbreviation: product.name_abbreviation,
          description: product.description,
          product_type: product.product_type,
          sales_date: product.sales_date,
          price: product.price,
          image: product.image,
          image_internal: product.image_internal,
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
