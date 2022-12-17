import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/IndexPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'sign-in',
        name: 'sign-in',
        component: () => import('pages/SignInPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'sign-up',
        name: 'sign-up',
        component: () => import('pages/SignUpPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'products/:id',
        name: 'product-detail',
        component: () => import('src/pages/ProductDetailPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'shops/:id',
        name: 'shop-detail',
        component: () => import('src/pages/ShopDetailPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'purchased-tickets',
        name: 'purchased-tickets',
        component: () => import('src/pages/PurchasedTicketsPage.vue'),
        meta: { requiresAuth: true }, //Convert this to true
      },
      {
        path: 'my-shop',
        name: 'my-shop',
        component: () => import('src/pages/MyShopPage.vue'),
        meta: { requiresAuth: true }, //Convert this to true
      },
      {
        path: 'edit-shop',
        name: 'create-shop',
        component: () => import('src/pages/EditShopPage.vue'),
        meta: { requiresAuth: true }, //Convert this to true
      },
      {
        path: 'edit-shop/:id',
        name: 'edit-shop',
        component: () => import('src/pages/EditShopPage.vue'),
        meta: { requiresAuth: true }, //Convert this to true
      },
      {
        path: 'edit-product',
        name: 'create-product',
        component: () => import('src/pages/EditProductPage.vue'),
        meta: { requiresAuth: true }, //Convert this to true
      },
      {
        path: 'edit-product/:id',
        name: 'edit-product',
        component: () => import('src/pages/EditProductPage.vue'),
        meta: { requiresAuth: true }, //Convert this to true
      },
      {
        path: 'sold-tickets',
        name: 'sold-tickets',
        component: () => import('src/pages/SoldTicketsPage.vue'),
        meta: { requiresAuth: true }, //Convert this to true
      },
      {
        path: 'ticket-management',
        name: 'ticket-management',
        component: () => import('src/pages/TicketManagementPage.vue'),
        meta: { requiresAuth: true }, //Convert this to false
      },
      //New routes
      {
        path: 'preorders',
        name: 'preorders',
        component: () => import('src/pages/PreorderPage.vue'),
        meta: { requiresAuth: true }, //Convert this to false
      },
      {
        path: 'my-shop-preorders',
        name: 'my-shop-preorders',
        component: () => import('src/pages/MyShopPreorderPage.vue'),
        meta: { requiresAuth: true }, //Convert this to false
      },
      {
        path: 'invoice/:id',
        name: 'invoice',
        component: () => import('src/pages/InvoicePage.vue'),
        meta: { requiresAuth: true }, //Convert this to false
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
