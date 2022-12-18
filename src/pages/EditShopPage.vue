<template>
  <div class="full-screen form-container row items-center justify-evenly">
    <div v-if="!isLoading">
      <h2 class="heading">{{ id != undefined ? 'Create' : 'Edit' }} Shop</h2>

      <q-input
        class="input"
        outlined
        bottom-slots
        v-model="shop.name"
        label="Name"
        ><template v-slot:hint> <p>Unique name of your shop</p> </template>
      </q-input>
      <q-input
        class="input"
        outlined
        bottom-slots
        v-model="shop.description"
        label="Description"
        ><template v-slot:hint> <p>Description of your shop</p> </template>
      </q-input>
      <q-select
        class="input"
        outlined
        v-model="shop.sales_date"
        :options="['20th December', '21st December']"
        label="Sales Date"
        ><template v-slot:hint>
          <p>Select the day you are selling</p>
        </template></q-select
      >
      <q-file
        v-if="shop.image == ''"
        v-model="shopImageFile"
        label="Image"
        hint="Main image of your shop. Used as hero in shop page"
        accept=".jpg,.png,.gif"
        max-file-size="1000000000"
        clearable
        outlined
      />

      <q-btn
        v-else
        class="q-mb-xl"
        label="Remove Image"
        color="primary"
        size="lg"
        :ripple="{ early: true }"
        @click="shopImageDeleteDialog = true"
      />

      <q-input
        class="input"
        outlined
        bottom-slots
        v-model="shop.preorder_perks"
        label="Preorder Perks"
        ><template v-slot:hint>
          <p>Perks for preordering your products</p>
          <p>Eg: 10% discount / Buy 3, Get 1 Free / Customised Product</p>
          <p>Leave this as blank if you don't have any perks for preordering</p>
        </template>
      </q-input>

      <h3 class="q-mt-xl">Social Media Links (Optional)</h3>
      <q-input
        class="input"
        outlined
        bottom-slots
        v-model="social.facebook"
        label="Facebook"
        ><template v-slot:hint> <p>Facebook of your shop</p> </template>
      </q-input>
      <q-input
        class="input"
        outlined
        bottom-slots
        v-model="social.instagram"
        label="Instagram"
        ><template v-slot:hint> <p>Instagram of your shop</p> </template>
      </q-input>
      <q-input
        class="input"
        outlined
        bottom-slots
        v-model="social.discord"
        label="Discord"
        ><template v-slot:hint> <p>Discord of your shop</p> </template>
      </q-input>

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

    <confirm-dialog v-model="shopImageDeleteDialog">
      <div>
        <h5>Are you sure you want to delete the image?</h5>
        <div>
          <q-btn
            class="q-my-lg"
            label="Delete"
            color="negative"
            :ripple="{ early: true }"
            @click="deleteShopImage"
          />
        </div>
      </div>
    </confirm-dialog>
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

    //Checking for shop id in the route
    const id = ref('');

    const isLoading = ref(false);

    onMounted(async () => {
      isLoading.value = true;
      if (route.params.id == undefined) {
        id.value = '';
      } else {
        id.value = route.params.id;

        //Fetch the shop based on id
        await fetchShop();
      }
      isLoading.value = false;
    });

    const fetchShop = async () => {
      const fetchedShop = await getById(
        'shop',
        id.value,
        '*,socials:social(*)'
      );

      //Adding the keys
      setShop(fetchedShop);

      const fetchedSocial = fetchedShop.socials[0];
      //Adding the keys
      Object.keys(fetchedSocial).forEach((key) => {
        social[key] = fetchedSocial[key];
      });
    };

    const shop = reactive({
      id: '',
      name: '',
      description: '',
      sales_date: '20th December',
      image: '',
      preorder_perks: '',
    });
    const social = reactive({
      id: '',
      facebook: '',
      instagram: '',
      discord: '',
    });

    const setShop = (newShop) => {
      //Adding the keys
      Object.keys(newShop).forEach((key) => {
        shop[key] = newShop[key];
      });
    };

    const shopImageFile = ref(null);
    const shopImageDeleteDialog = ref(false);

    const deleteShopImage = async () => {
      await deleteImg('iip-funfair-shop', shop.id);

      const { data, error } = await supabase
        .from('shop')
        .update({
          image: '',
        })
        .eq('id', shop.id)
        .select();

      setShop(data);

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
        shop.name != '' &&
        shop.description != '' &&
        shop.sales_date != '' &&
        (shopImageFile.value != null || shop.image != '')
      ) {
        if (id.value == '') {
          await createShop();
        } else {
          await editShop();
        }

        if (route.params.id == undefined) {
          router.push({ name: 'create-product' });
        } else {
          router.push({ name: 'my-shop' });
        }
      } else {
        $q.notify({
          message: 'Data is incomplete',
          caption: 'Fill up all the fields in the form',
          color: 'primary',
        });
      }
      isLoading.value = false;
    };

    const createShop = async () => {
      //Setting up the shop
      const fetchedShop = await post('shop', {
        name: shop.name,
        description: shop.description,
        sales_date: shop.sales_date,
        preorder_perks: shop.preorder_perks,
      });
      const shopID = fetchedShop[0].id;

      //Uploading the image
      const fetchedShopImage = await uploadImg(
        shopImageFile.value,
        'iip-funfair-shop',
        `shop/${shopID}`
      );

      //Getting public url
      var { data } = supabase.storage
        .from('iip-funfair-shop')
        .getPublicUrl(fetchedShopImage);

      shop.image = data.publicUrl;
      await update('shop', { id: shopID, image: shop.image });

      //Creating the shop member
      const shopMember = await post('shop_member', {
        user: user.value.id,
        shop: shopID,
      });

      //Creating social links
      console.log(social);
      const fetchedSocial = await post('social', {
        shop: shopID,
        facebook: social.facebook,
        instagram: social.instagram,
        discord: social.discord,
      });
    };

    const editShop = async () => {
      //Checking if the image was reset
      if (shop.image == '') {
        //Uploading the image
        const fetchedImage = await uploadImg(
          shopImageFile.value,
          'iip-funfair-shop',
          `shop/${shop.id}`
        );

        //Getting public url
        const { data } = supabase.storage
          .from('iip-funfair-shop')
          .getPublicUrl(fetchedImage);
        const public_url = data.publicUrl;

        shop.image = public_url;
      }

      //Updating the shop values
      const { data, error } = await supabase
        .from('shop')
        .update({
          id: shop.id,
          name: shop.name,
          description: shop.description,
          sales_date: shop.sales_date,
          preorder_perks: shop.preorder_perks,
          image: shop.image,
        })
        .eq('id', shop.id)
        .select();

      const { socialData, socialError } = await supabase
        .from('social')
        .update({
          facebook: social.facebook,
          instagram: shop.instagram,
          discord: shop.discord,
        })
        .eq('id', social.id)
        .select();
    };

    return {
      isLoading,
      shop,
      social,
      id,
      shopImageFile,
      shopImageDeleteDialog,
      deleteShopImage,
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
