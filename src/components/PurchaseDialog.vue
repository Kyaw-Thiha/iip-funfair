<template>
  <q-dialog v-model="isOpen" :persistent="false">
    <q-card class="card">
      <q-card-section>
        <h4>Preorder</h4>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <h4>{{ shop.name }}</h4>
        <h5>{{ shop.sales_date }}</h5>
        <p class="q-mb-none q-mt-md">
          Important: You are oblidged to buy the preordered products on the
          actual fun fair day
        </p>
        <p>
          If you fail to do so, the shop seller has the right to charge you
          TWICE the amount you preordered
        </p>

        <div class="q-mt-lg">
          <div
            class="q-mb-lg"
            v-for="(product, index) in products"
            :key="index"
          >
            {{ product.name }} - {{ product.price }}Ks
            <q-input
              class="q-mt-md"
              v-model="counts[index]"
              label="Ticket Count"
              type="number"
              outlined
            />
          </div>
        </div>

        <h5 class="q-mt-md">{{ totalCost }} Ks</h5>
      </q-card-section>

      <q-card-actions align="right">
        <div class="btn-container">
          <q-btn
            class="btn"
            :disable="isLoading"
            label="Preorder"
            color="primary"
            @click="buy"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import useApi from 'src/composables/useApi';
import UseAuthUser from 'src/composables/useAuthUser';

export default defineComponent({
  props: {
    shop: {
      type: Object,
      required: true,
    },
    products: {
      type: Array,
      required: true,
    },
  },
  setup(props, context) {
    const $q = useQuasar();
    const { post, filterByProperties, getById } = useApi();
    const { user } = UseAuthUser();

    const isOpen = ref(false);
    const isLoading = ref(false);

    var count = ref(0);
    var counts = reactive([]);
    var totalCost = computed(() => {
      //Calculating the total cost
      var total = 0;

      for (var i = 0; i < counts.length; i++) {
        const count = counts[i];
        total = total + count * props.products[i].price;
      }

      return total;
    });

    onMounted(async () => {
      //Initialising the counts value
      for (const product of props.products) {
        counts.push(0);
      }
    });

    const checkIfMember = async () => {
      const fetchedShop = await getById(
        'shop',
        props.shop.id,
        'members:shop_member(user)'
      );

      for (const member of fetchedShop.members) {
        if (member.user == user.value.id) {
          return true;
        }
      }

      return false;
    };

    const checkCountLimit = async () => {
      // const fetchedUser = await getById(
      //   'users',
      //   user.value.id,
      //   'tickets:ticket(*)'
      // );
      // const ticketLength = fetchedUser.tickets.length;
      // const ticketCount = parseInt(count.value);

      // return ticketLength + ticketCount > 75;
      return false;
    };

    const buy = async () => {
      const totalCount = counts.reduce((a, b) => parseInt(a) + parseInt(b), 0);

      if (totalCount == 0) {
        $q.notify({
          message: 'Ticket count cannot be zero',
          caption: 'You need buy at least one ticket',
          color: 'primary',
        });
      } else if (totalCount > 15) {
        $q.notify({
          message: 'You can buy maximum of fifteen items per request',
          caption: 'Come back to this page to buy more',
          color: 'primary',
        });
      } else if (totalCost.value > 100000) {
        $q.notify({
          message: 'You can spend maximum of 1lakh in preorder',
          caption: 'Consider spending less',
          color: 'primary',
        });
      } else {
        isLoading.value = true;
        const isMember = await checkIfMember();
        const isOverCountLimit = await checkCountLimit();

        if (isMember) {
          $q.notify({
            message: 'You are the member of this shop',
            caption: 'You cannot buy your own ticket',
            color: 'primary',
          });
        } else if (isOverCountLimit) {
          $q.notify({
            message: 'Maximum number of tickets allowed is 75 tickets',
            caption: 'Contact the developer if you want more tickets',
            color: 'primary',
          });
        } else {
          const today = new Date();
          const date = today.getDate();

          const random_no = Math.floor(100000 + Math.random() * 900000);

          const invoice = await post('invoice', {
            invoice_no: random_no,
            purchase_date: date,
            total: totalCost.value,
            buyer: user.value.id,
            shop: props.shop.id,
            sales_date: props.shop.sales_date,
          });

          const invoiceID = invoice[0].id;

          for (var i = 0; i < props.products.length; i++) {
            const product = props.products[i];

            post('invoice_purchase', {
              invoice: invoiceID,
              product: product.id,
              product_name: product.name,
              quantity: counts[i],
              price: product.price,
            });
          }

          $q.notify({
            message: `You have successfully preorderd from ${props.shop.name}.`,
            caption: 'Dont forget to redeem it on fun fair day',
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
      counts,
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
