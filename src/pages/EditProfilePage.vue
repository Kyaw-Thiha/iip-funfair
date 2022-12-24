<template>
  <div class="full-screen form-container row items-center justify-evenly">
    <div>
      <h2 class="heading text-center">Profile</h2>

      <div>
        <q-avatar size="250px">
          <img
            :src="`https://avatars.dicebear.com/api/micah/${imageSeed}.svg`"
          />
        </q-avatar>
      </div>

      <q-input
        class="input"
        outlined
        bottom-slots
        type="text"
        v-model="imageSeed"
        label="Image"
        ><template v-slot:hint>
          <p>Image seed of your profile image</p>
        </template>
      </q-input>

      <q-input
        class="input"
        outlined
        bottom-slots
        type="text"
        v-model="name"
        label="Name"
        ><template v-slot:hint>
          <p>Name of your account</p>
        </template>
      </q-input>

      <q-select
        class="input"
        outlined
        v-model="className"
        :options="classes"
        label="Class Name"
        ><template v-slot:hint>
          <p>Select the class you are currently studying</p>
          <p>If you used to study at IIP but has finished, choose Alumni</p>
        </template></q-select
      >

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
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import useSupabase from 'src/boot/supabase';
import useAuthUser from 'src/composables/useAuthUser';
import useApi from 'src/composables/useApi';

export default defineComponent({
  name: 'SignInPage',
  components: {},
  setup() {
    const $q = useQuasar();

    const { user } = useAuthUser();
    const { getById, update } = useApi();
    const router = useRouter();

    const classes = [
      'A Level',
      'Section A',
      'Section B',
      'Section C',
      'Year-8',
      'Year-9',
      'Alumni',
      'Teacher',
    ];

    const isLoading = ref(false);
    const name = ref('');
    const className = ref('');
    const imageSeed = ref('');
    const image = ref('');

    onMounted(async () => {
      //Initialising the user data value
      isLoading.value = true;
      await fetchUser();
      isLoading.value = false;
    });

    const fetchUser = async () => {
      const fetchedUser = await getById('users', user.value.id);

      name.value = fetchedUser.name;
      className.value = fetchedUser.class;
      image.value = fetchedUser.image;

      const dicebearLink = 'https://avatars.dicebear.com/api/micah/';
      const seed = image.value.substring(
        image.value.indexOf(dicebearLink) + dicebearLink.length,
        image.value.lastIndexOf('.svg')
      );

      imageSeed.value = seed;

      if (image.value == undefined || image.value == '') {
        //Adding in the image path if image
        image.value = `https://avatars.dicebear.com/api/micah/${fetchedUser.id}.svg`;
        imageSeed.value = fetchedUser.id;
      }
    };

    const confirm = async () => {
      if (name.value != '' && className.value != '') {
        //Disabling creation/editting of user as fun fair has already ended
        if (true) {
          $q.notify({
            message: 'You can no longer edit your user profile.',
            caption: 'The fun fair has already ended',
            color: 'primary',
          });

          return;
        }

        await patchUser();

        router.push({ name: 'my-shop' });
      } else {
        $q.notify({
          message: 'Data is incomplete',
          caption: 'Fill up all the fields in the form',
          color: 'primary',
        });
      }
    };

    const patchUser = async () => {
      const seed = image.value.substring(
        image.value.indexOf('https://avatars.dicebear.com/api/micah/') + 1,
        image.value.lastIndexOf('.svg')
      );
      if (imageSeed.value != '' && imageSeed.value != seed) {
        image.value = `https://avatars.dicebear.com/api/micah/${imageSeed.value}.svg`;
      } else {
        image.value = '';
      }

      console.log(image.value);

      await update('users', {
        id: user.value.id,
        name: name.value,
        class: className.value,
        image: image.value,
      });
    };

    return { name, className, image, imageSeed, classes, confirm, router };
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
    margin: 20px 0;
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
