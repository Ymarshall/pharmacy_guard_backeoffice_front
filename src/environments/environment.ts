export const environment = {
  production: true,
  apiUrl: '/api',
  /**
   * La pagination reste côté client. Passer à true enverra page/size/sort/search
   * dès que le backend les acceptera (voir PageQuery).
   */
  serverPagination: false
};
