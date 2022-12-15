<template>
  <div class="q-mb-xl">
    <h2 class="text-center text-primary">Tickets</h2>

    <div class="text-center q-my-xl">
      <q-btn
        class="manage-ticket-btn"
        label="Manage Tickets"
        size="xl"
        color="primary"
        :ripple="{ early: true }"
        :to="{ name: 'ticket-management' }"
      />
    </div>

    <section v-if="unpaidTickets.length > 0" class="q-mb-xl">
      <ticket-list
        title="Unpaid"
        btnLabel="Pay"
        :tickets="unpaidTickets"
        @openDialog="openUnpaidDialog"
      />
    </section>

    <section v-if="paidTickets.length > 0">
      <ticket-list
        title="Paid"
        btnLabel="Use"
        :tickets="paidTickets"
        @openDialog="openPaidDialog"
      />
    </section>

    <section v-if="usedTickets.length > 0">
      <ticket-list title="Used" btnLabel="" :tickets="usedTickets" />
    </section>

    <section v-if="noTickets">
      <div class="full-screen row justify-evenly">
        <div>
          <h5 class="col-12 text-center">
            Hmm...Looks like you havn't sell any ticket yet
          </h5>

          <div class="col-12 text-center">
            <h6>Sell tickets and they will show up here :)</h6>
          </div>
        </div>
      </div>
    </section>

    <!-- Dialogs for the unpaid tickets -->
    <confirmDialog
      title="Ticket Payment"
      v-for="ticket in unpaidTickets"
      :key="ticket.id"
      v-model="ticket.openDialog"
    >
      <h6 class="q-mt-sm">
        Scan the QR code through ticket management once the purchase is
        completed
      </h6>
      <div class="row items-center justify-evenly">
        <QrcodeVue :value="ticket.id" :size="200" level="H" />
      </div>
    </confirmDialog>

    <!-- Dialogs for the paid tickets -->
    <confirmDialog
      title="Ticket Payment"
      v-for="ticket in paidTickets"
      :key="ticket.id"
      v-model="ticket.openDialog"
    >
      <h6 class="q-mt-sm q-mb-lg">
        Scan the QR code through ticket management once the ticket has been used
      </h6>
      <div class="row items-center justify-evenly">
        <QrcodeVue :value="ticket.id" :size="200" level="H" />
      </div>
    </confirmDialog>
  </div>
</template>

<script>
import { defineComponent, reactive, ref, onMounted } from 'vue';
import QrcodeVue from 'qrcode.vue';
import TicketList from 'src/components/TicketList.vue';
import confirmDialog from 'components/ConfirmDialog.vue';

import useApi from 'src/composables/useApi';
import useAuthUser from 'src/composables/useAuthUser';

export default defineComponent({
  name: 'PurchasedTicketsPage',
  components: { QrcodeVue, TicketList, confirmDialog },
  setup() {
    const unpaidTickets = reactive([]);
    const paidTickets = reactive([]);
    const usedTickets = reactive([]);

    const noTickets = ref(false);

    const openUnpaidDialog = (index) => {
      unpaidTickets[index].openDialog = true;
    };

    const openPaidDialog = (index) => {
      paidTickets[index].openDialog = true;
    };

    const { filterByProperties, getById } = useApi();
    const { user } = useAuthUser();

    const fetchTickets = async () => {
      //Fetch the shop of the user
      const fetchedUser = await getById(
        'users',
        user.value.id,
        'shops:shop_member(shop)'
      );

      const shop = fetchedUser.shops[0].shop;

      //Fetch the product of the shop
      const products = await filterByProperties(
        'product',
        { shop: shop },
        'tickets:ticket(product,user,status)'
      );
      const tickets = products[0].tickets;
      for (const ticket of tickets) {
        const user = await getById('users', ticket.user, 'name,class');

        ticket.name = user.name;
        ticket.id = user.class;
        ticket.image = `https://avatars.dicebear.com/api/micah/${user.name}.svg`;
        if (ticket.status == 'not-paid') {
          //Tickets that have not been paid
          unpaidTickets.push(ticket);
        } else if (ticket.status == 'paid') {
          //Tickets that have been paid
          paidTickets.push(ticket);
        } else {
          //Tickets that have been used
          usedTickets.push(ticket);
        }
      }

      //If no tickets have been bought yet
      if (
        unpaidTickets.length <= 0 &&
        paidTickets.length <= 0 &&
        usedTickets.length <= 0
      ) {
        noTickets.value = true;
      }
    };

    onMounted(() => {
      fetchTickets();
    });

    return {
      unpaidTickets,
      paidTickets,
      usedTickets,
      noTickets,
      openUnpaidDialog,
      openPaidDialog,
    };
  },
});
</script>
<style lang="scss" scoped>
.manage-ticket-btn {
  width: 80%;

  @media screen and (max-width: $breakpoint-xs-max) {
    width: 250px;
  }
}
</style>
