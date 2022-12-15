<template>
  <div class="q-mb-xl">
    <h2 class="text-center text-primary">Tickets</h2>
    <section v-if="unpaidTickets.length > 0" class="q-mb-xl">
      <ticket-list
        title="Unpaid"
        btnLabel="Pay"
        :tickets="unpaidTickets"
        @openDialog="openUnpaidDialog"
      />
    </section>

    <section>
      <ticket-list
        v-if="paidTickets.length > 0"
        title="Paid"
        btnLabel="Use"
        :tickets="paidTickets"
        @openDialog="openPaidDialog"
      />
    </section>

    <section>
      <ticket-list
        v-if="usedTickets.length > 0"
        title="Used"
        btnLabel=""
        :tickets="usedTickets"
      />
    </section>

    <section v-if="noTickets">
      <div class="full-screen row justify-evenly">
        <div>
          <h5 class="col-12 text-center">
            Hmm...Looks like you havn't bought any ticket yet
          </h5>

          <div class="col-12 text-center">
            <h6>Buy tickets and they will show up here :)</h6>
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
      <!-- <h6 class="q-mt-sm">
        Pay the ticket to {{ getMembers(ticket.members) }}
      </h6> -->
      <h6 class="q-mt-sm q-mb-lg">
        Let them scan this QR code to validate the payment.
      </h6>
      <div class="row items-center justify-evenly">
        <QrcodeVue :value="ticket.id" :size="200" level="H" />
      </div>
      <p class="q-mt-md">
        Note: Refresh the page to see ticket payment updated
      </p>
    </confirmDialog>

    <!-- Dialogs for the paid tickets -->
    <confirmDialog
      title="Ticket Payment"
      v-for="ticket in paidTickets"
      :key="ticket.id"
      v-model="ticket.openDialog"
    >
      <h6 class="q-mt-sm q-mb-lg">Go to the shop and scan this QR code.</h6>
      <div class="row items-center justify-evenly">
        <QrcodeVue :value="ticket.id" :size="200" level="H" />
      </div>
      <p class="q-mt-md">Note: Refresh the page to see ticket usage updated</p>
    </confirmDialog>
  </div>
</template>

<script>
import { defineComponent, reactive, ref, onMounted } from 'vue';
import QrcodeVue from 'qrcode.vue';

import TicketList from 'src/components/TicketList.vue';
import confirmDialog from 'src/components/ConfirmDialog.vue';

import useApi from 'src/composables/useApi';
import useAuthUser from 'src/composables/useAuthUser';

export default defineComponent({
  name: 'PurchasedTicketsPage',
  components: { QrcodeVue, TicketList, confirmDialog },
  setup() {
    const { filterByProperties, getById } = useApi();
    const { user } = useAuthUser();

    const noTickets = ref(false);

    const fetchTickets = async () => {
      //Fetching unpaid tickets
      const unpaid = await filterByProperties('ticket', {
        user: user.value.id,
        status: 'not-paid',
      });
      unpaid.forEach(async (ticket) => {
        const product = await getById('product', ticket.product, 'image,name');
        ticket.id = ticket.reference_no;
        ticket.name = product.name;
        ticket.image = product.image;
        ticket.openDialog = false;

        unpaidTickets.push(ticket);
      });

      //Fetching paid tickets
      const paid = await filterByProperties('ticket', {
        user: user.value.id,
        status: 'paid',
      });
      paid.forEach(async (ticket) => {
        const product = await getById('product', ticket.product, 'image');
        ticket.id = ticket.reference_no;
        ticket.image = product.image;
        ticket.openDialog = false;

        paidTickets.push(ticket);
      });

      //Fetching used tickets
      const used = await filterByProperties('ticket', {
        user: user.value.id,
        status: 'used',
      });
      used.forEach(async (ticket) => {
        const product = await getById('product', ticket.product, 'image');
        ticket.id = ticket.reference_no;
        ticket.image = product.image;
        ticket.openDialog = false;

        usedTickets.push(ticket);
      });

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

    const unpaidTickets = reactive([]);
    const paidTickets = reactive([]);
    const usedTickets = reactive([]);

    // const isMembersFetching = ref(true);
    // const fetchMembers = async (product) => {
    //   isMembersFetching.value = true;

    //   const shop = await getById(
    //     'shop',
    //     product.shop,
    //     'members:shop_member(*)'
    //   );
    //   product.members = [];

    //   for (var i = 0; i < shop.members.length; i++) {
    //     const fetchedUser = await getById(
    //       'users',
    //       shop.members[i].user,
    //       'id,image,name'
    //     );

    //     product.members.push(fetchedUser);
    //     if (fetchedUser.image == undefined || fetchedUser.image == '') {
    //       //Adding in the image path if image is not set
    //       product.members[
    //         i
    //       ].image = `https://avatars.dicebear.com/api/micah/${fetchedUser.id}.svg`;
    //     }
    //   }

    //   isMembersFetching.value = false;
    // };

    const openUnpaidDialog = (index) => {
      unpaidTickets[index].openDialog = true;
    };

    const openPaidDialog = (index) => {
      paidTickets[index].openDialog = true;
    };

    const getMembers = (members) => {
      var memberNames = '';

      for (var i = 0; i < members.length; i++) {
        const member = members[i];

        if (i == 0) {
          memberNames = ` ${member.name} (${member.class})`;
        } else if (i < members.length - 1) {
          memberNames = `${memberNames}, ${member.name} (${member.class})`;
        } else {
          memberNames = `${memberNames} or ${member.name} (${member.class})`;
        }
      }

      return memberNames;
    };

    return {
      noTickets,
      unpaidTickets,
      paidTickets,
      usedTickets,
      openUnpaidDialog,
      openPaidDialog,
      //fetchMembers,
      //isMembersFetching,
      //getMembers,
    };
  },
});
</script>
