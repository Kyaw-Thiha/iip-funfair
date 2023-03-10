<template>
  <!-- Dialog for the unpaid tickets -->
  <confirm-dialog title="Invite Member" v-model="isOpen">
    <div class="row items-center justify-evenly">
      <q-input
        class="input inline-block q-mr-md"
        :dense="screen.lt.md"
        outlined
        v-model="email"
        label="Email"
      />

      <q-btn
        class="inline-block"
        :size="screen.lt.md ? 'md' : 'lg'"
        icon="add"
        dense
        color="primary"
        @click="invite"
        :ripple="{ early: true }"
      />
    </div>
  </confirm-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import useApi from 'src/composables/useApi';

import ConfirmDialog from 'src/components/ConfirmDialog.vue';
import { User } from '@supabase/gotrue-js';

interface UserInterface {
  id: string;
  email: string;
}

export default defineComponent({
  name: 'InviteMemberDialog',
  components: { ConfirmDialog },
  props: {
    shopID: String,
  },
  setup(props, context) {
    const $q = useQuasar();
    const screen = $q.screen;

    const { filterByProperties, post } = useApi();

    const email = ref('');
    const isOpen = ref(false);

    const invite = async () => {
      if (email.value == '') {
        //Email is empty
        $q.notify({
          message: 'Email cannot be empty',
          caption: 'Enter the email of your friend',
          color: 'primary',
        });
      } else if (!email.value.endsWith('@gmail.com')) {
        //Email is in wrong format
        $q.notify({
          message: 'Email in wrong format',
          caption: 'Email must end with @gmail.com',
          color: 'primary',
        });
      } else {
        //Send a request to server
        const users = await filterByProperties(
          'users',
          { email: email.value },
          'id'
        );

        if (users.length == 0) {
          //Account with email does not exist
          $q.notify({
            message: 'Account does not exist',
            caption: 'Ask your friend to sign up on this website',
            color: 'primary',
          });
        } else {
          const changedUser = users[0] as unknown;
          const fetchedUser = changedUser as User;

          await post('shop_member', {
            user: fetchedUser.id,
            shop: props.shopID,
          });

          $q.notify({
            message: `The user with email ${email.value} has been added`,
            caption: 'Refresh the page to see changes',
            color: 'primary',
          });
        }
        context.emit('userAdded');
      }
    };

    return {
      screen,
      email,
      isOpen,
      invite,
    };
  },
});
</script>

<style lang="scss" scoped>
.input {
  width: 300px;

  @media screen and (max-width: $breakpoint-sm-max) {
    width: 250px;
  }
  @media screen and (max-width: $breakpoint-xs-max) {
    width: 200px;
  }
}
</style>
