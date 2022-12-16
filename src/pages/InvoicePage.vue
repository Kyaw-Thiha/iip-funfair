<template>
  <div v-if="!isLoading">
    <h2 class="text-center text-primary">Invoice</h2>
    <section class="q-px-md-xl q-px-sm-md q-px-xs-sm">
      <h6>Shop: {{ invoice.shop_name }}</h6>
      <h6>Buyer: {{ invoice.buyer_name }} ({{ invoice.buyer_class }})</h6>
      <h6>Purchase Date: {{ invoice.date }}th December</h6>
      <p class="q-mt-md">
        Sales Date: <b>{{ invoice.sales_date }}</b>
      </p>

      <q-table
        class="q-my-xl"
        title="Purchases"
        :rows="invoice.purchases"
        :columns="columns"
        row-key="name"
        :rows-per-page-options="0"
        :separator="separator"
      />

      <h6 class="q-mt-lg">Total: {{ getTotal() }} Kyats</h6>
    </section>
  </div>
  <div v-else>
    <div class="full-screen row items-center justify-evenly">
      <q-spinner-hourglass color="primary" size="8em" />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';

import useApi from 'src/composables/useApi';

export default defineComponent({
  name: 'MainLayout',
  components: {},
  setup() {
    const route = useRoute();
    const { getById } = useApi();

    const invoice = {
      shop_name: 'Good Foods',
      buyer_name: 'Kevin',
      buyer_class: 'A Level',
      invoice_id: '192381',
      date: '19',
      purchases: [{ description: 'product_name', quantity: 1, price: 3000 }],
      total: 0,
    };

    const columns = [
      {
        name: 'description',
        label: 'Description',
        align: 'center',
        field: 'product_name',
      },
      {
        name: 'quantity',
        label: 'Quantity',
        align: 'center',
        field: 'quantity',
      },
      {
        name: 'price',
        label: 'Price',
        align: 'center',
        field: 'price',
      },
    ];
    const isLoading = ref(false);

    onMounted(async () => {
      isLoading.value = true;
      if (route.params.id == undefined) {
      } else {
        //Fetch the invoice based on id

        await fetchInvoice(route.params.id);
      }
      isLoading.value = false;
    });

    const fetchInvoice = async (id) => {
      const fetchedInvoice = await getById(
        'invoice',
        id,
        '*,purchases:invoice_purchase(*)'
      );

      //Getting buyer name
      const buyer = await getById('users', fetchedInvoice.buyer, 'name,class');
      invoice.buyer_name = buyer.name;
      invoice.buyer_class = buyer.class;

      const shop = await getById('shop', fetchedInvoice.shop, 'name');
      invoice.shop_name = shop.name;

      //Adding the keys
      Object.keys(fetchedInvoice).forEach((key) => {
        invoice[key] = fetchedInvoice[key];
      });
      console.log(fetchedInvoice);
    };

    const getTotal = () => {
      var total = 0;
      for (const purchase of invoice.purchases) {
        total = total + purchase.price;
      }
      return total;
    };

    return { isLoading, invoice, columns, getTotal };
  },
});
</script>
