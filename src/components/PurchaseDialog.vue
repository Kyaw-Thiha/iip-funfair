<template>
  <q-dialog v-model="isOpen" :persistent="false">
    <q-card class="card">
      <q-card-section>
        <h4>{{ name }}</h4>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          class="q-mt-md"
          v-model="count"
          label="Ticket Count"
          type="number"
          outlined
        />
        <h5 class="q-mt-md">{{ totalCost }} Ks</h5>
      </q-card-section>

      <q-card-actions align="right">
        <div class="btn-container">
          <q-btn
            class="btn"
            :disable="isLoading"
            label="Buy"
            color="primary"
            @click="buy"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import useApi from 'src/composables/useApi';
import UseAuthUser from 'src/composables/useAuthUser';

export default defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
    productID: {
      type: String,
      required: true,
    },

    name_abbreviation: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  setup(props, context) {
    const $q = useQuasar();
    const { post, filterByProperties, getById } = useApi();
    const { user } = UseAuthUser();

    const isOpen = ref(false);
    const isLoading = ref(false);

    var count = ref(0);
    var totalCost = computed(() => {
      return props.price * count.value;
    });

    const postPurchase = async () => {
      //Buying request
      var random_no = Math.floor(100000 + Math.random() * 900000);
      var tickets = await filterByProperties('ticket', {
        reference_no: `IIPFunFair-${props.name_abbreviation}-${random_no}`,
      });

      //If ticket already exists, regenerate new one
      while (tickets.length > 0) {
        random_no = Math.floor(100000 + Math.random() * 900000);
        tickets = await filterByProperties('ticket', {
          reference_no: `IIPFunFair-${props.name_abbreviation}-${random_no}`,
        });
      }

      //Creating a new ticket
      const ticket = await post('ticket', {
        reference_no: `IIPFunFair-${props.name_abbreviation}-${random_no}`,
        status: 'not-paid',
        user: user.value.id,
        product: props.productID,
      });
    };

    const checkIfMember = async () => {
      const product = await getById('product', props.productID, 'shop');
      const shop = await getById(
        'shop',
        product.shop,
        'members:shop_member(user)'
      );

      for (const member of shop.members) {
        if (member.user == user.value.id) {
          return true;
        }
      }

      return false;
    };

    const checkTicketLimit = async () => {
      const fetchedUser = await getById(
        'users',
        user.value.id,
        'tickets:ticket(*)'
      );
      const ticketLength = fetchedUser.tickets.length;
      const ticketCount = parseInt(count.value);

      return ticketLength + ticketCount > 75;
    };

    const buy = async () => {
      if (count.value == 0) {
        $q.notify({
          message: 'Ticket count cannot be zero',
          caption: 'You need buy at least one ticket',
          color: 'primary',
        });
      } else if (count.value > 3) {
        $q.notify({
          message: 'You can buy maximum of three tickets per request',
          caption: 'Come back to this page to buy more',
          color: 'primary',
        });
      } else {
        isLoading.value = true;
        const isMember = await checkIfMember();
        const isOverTicketLimit = await checkTicketLimit();
        if (isMember) {
          $q.notify({
            message: 'You are the member of this shop',
            caption: 'You cannot buy your own ticket',
            color: 'primary',
          });
        } else if (isOverTicketLimit) {
          $q.notify({
            message: 'Maximum number of tickets allowed is 75 tickets',
            caption: 'Contact the developer if you want more tickets',
            color: 'primary',
          });
        } else {
          for (var i = 0; i < count.value; i++) {
            await postPurchase();
          }

          $q.notify({
            message: `You have successfully bought ${count.value} tickets.`,
            caption: 'Please pay the shop owner at school',
            color: 'primary',
          });

          context.emit('bought');
        }

        isLoading.value = false;

        isOpen.value = false;
      }
    };

    return {
      isOpen,
      isLoading,
      count,
      totalCost,
      buy,
    };
  },
});
</script>
<style lang="scss" scoped>
.card {
  min-width: 350px;

  @media (max-width: 330px) {
    .card {
      min-width: 300px;
    }
  }
}

.btn-container {
  text-align: center;
  width: 100%;
  margin-top: 16px;
  margin-bottom: 16px;
  .btn {
    width: 90%;
  }
}
</style>
