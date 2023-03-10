<template>
  <div class="full-screen form-container row items-center justify-evenly">
    <div>
      <h2 class="heading text-center">Sign Up</h2>
      <q-input class="input" outlined bottom-slots v-model="email" label="Email"
        ><template v-slot:hint> <p>Email Address of your account</p> </template>
      </q-input>
      <q-input
        class="input"
        outlined
        bottom-slots
        type="password"
        v-model="password"
        label="Password"
        ><template v-slot:hint>
          <p>Password of your account</p>
        </template>
      </q-input>
      <q-input class="input" outlined bottom-slots v-model="name" label="Name"
        ><template v-slot:hint>
          <p>Your name used at school (English or Myanmar)</p>
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

      <div>
        <div class="text-center q-mt-lg">
          <q-btn
            class="confirm-btn"
            label="Already have an account? Sign in instead!"
            flat
            color="primary"
            size="md"
            :ripple="{ early: true }"
            @click="router.push({ name: 'sign-in' })"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import useAuthUser from 'src/composables/useAuthUser';
import useSupabase from 'src/boot/supabase';
import useApi from 'src/composables/useApi';

export default defineComponent({
  name: 'SignUpPage',
  components: {},
  setup() {
    const $q = useQuasar();
    const { post } = useApi();

    const email = ref('');
    const password = ref('');
    const name = ref('');
    const className = ref('');

    const classes = reactive([
      'A Level',
      'Section A',
      'Section B',
      'Section C',
      'Year-8',
      'Year-9',
      'Alumni',
      'Teacher',
    ]);

    const router = useRouter();

    const { supabase } = useSupabase();
    const confirm = async () => {
      if (
        email.value != '' &&
        password.value != '' &&
        name.value != '' &&
        className.value != ''
      ) {
        await signUp();
      } else {
        $q.notify({
          message: 'Data is incomplete',
          caption: 'Fill up all the fields in the form',
          color: 'primary',
        });
      }

      //router.push({ name: 'home' });
    };

    const signUp = async () => {
      if (true) {
        //Disabling signing up as fun fair has already ended
        $q.notify({
          message: 'You can no longer sign up',
          caption: 'The fun fair has already ended',
          color: 'primary',
        });
        return;
      }

      const { user, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      });

      if (error != undefined) {
        $q.notify({
          message: 'Registration Error',
          caption: error.message,
          color: 'primary',
        });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value,
        });

        const user = await post('users', {
          id: data.user.id,
          name: name.value,
          email: email.value,
          class: className.value,
        });

        router.push({ name: 'home' });
      }
    };

    return { email, password, name, className, classes, confirm, router };
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
